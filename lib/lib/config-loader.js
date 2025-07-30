const fs = require('fs');
const path = require('path');

/**
 * 加载配置文件
 * @param {string} configPath - 配置文件路径
 * @returns {Object} 配置对象
 */
function loadConfigFile(configPath) {
  if (fs.existsSync(configPath)) {
    try {
      // 支持 .js 和 .json 配置文件
      if (configPath.endsWith('.js')) {
        return require(configPath);
      } else if (configPath.endsWith('.json')) {
        const configFile = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configFile);
      }
    } catch (error) {
      console.warn(`配置文件加载失败: ${error.message}`);
    }
  }
  return {};
}

/**
 * 查找并加载配置文件
 * @param {Object} cliConfig - 命令行配置参数
 * @returns {Object} 合并后的配置对象
 */
function loadConfig(cliConfig = {}) {
  // 查找配置文件的路径
  const configFiles = [
    '.feishu-i18n-config.js',
    '.feishu-i18n-config.json',
    'feishu-i18n-config.js',
    'feishu-i18n-config.json'
  ];
  
  let configFile = {};
  
  for (const file of configFiles) {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
      configFile = loadConfigFile(fullPath);
      break;
    }
  }
  
  // 合并配置，命令行参数优先级最高
  return {
    ...configFile,
    ...cliConfig,
    filePaths: {
      ...configFile.filePaths,
      ...cliConfig.filePaths
    }
  };
}

module.exports = {
  loadConfig
};