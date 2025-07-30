const logger = require('./logger');
const { getAccessToken, getSpreadsheetMeta, getSheetHeaders } = require('./feishu-api');
const { readLocalI18nFiles } = require('./file-handler');

// 扁平化对象
function flattenObject(obj, prefix = '', result = {}, keepEmpty = false, fileName = '') {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // 如果是对象，递归处理
        flattenObject(obj[key], newKey, result, keepEmpty, fileName);
      } else {
        // 如果是值，直接添加到结果中
        if (obj[key] !== '' || keepEmpty) {
          result[newKey] = obj[key];
        }
      }
    }
  }
  return result;
}

// 获取列映射
function getColumnMapping(headers) {
  if (!headers || headers.length === 0) {
    logger.error('表头为空，无法确定列映射');
    return {};
  }

  // 转换所有表头为小写以进行不区分大小写的匹配
  const lowerHeaders = headers.map(header => header.toLowerCase().trim());

  // 尝试匹配 key 列
  const keyColumnIndex = lowerHeaders.findIndex(header => 
    header === 'key' || 
    header === '键' || 
    header.includes('key') || 
    header.includes('键')
  );

  // 尝试匹配中文列
  const zhColumnIndex = lowerHeaders.findIndex(header => 
    header === 'zh-cn' || 
    header === '中文' || 
    header.includes('zh') || 
    header.includes('中文')
  );

  // 尝试匹配英文列
  const enColumnIndex = lowerHeaders.findIndex(header => 
    header === 'en-us' || 
    header === '英文' || 
    header.includes('en') || 
    header.includes('英文')
  );

  // 构建映射对象
  const mapping = {};

  if (keyColumnIndex !== -1) {
    mapping['key'] = keyColumnIndex;
  } else {
    logger.warn('未找到 key 列，默认使用第一列');
    mapping['key'] = 0; // 默认使用第一列作为 key
  }

  if (zhColumnIndex !== -1) {
    mapping['zh-CN'] = zhColumnIndex;
  } else {
    logger.warn('未找到中文列');
  }

  if (enColumnIndex !== -1) {
    mapping['en-US'] = enColumnIndex;
  } else {
    logger.warn('未找到英文列');
  }

  logger.info('列映射结果:', mapping);
  return mapping;
}

// 写入飞书表格
async function writeToFeishuSheet(accessToken, data, sheetId, config) {
  try {
    // 获取表格表头和元数据
    const headers = await getSheetHeaders(accessToken, sheetId, config);
    const columnMapping = getColumnMapping(headers);
    const spreadsheetMeta = await getSpreadsheetMeta(accessToken, config);
    const sheetInfo = spreadsheetMeta.sheets.find(s => s.sheetId === sheetId);
    const actualColumnCount = sheetInfo.columnCount;

    // 确定必要的列索引
    const keyCol = columnMapping['key'] !== undefined ? columnMapping['key'] : 0;
    const zhCol = columnMapping['zh-CN'] !== undefined ? columnMapping['zh-CN'] : -1;
    const enCol = columnMapping['en-US'] !== undefined ? columnMapping['en-US'] : -1;
    // 扁平化所有语言的数据
    const flattenedZhData = flattenObject(data['zh-CN'] || {}, '', {}, true, data.fileName || '');
    const flattenedEnData = flattenObject(data['en-US'] || {}, '', {}, true, data.fileName || '');
    // 获取所有扁平化后的键
    const allKeys = [...new Set([...Object.keys(flattenedZhData), ...Object.keys(flattenedEnData)])];
    // 构建表格数据
    const values = [headers];
    for (const key of allKeys) {
      const row = new Array(actualColumnCount).fill('');
      row[keyCol] = key;
      if (zhCol !== -1) row[zhCol] = flattenedZhData[key] || '';
      if (enCol !== -1) row[enCol] = flattenedEnData[key] || '';
      values.push(row);
    }

    // 调用飞书API写入数据
    const response = await axios.post(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${config.feishu?.spreadsheetToken || process.env.FEISHU_SPREADSHEET_TOKEN}/values_batch_update`,
      {
        valueRanges: [
          {
            range: `${sheetId}!A1:Z${values.length}`,
            values: values
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );

    if (response.data.code !== 0) {
      throw new Error(`写入表格失败: ${response.data.msg}`);
    }

    logger.info(`成功写入 ${values.length - 1} 条数据到表格`);
  } catch (error) {
    logger.error('写入表格时出错:', error.message);
    throw error;
  }
}

// 上传国际化数据主函数
async function uploadI18nData(userConfig = {}) {
  try {
    logger.info('开始上传国际化数据到飞书表格...');

    // 读取本地国际化文件
    const i18nData = readLocalI18nFiles(userConfig);
    logger.info('读取本地国际化文件完成');

    // 获取访问凭证
    const accessToken = await getAccessToken(userConfig);
    logger.info('已获取访问凭证');

    // 获取电子表格元数据
    const spreadsheetMeta = await getSpreadsheetMeta(accessToken, userConfig);
    const existingSheets = spreadsheetMeta.sheets;

    // 使用for...of循环替代forEach处理异步操作
    const uploadPromises = [];
    for (const [fileName, zhData] of Object.entries(i18nData['zh-CN'])) {
      // 查找sheetId
      const sheet = existingSheets.find(s => s.title === fileName);
      const sheetId = sheet ? sheet.sheetId : null;

      // 如果sheet不存在，跳过并提供明确信息
      if (!sheetId) {
        logger.warn(`未找到工作表: ${fileName}，跳过该文件的上传。请在飞书表格中创建该工作表。`);
        continue;
      }

      // 准备上传数据
      const uploadData = {
        'zh-CN': zhData,
        'en-US': i18nData['en-US'][fileName] || {},
        'fileName': fileName
      };

      // 添加到上传队列
      uploadPromises.push(writeToFeishuSheet(accessToken, uploadData, sheetId, userConfig));
    }

    // 等待所有上传完成
    await Promise.all(uploadPromises);
    logger.info('国际化数据上传完成！');
  } catch (error) {
    logger.error('上传过程中出错:', error.message);
    logger.error(error);
    throw error;
  }
}

module.exports = {
  uploadI18nData
};
