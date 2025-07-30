const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
const loadEnv = (envPath = '.env') => {
  const envFilePath = path.resolve(process.cwd(), envPath);
  dotenv.config({ path: envFilePath });
};

// 导入核心功能模块
const { syncI18nFiles } = require('./lib/sync');
const { uploadI18nData } = require('./lib/upload');
const { validateConfig, printValidationResult } = require('./lib/config-validator');

module.exports = {
  loadEnv,
  syncI18nFiles,
  uploadI18nData,
  validateConfig,
  printValidationResult
};
