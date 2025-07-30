#!/usr/bin/env node

const { validateConfig, printValidationResult } = require('../index');

async function runValidation() {
  console.log('开始验证插件配置文件加载功能...');
  
  // 解析命令行参数
  const cliConfig = {};
  const args = process.argv.slice(2);
  
  // 简单的命令行参数解析
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      cliConfig[key] = value;
      if (value !== true) i++; // 跳过值
    }
  }
  
  try {
    const result = await validateConfig(cliConfig);
    printValidationResult(result);
    
    if (result.success) {
      console.log('✅ 配置文件验证通过');
      process.exit(0);
    } else {
      console.log('❌ 配置文件验证失败');
      process.exit(1);
    }
  } catch (error) {
    console.error('验证过程中发生错误:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行验证
if (require.main === module) {
  runValidation();
}

module.exports = {
  runValidation
};