# Psyche-X™ 快速开始指南

## 🚀 5分钟快速启动

### 方式一：一键启动（推荐）
```bash
cd /Users/xg/.gemini/antigravity/playground/metallic-universe/Psyche-X
bash start.sh
```

等待系统启动后，浏览器会自动打开应用。

### 方式二：手动启动

**Terminal 1 - 启动后端**:
```bash
cd /Users/xg/.gemini/antigravity/playground/metallic-universe/Psyche-X/backend
source venv/bin/activate
python3 run.py
```

**Terminal 2 - 启动前端**:
```bash
cd /Users/xg/.gemini/antigravity/playground/metallic-universe/Psyche-X/frontend
python3 -m http.server 3000
```

**浏览器访问**:
```
http://localhost:3000/working.html
```

---

## 🎮 使用流程

### 1. 登录页面
- 输入受试者编号（例如：MIT-2024-001）
- 点击 **INITIALIZE** 按钮
- 听到 "System Initialized" 确认音频就绪

### 2. 游戏页面
- 观察 3×3 网格中点亮的方块
- 聆听播报的字母
- 判断当前刺激是否与 N 步之前匹配：
  - 按 **A** 键：位置匹配
  - 按 **L** 键：字母匹配
  - 可同时按两个键

### 3. 结果页面
- 查看最终得分
- 点击 **UPLOAD TO CORE** 提交数据
- 点击 **VIEW REPORT** 查看详细报告

### 4. 报告页面
- 查看雷达图（5维认知能力）
- 查看等级评定（A-E）
- 阅读个性化训练建议

---

## 🔧 常见问题

### Q: 点击按钮没反应？
**A**: 检查后端是否运行：
```bash
curl http://127.0.0.1:8000/api/status
```
应该返回：`{"status":"Online","mode":"Modular V2"}`

### Q: 听不到声音？
**A**: 
1. 检查浏览器音量设置
2. 确认浏览器允许音频播放
3. 刷新页面重新初始化

### Q: 报告显示"数据不足"？
**A**: 至少需要完成 2-3 次游戏才能生成报告

### Q: 数据上传失败？
**A**: 
1. 确认后端正在运行（Port 8000）
2. 检查浏览器控制台错误信息（F12）
3. 重启后端服务

---

## 📊 推荐版本

### Premium 版本（推荐）
```
http://localhost:3000/working.html
```
- ✅ 企业级 UI 设计
- ✅ 动态背景效果
- ✅ 完整功能支持
- ✅ 已验证稳定性

### 原版（备选）
```
http://localhost:3000/index.html
```
- 赛博朋克风格
- 所有功能相同

### 调试版本
```
http://localhost:3000/debug.html
```
- 用于测试基本功能
- 实时日志输出

---

## 🎯 游戏规则详解

### N-Back 是什么？
N-Back 是一种工作记忆训练任务。"N" 表示需要记住前 N 步的信息。

### 示例（2-Back）
```
试炼 1: 位置=5, 字母=C  → 无需按键（前面没有2步）
试炼 2: 位置=2, 字母=H  → 无需按键（前面只有1步）
试炼 3: 位置=5, 字母=K  → 按A键（位置与试炼1相同）
试炼 4: 位置=2, 字母=H  → 按A+L键（位置和字母都与试炼2相同）
```

### 计分规则
- ✅ 正确匹配：+10 分
- ❌ 漏报（应按未按）：-5 分
- ❌ 误报（不应按却按）：-5 分

### 自适应难度
- 表现好（准确率 >80%）→ 自动升级到 3-Back, 4-Back...
- 表现差（准确率 <50%）→ 自动降级

---

## 📈 数据说明

### 5维认知能力
1. **Gf (流体智力)**: 解决新问题的能力
2. **Gwm (工作记忆)**: 短期信息保持和操作能力
3. **Att (执行功能)**: 注意力控制和反应速度
4. **Meta (元认知)**: 自我监控和调节能力
5. **Res (心理韧性)**: 面对困难的坚持度

### 等级评定
- **A**: 优秀（前10%）
- **B**: 良好（前30%）
- **C**: 中等（前60%）
- **D**: 需提升（前85%）
- **E**: 需加强（后15%）

---

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript + Chart.js
- **后端**: Python + FastAPI + SQLAlchemy
- **数据库**: SQLite
- **部署**: Uvicorn + Python http.server

---

## 📞 获取帮助

### 查看完整文档
```bash
cat PROJECT_SUMMARY.md
```

### 查看 API 文档
```
http://127.0.0.1:8000/docs
```

### 测试 API
```
http://localhost:3000/test.html
```

---

**Psyche-X™ Professional - Ready to Use!**

*如有问题，请查看 PROJECT_SUMMARY.md 获取详细技术文档*
