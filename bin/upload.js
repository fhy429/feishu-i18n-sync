#!/usr/bin/env node

const { loadEnv, uploadI18nData } = require('../index');
const { loadConfig } = require('../lib/config-loader');
const path = require('path');

// 加载环境变量
loadEnv();

// 解析命令行参数
const args = process.argv.slice(2);
const cliConfig = {};

// 检查是否有自定义路径参数
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input-dir' && args[i + 1]) {
    cliConfig.filePaths = cliConfig.filePaths || {};
    cliConfig.filePaths.inputDir = args[i + 1];
    i++;
  } else if (args[i] === '--output-dir' && args[i + 1]) {
    cliConfig.filePaths = cliConfig.filePaths || {};
    cliConfig.filePaths.outputDir = args[i + 1];
    i++;
  } else if (args[i] === '--mapping-file' && args[i + 1]) {
    cliConfig.filePaths = cliConfig.filePaths || {};
    cliConfig.filePaths.mappingFile = args[i + 1];
    i++;
  }
}

// 加载配置文件并合并配置
const config = loadConfig(cliConfig);

// 上传国际化数据
uploadI18nData(config)
  .then(() => {
    console.log('国际化数据上传完成');
  })
  .catch((error) => {
    console.error('上传过程中出错:', error);
    process.exit(1);
  });