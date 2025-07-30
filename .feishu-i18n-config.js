/**
 * 飞书国际化插件配置文件
 * 可以通过此文件设置默认配置，避免每次执行命令时都需要输入参数
 */

module.exports = {
  // 飞书相关配置
  feishu: {
    // 可以通过环境变量覆盖
    // appId: process.env.FEISHU_APP_ID,
    // appSecret: process.env.FEISHU_APP_SECRET,
    // spreadsheetToken: process.env.FEISHU_SPREADSHEET_TOKEN
  },
  
  // 文件路径配置
  filePaths: {
    // 输入目录 - 包含源语言文件的目录
    inputDir: './src/i18n',
    
    // 输出目录 - 同步下来的多语言文件存放目录
    outputDir: './src/i18n/output',
    
    // 映射文件 - 定义飞表格与本地文件映射关系的文件
    mappingFile: './sheet-mapping.json'
  },
  
  // 日志配置
  log: {
    // 日志级别: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
    level: 'INFO',
    
    // 日志文件目录
    dir: './logs'
  }
};