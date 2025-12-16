# 🤖 Dify AI 助教集成指南

## 📋 概述

AI 助教现已支持 **Dify** 和 **DeepSeek** 两种后端，推荐使用 Dify 以避免 CORS 问题。

---

## 🎯 为什么选择 Dify？

### ✅ 优势
- **无 CORS 问题** - 本地部署，无跨域限制
- **免费使用** - 本地运行，无 API 费用
- **数据隐私** - 所有数据保存在本地
- **可定制** - 可以自定义 AI 助教的行为
- **稳定可靠** - 不依赖外部服务

### ❌ DeepSeek 的问题
- CORS 跨域限制
- 需要本地代理服务器
- 依赖网络连接
- 有 API 使用费用

---

## 🚀 Dify 集成步骤

### **步骤 1: 启动 Dify**

如果您已经有 Dify 本地部署：

```bash
# 进入 Dify 目录
cd /path/to/dify

# 启动 Dify
docker-compose up -d
```

访问 Dify：`http://localhost`

---

### **步骤 2: 创建 AI 助教应用**

1. **登录 Dify 控制台**
   - 访问 `http://localhost`
   - 使用您的账号登录

2. **创建新应用**
   - 点击 "创建应用"
   - 选择 "聊天助手"
   - 命名：`FutureAI 课程助教`

3. **配置系统提示词**
   ```
   你是 FutureAI 2.0，一位专业的课程助教。
   
   你的职责：
   - 解答学生的课程相关问题
   - 提供学习建议和思路
   - 深入解释知识点
   - 推荐相关学习资源
   
   回答要求：
   - 简洁、友好、专业
   - 使用 Markdown 格式组织内容
   - 适当使用 emoji 增加亲和力
   - 鼓励学生深入思考
   ```

4. **选择模型**
   - 推荐：`gpt-3.5-turbo` 或 `gpt-4`
   - 或使用本地模型（如果已配置）

5. **调整参数**
   - Temperature: `0.7`
   - Max Tokens: `2000`
   - Top P: `0.9`

6. **发布应用**
   - 点击 "发布"
   - 复制 **API Key**（格式：`app-xxxxx`）

---

### **步骤 3: 配置 course.html**

打开 `course.html`，找到 Dify 配置部分（约第 580 行）：

```javascript
// Dify API 配置（推荐）
const DIFY_CONFIG = {
    // 粘贴您的 Dify API Key
    apiKey: 'app-YOUR_DIFY_API_KEY',  // ← 替换这里
    // Dify API 地址
    apiUrl: 'http://localhost/v1/chat-messages',
    user: 'course-student-' + Date.now()
};

// 当前使用的配置
const USE_DIFY = true;  // ← 确保为 true
```

**替换为**：

```javascript
const DIFY_CONFIG = {
    apiKey: 'app-实际的API密钥',  // 从 Dify 复制
    apiUrl: 'http://localhost/v1/chat-messages',
    user: 'course-student-' + Date.now()
};

const USE_DIFY = true;
```

---

### **步骤 4: 测试**

1. **刷新课程页面**
   ```
   打开 course.html?id=102
   ```

2. **打开 AI 助教**
   - 点击右侧 AI 助教面板
   - 应该看到欢迎消息

3. **发送测试消息**
   - 输入："你好"
   - 按回车发送
   - 等待 AI 回复

4. **测试语音输入**
   - 点击 🎤 按钮
   - 说话测试
   - 查看识别结果

---

## 🔄 切换 API 后端

### **使用 Dify（推荐）**

```javascript
const USE_DIFY = true;
```

### **使用 DeepSeek（需要代理）**

```javascript
const USE_DIFY = false;

// 确保代理服务器运行
// node deepseek-proxy.js
```

---

## 📊 API 对比

| 特性 | Dify | DeepSeek |
|------|------|----------|
| CORS 问题 | ✅ 无 | ❌ 有 |
| 部署方式 | 本地 | 云端 |
| 费用 | 免费 | 按量计费 |
| 数据隐私 | ✅ 本地 | ⚠️ 云端 |
| 需要代理 | ❌ 否 | ✅ 是 |
| 稳定性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 推荐度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🐛 故障排查

### **问题 1: Dify 无法连接**

