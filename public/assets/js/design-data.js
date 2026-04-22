/**
 * TITAN STUDIO DESIGN COURSE DATA v2.0 - COMPREHENSIVE TEEN EDITION
 * A full curriculum based on global STEM + Art (STEAM) standards.
 */

const designCourseData = {
    settings: {
        theme: 'studio-light',
        currentLang: 'zh'
    },

    categories: [
        { id: 'generative', name: { zh: '生成艺术', en: 'Generative Art' }, icon: '🌀' },
        { id: 'industrial', name: { zh: '工业美学', en: 'Industrial Tech' }, icon: '🦾' },
        { id: 'cyber', name: { zh: '赛博交互', en: 'Cyber UI/UX' }, icon: '👓' },
        { id: 'ai', name: { zh: 'AIGC 视觉', en: 'AI Orchestration' }, icon: '👁️' }
    ],

    lessons: [
        // --- 🌀 GENERATIVE ART TRACK (p5.js FOCUS) ---
        {
            id: 'gen-01', cat: 'generative',
            title: '创意编程入门：代码即画笔',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1pP4y1t7Yp',
            desc: '理解为什么代码是 21 世纪最重要的艺术媒介。搭建第一个 p5.js 环境。',
            tasks: ['访问 p5.js Web Editor', '修改 background() 颜色并运行']
        },
        {
            id: 'gen-02', cat: 'generative',
            title: '数字画布坐标系：点、线、面',
            type: 'interactive',
            desc: '学习计算机显示器的二维坐标系统 (0,0) 位置，以及基本图形函数。',
            content: `
                ### 核心函数：
                - \`ellipse(x, y, w, h)\`: 绘制椭圆/圆
                - \`rect(x, y, w, h)\`: 绘制矩形
                - \`line(x1, y1, x2, y2)\`: 绘制线条
                
                > 注意：在 p5.js 中，坐标原点 (0,0) 位于左上角。
            `,
            tasks: ['绘制一个由三个不同颜色圆组成的图案', '尝试绘制一个三角形 (triangle)']
        },
        {
            id: 'gen-03', cat: 'generative',
            title: '赋予生命：Draw Loop 循环动画',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1v4411v7S4',
            desc: '理解 setup() 和 draw() 的区别。利用变量实现物体的平移。',
            tasks: ['让一个球屏从左向右移动', '尝试利用 frameCount 改变球的大小']
        },
        {
            id: 'gen-04', cat: 'generative',
            title: '交互美学：鼠标与键盘输入',
            type: 'reading',
            content: `
                ### 实时互动控制
                - \`mouseX\`, \`mouseY\`: 获取鼠标当前坐标。
                - \`mouseIsPressed\`: 检测鼠标是否按下。
                
                #### 挑战任务：
                创建一个跟随鼠标旋转的彩色几何体。当鼠标点击时，改变颜色。
            `,
            desc: '让你的艺术品对人类的动作做出响应。'
        },
        {
            id: 'gen-05', cat: 'generative',
            title: '数学之美：Sin/Cos 周期律',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1pG4y1a7zF',
            desc: '如何利用三角函数创造丝滑、自然的波浪效果。',
            tasks: ['模拟海浪的律动', '制作一个呼吸灯效果的渐变圆']
        },

        // --- 🦾 INDUSTRIAL TECH TRACK ---
        {
            id: 'ind-01', cat: 'industrial',
            title: '设计思维：从同理心开始',
            type: 'reading',
            content: `
                ### 设计思维五部曲 (Design Thinking)
                1. **共情 (Empathize)**：通过观察理解用户需求。
                2. **定义 (Define)**：明确要解决的核心痛点。
                3. **设想 (Ideate)**：头脑风暴，不设限地产生方案。
                4. **原型 (Prototype)**：低成本制作模型（纸板或 3D 打印）。
                5. **测试 (Test)**：根据反馈不断迭代。
            `,
            desc: '工业设计不仅仅是画图，是解决复杂问题的逻辑体系。'
        },
        {
            id: 'ind-02', cat: 'industrial',
            title: '3D 建模入门：Tinkercad 极速上手',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1os411r7Pz',
            desc: '学习加法建模与减法建模，制作第一个 3D 构件。',
            tasks: ['设计一个极简主义的耳机挂架', '导出一个适合 3D 打印的 STL 文件']
        },
        {
            id: 'ind-03', cat: 'industrial',
            title: 'PBR 物理渲染逻辑：光影的奥秘',
            type: 'reading',
            content: `
                ### 核心渲染参数解析
                - **Roughness (粗糙度)**: 让表面像磨砂铝合金还是镜面。
                - **Metallic (金属度)**: 决定反射光线的颜色属性。
                - **Normal (法线)**: 模拟细节划痕而不增加面数。
            `,
            desc: '学习如何让数字模型具有真实的“泰坦金属质感”。'
        },
        {
            id: 'ind-04', cat: 'industrial',
            title: '案例分析：SpaceX 猛禽引擎构型',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1Yf4y1M78M',
            desc: '分析极限工程中的工业美学——管路布局与不对称平衡。'
        },

        // --- 👓 CYBER UI/UX TRACK ---
        {
            id: 'cyb-01', cat: 'cyber',
            title: '用户调研与画像：为谁而设计',
            type: 'reading',
            content: `
                ### 用户画像 (Personas) 模板
                - **特征描述**：年龄、职业、技术熟悉度。
                - **目标**：他想通过这个界面完成什么任务？
                - **痛点**：他在使用现有产品时最困扰的是什么？
            `,
            desc: '理解界面背后的心理学逻辑。'
        },
        {
            id: 'cyb-02', cat: 'cyber',
            title: 'Figma 基础：组件化设计思维',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1K5411L7S7',
            desc: '学习 Frame、Auto Layout 以及 Symbol 的概念。',
            tasks: ['临摹一个 iOS 锁屏界面', '创建一个通用的科技感按钮组件']
        },
        {
            id: 'cyb-03', cat: 'cyber',
            title: 'HUD 全息投影界面设计规范',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1E7411m7uN',
            desc: '科幻电影中的半透明 UI 是如何通过色彩与层叠建立秩序感的。'
        },
        {
            id: 'cyb-04', cat: 'cyber',
            title: '空间计算：Apple Vision Pro 交互实战',
            type: 'reading',
            content: `
                ### 空间计算 (Spatial Computing) 三原则
                1. **深度控制**：信息在 Z 轴上的排列优先级。
                2. **眼动交互**：通过目光选择替代传统鼠标。
                3. **透视感**：数字窗口与物理环境的柔和融合。
            `,
            desc: '探索当“屏幕”消失后的下一个交互时代。'
        },

        // --- 👁️ AI ORCHESTRATION ---
        {
            id: 'ai-01', cat: 'ai',
            title: '提示语美学 101：构图与光影',
            type: 'reading',
            content: `
                ### 标准 Prompt 公式
                [主体 Subject] + [场景 Scene] + [艺术风格 Art Style] + [光影 Lighting] + [相机/细节 Details]
                
                #### 示例：
                *Cyberpunk robotic owl, soaring over a neon-lit Tokyo, digital painting, soft cinematic lighting, 8k, Unreal Engine 5 render*
            `,
            desc: '学习如何像导演一样指挥 AI。'
        },
        {
            id: 'ai-02', cat: 'ai',
            title: 'Stable Diffusion 深度训练逻辑',
            type: 'video',
            content_url: 'https://player.bilibili.com/player.html?bvid=BV1As4y1v7Yp',
            desc: '理解采样器 (Samplers)、步数 (Steps) 以及 CFG 值对画质的影响。'
        },
        {
            id: 'ai-03', cat: 'ai',
            title: 'ControlNet：给 AI 创作戴上枷锁',
            type: 'interactive',
            desc: '通过姿态估计 (Pose) 和深度图 (Depth) 精准控制 AI 生成的人物动作。',
            tasks: ['找一张复杂的动作图', '利用 ControlNet 生成同款动作的科幻角色']
        }
    ]
};

window.designCourseData = designCourseData;
