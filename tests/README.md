# 自动化测试指南

本项目使用 Playwright 进行端到端自动化测试。

## 安装依赖

```bash
npm install
npx playwright install
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行身份系统测试
```bash
npm run test:auth
```

### 带界面运行测试 (可视化)
```bash
npm run test:headed
# 或只测试身份系统
npm run test:auth:headed
```

### 调试模式
```bash
npm run test:debug
```

### UI 模式 (交互式)
```bash
npm run test:ui
```

### 查看测试报告
```bash
npm run test:report
```

## 测试覆盖范围

### 身份系统测试 (`tests/auth.spec.js`)
- ✅ 打开/关闭认证模态框
- ✅ 用户注册 (Email/Password)
- ✅ 用户登录 (Email/Password)
- ✅ 显示用户资料
- ✅ 用户登出
- ✅ 表单验证 (空字段检查)
- ✅ 会话持久化 (刷新后保持登录)
- ✅ GitHub OAuth 跳转

## 配置

### 环境变量
在运行测试前,可以设置以下环境变量:

```bash
# 设置测试 URL (默认: http://localhost:3000)
export BASE_URL=https://your-domain.com

# 运行测试
npm test
```

### 浏览器配置
默认在以下浏览器中运行测试:
- Chromium (桌面)
- Firefox (桌面)
- WebKit (桌面)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

可以在 `playwright.config.js` 中修改配置。

## 注意事项

1. **Supabase 配置**: 确保 Supabase 项目已正确配置 Email 和 GitHub OAuth。
2. **测试账户**: 测试会创建临时账户,邮箱格式为 `test-{timestamp}@example.com`。
3. **并行执行**: 默认启用并行测试,可在配置文件中调整。
4. **失败重试**: CI 环境中会自动重试失败的测试 2 次。

## 故障排查

### 测试失败
- 检查 `test-results/` 目录中的截图和视频
- 使用 `npm run test:debug` 进入调试模式
- 查看 HTML 报告: `npm run test:report`

### 本地服务器
如果需要自动启动本地服务器,取消 `playwright.config.js` 中 `webServer` 部分的注释。
