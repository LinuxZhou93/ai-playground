// synergy-data.js - V6.0 (4-Tier Star System: Star -> Planet -> Satellite -> Asteroid)

// 1. Level 2 Seeds (Planets) - The Curriculum Core
const curriculumSeeds = {
    // === ELEMENTARY SCHOOL ===
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
        'general': [
            "计算机基础", "Scratch初体验", "认识人工智能", "色彩原理", "乐理基础", "自我保护"
        ]
    },

    // === MIDDLE SCHOOL ===
    'middle': {
        'math': [
            "有理数", "整式加减", "一元一次方程", "几何图形初步", "相交线与平行线", "实数",
            "平面直角坐标系", "二元一次方程组", "不等式", "数据的收集整理", "全等三角形",
            "轴对称", "整式乘法", "因式分解", "分式", "二次根式", "勾股定理",
            "平行四边形", "一次函数", "数据的分析", "一元二次方程", "二次函数", "旋转",
            "圆", "概率初步", "相似三角形", "锐角三角函数", "投影与视图"
        ],
        'physics': [
            "机械运动", "声现象", "物态变化", "光现象", "透镜及其应用", "质量与密度",
            "力与运动", "压强", "浮力", "功和机械能", "简单机械", "内能", "热机",
            "电流和电路", "电压电阻", "欧姆定律", "电功率", "生活用电", "电与磁", "信息的传递",
            "能源与可持续"
        ],
        'chemistry': [
            "开启化学之门", "身边的化学物质", "空气与氧气", "自然界的水", "物质构成的奥秘",
            "化学方程式", "碳和碳的氧化物", "燃料及其利用", "金属和金属材料", "溶液",
            "酸和碱", "盐化肥", "化学与生活", "实验基本操作", "元素周期表", "原子结构"
        ],
        'biology': [
            "生物圈", "细胞结构", "生物体的层次", "绿色植物", "光合作用", "呼吸作用",
            "人体的营养", "人体的呼吸", "人体运输", "人体排泄", "神经调节", "激素调节",
            "动物运动", "动物行为", "细菌真菌", "生物分类", "生物多样性", "生命起源",
            "生物进化", "传染病预防", "免疫与健康", "基因编辑", "转基因食品"
        ],
        'cs': [
            "信息社会", "计算机系统", "Python基础", "算法基础", "人工智能初步", "物联网应用"
        ]
    },

    // === HIGH SCHOOL ===
    'high': {
        'math': [
            "集合与逻辑", "函数概念", "基本初等函数", "三角函数", "平面向量", "数列", "不等式",
            "立体几何", "解析几何", "导数应用", "计数原理", "概率与统计", "复数", "算法初步",
            "数学建模"
        ],
        'physics': [
            "运动学", "牛顿定律", "曲线运动", "万有引力", "机械能守恒", "动量守恒", "静电场",
            "恒定电流", "磁场", "电磁感应", "交变电流", "热学", "光学", "原子物理",
            "相对论初步", "量子论初步"
        ],
        'chemistry': [
            "物质的量", "氧化还原", "离子反应", "金属化合物", "非金属化合物", "元素周期律",
            "化学反应速率", "化学平衡", "电化学", "有机化学", "烃", "烃的衍生物",
            "糖类油脂", "蛋白质", "合成高分子", "晶体结构"
        ],
        'biology': [
            "细胞分子", "细胞结构", "细胞代谢", "细胞增殖", "分化衰老", "遗传定律", "伴性遗传",
            "DNA复制", "基因表达", "基因突变", "人类遗传病", "生物育种", "进化论", "内环境稳态",
            "神经体液免疫", "种群群落", "生态系统", "基因工程", "细胞工程", "胚胎工程"
        ],
        'general': [
            "C++算法竞赛", "数据结构进阶", "复杂网络", "机器学习基础", "神经网络", "数据库设计"
        ]
    },

    // === UNIVERSITY ===
    'university': {
        'math': ["Mathematical Analysis", "Linear Algebra", "Analytic Geometry", "Probability Theory", "Statistics", "ODEs", "PDEs", "Real Analysis", "Complex Analysis", "Abstract Algebra", "Topology", "Number Theory", "Differential Geometry"],
        'physics': ["Theoretical Mechanics", "Thermodynamics", "Electrodynamics", "Quantum Mechanics", "Solid State Physics", "Optics", "Nuclear Physics", "Astrophysics", "Particle Physics", "General Relativity"],
        'chemistry': ["Inorganic Chemistry", "Organic Chemistry", "Physical Chemistry", "Analytical Chemistry", "Structural Chemistry", "Biochemistry", "Polymer Chemistry", "Materials Chemistry"],
        'cs': ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Systems", "Software Engineering", "Artificial Intelligence", "Machine Learning", "Deep Learning", "Computer Vision", "Distributed Systems"]
    }
};

