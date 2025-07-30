# 飞书国际化插件发布说明

## 发布状态

插件当前已完成以下发布准备工作：

1. 完善了 `package.json` 文件，添加了必要的元数据（作者、仓库地址等）
2. 确保了 `README.md` 包含详细的使用说明
3. 创建了 `PUBLISH.md` 发布指南
4. 创建并改进了测试脚本 `test-publish.js`

## 发布注意事项

1. 测试脚本 `test-publish.js` 当前在无配置环境下运行失败，这是预期行为，因为缺少必要的飞书配置
2. 在实际使用环境中，用户需要提供正确的飞书配置（appId、appSecret、spreadsheetToken）
3. 发布前请确保您已拥有 `feishu-i18n-plugin` 包名的发布权限
4. 建议先在测试环境中验证插件功能

## 发布命令

在插件根目录下运行以下命令发布插件：

```bash
# 登录npm账户
npm login

# 发布插件
npm publish
```

## 验证发布

发布成功后，您可以通过以下方式验证：

```bash
# 查看包信息
npm info feishu-i18n-plugin
```

## 紧急撤销发布

如果发布后发现严重问题，可以在24小时内撤销发布：

```bash
npm unpublish feishu-i18n-plugin@<version>
```

替换 `<version>` 为您发布的版本号。