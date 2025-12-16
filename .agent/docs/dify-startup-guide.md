# 🚀 Dify 快速启动指南

## 当前状态

Docker 已启动，但 Dify 容器下载遇到网络问题。

---

## 📋 解决方案

### **方案 1: 配置 Docker 镜像加速（推荐）**

1. **打开 Docker Desktop**
   - 已经打开

2. **配置镜像源**
   - 点击 Docker Desktop 图标
   - Settings → Docker Engine
   - 添加以下配置：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://docker.mirrors.ustc.edu.cn",
    "https://docker.nju.edu.cn"
  ]
}
```

3. **重启 Docker**
   - 点击 "Apply & Restart"

4. **重新启动 Dify**
```bash
cd /Users/zhoulin/dify/docker
docker-compose down
docker-compose up -d
```

---

### **方案 2: 使用已有的 Dify 实例**

如果您之前已经运行过 Dify，可以直接启动：

```bash
cd /Users/zhoulin/dify/docker
docker-compose start
```

---

### **方案 3: 使用本地 DeepSeek（临时方案）**

在 Dify 启动之前，可以先使用 DeepSeek：

1. **确保代理运行**
   ```bash
   # 已在运行
   node deepseek-proxy.js
   ```

2. **配置 course.html**
   ```javascript
   const USE_DIFY = false;  // 暂时使用 DeepSeek
   ```

3. **刷新页面测试**

---

## 🔍 检查 Dify 状态

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看 Dify 日志
cd /Users/zhoulin/dify/docker
docker-compose logs -f
```

---

## 📞 下一步

请选择：

1. **配置镜像加速** - 我来帮您配置
2. **检查已有容器** - 看看是否有之前的 Dify 实例
3. **使用 DeepSeek** - 先用 DeepSeek 测试功能

请告诉我您想选择哪个方案？
