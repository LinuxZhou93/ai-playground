# 智慧教育平台教材下载指南

## 🎯 目标
实现免登录、免跳转、直接在页面预览和下载教材PDF

## 📋 方案架构

```
前端页面 (textbook.html)
    ↓
后端代理 (textbook-proxy.js)
    ↓
智慧教育平台 API
```

---

## 🔧 部署步骤

### 步骤1：获取Access Token

1. **登录智慧教育平台**
   - 访问：https://basic.smartedu.cn/tchMaterial
   - 使用您的账号密码登录

2. **获取Token**
   - 按 `F12` 打开开发者工具
   - 切换到 `控制台(Console)` 选项卡
   - 输入以下代码并回车：

   ```javascript
   console.log(localStorage.getItem('ND_UC_AUTH'));
   ```

   - 复制输出的Token字符串（格式like: `MAC id="xxx", nonce="xxx", mac="xxx"`）

3. **保存Token**
   - 将Token保存到安全的地方
   - 有效期约7天，过期后需重新获取

---

### 步骤2：启动后端代理服务

1. **安装依赖**
   ```bash
   cd /Users/zhoulin/Desktop/github/ai-playground/server
   npm install
   ```

2. **配置Token**
   
   方法A：环境变量（推荐）
   ```bash
   export SMARTEDU_TOKEN="MAC id=\"xxx\", nonce=\"xxx\", mac=\"xxx\""
   npm start
   ```

   方法B：通过API设置
   ```bash
   npm start
   # 然后在另一个终端执行：
   curl -X POST http://localhost:3001/api/set-token \
     -H "Content-Type: application/json" \
     -d '{"token":"您的Token"}'
   ```

3. **验证服务**
   ```bash
   curl http://localhost:3001/health
   # 应返回：{"status":"ok","hasToken":true}
   ```

---

### 步骤3：更新前端页面

前端页面会自动连接到 `http://localhost:3001` 后端服务

---

## 📡 API 接口文档

### 1. 获取教材列表
```
GET /api/textbooks?grade=小学&subject=语文&publisher=人教版
```

### 2. 获取PDF信息
```
GET /api/textbook/:id
```

### 3. 代理PDF流（核心）
```
GET /api/pdf/proxy?url=PDF的URL
```

### 4. 设置Token
```
POST /api/set-token
Body: {"token": "您的Token"}
```

### 5. 健康检查
```
GET /health
```

---

## 🔄 Token自动刷新方案

### 方案A：Puppeteer自动登录
```bash
npm install puppeteer
```

```javascript
const puppeteer = require('puppeteer');

async function autoLogin() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://basic.smartedu.cn/tchMaterial');
    await page.type('#username', process.env.SMARTEDU_USERNAME);
    await page.type('#password', process.env.SMARTEDU_PASSWORD);
    await page.click('#login-button');
    
    await page.waitForNavigation();
    
    const token = await page.evaluate(() => {
        return localStorage.getItem('ND_UC_AUTH');
    });
    
    await browser.close();
    return token;
}
```

### 方案B：定时刷新
在 `textbook-proxy.js` 中添加：

```javascript
// 每6天自动刷新Token
setInterval(async () => {
    accessToken = await autoLogin();
}, 6 * 24 * 60 * 60 * 1000);
```

---

## 🚀 使用示例

### 前端调用示例

```javascript
// 获取PDF并显示
async function loadPDF(bookId) {
    // 1. 获取PDF URL
    const infoRes = await fetch(`http://localhost:3001/api/textbook/${bookId}`);
    const info = await infoRes.json();
    
    // 2. 通过代理加载PDF
    const pdfUrl = `http://localhost:3001/api/pdf/proxy?url=${encodeURIComponent(info.pdfUrl)}`;
    
    // 3. 使用PDF.js渲染
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    // ... 渲染逻辑
}

// 下载PDF
function downloadPDF(bookId) {
    const downloadUrl = `http://localhost:3001/api/pdf/proxy?url=${pdfUrl}`;
    window.open(downloadUrl, '_blank');
}
```

---

## ⚠️ 注意事项

1. **安全性**
   - Token 包含您的登录凭证，请妥善保管
   - 建议在本地环境运行，不要暴露到公网
   - 使用环境变量而非硬编码Token

2. **合法合规**
   - 仅用于个人学习使用
   - 遵守平台服务条款
   - 不得用于商业用途或批量下载

3. **性能优化**
   - 代理服务会缓存Token
   - PDF流式传输，节省内存
   - 可添加Redis缓存PDF URL

---

## 🐛 故障排查

### 问题1：Token失效
```
错误：401 Unauthorized
解决：重新获取Token并设置
```

### 问题2：CORS错误
```
错误：CORS policy blocked
解决：确保后端服务已启动，端口正确
```

### 问题3：PDF无法加载
```
错误：Failed to load PDF
解决：检查PDF URL是否正确，Token是否有效
```

---

## 📝 完整流程总结

1. ✅ **获取Token** - 在智慧教育平台登录并提取
2. ✅ **启动服务** - `npm start` 运行后端代理
3. ✅ **配置Token** - 通过环境变量或API设置
4. ✅ **打开前端** - 访问 `textbook.html`
5. ✅ **选择教材** - 筛选并点击教材卡片
6. ✅ **预览/下载** - 直接在页面预览或一键下载

---

## 🎉 完成后效果

- ✅ 免登录（Token自动处理）
- ✅ 免跳转（iframe内嵌预览）
- ✅ 直接预览（PDF.js渲染）
- ✅ 一键下载（代理流式下载）
- ✅ 全自动化（无需手动操作）

---

需要帮助？请查看：
- GitHub Issue: 相关开源项目
- 技术支持: 项目README
