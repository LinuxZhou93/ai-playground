const experiments = [
    // --- Physics (物理) ---
    {
        title: "直流电路实验室",
        category: "Physics",
        level: "Middle",
        description: "使用电池、灯泡、电阻和开关构建电路。探索串联和并联电路的奥秘。",
        url: "https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_zh_CN.html",
        thumbnail: "⚡"
    },
    {
        title: "能量滑板公园",
        category: "Physics",
        level: "Middle",
        description: "通过滑板运动探索能量守恒定律！设计轨道、坡度和跳跃，观察动能与势能的转换。",
        url: "https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_zh_CN.html",
        thumbnail: "🛹"
    },
    {
        title: "重力与轨道",
        category: "Physics",
        level: "Middle",
        description: "移动太阳、地球、月球和空间站，观察引力如何决定它们的运行轨道。",
        url: "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_zh_CN.html",
        thumbnail: "🪐"
    },
    {
        title: "光的折射与反射",
        category: "Physics",
        level: "High",
        description: "使用激光笔、棱镜和透镜探索光的传播规律。观察折射、反射和色散现象。",
        url: "https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_zh_CN.html",
        thumbnail: "🌈"
    },
    {
        title: "波的干涉",
        category: "Physics",
        level: "High",
        description: "制造水波、声波和光波，观察它们是如何产生干涉图样的。",
        url: "https://phet.colorado.edu/sims/html/wave-interference/latest/wave-interference_zh_CN.html",
        thumbnail: "🌊"
    },
    {
        title: "力的平衡",
        category: "Physics",
        level: "Middle",
        description: "在跷跷板上放置物体，学习力矩平衡原理。",
        url: "https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_zh_CN.html",
        thumbnail: "⚖️"
    },
    {
        title: "静电这一场",
        category: "Physics",
        level: "High",
        description: "探索电荷、电场和电势。观察带电粒子在电场中的运动。",
        url: "https://phet.colorado.edu/sims/html/charges-and-fields/latest/charges-and-fields_zh_CN.html",
        thumbnail: "🔋"
    },
    {
        title: "黑体辐射",
        category: "Physics",
        level: "University",
        description: "观察太阳、灯泡等物体的辐射光谱随温度的变化。",
        url: "https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum_zh_CN.html",
        thumbnail: "🌡️"
    },
    {
        title: "抛体运动",
        category: "Physics",
        level: "High",
        description: "发射炮弹，调整角度和速度，研究平抛和斜抛运动的规律。",
        url: "https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_zh_CN.html",
        thumbnail: "☄️"
    },
    {
        title: "摩擦力",
        category: "Physics",
        level: "Middle",
        description: "观察微观层面的摩擦力，了解为什么接触面越粗糙摩擦力越大。",
        url: "https://phet.colorado.edu/sims/html/friction/latest/friction_zh_CN.html",
        thumbnail: "🧊"
    },

    // --- Chemistry (化学) ---
    {
        title: "原子构建器",
        category: "Chemistry",
        level: "Middle",
        description: "从质子、中子和电子开始构建原子，观察元素、电荷和质量的变化。",
        url: "https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_zh_CN.html",
        thumbnail: "⚛️"
    },
    {
        title: "物质状态",
        category: "Chemistry",
        level: "Middle",
        description: "加热、冷却和压缩原子与分子，观察它们在固态、液态和气态之间的变化。",
        url: "https://phet.colorado.edu/sims/html/states-of-matter/latest/states-of-matter_zh_CN.html",
        thumbnail: "🧊"
    },
    {
        title: "分子形状",
        category: "Chemistry",
        level: "High",
        description: "通过添加原子构建分子，探索VSEPR理论，观察分子的3D几何构型。",
        url: "https://phet.colorado.edu/sims/html/molecule-shapes/latest/molecule-shapes_zh_CN.html",
        thumbnail: "🧬"
    },
    {
        title: "酸碱溶液",
        category: "Chemistry",
        level: "High",
        description: "测量不同液体的pH值，观察酸、碱溶液中的离子浓度。",
        url: "https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_zh_CN.html",
        thumbnail: "🧪"
    },
    {
        title: "反应速率",
        category: "Chemistry",
        level: "High",
        description: "探索碰撞理论，观察温度、浓度和催化剂如何影响化学反应速率。",
        url: "https://phet.colorado.edu/sims/html/reactions-and-rates/latest/reactions-and-rates_zh_CN.html",
        thumbnail: "💥"
    },
    {
        title: "同位素与原子量",
        category: "Chemistry",
        level: "High",
        description: "了解同位素的概念，探究自然界中元素原子量的计算方法。",
        url: "https://phet.colorado.edu/sims/html/isotopes-and-atomic-mass/latest/isotopes-and-atomic-mass_zh_CN.html",
        thumbnail: "⚖️"
    },
    {
        title: "浓度溶液",
        category: "Chemistry",
        level: "Middle",
        description: "像调酒师一样调制溶液，观察溶质、溶剂和浓度的关系。",
        url: "https://phet.colorado.edu/sims/html/molarity/latest/molarity_zh_CN.html",
        thumbnail: "🍹"
    },
    {
        title: "气体性质",
        category: "Chemistry",
        level: "High",
        description: "向容器中泵入气体分子，控制体积、温度，验证理想气体定律。",
        url: "https://phet.colorado.edu/sims/html/gas-properties/latest/gas-properties_zh_CN.html",
        thumbnail: "🎈"
    },
    {
        title: "反应平衡",
        category: "Chemistry",
        level: "University",
        description: "观察可逆反应如何达到平衡，勒夏特列原理是如何起作用的。",
        url: "https://phet.colorado.edu/sims/html/reversible-reactions/latest/reversible-reactions_en.html",
        thumbnail: "⚖️"
    },
    {
        title: "比尔定律",
        category: "Chemistry",
        level: "University",
        description: "探索溶液浓度与光吸收率之间的关系（分光光度法）。",
        url: "https://phet.colorado.edu/sims/html/beers-law-lab/latest/beers-law-lab_zh_CN.html",
        thumbnail: "🔦"
    },

    // --- Mathematics (数学) ---
    {
        title: "函数构建器",
        category: "Mathematics",
        level: "Middle",
        description: "通过输入和输出的变换，直观理解函数的概念。",
        url: "https://phet.colorado.edu/sims/html/function-builder/latest/function-builder_zh_CN.html",
        thumbnail: "📈"
    },
    {
        title: "图形计算器",
        category: "Mathematics",
        level: "High",
        description: "功能强大的在线图形计算器，绘制函数曲线，求解方程。",
        url: "https://www.geogebra.org/calculator",
        thumbnail: "📉"
    },
    {
        title: "分数的相等",
        category: "Mathematics",
        level: "Elementary",
        description: "通过图形匹配，理解分数的概念和相等分数。",
        url: "https://phet.colorado.edu/sims/html/fraction-matcher/latest/fraction-matcher_zh_CN.html",
        thumbnail: "🍰"
    },
    {
        title: "概率实验室",
        category: "Mathematics",
        level: "High",
        description: "投掷硬币、转动转盘，模拟大量随机事件，理解大数定律。",
        url: "https://phet.colorado.edu/sims/html/plinko-probability/latest/plinko-probability_zh_CN.html",
        thumbnail: "🎲"
    },
    {
        title: "向量加法",
        category: "Mathematics",
        level: "High",
        description: "在这个交互式模拟中探索向量的加法和分解。",
        url: "https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_zh_CN.html",
        thumbnail: "↗️"
    },
    {
        title: "三角函数之旅",
        category: "Mathematics",
        level: "High",
        description: "观察单位圆与正弦、余弦、正切函数图像之间的联系。",
        url: "https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_zh_CN.html",
        thumbnail: "〰️"
    },
    {
        title: "曲线拟合",
        category: "Mathematics",
        level: "University",
        description: "拖动数据点，寻找最佳拟合曲线，理解最小二乘法。",
        url: "https://phet.colorado.edu/sims/html/curve-fitting/latest/curve-fitting_zh_CN.html",
        thumbnail: "📊"
    },
    {
        title: "面积生成器",
        category: "Mathematics",
        level: "Elementary",
        description: "用方块构建形状，探索面积和周长的关系。",
        url: "https://phet.colorado.edu/sims/html/area-builder/latest/area-builder_zh_CN.html",
        thumbnail: "🧱"
    },
    {
        title: "3D 几何画板",
        category: "Mathematics",
        level: "High",
        description: "探索三维空间中的几何图形，构建多面体、旋转体。",
        url: "https://www.geogebra.org/3d",
        thumbnail: "🧊"
    },
    {
        title: "算术练习",
        category: "Mathematics",
        level: "Elementary",
        description: "通过游戏化的方式练习加减乘除运算。",
        url: "https://phet.colorado.edu/sims/html/arithmetic/latest/arithmetic_zh_CN.html",
        thumbnail: "➗"
    },

    // --- Biology (生物) ---
    {
        title: "自然选择模拟",
        category: "Biology",
        level: "High",
        description: "通过控制环境和基因突变来探索自然选择机制，观察物种如何适应生存。",
        url: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_zh_CN.html",
        thumbnail: "🐇"
    },
    {
        title: "基因表达",
        category: "Biology",
        level: "University",
        description: "从DNA到蛋白质：模拟转录和翻译的中心法则。",
        url: "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_zh_CN.html",
        thumbnail: "🧬"
    },
    {
        title: "神经元模拟",
        category: "Biology",
        level: "University",
        description: "刺激神经元，观察动作电位的产生和传导过程。",
        url: "https://phet.colorado.edu/sims/html/neuron/latest/neuron_zh_CN.html",
        thumbnail: "🧠"
    },
    {
        title: "视觉与色彩",
        category: "Biology",
        level: "Middle",
        description: "探索眼睛如何感知色彩，光的三原色混合原理。",
        url: "https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_zh_CN.html",
        thumbnail: "👁️"
    },
    {
        title: "膜通道",
        category: "Biology",
        level: "University",
        description: "观察细胞膜上的通道蛋白如何控制物质进出细胞。",
        url: "https://phet.colorado.edu/sims/cheerpj/membrane-channels/latest/membrane-channels.html",
        thumbnail: "🦠"
    },
    {
        title: "温室效应",
        category: "Biology",
        level: "Middle",
        description: "观察温室气体如何影响地球温度，理解全球变暖的机制。",
        url: "https://phet.colorado.edu/sims/html/greenhouse-effect/latest/greenhouse-effect_zh_CN.html",
        thumbnail: "🌡️"
    },
    {
        title: "食物链",
        category: "Biology",
        level: "Elementary",
        description: "了解生态系统中的生产者、消费者和分解者，平衡食物网。",
        url: "https://fp.interactives.dk/food_chains/food_chains.html",
        thumbnail: "🕸️"
    },
    {
        title: "细胞分裂",
        category: "Biology",
        level: "High",
        description: "观察有丝分裂和减数分裂的过程，理解细胞增殖。",
        url: "https://www.cellsalive.com/mitosis.htm",
        thumbnail: "🔬"
    },
    {
        title: "人体解剖",
        category: "Biology",
        level: "Middle",
        description: "3D交互式人体模型，探索人体骨骼、肌肉和器官系统。",
        url: "https://www.zygotebody.com/",
        thumbnail: "💀"
    },
    {
        title: "听觉模拟",
        category: "Biology",
        level: "Middle",
        description: "了解声波如何通过耳朵转化为神经信号。",
        url: "https://phet.colorado.edu/sims/html/sound/latest/sound_zh_CN.html",
        thumbnail: "👂"
    },

    // --- Earth Science (地球科学) ---
    {
        title: "板块构造",
        category: "Earth Science",
        level: "Middle",
        description: "移动地球板块，观察山脉形成、火山爆发和地震。",
        url: "https://phet.colorado.edu/sims/html/plate-tectonics/latest/plate-tectonics_zh_CN.html",
        thumbnail: "🌋"
    },
    {
        title: "太阳系模型",
        category: "Earth Science",
        level: "Elementary",
        description: "探索太阳系八大行星的大小、距离和运行轨道。",
        url: "https://www.solarsystemscope.com/",
        thumbnail: "🪐"
    },
    {
        title: "冰川模拟",
        category: "Earth Science",
        level: "High",
        description: "调整气温和降雪量，观察冰川的进退和对地貌的侵蚀。",
        url: "https://phet.colorado.edu/sims/html/glaciers/latest/glaciers_zh_CN.html",
        thumbnail: "🏔️"
    },
    {
        title: "水循环",
        category: "Earth Science",
        level: "Elementary",
        description: "交互式学习水的蒸发、凝结和降水过程。",
        url: "https://water.usgs.gov/edu/watercycle-kids-interactive.html",
        thumbnail: "🌧️"
    },
    {
        title: "地震波",
        category: "Earth Science",
        level: "High",
        description: "探索P波和S波在地球内部的传播路径。",
        url: "https://ds.iris.edu/seismon/",
        thumbnail: "〰️"
    },
    {
        title: "矿物鉴定",
        category: "Earth Science",
        level: "High",
        description: "在线矿物博物馆，学习如何根据硬度、光泽等特征鉴定矿物。",
        url: "https://geology.com/minerals/",
        thumbnail: "💎"
    },
    {
        title: "星图",
        category: "Earth Science",
        level: "All",
        description: "实时交互式星空图，寻找星座和行星。",
        url: "https://stellarium-web.org/",
        thumbnail: "✨"
    },
    {
        title: "洋流",
        category: "Earth Science",
        level: "High",
        description: "观察全球洋流的分布及其对气候的影响。",
        url: "https://earth.nullschool.net/",
        thumbnail: "🌊"
    },
    {
        title: "月相变化",
        category: "Earth Science",
        level: "Elementary",
        description: "观察月球绕地球公转过程中月相的周期性变化。",
        url: "https://phet.colorado.edu/sims/html/lunar-phase-simulator/",
        thumbnail: "🌑"
    },
    {
        title: "地质年代",
        category: "Earth Science",
        level: "High",
        description: "穿越时空，探索地球46亿年的演化历史。",
        url: "https://ucmp.berkeley.edu/help/timeform.php",
        thumbnail: "🦕"
    },

    // --- Coding/Games (编程/游戏 - Legacy) ---
    {
        title: "赛博太空战机",
        category: "Coding",
        level: "All",
        description: "驾驶战机，在霓虹弹幕中生存。击碎敌机，挑战最高分！",
        url: "space-shooter.html",
        thumbnail: "🚀"
    },
    {
        title: "赛博打砖块",
        category: "Coding",
        level: "All",
        description: "经典的街机游戏重制版。体验霓虹美学与粒子碰撞的快感。",
        url: "breakout.html",
        thumbnail: "🧱"
    },
    {
        title: "Python 极速赛车",
        category: "Coding",
        level: "All",
        description: "基于 Tkinter 的本地桌面游戏。下载源码，体验复古赛车躲避玩法。",
        url: "racing.html",
        thumbnail: "🏎️"
    }
];
