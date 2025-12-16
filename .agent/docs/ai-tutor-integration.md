# 🤖 AI 助教集成指南 - DeepSeek API

## 📋 功能概述

AI 助教已成功集成到课程学习页面（`course.html`），使用 **DeepSeek-V3** 模型提供智能问答服务。

### ✨ 核心功能

- 📚 **课程内容解答** - 回答课程相关问题
- 💡 **学习建议** - 提供个性化学习思路
- 🔍 **知识点深入解释** - 详细讲解难点
- 🎯 **资源推荐** - 推荐相关学习材料
- 💬 **流式响应** - 实时显示 AI 回复
- 📱 **响应式设计** - 完美适配移动端

---

## 🔑 配置 DeepSeek API Key

### 步骤 1: 获取 API Key

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 **API Keys** 页面
4. 点击 **Create API Key**
5. 复制生成的 API Key（格式：`sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 步骤 2: 配置到代码中

打开 `course.html`，找到以下代码（约第 480 行）：

```javascript
// DeepSeek API 配置
const DEEPSEEK_CONFIG = {
    apiKey: 'YOUR_DEEPSEEK_API_KEY_HERE', // 请替换为您的 API Key
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
};
```

**替换为**：

```javascript
// DeepSeek API 配置
const DEEPSEEK_CONFIG = {
    apiKey: 'sk-你的实际API密钥', // 粘贴您的 API Key
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
};
```

### 步骤 3: 保存并测试

1. 保存 `course.html` 文件
2. 刷新浏览器页面
3. 点击右侧 **🤖 AI 课程助教** 面板
4. 输入问题测试（例如："请解释一下宇宙大爆炸理论"）

---

## 🎨 UI 界面

### 桌面端
```
┌─────────────────────────────────────────────┐
│  课程列表  │    主内容区    │  AI 助教面板  │
│            │                │               │
│  进度条    │   视频播放器   │  🤖 标题栏    │
│            │                │               │
│  课程1 ✓   │   课程内容     │  聊天历史     │
│  课程2 ✓   │                │               │
│  课程3 →   │   控制按钮     │  输入框       │
│            │                │               │
└─────────────────────────────────────────────┘
```

### 移动端
- 右侧面板默认隐藏
- 点击 **🤖 AI助教** 按钮展开
- 点击 **✕** 按钮收起

---

## 🔧 技术细节

### API 调用流程

```
用户输入问题
    ↓
构建上下文（课程名称 + 当前章节）
    ↓
发送到 DeepSeek API (流式请求)
    ↓
实时接收并显示回复
    ↓
自动滚动到底部
```

### 上下文注入

AI 助教会自动获取当前课程上下文：

```javascript
const contextMessage = `当前课程：${course.value.title}
当前章节：${currentLesson.value?.title}

`;
```

这样 AI 可以提供更精准的课程相关回答。

### System Prompt

```javascript
{
    role: 'system',
    content: `你是一位专业的课程助教，正在帮助学生学习「${course.value.title}」课程。
    请用简洁、友好的方式回答问题，必要时可以使用 Markdown 格式来组织内容。`
}
```

---

## 📊 API 参数配置

当前配置：

| 参数 | 值 | 说明 |
|------|-----|------|
| `model` | `deepseek-chat` | DeepSeek 聊天模型 |
| `stream` | `true` | 启用流式响应 |
| `temperature` | `0.7` | 创造性（0-2，越高越发散） |
| `max_tokens` | `2000` | 最大回复长度 |

### 调整参数

如需修改 AI 行为，可调整以下参数：

```javascript
body: JSON.stringify({
    model: DEEPSEEK_CONFIG.model,
    messages: messages,
    stream: true,
    temperature: 0.7,      // 调整创造性
    max_tokens: 2000,      // 调整回复长度
    top_p: 0.9,           // 可选：核采样
    frequency_penalty: 0   // 可选：重复惩罚
})
```

---

## 🎯 Markdown 支持

AI 回复支持简单的 Markdown 格式：

| Markdown | 渲染效果 |
|----------|---------|
| `**粗体**` | **粗体** |
| `*斜体*` | *斜体* |
| `` `代码` `` | `代码` |
| 换行 | `<br>` |

---

## 🐛 故障排查

### 问题 1: AI 无响应

**可能原因**：
- API Key 未配置或错误
- 网络连接问题
- API 配额用尽

**解决方案**：
1. 检查浏览器控制台（F12）查看错误信息
2. 验证 API Key 是否正确
3. 检查 DeepSeek 账户余额

### 问题 2: 回复乱码

**可能原因**：
- 流式响应解析错误

**解决方案**：
- 检查网络稳定性
- 刷新页面重试

### 问题 3: 侧边栏不显示

**可能原因**：
- Vue 状态未正确导出

**解决方案**：
- 确认 `return` 对象中包含所有 AI 助教相关状态
- 检查浏览器控制台是否有 Vue 错误

---

## 💰 费用说明

DeepSeek API 采用按量计费：

- **输入**: ~¥0.001 / 1K tokens
- **输出**: ~¥0.002 / 1K tokens

**预估成本**：
- 单次对话（500字）：约 ¥0.001
- 100次对话：约 ¥0.1

💡 **建议**: 设置 API 使用限额，避免意外超支。

---

## 🔒 安全建议

### ⚠️ 重要提示

1. **不要将 API Key 提交到公开仓库**
   ```bash
   # 添加到 .gitignore
   echo "course.html" >> .gitignore
   ```

2. **使用环境变量（生产环境）**
   ```javascript
   const DEEPSEEK_CONFIG = {
       apiKey: process.env.DEEPSEEK_API_KEY,
       // ...
   };
   ```

3. **定期轮换 API Key**
   - 每月更换一次
   - 发现泄露立即撤销

---

## 🚀 未来优化方向

### 短期计划
- [ ] 添加对话历史持久化（localStorage）
- [ ] 支持多轮对话上下文
- [ ] 添加"清空对话"按钮
- [ ] 优化 Markdown 渲染（支持列表、链接）

### 中期计划
- [ ] 集成语音输入/输出
- [ ] 添加预设问题快捷按钮
- [ ] 支持代码高亮显示
- [ ] 添加对话导出功能

### 长期愿景
- [ ] 多模态支持（图片、视频）
- [ ] 个性化学习路径推荐
- [ ] 集成知识图谱
- [ ] AI 自动生成练习题

---

## 📚 参考资源

- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Vue 3 官方文档](https://vuejs.org/)
- [Markdown 语法指南](https://www.markdownguide.org/)

---

## 📞 技术支持

如遇问题，请检查：
1. 浏览器控制台（F12 → Console）
2. Network 标签（查看 API 请求）
3. DeepSeek 平台状态页

---

**集成完成时间**: 2025-12-16  
**版本**: v1.0  
**维护者**: AI Playground Team
