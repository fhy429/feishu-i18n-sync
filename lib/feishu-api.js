const axios = require('axios');
const logger = require('./logger');

// 飞书开放平台相关配置
const getAppConfig = (config) => {
  return {
    appId: config.feishu?.appId || process.env.FEISHU_APP_ID,
    appSecret: config.feishu?.appSecret || process.env.FEISHU_APP_SECRET,
    spreadsheetToken: config.feishu?.spreadsheetToken || process.env.FEISHU_SPREADSHEET_TOKEN
  };
};

// 获取访问凭证
async function getAccessToken(config) {
  const { appId, appSecret } = getAppConfig(config);
  
  try {
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: appId,
      app_secret: appSecret
    });
    
    if (response.data.code === 0) {
      return response.data.tenant_access_token;
    } else {
      throw new Error(`获取访问凭证失败: ${response.data.msg}`);
    }
  } catch (error) {
    logger.error('获取访问凭证时出错:', error.message);
    throw error;
  }
}

// 获取电子表格元数据
async function getSpreadsheetMeta(accessToken, config) {
  const { spreadsheetToken } = getAppConfig(config);
  
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${spreadsheetToken}/metainfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (response.data.code === 0) {
      return response.data.data;
    } else {
      throw new Error(`获取电子表格元数据失败: ${response.data.msg}`);
    }
  } catch (error) {
    logger.error('获取电子表格元数据时出错:', error.message);
    throw error;
  }
}

// 获取工作表数据
async function getSheetData(accessToken, sheetId, config) {
  const { spreadsheetToken } = getAppConfig(config);
  
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${spreadsheetToken}/values/${sheetId}?valueRenderOption=ToString`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (response.data.code === 0) {
      return response.data.data;
    } else {
      throw new Error(`获取工作表数据失败: ${response.data.msg}`);
    }
  } catch (error) {
    logger.error('获取工作表数据时出错:', error.message);
    throw error;
  }
}

// 获取工作表表头
async function getSheetHeaders(accessToken, sheetId, config) {
  const { spreadsheetToken } = getAppConfig(config);
  
  try {
    const response = await axios.get(
      `https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/${spreadsheetToken}/values/${sheetId}?valueRenderOption=ToString&range=${sheetId}!1:1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (response.data.code === 0) {
      return response.data.data.valueRange.values[0];
    } else {
      throw new Error(`获取工作表表头失败: ${response.data.msg}`);
    }
  } catch (error) {
    logger.error('获取工作表表头时出错:', error.message);
    throw error;
  }
}

module.exports = {
  getAccessToken,
  getSpreadsheetMeta,
  getSheetData,
  getSheetHeaders
};
