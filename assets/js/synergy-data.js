// synergy-data.js - V4.0 (Mega Scale: 1000+ Nodes + University)

// 1. Define Core Syllabi (The "Seed" Data)
const curriculumSeeds = {
    // === ELEMENTARY SCHOOL (Science) ===
    'elementary': {
        'science': [
            "观察与测量", "比较与分类", "预测与推理", "植物的身体", "动物的分类", "昆虫的奥秘",
            "水的形态", "空气的性质", "各种各样的岩石", "土壤的成分", "太阳与影子", "月相变化",
            "磁铁的性质", "简单电路", "声音的产生", "光的传播", "热的传递", "简单机械",
            "杠杆平衡", "滑轮组", "斜面的作用", "食物链", "生态平衡", "天气与气候",
            "风的形成", "雨和雪", "地球的构造", "火山与地震", "常见的材料", "纸的性质",
            "金属的特性", "塑料的应用", "溶解与分离", "混合物的分离", "沉浮的秘密", "影子的游戏",
            "指南针制作", "太阳能利用", "环境保护", "垃圾分类", "水资源保护", "生活中的静电"
        ],
        'math': [
            "100以内加减法", "乘法口诀", "除法的初步认识", "混合运算", "分数的认识", "小数的认识",
            "长度单位", "面积与周长", "长方形与正方形", "角的度量", "三角形分类", "平行四边形",
            "统计与概率初步", "条形统计图", "折线统计图", "找规律", "数学广角", "鸡兔同笼"
        ],
        'cs': [
            "计算机基础", "鼠标键盘操作", "画图软件使用", "文字处理Word", "PPT演示文稿",
            "初识互联网", "信息搜索", "网络安全", "Scratch初体验", "角色与舞台", "积木编程",
            "顺序结构", "简单的循环", "侦测与判断", "广播消息"
        ]
    },

    // === MIDDLE SCHOOL (Junior High) ===
    'middle': {
        'math': [
            "有理数", "整式的加减", "一元一次方程", "几何图形初步", "相交线与平行线", "实数",
            "平面直角坐标系", "二元一次方程组", "不等式与不等式组", "数据的收集整理", "全等三角形",
            "轴对称", "整式的乘法", "因式分解", "分式", "二次根式", "勾股定理", "平行四边形判定",
            "一次函数", "数据的分析", "一元二次方程", "二次函数", "旋转", "圆", "概率初步",
            "相似三角形", "锐角三角函数", "投影与视图"
        ],
        'physics': [
            "机械运动", "声现象", "物态变化", "光现象", "透镜及其应用", "质量与密度", "力",
            "运动和力", "压强", "浮力", "功和机械能", "简单机械", "内能", "内能的利用",
            "电流和电路", "电压电阻", "欧姆定律", "电功率", "生活用电", "电与磁", "信息的传递",
            "能源与可持续发展"
        ],
        'chemistry': [
            "开启化学之门", "身边的化学物质", "空气与氧气", "自然界的水", "物质构成的奥秘",
            "化学方程式", "碳和碳的氧化物", "燃料及其利用", "金属和金属材料", "溶液",
            "酸和碱", "盐化肥", "化学与生活", "实验基本操作"
        ],
        'biology': [
            "生物圈", "细胞结构", "生物体的层次", "绿色植物", "光合作用", "呼吸作用",
            "人的生殖", "人体的营养", "人体的呼吸", "人体内物质运输", "废物的排出",
            "神经调节", "激素调节", "动物的运动", "动物的行为", "细菌和真菌", "生物的分类",
            "生物的多样性", "生命起源", "生物进化", "传染病预防", "免疫与健康"
        ],
        'cs': [
            "信息社会", "计算机系统", "Python基础", "变量与数据类型", "分支结构", "循环结构",
            "列表与字典", "函数定义", "算法基础", "枚举算法", "排序算法", "网络基础",
            "人工智能初步", "物联网应用", "3D打印基础", "机器人的组成"
        ]
    },

    // === SENIOR SCHOOL (High School) ===
    'high': {
        'math': [
            "集合与逻辑", "一元二次函数", "基本不等式", "幂函数", "指数函数", "对数函数",
            "三角函数", "三角恒等变换", "平面向量", "复数", "立体几何", "空间点线面",
            "直线与圆", "圆锥曲线", "椭圆双曲线抛物线", "数列", "等差等比数列", "导数及其应用",
            "统计案例", "概率模型", "排列组合", "二项式定理", "随机变量", "正态分布"
        ],
        'physics': [
            "运动的描述", "匀变速直线运动", "相互作用", "牛顿运动定律", "曲线运动", "万有引力与航天",
            "机械能守恒定律", "静电场", "恒定电流", "磁场", "电磁感应", "交变电流", "传感器",
            "分子动理论", "气体实验定律", "热力学定律", "机械振动", "机械波", "光", "电磁波",
            "相对论简介", "动量守恒", "波粒二象性", "原子结构", "原子核"
        ],
        'chemistry': [
            "物质的量", "离子反应", "氧化还原反应", "金属及其化合物", "非金属及其化合物",
            "元素周期律", "化学键", "化学能与热能", "原电池", "化学反应速率", "化学平衡",
            "水溶液中的离子平衡", "有机化合物", "烃", "烃的衍生物", "糖类油脂蛋白质",
            "合成高分子", "原子结构与性质", "分子结构与性质", "晶体结构"
        ],
        'biology': [
            "细胞的分子组成", "细胞的结构", "物质跨膜运输", "酶与ATP", "细胞呼吸", "光合作用深入",
            "细胞增殖", "细胞分化", "遗传因子的发现", "基因与染色体", "DNA结构与复制",
            "基因表达", "基因突变", "人类遗传病", "生物育种", "内环境稳态", "神经液压调节",
            "免疫调节", "种群与群落", "生态系统", "生态环境保护", "基因工程", "细胞工程"
        ],
        'cs': [
            "数据与计算", "数字化", "算法效率分析", "栈与队列", "树与图", "查找与排序进阶",
            "信息系统基础", "网络协议TCP/IP", "数据库SQL", "信息安全", "人工智能",
            "机器学习基础", "神经网络", "大数据处理", "开源硬件", "项目开发管理"
        ]
    },

    // === UNIVERSITY (New Extension) ===
    'university': {
        'math': [
            "极限与连续", "导数与微分", "不定积分", "定积分", "多元函数微积分", "重积分",
            "无穷级数", "常微分方程", "线性代数", "行列式与矩阵", "向量空间", "特征值与特征向量",
            "概率论", "数理统计", "复变函数", "离散数学", "拓扑学基础", "实变函数", "泛函分析"
        ],
        'physics': [
            "经典力学(拉格朗日)", "电动力学", "麦克斯韦方程组", "热力学与统计物理", "量子力学基础",
            "薛定谔方程", "波函数", "固体物理", "晶格振动", "半导体物理", "原子核物理", "粒子物理",
            "广义相对论", "天体物理", "现代光学", "流体力学"
        ],
        'chemistry': [
            "无机化学进阶", "配位化学", "分析化学", "仪器分析", "有机合成", "立体化学",
            "物理化学", "量子化学", "化学热力学", "统计热力学", "电化学", "表面化学",
            "高分子化学", "生物化学", "药物化学"
        ],
        'biology': [
            "分子生物学", "基因组学", "蛋白质组学", "细胞信号转导", "免疫学基础", "微生物学",
            "神经生物学", "发育生物学", "生物信息学", "生态学模型", "进化生物学", "病毒学"
        ],
        'cs': [
            "数据结构与算法分析", "操作系统原理", "计算机组成与体系结构", "计算机网络原理", "编译原理",
            "数据库系统概论", "软件工程", "人工智能导论", "深度学习", "计算机视觉", "自然语言处理",
            "分布式系统", "云计算", "网络安全与密码学", "计算机图形学", "人机交互"
        ]
    }
};

