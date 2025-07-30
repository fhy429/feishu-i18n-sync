const { loadConfig } = require('./config-loader');

/**
 * 验证插件是否能正确获取项目中的配置文件
 * @param {Object} cliConfig - 命令行配置参数
 * @returns {Promise<Object>} 验证结果
 */
async function validateConfig(cliConfig = {}) {
  console.log('开始验证配置文件...');
  
  try {
    // 加载配置
    const config = await loadConfig(cliConfig);
    
    // 处理可能的 ES 模块默认导出
    const actualConfig = config.default || config;
    
    const validationResult = {
      success: true,
      config: actualConfig,
      validations: []
    };
    
    // 验证 filePaths 配置
    if (actualConfig.filePaths) {
      validationResult.validations.push({
        name: 'filePaths',
        passed: true,
        message: '配置文件中的 filePaths 字段已正确加载',
        details: actualConfig.filePaths
      });
    } else {
      validationResult.validations.push({
        name: 'filePaths',
        passed: false,
        message: '配置文件中的 filePaths 字段未找到'
      });
    }
    
    // 验证 log 配置
    if (actualConfig.log) {
      validationResult.validations.push({
        name: 'log',
        passed: true,
        message: '配置文件中的 log 字段已正确加载',
        details: actualConfig.log
      });
    } else {
      validationResult.validations.push({
        name: 'log',
        passed: false,
        message: '配置文件中的 log 字段未找到'
      });
    }
    
    // 验证命令行参数是否正确合并
    const cliKeys = Object.keys(cliConfig);
    if (cliKeys.length > 0) {
      const allCliParamsFound = cliKeys.every(key => 
        key in config && JSON.stringify(config[key]) === JSON.stringify(cliConfig[key])
      );
      
      validationResult.validations.push({
        name: 'cliParams',
        passed: allCliParamsFound,
        message: allCliParamsFound ? 
          '命令行参数已正确合并' : 
          '命令行参数未正确合并',
        details: cliConfig
      });
    }
    
    console.log('配置文件验证完成');
    return validationResult;
  } catch (error) {
    console.error('配置文件验证失败:', error);
    return {
      success: false,
      error: error.message,
      validations: []
    };
  }
}

/**
 * 打印验证结果
 * @param {Object} validationResult - 验证结果
 */
function printValidationResult(validationResult) {
  if (!validationResult.success) {
    console.error('配置文件验证失败:', validationResult.error);
    return;
  }
  
  console.log('\n=== 配置文件验证结果 ===');
  console.log('配置加载成功');
  
  validationResult.validations.forEach(validation => {
    const status = validation.passed ? '✓' : '✗';
    console.log(`${status} ${validation.name}: ${validation.message}`);
    
    if (validation.details) {
      console.log(`  详情: ${JSON.stringify(validation.details, null, 2)}`);
    }
  });
  
  console.log('========================\n');
}

module.exports = {
  validateConfig,
  printValidationResult
};