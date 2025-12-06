# 快速更新Cloudflare隧道URL指南

## 问题说明
免费的Cloudflare隧道URL会定期过期,需要重新启动隧道并更新URL。

## 当前配置
- **API_KEY**: `app-XZYyFcpsU6Qk1dIoWDz92ZCR` (保持不变)
- **当前URL**: `https://title-pty-lynn-educational.trycloudflare.com`

## 快速更新步骤

### 方法1: 使用自动脚本(推荐)

1. **启动新的Cloudflare隧道**
   ```bash
   # 假设你的Dify服务在5001端口
   cloudflared tunnel --url http://localhost:5001
   ```
   
   复制生成的URL,例如: `https://new-tunnel-name.trycloudflare.com`

2. **运行更新脚本**
   ```bash
   ./update-cloudflare-url.sh "https://new-tunnel-name.trycloudflare.com"
   ```

3. **提交并推送**
   ```bash
   git add index.html
   git commit -m "chore: 更新Cloudflare隧道URL"
   git push origin main
   ```

### 方法2: 手动更新

编辑 `index.html` 第2037行:
```javascript
const API_URL = 'https://你的新隧道URL.trycloudflare.com/v1/chat-messages';
```

## 注意事项
- 只需要更新URL,API_KEY保持不变
- 确保URL以 `/v1/chat-messages` 结尾
- 更新后在浏览器测试: http://localhost:8089/index.html
