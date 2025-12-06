# 🚀 AI聊天功能快速启动指南

## 当前状态
✅ Dify服务已在Docker中运行  
❌ 需要安装Cloudflared并启动隧道

---

## 📋 三步启动

### 步骤1: 安装Cloudflared

**选择一种方式:**

#### 方式A: 使用Homebrew (推荐)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install cloudflare/cloudflare/cloudflared
```

#### 方式B: 直接下载
```bash
cd /Users/zhoulin/Desktop/github/ai-playground
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

### 步骤2: 启动Cloudflare隧道

```bash
cloudflared tunnel --url http://localhost:80
```

**重要**: 保持此终端窗口打开!

你会看到类似输出:
```
Your quick Tunnel has been created! Visit it at:
https://random-words-1234.trycloudflare.com
```

**复制这个URL!** 例如: `https://random-words-1234.trycloudflare.com`

### 步骤3: 更新主页配置

打开**新的**终端窗口,运行:

```bash
cd /Users/zhoulin/Desktop/github/ai-playground
./update-cloudflare-url.sh "https://你复制的URL.trycloudflare.com"
```

---

## ✅ 测试

1. 打开浏览器: http://localhost:8089/index.html
2. 点击左侧AI教练头像
3. 发送消息测试

---

## 🔄 下次使用

每次重启电脑后:

1. **启动Docker** (打开Docker Desktop)
2. **启动隧道**: `cloudflared tunnel --url http://localhost:80`
3. **复制新URL并更新**: `./update-cloudflare-url.sh "新URL"`

---

## ❓ 常见问题

**Q: 为什么每次都要更新URL?**  
A: 免费Cloudflare隧道每次重启会生成新的随机URL

**Q: 可以使用固定URL吗?**  
A: 可以,需要Cloudflare账户和域名,参考 `cloudflare-tunnel-setup.md`

**Q: 隧道启动失败?**  
A: 确认Docker正在运行: `docker ps | grep nginx`

---

## 📝 提交更改(可选)

```bash
git add index.html
git commit -m "chore: 更新Cloudflare隧道URL"
git push origin main
```
