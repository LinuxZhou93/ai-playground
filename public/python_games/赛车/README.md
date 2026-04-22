# 赛车小游戏

一个用 Python 和 Tkinter 开发的简单 2D 赛车游戏。**无需安装任何额外依赖**。

## 游戏规则

- 控制你的赛车躲避迎面而来的障碍物
- 躲避的障碍物越多，得分越高
- 碰撞到障碍物游戏结束

## 操作方式

- **左箭头** / **A键**: 向左移动
- **右箭头** / **D键**: 向右移动
- **空格键**: 开始游戏/重新开始
- **ESC**: 退出游戏

## 安装和运行

### 方法 1: 直接运行（推荐）

```bash
python3 racing_game.py
```

### 方法 2: 使用 Python 2

```bash
python racing_game.py
```

## 游戏特性

- ✅ 简单直观的游戏界面
- ✅ 逐渐加速的难度
- ✅ 实时分数显示
- ✅ 碰撞检测
- ✅ 游戏结束提示和重新开始功能
- ✅ 零依赖（仅使用 Python 内置 tkinter 库）

## 系统要求

- Python 3.6+（或 Python 2.7+）
- Tkinter（通常与 Python 一起安装）

## 故障排除

如果遇到 tkinter 未找到的错误，请安装 tkinter：

**macOS:**
```bash
brew install python-tk@3.11  # 根据你的 Python 版本调整
```

**Ubuntu/Debian:**
```bash
sudo apt-get install python3-tk
```

**Windows:**
在安装 Python 时选择 "tcl/tk and IDLE" 选项
