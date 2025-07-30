# 飞书国际化插件 (feishu-i18n-plugin)

一个用于同步和上传国际化数据到飞书表格的 Node.js 插件。支持配置文件验证、自定义配置以及命令行参数覆盖。

## 功能

- 从飞书表格同步国际化数据到本地文件
- 将本地国际化数据上传到飞书表格
- 支持自定义配置（环境变量、配置文件、命令行参数）
- 提供配置文件验证功能
- 支持 CommonJS 和 ES 模块
- 提供 TypeScript 类型定义

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

插件会自动查找以下配置文件：

- `.feishu-i18n-config.js`
- `.feishu-i18n-config.json`
- `feishu-i18n-config.js`
- `feishu-i18n-config.json`

#### CommonJS 配置文件示例 (`.feishu-i18n-config.js`):

```javascript
module.exports = {
  // 飞书配置
  feishu: {
    appId: 'your_app_id',
    appSecret: 'your_app_secret',
    spreadsheetToken: 'your_spreadsheet_token'
  },
  // 文件路径配置
  filePaths: {
    // 输入目录 - 包含源语言文件的目录
    inputDir: './src/i18n',
    
    // 输出目录 - 同步下来的多语言文件存放目录
    outputDir: './src/i18n',
    
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

#### ES 模块配置文件示例 (`.feishu-i18n-config.js`):

```javascript
export default {
  // 飞书配置
  feishu: {
    appId: 'your_app_id',
    appSecret: 'your_app_secret',
    spreadsheetToken: 'your_spreadsheet_token'
  },
  // 文件路径配置
  filePaths: {
    inputDir: './src/i18n',
    outputDir: './src/i18n',
    mappingFile: './sheet-mapping.json'
  },
  
  // 日志配置
  log: {
    level: 'INFO',
    dir: './logs'
  }
};
```

配置优先级：命令行参数 > 配置文件 > 环境变量。

### 3. 通过 npm 指令使用

安装插件后，在项目的 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "sync": "feishu-i18n-sync",
    "upload": "feishu-i18n-upload",
    "validate-config": "feishu-i18n-validate-config"
  }
}
```

然后可以使用以下 npm 指令：

```bash
# 同步国际化数据（从飞书表格到本地文件）
npm run sync

# 上传国际化数据（从本地文件到飞书表格）
npm run upload

# 验证配置文件是否能正确加载
npm run validate-config

# 使用自定义参数同步数据
npm run sync -- --inputDir ./src/i18n --outputDir ./src/i18n --mappingFile ./sheet-mapping.json

# 使用自定义参数上传数据
npm run upload -- --inputDir ./src/i18n --outputDir ./src/i18n --mappingFile ./sheet-mapping.json

# 使用自定义参数验证配置
npm run validate-config -- --inputDir ./src/i18n --outputDir ./src/i18n
```

### 4. 全局安装后使用

```bash
# 全局安装插件
npm install -g feishu-i18n-plugin

# 同步国际化数据
feishu-i18n-sync

# 上传国际化数据
feishu-i18n-upload

# 验证配置文件
feishu-i18n-validate-config

# 使用自定义参数
feishu-i18n-sync --inputDir ./src/i18n --outputDir ./src/i18n --mappingFile ./sheet-mapping.json
```

### 5. 编程方式使用

```javascript
// CommonJS
const { loadEnv, syncI18nFiles, uploadI18nData, validateConfig, printValidationResult } = require('feishu-i18n-plugin');

// ES 模块
// import { loadEnv, syncI18nFiles, uploadI18nData, validateConfig, printValidationResult } from 'feishu-i18n-plugin';

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
  outputDir: './src/i18n'
});
printValidationResult(validationResult);
```

### 6. 自定义配置

```javascript
const customConfig = {
  feishu: {
    appId: 'your_app_id',
    appSecret: 'your_app_secret',
    spreadsheetToken: 'your_spreadsheet_token'
  },
  filePaths: {
    inputDir: './src/i18n',
    outputDir: './src/i18n',
    mappingFile: './sheet-mapping.json'
  },
  log: {
    level: 'DEBUG',
    dir: './logs'
  }
};

await syncI18nFiles(customConfig);
await uploadI18nData(customConfig);
```

### 7. 配置文件验证

插件提供配置文件验证功能，帮助您确认配置文件是否能被正确加载和合并：

```bash
# 验证配置文件
npx feishu-i18n-validate-config

# 带参数验证
npx feishu-i18n-validate-config --inputDir ./custom/input --outputDir ./custom/output
```

验证内容包括：
1. 配置文件是否能正确加载（支持 CommonJS 和 ES 模块）
2. 配置文件中的关键字段是否存在
3. 命令行参数是否能正确合并到配置中
4. 输出合并后的完整配置信息

## API

### `loadEnv()`

加载环境变量。自动从项目根目录的 `.env` 文件加载环境变量。

### `syncI18nFiles(userConfig?)`

从飞书表格同步国际化数据到本地文件。

- `userConfig` (可选): 自定义配置对象，将覆盖默认配置和环境变量
- 返回: `Promise<void>`

### `uploadI18nData(userConfig?)`

将本地国际化数据上传到飞书表格。

- `userConfig` (可选): 自定义配置对象，将覆盖默认配置和环境变量
- 返回: `Promise<void>`

### `validateConfig(cliConfig?)`

验证插件是否能正确获取和合并配置文件。

- `cliConfig` (可选): 模拟命令行参数的对象
- 返回: `Promise<{ isValid: boolean, config: Object, errors: string[] }>`

### `printValidationResult(validationResult)`

打印配置验证结果到控制台。

- `validationResult`: `validateConfig` 函数返回的验证结果对象
- 返回: `void`