// 2. Helper: Text Generator
const descriptions = [
    "这是本学科的核心基础知识，构建了整个知识体系的基石。",
    "该概念在科学研究和工程应用中具有极高的价值。",
    "深入理解这一内容，有助于掌握复杂系统的运行规律。",
    "它是连接理论与实践的桥梁，常用于解决实际问题。",
    "这一领域的突破推动了人类科技的重大进步。",
    "掌握它需要具备较强的逻辑思维和抽象能力。",
    "通过实验和观察，我们可以验证其背后的科学原理。",
    "它是跨学科研究的热点，融合了多领域的智慧。",
    "这一知识点是进一步深造和学术研究的必经之路。"
];

// 3. Helper: Tag Generator
const subjectTags = {
    'math': ['逻辑', '计算', '模型', '抽象', '几何', '代数', '分析', '证明'],
    'physics': ['力学', '电磁', '量子', '能量', '物质', '宇宙', '实验', '定律'],
    'chemistry': ['分子', '反应', '合成', '结构', '能量', '材料', '分析', '实验'],
    'biology': ['基因', '细胞', '进化', '生态', '神经', '代谢', '生命', '实验'],
    'cs': ['算法', '系统', '网络', 'AI', '数据', '逻辑', '架构', '代码'],
    'science': ['探究', '观察', '自然', '现象', '实验', '测量', '发现']
};