// 2. Specific Level 3 Dictionary (Satellites)
const subConceptMap = {
    // MATH
    "方程": ["一元一次方程", "二元一次方程组", "一元二次方程", "分式方程", "根的判别式", "韦达定理", "方程的解", "等式的性质"],
    "函数": ["一次函数", "二次函数", "反比例函数", "函数的图像", "定义域与值域", "函数的单调性", "奇偶性", "函数解析式"],
    "几何": ["点线面", "角", "三角形", "四边形", "圆", "相似", "全等", "勾股定理", "平移旋转", "轴对称"],
    "微积分": ["极限", "导数", "微分", "不定积分", "定积分", "牛顿-莱布尼茨公式", "极值点", "切线方程"],
    // PHYSICS
    "牛顿定律": ["牛顿第一定律(惯性)", "牛顿第二定律(F=ma)", "牛顿第三定律(作用力)", "惯性系", "失重与超重", "受力分析", "摩擦力"],
    "能量": ["动能", "势能", "机械能守恒", "能量守恒定律", "功", "功率", "内能", "热传递"],
    "电磁": ["电场", "磁场", "电磁感应", "洛伦兹力", "安培力", "麦克斯韦方程组", "电磁波"],
    "量子力学": ["波粒二象性", "薛定谔方程", "测不准原理", "量子纠缠", "光电效应", "能级跃迁", "电子云"],
    // CHEM
    "原子结构": ["质子", "中子", "电子", "原子核", "同位素", "电子排布", "轨道", "能层"],
    "化学反应": ["化合反应", "分解反应", "置换反应", "复分解反应", "氧化还原反应", "离子反应", "热化学反应", "催化剂"],
    // BIO
    "细胞结构": ["细胞膜", "细胞质", "细胞核", "线粒体(动力工厂)", "叶绿体(光合作用)", "核糖体", "高尔基体", "内质网"],
    "DNA": ["双螺旋结构", "碱基配对", "DNA复制", "转录", "翻译", "基因", "染色体", "遗传密码"],
    // CS
    "算法": ["排序算法", "查找算法", "递归", "动态规划", "贪心算法", "回溯法", "分治法", "复杂度分析"],
    "人工智能": ["机器学习", "深度学习", "神经网络", "自然语言处理", "计算机视觉", "强化学习", "图灵测试", "专家系统"]
};

// 3. Level 4 Asteroid Particles (Micro Suffixes)
// Each Satellite will spawn 1-3 Asteroids
const asteroidSuffixes = [
    "Formula", "KeyFact", "Date", "Example", "Step1", "Step2", "Proof", "Code", "LabData", "Quote"
];


// 4. Generic Satellite Generators (Fallbacks)
const genericSuffixes = {
    'science': ["定义 (Definition)", "原理 (Principle)", "实验 (Experiment)", "历史 (History)", "应用 (Application)", "测量 (Measurement)"],
    'math': ["定义 (Definition)", "公式 (Formula)", "定理 (Theorem)", "证明 (Proof)", "例题 (Example)", "应用 (Application)"],
    'default': ["基础概念", "核心原理", "拓展应用", "历史演变", "相关案例", "前沿探索"]
};

