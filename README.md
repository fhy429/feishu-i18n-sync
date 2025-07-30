# 飞书国际化插件 (feishu-i18n-plugin)

一个用于同步和上传国际化数据到飞书表格的Node.js插件。

## 功能

- 从飞书表格同步国际化数据到本地文件
- 将本地国际化数据上传到飞书表格
- 支持自定义配置
- 提供TypeScript类型定义

## 安装

```bash
npm install feishu-i18n-plugin
```

## 使用方法

### 1. 环境变量配置

在项目根目录创建 `.env` 文件并配置以下环境变量：

```
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_SPREADSHEET_TOKEN=your_spreadsheet_token
LOG_LEVEL=INFO
```

### 2. 配置文件

除了使用环境变量，您还可以通过配置文件来设置默认参数。插件会自动查找以下配置文件：

- `.feishu-i18n-config.js`
- `.feishu-i18n-config.json`
- `feishu-i18n-config.js`
- `feishu-i18n-config.json`

配置文件示例 (`.feishu-i18n-config.js`)：

```javascript
module.exports = {
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
```

配置文件中的参数会被命令行参数覆盖，优先级为：命令行参数 > 配置文件 > 环境变量。

### 3. 通过npm指令使用

安装插件后，可以使用以下npm指令：

```bash
# 同步国际化数据（从飞书表格到本地文件）
npm run sync

# 上传国际化数据（从本地文件到飞书表格）
npm run upload

# 验证配置文件是否能正确加载
npm run validate-config

# 使用自定义路径同步数据
npm run sync -- --input-dir ./src/i18n --output-dir ./src/i18n/output --mapping-file ./sheet-mapping.json

# 使用自定义路径上传数据
npm run upload -- --input-dir ./src/i18n --output-dir ./src/i18n/output --mapping-file ./sheet-mapping.json

# 使用自定义参数验证配置
npm run validate-config -- --input-dir ./src/i18n --output-dir ./src/i18n/output
```

### 4. 全局安装后使用

```bash
# 全局安装插件
npm install -g feishu-i18n-plugin

# 同步国际化数据（从飞书表格到本地文件）
feishu-i18n-sync

# 上传国际化数据（从本地文件到飞书表格）
feishu-i18n-upload

# 验证配置文件是否能正确加载
feishu-i18n-validate-config

# 使用自定义路径同步数据
feishu-i18n-sync --input-dir ./src/i18n --output-dir ./src/i18n/output --mapping-file ./sheet-mapping.json

# 使用自定义路径上传数据
feishu-i18n-upload --input-dir ./src/i18n --output-dir ./src/i18n/output --mapping-file ./sheet-mapping.json

# 使用自定义参数验证配置
feishu-i18n-validate-config --input-dir ./src/i18n --output-dir ./src/i18n/output
```

### 5. 编程方式使用

```javascript
const { loadEnv, syncI18nFiles, uploadI18nData, validateConfig, printValidationResult } = require('feishu-i18n-plugin');

// 加载环境变量
loadEnv();

// 同步国际化数据
await syncI18nFiles();

// 上传国际化数据
await uploadI18nData();

// 验证配置文件
const validationResult = await validateConfig({
  // 可选的命令行参数
  inputDir: './src/i18n',
  outputDir: './src/i18n/output'
});
printValidationResult(validationResult);
```

### 6. 自定义配置

```javascript
const config = {
  feishu: {
    appId: 'your_app_id',
    appSecret: 'your_app_secret',
    spreadsheetToken: 'your_spreadsheet_token'
  },
  filePaths: {
    inputDir: './src/i18n',
    outputDir: './src/i18n/output',
    mappingFile: './sheet-mapping.json'
  },
  log: {
    level: 'DEBUG',
    dir: './logs'
  }
};

await syncI18nFiles(config);
await uploadI18nData(config);
```

### 7. 验证配置文件

插件新增了配置文件验证功能，可以帮助您确认配置文件是否能被正确加载：

```bash
# 验证配置文件
npx feishu-i18n-validate-config
```

该命令会检查：
1. 配置文件是否能正确加载
2. 配置文件中的关键字段是否存在
3. 命令行参数是否能正确合并

## API

### `loadEnv()`

加载环境变量。

### `syncI18nFiles(userConfig?)`

从飞书表格同步国际化数据到本地文件。

- `userConfig` (可选): 自定义配置对象

### `uploadI18nData(userConfig?)`

将本地国际化数据上传到飞书表格。

- `userConfig` (可选): 自定义配置对象

### `validateConfig(cliConfig?)`

验证插件是否能正确获取项目中的配置文件。

- `cliConfig` (可选): 命令行配置参数

### `printValidationResult(validationResult)`

打印验证结果。

- `validationResult`: 验证结果对象

## 许可证

MIT