// 4. Data Generation Logic
const synergyData = [];
let idCounter = 1;

function createNode(title, subject, stage, isKey = false, type = 'concept') {
    const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
    const baseTags = subjectTags[subject];
    const myTags = [baseTags[Math.floor(Math.random() * baseTags.length)], baseTags[Math.floor(Math.random() * baseTags.length)]];

    // Cross-disciplinary chance
    if (Math.random() > 0.8) {
        const otherSubjects = Object.keys(subjectTags).filter(s => s !== subject);
        const randomSub = otherSubjects[Math.floor(Math.random() * otherSubjects.length)];
        myTags.push(subjectTags[randomSub][0]);
    }

    let suffix = '';
    if (type === 'lab') suffix = ' [实验]';
    if (type === 'app') suffix = ' [应用]';

    return {
        id: title + suffix, // Ensure ID uniqueness
        title: title + suffix,
        category: subject,
        stage: stage,
        tags: [...new Set(myTags)],
        content: `<h3>${title}</h3><p>${desc}</p><p><strong>学科:</strong> ${subject.toUpperCase()} | <strong>阶段:</strong> ${stage.toUpperCase()}</p>`,
        rank: isKey ? 10 : (type === 'concept' ? 3 : 1), // Hubs=20 (handled in graph), Key Concepts=10, Normal=3, Leaves=1
        type: type
    };
}

// 5. Generate Core Nodes from Seeds
Object.keys(curriculumSeeds).forEach(stage => {
    Object.keys(curriculumSeeds[stage]).forEach(subject => {
        const topics = curriculumSeeds[stage][subject];

        topics.forEach(topic => {
            // Core Concept
            synergyData.push(createNode(topic, subject, stage, Math.random() > 0.8)); // 20% are key nodes

            // Expansion: To reach 1000+, we need aggressive multiplication
            // Each concept spawns 1-3 sub-nodes
            const bloomFactor = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < bloomFactor; i++) {
                const subType = Math.random() > 0.5 ? 'app' : 'lab';
                const subName = subType === 'app' ? `${topic}-应用拓展${i + 1}` : `${topic}-实验探究${i + 1}`;

                // Add sub-node linked to parent concept implicitly by title association or tag
                // In graph generation, we will link them.
                const node = createNode(subName, subject, stage, false, subType);
                // Tag the parent to ensure connection
                node.parentContext = topic;
                synergyData.push(node);
            }
        });
    });
});

console.log(`Generated ${synergyData.length} synergy nodes.`);
window.synergyData = synergyData;
