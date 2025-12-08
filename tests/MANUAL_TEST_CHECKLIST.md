# 身份系统测试清单

由于当前磁盘空间不足,无法安装 Playwright 浏览器。以下提供手动测试清单和自动化测试准备说明。

## 🚀 快速手动测试

### 测试前准备
1. 确保本地服务器运行: `python3 -m http.server 3000` 或使用其他服务器
2. 打开浏览器访问: http://localhost:3000
3. 打开浏览器开发者工具 (F12) → Console 标签页

---

### ✅ 测试清单

#### 1. 模态框功能
- [ ] 点击底部 "登录/注册" 按钮,模态框应该弹出
- [ ] 点击模态框右上角 [X],模态框应该关闭
- [ ] 模态框应显示:
  - [ ] Email 输入框
  - [ ] Password 输入框
  - [ ] LOGIN 按钮
  - [ ] REGISTER 按钮
  - [ ] LOGIN WITH GITHUB 按钮

#### 2. 表单验证
- [ ] 不填写任何内容,点击 LOGIN,应显示错误: "Please enter email and password"
- [ ] 不填写任何内容,点击 REGISTER,应显示错误: "Please enter email and password"

#### 3. 用户注册
- [ ] 输入邮箱: `test-${当前时间戳}@example.com`
- [ ] 输入密码: `Test123456!`
- [ ] 点击 REGISTER
- [ ] 应显示成功消息 (如果启用邮件确认,提示检查邮箱)
- [ ] 控制台应打印 Supabase 返回的 data 对象

#### 4. 用户登录
- [ ] 使用刚注册的邮箱和密码
- [ ] 点击 LOGIN
- [ ] 模态框应自动关闭
- [ ] 底部 "登录/注册" 按钮文字应变为邮箱前缀 (如 "test-1234567890")
- [ ] 控制台应打印 "Auth state changed: SIGNED_IN"

#### 5. 用户资料显示
- [ ] 登录后,再次点击底部用户按钮
- [ ] 应显示用户资料卡片,而非登录表单
- [ ] 资料卡片应显示:
  - [ ] 用户头像图标
  - [ ] 完整邮箱地址
  - [ ] LOGOUT 按钮

#### 6. 会话持久化
- [ ] 在登录状态下刷新页面 (F5)
- [ ] 页面加载后应仍然显示登录状态
- [ ] 底部按钮应显示用户名而非 "登录/注册"

#### 7. 用户登出
- [ ] 点击用户按钮打开资料卡片
- [ ] 点击 LOGOUT 按钮
- [ ] 页面应刷新
- [ ] 底部按钮应恢复为 "登录/注册"
- [ ] 控制台应打印 "Auth state changed: SIGNED_OUT"

#### 8. GitHub OAuth (需要配置)
- [ ] 点击 "LOGIN WITH GITHUB" 按钮
- [ ] 应跳转到 GitHub 授权页面
- [ ] 授权后应返回站点并自动登录
- [ ] 如果未配置 OAuth,应显示错误消息

---

## 🤖 自动化测试 (需要磁盘空间)

### 安装步骤
```bash
# 1. 清理磁盘空间 (至少需要 500MB)
# 2. 安装 Playwright 浏览器
npx playwright install chromium

# 3. 运行测试
npm run test:auth:headed
```

### 测试命令
```bash
# 所有测试 (无界面)
npm test

# 身份系统测试 (带界面)
npm run test:auth:headed

# 调试模式
npm run test:debug

# UI 模式 (交互式)
npm run test:ui

# 查看报告
npm run test:report
```

---

## 📊 预期测试结果

### 成功标准
- ✅ 所有 9 个测试用例通过
- ✅ 无控制台错误
- ✅ 会话正确持久化
- ✅ OAuth 跳转正常 (如果已配置)

### 常见问题

#### "Supabase not initialized"
- 检查 `assets/js/supabase-client.js` 中的 URL 和 Key
- 确保 Supabase CDN 脚本已加载

#### GitHub OAuth 失败
- 在 Supabase Dashboard → Authentication → Providers 中启用 GitHub
- 配置正确的 Client ID 和 Secret
- 确保 Redirect URL 匹配

#### 会话未持久化
- 检查浏览器是否禁用了 Cookie
- 确保 Supabase 项目启用了 Session Persistence

---

## 📝 测试记录模板

```
测试日期: ____________________
测试人员: ____________________
浏览器: ____________________

| 测试项 | 结果 | 备注 |
|--------|------|------|
| 模态框打开/关闭 | ☐ 通过 ☐ 失败 | |
| 表单验证 | ☐ 通过 ☐ 失败 | |
| 用户注册 | ☐ 通过 ☐ 失败 | |
| 用户登录 | ☐ 通过 ☐ 失败 | |
| 资料显示 | ☐ 通过 ☐ 失败 | |
| 会话持久化 | ☐ 通过 ☐ 失败 | |
| 用户登出 | ☐ 通过 ☐ 失败 | |
| GitHub OAuth | ☐ 通过 ☐ 失败 | |

总体评价: ____________________
```

---

## 🔧 下一步优化建议

1. **添加更多 OAuth 提供商**: Google, Microsoft
2. **实现密码重置功能**
3. **添加邮箱验证提醒**
4. **优化错误消息本地化**
5. **添加用户头像上传功能**
