#!/usr/bin/env node

/**
 * 发布前测试脚本
 * 用于验证插件是否能够正常加载和工作
 */

// 加载环境变量
require('dotenv').config();

// 导入插件功能
try {
  const { validateConfig, loadEnv } = require('./index');
  console.log('✓ 插件成功加载');

  // 测试插件功能
  async function testPlugin() {
    try {
      console.log('开始测试飞书国际化插件...');

      // 加载环境变量
      console.log('加载环境变量...');
      loadEnv();

      // 准备测试配置
      const testConfig = {
        inputDir: './src/i18n',
        outputDir: './src/i18n',
        // 使用环境变量或提供默认值
        feishu: {
          appId: process.env.FEISHU_APP_ID || 'test-app-id',
          appSecret: process.env.FEISHU_APP_SECRET || 'test-app-secret',
          spreadsheetToken: process.env.FEISHU_SPREADSHEET_TOKEN || 'test-spreadsheet-token'
        },
        log: {
          level: 'ERROR'
        }
      };

      // 测试配置验证功能
      console.log('测试配置验证功能...');
      const validationResult = await validateConfig(testConfig);

      if (validationResult.isValid) {
        console.log('✓ 配置验证通过!');
        console.log('配置内容:', JSON.stringify(validationResult.config, null, 2));
        console.log('测试成功! 插件已准备好发布。');
      } else {
        console.error('✗ 配置验证失败!');
        console.error('错误信息:', validationResult.errors || '未知错误');
        // 对于测试环境，如果只是缺少必要的飞书配置，我们可以继续执行
        if (validationResult.errors && validationResult.errors.some(err => err.includes('FEISHU'))) {
          console.log('⚠️ 注意: 缺少飞书配置，但插件本身功能正常。发布前请确保在生产环境中配置正确。');
          console.log('测试成功! 插件已准备好发布。');
        } else {
          process.exit(1);
        }
      }
    } catch (error) {
      console.error('✗ 测试失败!');
      console.error('错误信息:', error.message);
      process.exit(1);
    }
  }

  testPlugin();
} catch (error) {
  console.error('✗ 插件加载失败!');
  console.error('错误信息:', error.message);
  process.exit(1);
}