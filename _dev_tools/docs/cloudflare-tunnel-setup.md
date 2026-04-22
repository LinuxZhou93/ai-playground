# Cloudflare隧道设置指南

## 前提条件
确保你已经安装了`cloudflared`工具。如果没有安装,请运行:

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# 或者直接下载
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

## 快速启动隧道

### 方法1: 临时隧道(推荐用于开发测试)

假设你的Dify服务运行在本地端口(例如5001),运行:

```bash
cloudflared tunnel --url http://localhost:5001
```

这会生成一个临时的公网URL,类似:
```
https://random-name-1234.trycloudflare.com
```

**复制这个URL**,然后更新`index.html`中的`API_URL`。

### 方法2: 持久化隧道(推荐用于生产环境)

#### 1. 登录Cloudflare账户
```bash
cloudflared tunnel login
```

#### 2. 创建隧道
```bash
cloudflared tunnel create ai-playground-tunnel
```

#### 3. 配置隧道
创建配置文件 `~/.cloudflared/config.yml`:

```yaml
tunnel: ai-playground-tunnel
credentials-file: /Users/zhoulin/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: ai-playground.your-domain.com
    service: http://localhost:5001
  - service: http_status:404
```

#### 4. 配置DNS
```bash
cloudflared tunnel route dns ai-playground-tunnel ai-playground.your-domain.com
```

#### 5. 运行隧道
```bash
cloudflared tunnel run ai-playground-tunnel
```

## 当前配置信息

### 旧的API配置(需要更新)
- **API_URL**: `https://title-pty-lynn-educational.trycloudflare.com/v1/chat-messages`
- **API_KEY**: `app-XZYyFcpsU6Qk1dIoWDz92ZCR`

### 需要更新的文件
- `index.html` (第2037行)

## 更新步骤

1. **启动Cloudflare隧道**
   ```bash
   # 假设Dify运行在5001端口
   cloudflared tunnel --url http://localhost:5001
   ```

2. **复制生成的URL**
   例如: `https://new-tunnel-name.trycloudflare.com`

3. **更新代码**
   将`index.html`中的API_URL更新为:
   ```javascript
   const API_URL = 'https://new-tunnel-name.trycloudflare.com/v1/chat-messages';
   ```

4. **提交并推送**
   ```bash
   git add index.html
   git commit -m "feat: 更新AI API Cloudflare隧道地址"
   git push origin main
   ```

## 注意事项

- 临时隧道每次重启会生成新的URL,需要重新更新代码
- 持久化隧道需要Cloudflare账户和域名
- 确保Dify服务正在运行
- 测试新URL是否可以访问: `curl https://your-tunnel-url.trycloudflare.com/v1/chat-messages`
