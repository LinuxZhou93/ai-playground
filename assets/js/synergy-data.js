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
            "指南针制作", "太阳能利用", "环境保护", "垃圾分类", "水资源保护", "生活中的静电",
            // === NEW EXPANSION (Engineering & Environment) ===
            "桥梁结构设计", "塔台搭建", "造船的历史", "设计小赛车", "我们的地球家园",
            "制作生态瓶", "蚯蚓的选择", "制作岩石标本", "种植凤仙花", "养蚕日记",
            "厨房里的化学", "制作汽水", "小苏打和白醋", "米饭淀粉碘酒", "铁生锈了",
            "光的反射实验", "制作潜望镜", "光的折射", "彩虹的秘密", "电磁铁",
            "电动机原理", "神奇的能量", "能量转换", "煤石油天然气", "节约能源"
        ],
        'math': [
            "100以内加减法", "乘法口诀", "除法的初步认识", "混合运算", "分数的认识", "小数的认识",
            "长度单位", "面积与周长", "长方形与正方形", "角的度量", "三角形分类", "平行四边形",
            "统计与概率初步", "条形统计图", "折线统计图", "找规律", "数学广角", "鸡兔同笼",
            // === NEW EXPANSION (Olympiad/Logic) ===
            "数独游戏", "七巧板拼图", "幻方探索", "植树问题", "行程问题", "抽屉原理",
            "加法原理", "乘法原理", "等量代换", "巧算与速算", "定义新运算", "周期问题",
            "盈亏问题", "和差倍问题", "还原问题", "年龄问题", "逻辑推理", "容斥原理",
            "简单的立体几何", "观察物体", "轴对称图形", "平移与旋转"
        ],
        'cs': [
            "计算机基础", "鼠标键盘操作", "画图软件使用", "文字处理Word", "PPT演示文稿",
            "初识互联网", "信息搜索", "网络安全", "Scratch初体验", "角色与舞台", "积木编程",
            "顺序结构", "简单的循环", "侦测与判断", "广播消息",
            // === NEW EXPANSION (AI Literacy) ===
            "认识人工智能", "生活中的AI", "体验语音识别", "人脸识别初探", "智能家居",
            "无人驾驶概念", "机器翻译体验", "图灵测试简介", "信息伦理与安全", "防范网络诈骗",
            "编程思维", "分解问题", "模式识别", "抽象与算法", "简单的加解密", "二进制的奥秘"
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
            "能源与可持续发展",
            // === NEW EXPANSION (Modern/Applied Physics) ===
            "北斗卫星导航", "航空航天基础", "火箭发射原理", "空间站结构", "失重现象",
            "新能源汽车", "锂电池原理", "太阳能发电", "风力发电", "核能应用",
            "磁悬浮列车", "高铁技术", "光纤通信", "5G技术原理", "量子通信科普",
            "暗物质与暗能量", "黑洞科普", "引力波", "超导现象", "纳米技术应用"
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
            "生物的多样性", "生命起源", "生物进化", "传染病预防", "免疫与健康",
            // === NEW EXPANSION (Biotech/Health) ===
            "基因编辑科普", "转基因食品", "克隆技术", "试管婴儿", "生物反应器",
            "仿生学应用", "雷达与蝙蝠", "薄壳建筑与蛋壳", "人工肺", "血液透析",
            "显微镜下的世界", "观察洋葱表皮", "制作酸奶(发酵)", "制作米酒", "植物组织培养",
            "外来物种入侵", "濒危物种保护", "垃圾资源化", "低碳生活", "青春期心理健康"
        ],
        'cs': [
            "信息社会", "计算机系统", "Python基础", "变量与数据类型", "分支结构", "循环结构",
            "列表与字典", "函数定义", "算法基础", "枚举算法", "排序算法", "网络基础",
            "人工智能初步", "物联网应用", "3D打印基础", "机器人的组成",
            // === NEW EXPANSION (Project/Coding) ===
            "Python海龟绘图", "字符串处理", "文件读写", "异常处理", "第三方库使用",
            "Pygame游戏开发", "简单的爬虫", "requests库", "BeautifulSoup", "数据可视化基础",
            "Matplotlib绘图", "词云制作", "Arduino开源硬件", "传感器应用", "LED闪烁",
            "超声波测距", "Micro:bit编程", "App Inventor", "手机App开发", "简单的网页制作"
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

// 2. Rich Content Generator Engine (V2.0)
const RichContentGenerator = {
    templates: {
        'math': {
            defs: ["数学是研究数量、结构、变化、空间以及信息等概念的一门学科。", "这是数学大厦中不可或缺的一块基石，体现了严谨的逻辑美感。", "该概念通过抽象化的语言，描述了客观世界的某种本质规律。"],
            values: ["培养逻辑思维能力与空间想象力。", "为学习物理、化学等自然科学提供工具。", "在数据分析和算法设计中具有基础性作用。"],
            apps: ["建筑设计中的几何应用。", "金融市场的数据预测模型。", "计算机图形学中的坐标变换。", "密码学中的数论基础。"],
            facts: ["你知道吗？自然界中的蜂巢结构就蕴含着深刻的几何原理。", "这一概念最早可以追溯到古希腊时期的数学著作。", "许多数学难题的解决都依赖于对这一基础概念的深入理解。"]
        },
        'physics': {
            defs: ["物理学是研究物质、能量及其相互作用的自然科学。", "该现象揭示了宇宙运行的基本法则之一。", "这是经典力学/逻辑体系中的一个核心概念。"],
            values: ["理解自然现象背后的因果关系。", "培养实证精神和科学探究能力。", "为现代工程技术的发展奠定理论基础。"],
            apps: ["航天器的轨道计算与姿态控制。", "日常生活中的家用电器原理。", "高速列车的动力系统设计。", "桥梁建筑的受力分析。"],
            facts: ["牛顿曾说：'如果我看得更远，那是因为我站在巨人的肩膀上'。", "量子力学的发展挑战了我们对这一概念的传统认知。", "光速是目前已知宇宙中物质运动的速度极限。"]
        },
        'chemistry': {
            defs: ["化学是研究物质的组成、结构、性质及其变化规律的科学。", "该反应展示了物质之间神奇的转化过程。", "这是理解材料特性和化学反应机理的关键。"],
            values: ["认识物质世界的多样性与统一性。", "解决环境污染、能源危机等全球性问题。", "为新材料的研发提供理论指导。"],
            apps: ["新型电池材料的开发。", "药物合成与疾病治疗。", "食品加工与安全检测。", "环境监测与污水处理。"],
            facts: ["人体内每时每刻都在发生着无数次复杂的化学反应。", "诺贝尔奖不仅仅颁发给炸药的发明者，也见证了化学的辉煌。", "石墨烯的发现为材料科学打开了一扇新的大门。"]
        },
        'biology': {
            defs: ["生物学是研究生命现象和生命活动规律的科学。", "该结构体现了生物体形态与功能相适应的原理。", "这是探索生命起源与演化奥秘的重要线索。"],
            values: ["珍爱生命，与自然和谐共处。", "理解人体健康与疾病的奥秘。", "为生物工程和现代农业提供技术支撑。"],
            apps: ["基因工程在农业育种中的应用。", "疫苗研发与传染病防控。", "生态修复与生物多样性保护。", "仿生机器人技术。"],
            facts: ["人类的DNA与香蕉竟然有50%的相似度！", "微观下的细胞世界比最繁忙的城市还要复杂有序。", "大脑是已知宇宙中结构最复杂的物质。"]
        },
        'cs': {
            defs: ["计算机科学是研究信息处理、算法设计与系统构建的学科。", "该技术是实现人工智能与自动化的核心驱动力。", "这是连接虚拟世界与现实世界的逻辑桥梁。"],
            values: ["培养计算思维与问题解决能力。", "适应数字化时代的生活与工作方式。", "推动社会信息化和智能化的发展进程。"],
            apps: ["智能手机App的开发与运行。", "大数据分析与个性化推荐。", "网络安全攻防与信息加密。", "自动驾驶汽车的感知与决策。"],
            facts: ["世界上第一位程序员是诗人拜伦的女儿埃达·洛夫莱斯。", "摩尔定律预言了计算机性能每18个月翻一番。", "图灵测试通过与否曾经是判断机器是否具有智能的标准。"]
        },
        'default': {
            defs: ["这是科学探索旅程中一个有趣且重要的知识点。", "它体现了人类对自然界规律的不懈探索。"],
            values: ["拓宽知识视野，激发科学兴趣。", "培养批判性思维和创新意识。"],
            apps: ["科学技术在日常生活中的广泛应用。", "推动人类文明进步的重要力量。"],
            facts: ["科学的进步往往源于对未知世界的好奇心。", "每一个科学发现背后都有着动人的故事。"]
        }
    },

    generate: function (title, subject, type) {
        const t = this.templates[subject] || this.templates['default'];

        // Helper to pick random
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

        let content = '';

        // 1. Core Definition
        content += `<div class='mb-4'><h4 class='text-cyan-400 font-bold text-sm mb-1'>📝 核心概念 (Core Definition)</h4>`;
        content += `<p class='text-slate-300 text-sm'>${pick(t.defs)} <strong>${title}</strong> 是${subject === 'cs' ? '数字时代' : '科学体系'}中的重要组成部分。</p></div>`;

        // 2. Curriculum Value
        content += `<div class='mb-4'><h4 class='text-purple-400 font-bold text-sm mb-1'>🎓 新课标价值 (Curriculum Value)</h4>`;
        content += `<p class='text-slate-300 text-sm'>学习这一内容有助于${pick(t.values)} 它能帮助学生建立完整的${subject.toUpperCase()}学科图景。</p></div>`;

        // 3. Application or Lab
        if (type === 'lab') {
            content += `<div class='mb-4'><h4 class='text-green-400 font-bold text-sm mb-1'>🔬 实验探究 (Lab Inquiry)</h4>`;
            content += `<p class='text-slate-300 text-sm'>在“${title}”实验中，我们通常需要观察现象、记录数据并分析结论。${pick(t.apps).replace('应用', '原理')}</p></div>`;
        } else {
            content += `<div class='mb-4'><h4 class='text-orange-400 font-bold text-sm mb-1'>💡 现实应用 (Real World)</h4>`;
            content += `<p class='text-slate-300 text-sm'>这一概念广泛应用于：${pick(t.apps)} 它深刻地改变了我们的生活方式。</p></div>`;
        }

        // 4. Did You Know
        content += `<div><h4 class='text-pink-400 font-bold text-sm mb-1'>🌟 趣味拓展 (Did You Know?)</h4>`;
        content += `<p class='text-slate-300 text-sm italic'>${pick(t.facts)} 保持好奇心，是探索科学的最大动力！</p></div>`;

        return content;
    }
};

// 3. Helper: Tag Generator (Keep existing logic mostly, or simple map)
const subjectTags = {
    'math': ['逻辑', '计算', '模型', '抽象', '几何', '代数', '分析', '证明'],
    'physics': ['力学', '电磁', '量子', '能量', '物质', '宇宙', '实验', '定律'],
    'chemistry': ['分子', '反应', '合成', '结构', '能量', '材料', '分析', '实验'],
    'biology': ['基因', '细胞', '进化', '生态', '神经', '代谢', '生命', '实验'],
    'cs': ['算法', '系统', '网络', 'AI', '数据', '逻辑', '架构', '代码'],
    'elementary': ['启蒙', '自然', '观察', '动手', '趣味'],
    'science': ['探究', '观察', '自然', '现象', '实验', '测量', '发现']
};

// 4. Data Generation Logic
const synergyData = [];
let idCounter = 1;

function createNode(title, subject, stage, isKey = false, type = 'concept') {
    // Generate Rich Content
    const richContent = RichContentGenerator.generate(title, subject, type);

    // Tags Logic
    const baseTags = subjectTags[subject] || subjectTags['science'];
    const myTags = [baseTags[Math.floor(Math.random() * baseTags.length)], baseTags[Math.floor(Math.random() * baseTags.length)]];
    if (Math.random() > 0.8) { // Cross-disciplinary
        const otherSubjects = Object.keys(subjectTags).filter(s => s !== subject && s !== 'elementary');
        const randomSub = otherSubjects[Math.floor(Math.random() * otherSubjects.length)];
        if (subjectTags[randomSub]) myTags.push(subjectTags[randomSub][0]);
    }

    let suffix = '';
    if (type === 'lab') suffix = ' [实验]';
    if (type === 'app') suffix = ' [应用]';

    return {
        id: title + suffix,
        title: title + suffix,
        category: subject,
        stage: stage,
        tags: [...new Set(myTags)],
        content: richContent, // Use the new rich HTML
        rank: isKey ? 10 : (type === 'concept' ? 3 : 1),
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
