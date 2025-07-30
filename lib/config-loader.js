const fs = require('fs');
const path = require('path');

// 检测当前环境是否为ES模块
const isESModule = typeof module !== 'undefined' && module.exports === undefined;

/**
 * 加载配置文件
 * @param {string} configPath - 配置文件路径
 * @returns {Object} 配置对象
 */
async function loadConfigFile(configPath) {
  console.log(`尝试加载配置文件: ${configPath}`);
  if (fs.existsSync(configPath)) {
    try {
      // 支持 .js 和 .json 配置文件
      if (configPath.endsWith('.js')) {
        // 清除 require 缓存以支持重新加载
        if (require.cache && require.resolve) {
          delete require.cache[require.resolve(configPath)];
        }
        
        // 尝试使用 require 加载 (CommonJS)
        try {
          const config = require(configPath);
          console.log(`成功使用CommonJS加载配置文件: ${configPath}`);
          return config;
        } catch (commonjsError) {
          console.log(`CommonJS加载失败，尝试ES模块加载: ${commonjsError.message}`);
          // 如果 CommonJS 加载失败，尝试动态导入 (ES 模块)
          try {
            // 在Windows上，需要使用file://协议
            const configUrl = `file:///${configPath.replace(/\\/g, '/')}`;
            const configModule = await import(configUrl);
            // 处理ES模块的默认导出
            const config = configModule.default || configModule;
            // 确保返回的是纯对象，而不是模块命名空间对象
            if (config && typeof config === 'object' && config.__esModule) {
              console.log(`成功使用ES模块加载配置文件: ${configPath}`);
              return config.default || {};
            }
            console.log(`成功使用ES模块加载配置文件: ${configPath}`);
            return config;
          } catch (esModuleError) {
            console.error(`ES模块加载也失败: ${esModuleError.message}`);
            console.error(esModuleError.stack);
            // 如果两种方式都失败，抛出原始错误
            throw commonjsError;
          }
        }
      } else if (configPath.endsWith('.json')) {
        const configFile = fs.readFileSync(configPath, 'utf8');
        console.log(`成功加载JSON配置文件: ${configPath}`);
        return JSON.parse(configFile);
      }
    } catch (error) {
      console.warn(`配置文件加载失败: ${error.message}`);
      console.warn(error.stack);
    }
  } else {
    console.warn(`配置文件不存在: ${configPath}`);
  }
  return {};
}

/**
 * 查找并加载配置文件
 * @param {Object} cliConfig - 命令行配置参数
 * @returns {Object} 合并后的配置对象
 */
async function loadConfig(cliConfig = {}) {
  // 查找配置文件的路径
  const configFiles = [
    '.feishu-i18n-config.js',
    '.feishu-i18n-config.json',
    'feishu-i18n-config.js',
    'feishu-i18n-config.json'
  ];
  
  let configFile = {};
  
  // 首先在当前工作目录（用户项目目录）中查找配置文件
  for (const file of configFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      configFile = await loadConfigFile(fullPath);
      break;
    }
  }
  
  // 如果在用户项目目录中没找到，再在插件目录中查找
  if (Object.keys(configFile).length === 0) {
    for (const file of configFiles) {
      const fullPath = path.resolve(__dirname, '../', file);
      if (fs.existsSync(fullPath)) {
        configFile = await loadConfigFile(fullPath);
        break;
      }
    }
  }
  console.log('合并配置：', cliConfig);
  console.log('合并配置：', configFile);
  // 合并配置，命令行参数优先级最高
  // 处理ES模块的default导出
  const actualConfig = configFile.default || configFile;
  return {
    ...actualConfig,
    ...cliConfig,
    filePaths: {
      ...actualConfig.filePaths,
      ...cliConfig.filePaths
    }
  };

}

module.exports = {
  loadConfig
};