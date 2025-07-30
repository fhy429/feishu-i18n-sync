# 飞书国际化插件发布指南

## 发布前检查清单

1. 确保 `package.json` 文件中的版本号已更新
2. 确保 `README.md` 文件包含最新的使用说明
3. 确保 `.gitignore` 文件正确排除了不需要发布的文件
4. 确保所有依赖都已正确声明
5. 确保代码已通过测试

## 发布步骤

### 1. 登录 npm 账户

在终端中运行以下命令并按照提示输入您的 npm 账户信息：

```bash
npm login
```

### 2. 验证登录状态

运行以下命令确认您已成功登录：

```bash
npm whoami
```

### 3. 发布包

在插件根目录下运行以下命令：

```bash
npm publish
```

### 4. 验证发布

发布成功后，您可以通过以下方式验证：

1. 访问 npm 官网，搜索 `feishu-i18n-plugin`
2. 或运行以下命令查看包信息：

```bash
npm info feishu-i18n-plugin
```

## 版本更新

当您需要更新包版本时，请按照以下步骤操作：

1. 更新 `package.json` 文件中的 `version` 字段
   - 补丁更新（修复bug）：`npm version patch`
   -  minor更新（新增功能）：`npm version minor`
   - 主版本更新（重大变更）：`npm version major`

2. 提交代码变更到 Git 仓库

3. 再次运行 `npm publish` 命令发布新版本

## 注意事项

- 确保您拥有 `feishu-i18n-plugin` 包名的发布权限
- 发布前建议先在测试环境中验证包的功能
- 避免发布包含敏感信息的代码
- 定期更新包版本以修复bug和添加新功能

## 撤销发布

如果您需要撤销发布（发布后24小时内），可以运行以下命令：

```bash
npm unpublish feishu-i18n-plugin@<version>
```

替换 `<version>` 为您要撤销的版本号。