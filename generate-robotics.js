/**
 * Execution: Generate Robotics Module
 */
const { generateCourse } = require('./course_factory_js.js');

const roboticsCourse = {
    title: "机器人学进阶：构建人形智能",
    slug: "robotics-advanced",
    description: "从视觉感知到运动平横，探索人形机器人背后的尖端科技与算法逻辑。开启您的创客大师之路。",
    theme_name: "超脑机器人",
    lessons: [
        {
            id: 1,
            title: "第一课：IMU 与姿态感知的核心",
            type: "video",
            duration_seconds: 720,
            content_url: "https://www.bilibili.com/video/BV1Gg4y1t7Yp" // Placeholder video
        },
        {
            id: 2,
            title: "第二课：深度学习驱动的视觉识别 (YOLO)",
            type: "reading",
            content: "## 视觉神经系统的模拟\\n\\n在机器人学中，视觉识别是赋予机器“智慧”的关键一步。\\n\\n### YOLO 算法原理\\n1. **You Only Look Once**：将目标检测视为回归问题。\\n2. **实时性**：在低功耗嵌入式设备上也能达到 30fps 以上。"
        },
        {
            id: 3,
            title: "第三课：平衡之道：PID 控制算法的奥秘",
            type: "video",
            duration_seconds: 900,
            content_url: "https://www.bilibili.com/video/BV1ds411J7zL" // Placeholder physics video
        },
        {
            id: 4,
            title: "第四课：[实战课] 灵巧手结构的 3D 建模",
            type: "reading",
            content: "## 从解剖学到仿生学\\n\\n### 建模要点\\n- **关节活动度 (ROM)**：确保 3D 打印后可自由旋转。\\n- **轻量化设计**：通过拓扑优化减少重量。"
        },
        {
            id: 5,
            title: "第五课：[考核] 动力学模拟理论测验",
            type: "quiz",
            content: {
                questions: [
                    {
                        text: "在 PID 控制算法中，哪个参数主要用于消除静态误差？",
                        options: ["比例参数 (P)", "积分参数 (I)", "微分参数 (D)", "偏差参数 (E)"],
                        correctIndex: 1
                    },
                    {
                        text: "YOLO 算法相比传统 R-CNN 最显著的优势是什么？",
                        options: ["识别精度更高", "推理速度极快", "需要的算力更大", "支持的模型更多"],
                        correctIndex: 1
                    }
                ]
            }
        }
    ]
};

generateCourse(roboticsCourse);
console.log('Robotics Course Generated successfully.');
