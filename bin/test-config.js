#!/usr/bin/env node

const { loadConfig } = require('../lib/config-loader');

async function testConfigLoading() {
  console.log('开始测试配置文件加载功能...');
  
  try {
    // 测试加载配置
    const config = await loadConfig({
      testParam: 'test-value'
    });
    
    console.log('配置加载成功:');
    console.log(JSON.stringify(config, null, 2));
    
    // 验证配置内容
    // 处理可能的 ES 模块默认导出
    const actualConfig = config.default || config;
    
    if (actualConfig.filePaths) {
      console.log('✓ 配置文件中的 filePaths 字段已正确加载');
      console.log('  inputDir:', actualConfig.filePaths.inputDir);
      console.log('  outputDir:', actualConfig.filePaths.outputDir);
      console.log('  mappingFile:', actualConfig.filePaths.mappingFile);
    } else {
      console.log('✗ 配置文件中的 filePaths 字段未找到');
    }
    
    if (actualConfig.log) {
      console.log('✓ 配置文件中的 log 字段已正确加载');
      console.log('  level:', actualConfig.log.level);
      console.log('  dir:', actualConfig.log.dir);
    } else {
      console.log('✗ 配置文件中的 log 字段未找到');
    }
    
    if (config.testParam === 'test-value') {
      console.log('✓ 命令行参数已正确合并');
    } else {
      console.log('✗ 命令行参数未正确合并');
    }
    
    console.log('配置文件加载测试完成');
  } catch (error) {
    console.error('配置加载测试失败:', error);
    process.exit(1);
  }
}

testConfigLoading();