// 5. Rich Content Engine (V3.0)
const RichContentGenerator = {
    templates: {
        'default': {
            defs: ["这是知识图谱中的一个重要节点。", "它是构建学科大厦的基石之一。"],
            values: ["理解它有助于建立完整的知识体系。", "能够提升逻辑思维和问题解决能力。"]
        }
    },
    generate: function (title, subject, type) {
        return `<div class='mb-2'><h4 class='text-cyan-400 font-bold text-xs'>${title}</h4><p class='text-slate-300 text-xs'>属于 ${subject} 学科体系的重要组成部分。</p></div>`;
    }
};

// 6. Data Generation Engine
const synergyData = [];

// Helper: Tag Generator
function getTags(subject) {
    const map = {
        'math': ['Logic', 'Number', 'Shape', 'Calculate'],
        'physics': ['Matter', 'Energy', 'Force', 'Motion'],
        'chemistry': ['Element', 'Reaction', 'Atom', 'Molecule'],
        'biology': ['Life', 'Cell', 'Gene', 'Nature'],
        'cs': ['Code', 'Data', 'System', 'AI']
    };
    return map[subject] || ['Science', 'Knowledge', 'Study'];
}

function createNode(title, subject, stage, level, parentId = null) {
    // Level 1: Star (Subject)
    // Level 2: Planet (Concept)
    // Level 3: Satellite (Sub-Concept)
    // Level 4: Asteroid (Detail)

    // Visuals based on level
    let val = 5;
    if (level === 3) val = 2; // Satellite
    if (level === 4) val = 0.8; // Asteroid (Dust)

    // Determine tags
    const tags = getTags(subject);

    return {
        id: title,
        title: title,
        category: subject,
        stage: stage,
        level: level,
        parentId: parentId,
        tags: tags,
        val: val,
        content: RichContentGenerator.generate(title, subject, 'concept')
    };
}

// === GENERATION LOOP ===
Object.keys(curriculumSeeds).forEach(stage => {
    Object.keys(curriculumSeeds[stage]).forEach(subject => {
        const planets = curriculumSeeds[stage][subject];

        planets.forEach(planetName => {
            // 1. Create Planet Node (Level 2)
            const planetNode = createNode(planetName, subject, stage, 2);
            synergyData.push(planetNode);

            // 2. Generate Satellites (Level 3)
            let satellites = [];

            // A. Exact Dictionary Match
            if (subConceptMap[planetName]) {
                satellites = subConceptMap[planetName];
            }
            // B. Fuzzy Match 
            else {
                const fuzzyKey = Object.keys(subConceptMap).find(k => planetName.includes(k));
                if (fuzzyKey) {
                    satellites = subConceptMap[fuzzyKey].slice(0, 4);
                } else {
                    // C. Generic Fallback
                    const count = Math.floor(Math.random() * 4) + 3; // 3 to 6 satellites
                    const suffixes = genericSuffixes[subject] || genericSuffixes[Object.keys(genericSuffixes).find(k => subject.includes(k))] || genericSuffixes['default'];
                    for (let i = 0; i < count; i++) {
                        satellites.push(`${planetName}-${suffixes[i % suffixes.length]}`);
                    }
                }
            }

            // 3. Spawn Satellites (Level 3) AND Asteroids (Level 4)
            satellites.forEach(satName => {
                const satNode = createNode(satName, subject, stage, 3, planetName);
                synergyData.push(satNode);

                // === L4 INJECTION (SUPER BRAIN BOOST) ===
                // Spawn 3-5 Asteroids for each Satellite (Increased from 1-3)
                const asteroidCount = Math.floor(Math.random() * 3) + 3;
                for (let k = 0; k < asteroidCount; k++) {
                    const astName = `${satName}-${asteroidSuffixes[k % asteroidSuffixes.length]}`;
                    const astNode = createNode(astName, subject, stage, 4, satName);
                    synergyData.push(astNode);
                }
            });
        });
    });
});

console.log(`Generated ${synergyData.length} synergy nodes (5K Super Brain).`);
window.synergyData = synergyData;
