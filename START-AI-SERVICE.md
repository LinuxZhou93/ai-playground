# 本地AI聊天功能完整启动指南

## 当前状态

✅ **Dify服务已运行** (Docker容器运行中)
- Nginx: 端口 80, 443
- Dify API: 内部端口 5001
- Dify Web: 内部端口 3000

❌ **Cloudflare隧道未安装**

## 完整启动步骤

### 步骤1: 安装Cloudflared

在终端运行:

```bash
brew install cloudflare/cloudflare/cloudflared
```

### 步骤2: 启动Cloudflare隧道

```bash
# 为Nginx服务创建隧道(推荐)
cloudflared tunnel --url http://localhost:80
```

**或者**,如果你想直接连接Dify API:

```bash
# 需要先找到docker-api-1容器的内部IP
docker inspect docker-api-1 | grep IPAddress
# 然后使用该IP启动隧道
cloudflared tunnel --url http://172.x.x.x:5001
```

### 步骤3: 复制隧道URL

终端会显示类似:
```
Your quick Tunnel has been created! Visit it at:
https://random-name-1234.trycloudflare.com
```

**复制这个URL!**

### 步骤4: 更新主页配置

运行更新脚本:

```bash
cd /Users/zhoulin/Desktop/github/ai-playground
./update-cloudflare-url.sh "https://random-name-1234.trycloudflare.com"
```

### 步骤5: 测试AI聊天

1. 打开浏览器访问: http://localhost:8089/index.html
2. 点击AI教练头像
3. 发送测试消息

### 步骤6: 提交更改(可选)

```bash
git add index.html
git commit -m "chore: 更新Cloudflare隧道URL"
git push origin main
```

## 快速启动脚本

我已经为你创建了一个一键启动脚本,运行:

```bash
./start-ai-service.sh
```

## 故障排查

### 问题1: Cloudflared未安装
**解决**: 运行 `brew install cloudflare/cloudflare/cloudflared`

### 问题2: Docker服务未运行
**解决**: 
```bash
# 查找docker-compose.yml位置
cd ~/dify  # 或你的Dify安装目录
docker-compose up -d
```

### 问题3: 隧道连接失败
**解决**: 
- 确认Docker服务正在运行: `docker ps`
- 确认端口80可访问: `curl http://localhost:80`
- 重启隧道

### 问题4: API返回错误
**解决**: 
- 检查API_KEY是否正确
- 确认隧道URL已更新
- 清除浏览器缓存并刷新页面
