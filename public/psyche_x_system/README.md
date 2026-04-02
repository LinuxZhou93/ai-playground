# Psyche-X 认知评估系统

## 🧠 系统概述

Psyche-X 是一个基于认知神经科学的智能评估平台，采用 Dual N-Back 范式评估用户的工作记忆和流体智力。

### 核心特性

- ✅ **Dual N-Back 认知任务**: 同时测试视觉位置记忆和听觉字母记忆
- ✅ **自适应难度系统**: 根据实时表现动态调整难度 (1-5 Back)
- ✅ **数据可视化**: Chart.js 实时展示认知能力趋势
- ✅ **赛博朋克 UI**: 沉浸式霓虹风格界面
- ✅ **企业级架构**: FastAPI + SQLAlchemy + SQLite

---

## 🚀 快速启动

### 方式一：一键启动（推荐）

```bash
cd /path/to/Psyche-X
./start.sh
```

### 方式二：手动启动

**Terminal 1 - 后端**:
```bash
cd backend
source venv/bin/activate
python3 run.py
```

**Terminal 2 - 前端**:
```bash
cd frontend
python3 -m http.server 3000
```

**浏览器**:
```
http://localhost:3000
```

---

## 📊 架构设计

```
Psyche-X/
├── backend/              # FastAPI 后端
│   ├── main.py          # 主应用入口
│   ├── models.py        # 数据库模型
│   ├── schemas.py       # Pydantic 数据验证
│   ├── crud.py          # 数据库操作
│   ├── algorithms.py    # 认知评分算法
│   ├── database.py      # 数据库连接
│   └── run.py           # 启动脚本
├── frontend/            # 静态前端
│   └── index.html       # 单页应用
├── start.sh             # 一键启动脚本
└── README.md            # 本文档
```

---

## 🎮 使用指南

### 1. 初始化
- 输入代号 (Callsign)
- 点击 **INITIALIZE**
- 听到 "System Initialized" 表示音频系统就绪

### 2. 游戏规则
- **视觉任务**: 记住 N 步之前的方块位置
- **听觉任务**: 记住 N 步之前的字母
- **按键**:
  - `A` 键: 位置匹配
  - `L` 键: 音频匹配

### 3. 自适应难度
- 准确率 > 80%: 自动升级到 N+1
- 准确率 < 50%: 自动降级到 N-1
- 难度范围: 1-Back 至 5-Back

### 4. 数据上传
- 游戏结束后点击 **UPLOAD TO CORE**
- 查看个人认知能力趋势图

---

## 🔧 技术栈

### 后端
- **框架**: FastAPI
- **ORM**: SQLAlchemy
- **数据库**: SQLite (可升级至 PostgreSQL)
- **服务器**: Uvicorn

### 前端
- **核心**: 原生 JavaScript (ES6+)
- **可视化**: Chart.js
- **样式**: CSS3 (赛博朋克主题)
- **字体**: JetBrains Mono

### 认知科学
- **范式**: Dual N-Back
- **指标**: 
  - 工作记忆 (Gwm)
  - 流体智力 (Gf)
  - 执行功能 (Att)

---

## 📈 数据模型

### User
- `id`: 用户ID
- `username`: 用户名
- `email`: 邮箱
- `age`: 年龄
- `grade`: 年级

### ExamResult
- `id`: 记录ID
- `user_id`: 关联用户
- `score_*`: 五维认知分数
- `session_id`: 会话标识
- `adaptive_level_start/end`: 起始/结束难度
- `raw_data_log`: 原始数据 (JSON)
- `completed_at`: 完成时间

---

## 🛠️ 开发指南

### 添加新认知任务

1. 在 `frontend/index.html` 中创建新的 Game 模式
2. 在 `backend/algorithms.py` 中实现评分算法
3. 更新 `schemas.py` 定义新的数据结构

### 数据库迁移

```bash
cd backend
source venv/bin/activate
python3 -c "from database import engine; from models import Base; Base.metadata.create_all(engine)"
```

---

## 📝 API 文档

访问 `http://127.0.0.1:8000/docs` 查看完整 API 文档 (Swagger UI)

### 主要端点

- `POST /users/`: 用户注册
- `POST /exam/submit?user_id={id}`: 提交考试结果
- `GET /users/{user_id}/stats`: 获取用户统计数据

---

## 🎯 未来规划

- [ ] 多模态认知任务 (Stroop, Raven's Matrices)
- [ ] 实时多人对战模式
- [ ] 机器学习预测模型
- [ ] 移动端适配 (PWA)
- [ ] Docker 容器化部署
- [ ] 云端数据同步

---

## 📄 许可证

MIT License

---

## 👥 贡献者

Psyche-X Team @ Deepmind Advanced Agentic Coding

**Built with 🧠 and ⚡**
