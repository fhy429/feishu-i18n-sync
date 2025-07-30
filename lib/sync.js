const path = require('path');
const logger = require('./logger');
const { getAccessToken, getSpreadsheetMeta, getSheetData } = require('./feishu-api');
const { writeI18nFiles } = require('./file-handler');

// 将数据转换为国际化格式
function convertToI18nFormat(values) {
  if (!values || values.length === 0) {
    logger.error('没有数据可转换');
    return {};
  }

  // 获取表头行
  const headers = values[0];
  // 获取列映射
  const columnMapping = getColumnMapping(headers);
  // 提取有效的语言代码
  const languages = Object.keys(columnMapping).filter(key => key !== 'key');

  // 如果没有找到任何语言列，返回空对象
  if (languages.length === 0) {
    logger.error('未找到任何语言列');
    return {};
  }

  const result = {};

  // 初始化每种语言的对象
  languages.forEach((lang) => {
    result[lang] = {};
  });

  // 从第二行开始处理键值对
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (row.length === 0) continue;

    const key = row[columnMapping.key];
    if (!key) continue;

    // 拆分key为路径数组
    const keyParts = key.split('.');
    // 不再跳过任何层级，直接使用完整的键路径
    const actualKeyParts = keyParts;
    if (actualKeyParts.length < 1) continue;

    // 为每种语言设置嵌套值
    languages.forEach(lang => {
      const colIndex = columnMapping[lang];
      // 确保列索引有效
      if (colIndex === undefined || colIndex >= row.length) {
        logger.warn(`行 ${i+1} 中 ${lang} 列索引无效`);
        return;
      }

      const value = row[colIndex] || '';
      let currentObj = result[lang];

      // 创建嵌套对象结构
      for (let k = 0; k < actualKeyParts.length - 1; k++) {
        const part = actualKeyParts[k];
        if (!currentObj[part]) {
          currentObj[part] = {};
        }
        currentObj = currentObj[part];
      }

      // 设置最终值
      const lastPart = actualKeyParts[actualKeyParts.length - 1];
      currentObj[lastPart] = value;
      logger.info(`设置 ${lang} 中 ${key} 的值为: ${value}`);
    });
  }

  logger.info('转换后的国际化数据:', result);
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

// 同步国际化文件主函数
async function syncI18nFiles(userConfig = {}) {
  try {
    logger.info('开始同步国际化数据...');

    // 获取访问凭证
    const accessToken = await getAccessToken(userConfig);
    logger.info('已获取访问凭证');

    // 获取电子表格元数据
    const spreadsheetMeta = await getSpreadsheetMeta(accessToken, userConfig);
    const sheets = spreadsheetMeta.sheets || [];
    logger.info(`找到 ${sheets.length} 个工作表`);
    console.log(userConfig)
    const sheetMapping = userConfig.mappingFile || {};
    // 处理每个工作表
    for (const sheet of sheets) {
      logger.info(`正在处理工作表: ${sheet.title}`);
      logger.info(`获取工作表数据: ${sheet.sheetId}`);
      const sheetData = await getSheetData(accessToken, sheet.sheetId, userConfig);
      logger.info(`获取工作表数据完成`, sheetData);
      
      // 转换为国际化格式
      logger.info(`开始转换为国际化格式`);
      logger.info(`传递给convertToI18nFormat的数据:`, sheetData.valueRange.values);
      const i18nData = convertToI18nFormat(sheetData.valueRange.values);
      logger.info(`转换为国际化格式完成`, i18nData);
      // 根据映射关系确定文件名前缀
      // 首先检查新的 fileMappings 配置
      let prefixes = [];
      if (sheetMapping.fileMappings) {
        // 查找与当前工作表关联的所有文件名
        Object.entries(sheetMapping.fileMappings).forEach(([fileName, sheetTitles]) => {
          if (Array.isArray(sheetTitles) && sheetTitles.includes(sheet.title)) {
            prefixes.push(fileName);
          } else if (sheetTitles === sheet.title) {
            prefixes.push(fileName);
          }
        });
      }
      
      // 如果在 fileMappings 中没有找到，则回退到旧的 sheetMappings 配置
      if (prefixes.length === 0) {
        //键值去掉空格
        const prefix = sheetMapping.sheetMappings?.[sheet.title] || sheet.title.toLowerCase().replace(/\s+/g, '_');
        prefixes = [prefix];
      }

      // 为每个前缀创建独立的数据结构并写入文件
      for (const prefix of prefixes) {
        const sheetSpecificData = {};
        Object.entries(i18nData).forEach(([lang, data]) => {
          // 如果顶层只有一个键，且该键与prefix相同，则使用其值作为数据
          // 否则保留原始数据结构
          const topLevelKeys = Object.keys(data);
          const actualData = (topLevelKeys.length === 1 && topLevelKeys[0] === prefix) ? data[topLevelKeys[0]] : data;
          sheetSpecificData[lang] = {
            [prefix]: actualData
          };
        });
        // 写入文件
        writeI18nFiles(sheetSpecificData, userConfig);
      }
    }

    logger.info('国际化数据同步完成！');
  } catch (error) {
    logger.error('同步过程中发生错误:', error.message);
    logger.error('错误堆栈:', error.stack);
    throw error;
  }
}

module.exports = {
  syncI18nFiles
};
