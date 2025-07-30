// TypeScript类型定义

interface FeishuConfig {
  appId: string;
  appSecret: string;
  spreadsheetToken: string;
}

interface FilePathsConfig {
  inputDir: string;
  outputDir: string;
  mappingFile: string;
}

interface LogConfig {
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  dir: string;
}

interface PluginConfig {
  feishu?: FeishuConfig;
  filePaths?: FilePathsConfig;
  log?: LogConfig;
}

declare module 'feishu-i18n-plugin' {
  export function loadEnv(): void;
  export function syncI18nFiles(userConfig?: PluginConfig): Promise<void>;
  export function uploadI18nData(userConfig?: PluginConfig): Promise<void>;
}
