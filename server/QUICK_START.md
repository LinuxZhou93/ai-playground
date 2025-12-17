# 🚀 智慧教材系统 - 快速参考卡

## 📋 目录结构
```
ai-playground/
├── textbook.html          # 前端页面（电子教材浏览器）
└── server/
    ├── puppeteer-proxy.js # Puppeteer后端服务
    ├── start.sh           # 🌟 一键启动脚本
    ├── package.json       # 项目配置
    ├── PUPPETEER_GUIDE.md # 详细文档
    └── README.md          # 完整说明
```

---

## ⚡ 3步快速开始

### 1️⃣ 进入目录
```bash
cd /Users/zhoulin/Desktop/github/ai-playground/server
```

### 2️⃣ 运行启动脚本
```bash
./start.sh
```

### 3️⃣ 根据提示操作
- 输入智慧教育平台的账号密码
- 选择启动模式（推荐首次用"可视化模式"）
- 等待服务启动完成

---

## 🎯 完整使用流程

```
┌─────────────────────────────────────────┐
│ 1. cd server && ./start.sh              │
│    ↓                                    │
│ 2. 输入账号密码                          │
│    ↓                                    │
│ 3. 选择"可视化模式"                      │
│    ↓                                    │
│ 4. 看到浏览器自动登录                    │
│    ↓                                    │
│ 5. 打开 textbook.html                   │
│    ↓                                    │
│ 6. 筛选并点击任意教材                    │
│    ↓                                    │
│ 7. 🎉 PDF自动加载！                      │
└─────────────────────────────────────────┘
```

---

## 🔧 常用命令

### 启动服务
```bash
# 方式1：一键启动（推荐）
./start.sh

# 方式2：可视化模式
npm run start:headful

# 方式3：后台模式
npm run start:puppeteer
```

### 检查状态
```bash
curl http://localhost:3001/health
```

### 停止服务
按 `Ctrl + C`

---

## 📊 前端功能展示

### 筛选器
```
学段: [全部] [小学] [初中] [高中]
学科: [全部] [语文] [数学] [英语] ...
出版社: [全部] [人教版] [北师大版] ...
```

### 搜索
```
🔍 搜索教材名称、学科、年级...
```

### 教材卡片
```
┌─────────────────┐
│  📖 (封面图标)   │
│─────────────────│
│ 语文一年级上册   │
│ [小学] [人教版]  │
│ 语文 | 上        │
│ [点击查看详情]   │
└─────────────────┘
```

### Modal预览
```
┌────────────────────────────┐
│ 📚 语文一年级上册  [📥 下载]│
├────────────────────────────┤
│                            │
│    [PDF Canvas渲染区]       │
│    (高清、可翻页)           │
│                            │
├────────────────────────────┤
│ ◀上一页 | 1/120 | 下一页▶  │
└────────────────────────────┘
```

---

## ❓ 常见问题

### Q1: 首次启动很慢？
A: Puppeteer需要下载Chrome（约150MB），请耐心等待。
```bash
# 使用国内镜像加速
export PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors
npm install
```

### Q2: 服务启动但PDF加载失败？
A: 检查登录状态
```bash
curl http://localhost:3001/health
```
应显示 `"isLoggedIn": true`

### Q3: 如何查看浏览器在做什么？
A: 使用可视化模式
```bash
npm run start:headful
```

### Q4: 如何获取当前页面截图？
A: 
```bash
curl http://localhost:3001/api/screenshot --output debug.png
open debug.png
```

### Q5: 密码输错了怎么办？
A: 重新设置环境变量
```bash
export SMARTEDU_USERNAME="正确的用户名"
export SMARTEDU_PASSWORD="正确的密码"
npm run start:headful
```

---

## 🎁 额外功能

### 1. 后端状态检查按钮
前端页面出错时，点击"检查后端状态"按钮

### 2. API直接调用
```bash
# 搜索教材
curl -X POST http://localhost:3001/api/textbook/search \
  -H "Content-Type: application/json" \
  -d '{
    "name": "语文一年级上册",
    "grade": "小学",
    "subject": "语文"
  }'

# 手动登录
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"xxx","password":"xxx"}'
```

---

## 📈 性能优化

### 首次加载慢？
- Chrome下载：第一次运行需要下载
- 登录验证：约3-5秒
- PDF加载：取决于网络速度

### 后续使用
- 已登录：直接搜索，秒开
- 浏览器复用：无需重新启动
- 缓存优化：重复教材加载更快

---

## 🔒 安全与隐私

✅ 账号密码仅存储在本地环境变量  
✅ 不会上传到任何服务器  
✅ Puppeteer在本地运行  
✅ 所有连接均为HTTPS加密  
✅ 建议定期更换密码  

---

## 📞 获取帮助

1. **查看详细文档**
   ```bash
   cat server/PUPPETEER_GUIDE.md
   ```

2. **查看日志**
   ```bash
   # 可视化模式下，终端会显示所有日志
   npm run start:headful
   ```

3. **常见错误**
   - `ECONNREFUSED`: 服务未启动
   - `401 Unauthorized`: 密码错误
   - `Timeout`: 网络问题

---

## 🎉 成功标志

当看到以下提示，说明一切正常：

**后端**:
```
📚 Puppeteer代理服务运行在 http://localhost:3001
✅ 登录成功！
```

**前端**:
- 点击教材后看到加载动画
- PDF成功渲染显示
- 可以翻页查看
- 可以一键下载

---

## 💡 提示

- 🌟 **首次使用推荐可视化模式** - 可以看到整个自动化过程
- ⚡ **日常使用后台模式** - 节省资源
- 🔄 **登录过期自动刷新** - 无需手动操作
- 📚 **支持所有教材** - 小学到高中全覆盖

---

**享受无障碍的教材浏览体验！** 🎊
