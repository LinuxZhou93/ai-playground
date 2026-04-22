# 碳基极客工程 · 软件环境配置手册

> 本手册供任课教师在开课前完成所有软件环境的安装与测试。预计配置时间：60 分钟。

---

## 1. Arduino IDE 2.x + ESP32 支持

### 安装步骤
1. 下载 Arduino IDE 2.x：https://www.arduino.cc/en/software
2. 打开 **文件 → 首选项 → 附加开发板管理器网址**，添加：
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. 打开 **工具 → 开发板 → 开发板管理器**，搜索 `esp32`，安装 **esp32 by Espressif Systems**（版本 ≥ 2.0.14）
4. 选择开发板：**工具 → 开发板 → ESP32S3 Dev Module**
5. 串口设置：波特率 115200，端口选择对应的 USB 串口

### 必装库
| 库名 | 用途 | 安装方式 |
|:---|:---|:---|
| Adafruit NeoPixel | WS2812B 灯效控制 (L13) | 库管理器搜索安装 |
| ESP32 BLE Arduino | 蓝牙通信 (L10) | 内置，无需额外安装 |
| PID_v1 | PID 控温算法 (L02, L09) | 库管理器搜索安装 |

### 验证测试
上传 Blink 示例到 ESP32-S3，确认板载 LED 闪烁即为成功。

---

## 2. Fusion 360 教育版

### 申请步骤
1. 访问 https://www.autodesk.com/education/edu-software/overview
2. 使用学校邮箱注册教育账号
3. 下载 Fusion 360 教育版（免费，功能完整）
4. 登录后确认左上角显示 **Education License**

### 课程所需功能模块
- **草图 (Sketch)**：L04 人体工学外壳轮廓
- **实体建模 (Solid)**：L04-L05 拉伸/圆角/布尔运算
- **装配 (Assembly)**：L05 嵌入式结构配合
- **工程图 (Drawing)**：L15 产品说明书用图

### 验证测试
能创建一个 50×30×10mm 的圆角矩形盒体即为成功。

---

## 3. 3D 打印切片软件

### 推荐方案（二选一）

#### 方案 A：Cura（推荐新手）
- 下载：https://ultimaker.com/software/ultimaker-cura/
- 添加打印机：Creality Ender-3 V3
- 默认配置：层高 0.2mm，填充 20%，速度 50mm/s

#### 方案 B：PrusaSlicer（推荐进阶）
- 下载：https://www.prusa3d.com/page/prusaslicer_424/
- 添加自定义打印机，设置打印体积 220×220×250mm

### 课程推荐参数
| 参数 | L06 原型版 | L14 轻量版 |
|:---|:---|:---|
| 层高 | 0.2mm | 0.12mm |
| 填充率 | 20% | 15% (蜂窝) |
| 壁厚 | 1.2mm | 0.8mm |
| 支撑 | 树状支撑 | 有机支撑 |
| 材料 | PLA | 玻纤PLA |
| 预计时间 | 2-3h | 4-5h |

---

## 4. Web BLE 调试工具

### Chrome 浏览器配置
1. 使用 Chrome 88+ 版本
2. 确认已开启蓝牙权限：chrome://flags/#enable-web-bluetooth
3. 测试页面：https://nicegui.io/ble_example

### 课程用 Web 技术栈
| 技术 | 版本 | 用途 |
|:---|:---|:---|
| HTML5 | - | 控制面板页面 |
| Web Bluetooth API | Chrome 88+ | ESP32 BLE 通信 |
| Chart.js | 4.x | 实时温度曲线 |

---

## 5. Python + matplotlib

### 安装步骤
```bash
# macOS / Linux
brew install python3
pip3 install matplotlib numpy pandas

# Windows
# 下载 Python 3.11+：https://www.python.org/downloads/
pip install matplotlib numpy pandas
```

### 验证测试
```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.title("碳膜电阻测试 - 正弦波验证")
plt.savefig("test_plot.png")
print("matplotlib 配置成功！")
```

---

## 6. 环境检查清单

开课前请逐项确认：

- [ ] Arduino IDE 能编译上传 ESP32 程序
- [ ] Fusion 360 教育版已激活
- [ ] 切片软件已添加打印机配置文件
- [ ] Chrome 浏览器支持 Web Bluetooth
- [ ] Python + matplotlib 能生成图片
- [ ] 所有学生电脑已安装 CH340/CP2102 USB 驱动
- [ ] 教室 WiFi 可用（L10 Web BLE 需要）

---

*碳基极客工程 · 墨子实验室 × BGI × 天府七中 · 2026*
