const fs = require('fs');
const path = require('path');

// 创建logs目录
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志文件路径
const logFilePath = path.join(logDir, 'plugin.log');

// 日志级别
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// 当前日志级别（可从环境变量获取）
const currentLogLevel = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

// 获取当前时间戳
function getTimestamp() {
  return new Date().toISOString();
}

// 写入日志到文件
function writeLog(level, message) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  // 写入文件
  fs.appendFileSync(logFilePath, logMessage);
}

// 日志函数
function log(level, message) {
  // 检查日志级别
  if (LOG_LEVELS[level] <= currentLogLevel) {
    // 输出到控制台
    console.log(`[${level}] ${message}`);
    
    // 写入到文件
    writeLog(level, message);
  }
}

module.exports = {
  error: (message) => log('ERROR', message),
  warn: (message) => log('WARN', message),
  info: (message) => log('INFO', message),
  debug: (message) => log('DEBUG', message)
};