**症状**：
```
⚠️ 网络连接失败
请检查 Dify 是否正在运行
```

**解决方案**：
```bash
# 检查 Dify 是否运行
docker ps | grep dify

# 如果没有运行，启动 Dify
cd /path/to/dify
docker-compose up -d

# 检查端口
curl http://localhost
```

---

### **问题 2: API Key 无效**

**症状**：
```
⚠️ API 密钥无效
请检查 Dify API Key 是否正确配置
```

**解决方案**：
1. 登录 Dify 控制台
2. 进入应用设置
3. 重新生成 API Key
4. 复制并更新到 `course.html`

---

### **问题 3: 无响应**

**症状**：一直显示加载动画，没有回复

**解决方案**：
1. **检查浏览器控制台**
   - 按 F12
   - 查看 Console 错误
   - 查看 Network 请求

2. **检查 Dify 日志**
   ```bash
   docker logs dify-api
   ```

3. **验证 API 地址**
   ```bash
   curl -X POST http://localhost/v1/chat-messages \
     -H "Authorization: Bearer app-YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"inputs":{},"query":"你好","response_mode":"blocking","user":"test"}'
   ```

---

## 🎨 自定义 AI 助教

### **修改系统提示词**

在 Dify 控制台中：

1. 进入应用编辑页面
2. 修改 "系统提示词"
3. 例如，添加特定学科知识：

```
你是 FutureAI 2.0，专精于天文学的课程助教。

你的知识库包括：
- 宇宙学基础理论
- 恒星演化过程
- 黑洞物理学
- 系外行星探索
- 天文观测技术

回答时请：
- 使用准确的科学术语
- 提供具体的例子
- 引用最新的研究成果
- 鼓励学生进行观测实践
```

---

### **添加知识库**

1. 在 Dify 中创建知识库
2. 上传课程相关文档
3. 在应用中关联知识库
4. AI 将基于知识库回答问题

---

### **调整回答风格**

修改 Temperature 参数：

- **0.3-0.5**: 严谨、准确（适合科学课程）
- **0.7-0.9**: 创意、灵活（适合艺术课程）
- **1.0+**: 发散、多样（适合头脑风暴）

---

## 📈 性能优化

### **1. 启用缓存**

在 Dify 中启用对话缓存，减少重复计算。

### **2. 限制 Token**

```javascript
// 在 callDifyAPI 中
body: JSON.stringify({
    inputs: {},
    query: contextMessage,
    response_mode: "streaming",
    conversation_id: "",
    user: DIFY_CONFIG.user,
    // 添加 Token 限制
    max_tokens: 1000  // 根据需要调整
})
```

### **3. 使用对话 ID**

保持对话连续性：

```javascript
let conversationId = '';

// 在 callDifyAPI 中
conversation_id: conversationId || "",

// 保存返回的 conversation_id
if (parsed.conversation_id && !conversationId) {
    conversationId = parsed.conversation_id;
}
```

---

## 🔒 安全建议

### **1. 保护 API Key**

```javascript
// ❌ 不要提交到 Git
const DIFY_CONFIG = {
    apiKey: 'app-secret-key',  // 危险！
    ...
};

// ✅ 使用环境变量
const DIFY_CONFIG = {
    apiKey: process.env.DIFY_API_KEY || 'app-default',
    ...
};
```

### **2. 限制访问**

在 Dify 中设置：
- IP 白名单
- 请求频率限制
- 用户认证

### **3. 监控使用**

定期检查 Dify 日志，防止滥用。

---

## 📚 相关资源

- [Dify 官方文档](https://docs.dify.ai/)
- [Dify GitHub](https://github.com/langgenius/dify)
- [API 参考](https://docs.dify.ai/api-reference)

---

## 🎉 总结

使用 Dify 的优势：

1. ✅ **无需代理** - 直接本地调用
2. ✅ **完全免费** - 无 API 费用
3. ✅ **数据安全** - 本地存储
4. ✅ **高度可定制** - 自由配置
5. ✅ **稳定可靠** - 不依赖外网

**推荐配置**：
- 使用 Dify 作为主要后端
- DeepSeek 作为备用方案
- 定期备份 Dify 数据

---

**配置完成后，刷新 `course.html` 即可使用！** 🚀
