// 默认配置
const defaultConfig = {
  // 飞书配置
  feishu: {
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    spreadsheetToken: process.env.FEISHU_SPREADSHEET_TOKEN
  },
  
  // 文件路径配置
  paths: {
    inputDir: 'src/locales',
    outputDir: 'i18n-output',
    mappingFile: 'sheet-mapping.json'
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'INFO'
  }
};

// 合并用户配置与默认配置
const mergeConfig = (userConfig = {}) => {
  const config = JSON.parse(JSON.stringify(defaultConfig));
  
  // 合并飞书配置
  if (userConfig.feishu) {
    config.feishu = { ...config.feishu, ...userConfig.feishu };
  }
  
  // 合并路径配置
  if (userConfig.paths) {
    config.paths = { ...config.paths, ...userConfig.paths };
  }
  
  // 合并日志配置
  if (userConfig.log) {
    config.log = { ...config.log, ...userConfig.log };
  }
  
  return config;
};

module.exports = {
  defaultConfig,
  mergeConfig
};
