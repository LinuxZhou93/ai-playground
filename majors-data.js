// 中国学科分类数据（基于教育部《普通高等学校本科专业目录》）
// Data Structure Version: 2024.1 (Open Source Standard Compatible)

const chinaCategories = [
    // 01 哲学
    {
        code: '01',
        name: '哲学',
        icon: 'brain', // Lucide icon name
        desc: '探索世界本原、思维规律与价值体系的基础学科',
        stats: { majors: 4, heat: '⭐⭐⭐' },
        majors: [
            {
                name: '哲学', code: '010101', degree: '哲学学士', years: '4年',
                detail: {
                    intro: '培养具有扎实哲学理论基础和系统专业知识，能运用科学世界观和方法论分析解决问题的复合型人才。',
                    courses: '马克思主义哲学、中国哲学史、西方哲学史、逻辑学、伦理学、美学、科学技术哲学',
                    career: '党政机关、高等院校、科研机构、新闻出版、企业文化部门',
                    schools: ['北京大学', '复旦大学', '中国人民大学', '南京大学']
                }
            },
            {
                name: '逻辑学', code: '010102', degree: '哲学学士', years: '4年',
                detail: {
                    intro: '研究思维形式、规律和方法的学科，侧重数理逻辑与符号逻辑的训练。',
                    courses: '数理逻辑、模态逻辑、归纳逻辑、认知科学导论、分析哲学、计算机科学基础',
                    career: '高校科研、IT企业逻辑算法设计、数据分析、公务员',
                    schools: ['北京大学', '中山大学', '南开大学']
                }
            },
            {
                name: '宗教学', code: '010103K', degree: '哲学学士', years: '4年',
                detail: {
                    intro: '研究宗教现象、宗教历史、宗教理论及宗教与社会关系的学科。',
                    courses: '宗教学通论、基督教史、佛教史、道教史、伊斯兰教史、宗教社会学',
                    career: '宗教事务管理部门、统战部门、科研院所、文化机构',
                    schools: ['中国人民大学', '四川大学', '中央民族大学']
                }
            },
            {
                name: '伦理学', code: '010104T', degree: '哲学学士', years: '4年',
                detail: {
                    intro: '研究道德现象、道德本质、道德规律及道德规范的学科。',
                    courses: '伦理学原理、中国伦理思想史、西方伦理思想史、应用伦理学、政治哲学',
                    career: '教育、科研、宣传、文明办、企业CSR部门',
                    schools: ['中国人民大学', '清华大学', '湖南师范大学']
                }
            }
        ]
    },

    // 02 经济学
    {
        code: '02',
        name: '经济学',
        icon: 'trending-up',
        desc: '研究社会财富生产、分配、交换与消费规律的应用学科',
        stats: { majors: 6, heat: '⭐⭐⭐⭐⭐' },
        majors: [
            {
                name: '经济学', code: '020101', degree: '经济学学士', years: '4年',
                detail: {
                    intro: '现代经济学理论基础扎实，能进行经济分析、预测、规划与管理的专门人才。',
                    courses: '微观经济学、宏观经济学、计量经济学、政治经济学、财政学、金融学',
                    career: '政府经济部门、金融机构、企业战略部、政策研究机构',
                    schools: ['北京大学', '中国人民大学', '复旦大学', '武汉大学']
                }
            },
            {
                name: '金融学', code: '020301K', degree: '经济学学士', years: '4年',
                detail: {
                    intro: '研究货币、银行、保险、证券投资等金融领域理论与实务的学科。',
                    courses: '货币银行学、国际金融、证券投资学、公司金融、金融工程、商业银行管理',
                    career: '银行、证券、保险、基金公司、信托机构、监管部门',
                    schools: ['清华大学', '五道口金融学院', '上海财经大学', '中央财经大学']
                }
            },
            {
                name: '金融工程', code: '020302', degree: '经济学学士', years: '4年',
                detail: {
                    intro: '运用数学和工程技术手段设计、开发和实施新型金融产品，解决金融问题。',
                    courses: '金融衍生工具、随机微积分、金融风险管理、C++金融编程、计算金融',
                    career: '量化交易、风险管理、金融产品设计、投行',
                    schools: ['南开大学', '中国人民大学', '厦门大学']
                }
            },
            {
                name: '国际经济与贸易', code: '020401', degree: '经济学学士', years: '4年',
                detail: {
                    intro: '掌握国际贸易规则与实务，适应全球化经济活动的复合型人才。',
                    courses: '国际贸易实务、国际商法、外贸函电、国际结算、跨国公司管理',
                    career: '外贸企业、跨国公司、海关、商务部、外资银行',
                    schools: ['对外经济贸易大学', '南开大学', '上海对外经贸大学']
                }
            },
            {
                name: '财政学', code: '020201K', degree: '经济学学士', years: '4年',
                detail: {
                    intro: '研究政府收支活动及其对经济社会发展影响的学科。',
                    courses: '财政学、中国税制、政府预算、国有资产管理、公债学',
                    career: '财政局、税务局、会计师事务所、企业税务专员',
                    schools: ['中国人民大学', '厦门大学', '上海财经大学']
                }
            },
            {
                name: '数字经济', code: '020109T', degree: '经济学学士', years: '4年',
                detail: {
                    intro: '融合经济学与数字技术，研究数字经济运行规律与数字化转型。',
                    courses: '数字经济概论、大数据分析、区块链原理、数字贸易、互联网金融',
                    career: '互联网企业、数字化转型咨询、政府数字经济管理部门',
                    schools: ['北京大学', '浙江大学', '中央财经大学']
                }
            }
        ]
    },

    // 03 法学
    {
        code: '03',
        name: '法学',
        icon: 'scale',
        desc: '维护社会正义，研究法律规范与社会治理的学科',
        stats: { majors: 5, heat: '⭐⭐⭐⭐' },
        majors: [
            {
                name: '法学', code: '030101K', degree: '法学学士', years: '4年',
                detail: {
                    intro: '系统掌握法律知识，熟悉法律法规，具备法律思维与实务能力的专门人才。',
                    courses: '法理学、宪法、民法、刑法、行政法、诉讼法、国际法、商法',
                    career: '律师、法官、检察官、公证员、公司法务、公职人员',
                    schools: ['中国政法大学', '中国人民大学', '西南政法大学', '华东政法大学']
                }
            },
            {
                name: '社会学', code: '030301', degree: '法学学士', years: '4年',
                detail: {
                    intro: '研究社会结构、社会关系和社会变迁，探索社会运行规律。',
                    courses: '社会学概论、社会研究方法、社会心理学、社会统计学、社区概论',
                    career: '民政部门、社会组织、市场调查公司、媒体、高校',
                    schools: ['北京大学', '中国人民大学', '南京大学']
                }
            },
            {
                name: '政治学与行政学', code: '030201', degree: '法学学士', years: '4年',
                detail: {
                    intro: '研究国家政治制度、政治行为及行政管理规律的学科。',
                    courses: '政治学原理、行政学原理、公共政策、比较政治制度、中国政府与政治',
                    career: '党政机关、政策研究室、行政管理、新闻媒体',
                    schools: ['北京大学', '复旦大学', '吉林大学']
                }
            },
            {
                name: '外交学', code: '030203', degree: '法学学士', years: '4年',
                detail: {
                    intro: '研究国家对外关系、外交政策及外交实务的学科。',
                    courses: '外交学概论、中国外交史、国际关系理论、外交礼仪、国际组织',
                    career: '外交部、涉外机构、国际组织、外事部门、跨国智库',
                    schools: ['外交学院', '北京大学', '中国人民大学']
                }
            },
            {
                name: '社会工作', code: '030302', degree: '法学学士', years: '4年',
                detail: {
                    intro: '运用专业方法帮助困难群体，促进社会公平与和谐的应用型学科。',
                    courses: '社会工作概论、个案工作、小组工作、社区工作、社会福利与保障',
                    career: '社工机构、社区服务中心、民政系统、慈善组织',
                    schools: ['北京大学', '中山大学', '复旦大学']
                }
            }
        ]
    },

    // 04 教育学
    {
        code: '04',
        name: '教育学',
        icon: 'graduation-cap',
        desc: '培养人类灵魂工程师，研究教育规律与人才培养',
        stats: { majors: 4, heat: '⭐⭐⭐' },
        majors: [
            {
                name: '教育学', code: '040101', degree: '教育学学士', years: '4年',
                detail: {
                    intro: '研究教育现象和教育问题，揭示教育规律的学科。',
                    courses: '教育原理、教育心理学、中国教育史、外国教育史、课程与教学论',
                    career: '中小学教师、教育行政部门、教育研究机构、培训机构',
                    schools: ['北京师范大学', '华东师范大学', '东北师范大学']
                }
            },
            {
                name: '学前教育', code: '040106', degree: '教育学学士', years: '4年',
                detail: {
                    intro: '专门研究0-6岁儿童教育规律及保育方法的学科。',
                    courses: '学前教育学、儿童心理学、幼儿园课程、幼儿卫生学、钢琴与声乐',
                    career: '幼儿园教师、早教机构、学前教育管理、儿童出版物编辑',
                    schools: ['北京师范大学', '华南师范大学', '南京师范大学']
                }
            },
            {
                name: '体育教育', code: '040201', degree: '教育学学士', years: '4年',
                detail: {
                    intro: '培养掌握体育教育基本理论与技能的学校体育师资。',
                    courses: '运动解剖学、运动生理学、学校体育学、田径、球类、体操',
                    career: '中小学体育教师、体育俱乐部教练、健身指导',
                    schools: ['北京体育大学', '上海体育学院', '武汉体育学院']
                }
            },
            {
                name: '教育技术学', code: '040104', degree: '理学/教育学学士', years: '4年',
                detail: {
                    intro: '利用信息技术优化教育教学过程，设计开发数字化学习资源。',
                    courses: '教学系统设计、教育电视节目制作、多媒体课件设计、在线教育应用',
                    career: '信息技术教师、在线教育公司产品经理、教育软件开发',
                    schools: ['华南师范大学', '北京师范大学', '华东师范大学']
                }
            }
        ]
    },

    // 05 文学
    {
        code: '05',
        name: '文学',
        icon: 'book-open',
        desc: '传承人类文明，研究语言、文学与跨文化传播',
        stats: { majors: 6, heat: '⭐⭐⭐⭐' },
        majors: [
            {
                name: '汉语言文学', code: '050101', degree: '文学学士', years: '4年',
                detail: {
                    intro: '系统掌握中文与中国文学知识，具备高水平读写能力的通用型人才。',
                    courses: '现代汉语、古代汉语、现当代文学、古代文学、文学概论',
                    career: '编辑、记者、文案策划、行政文秘、语文教师',
                    schools: ['北京大学', '复旦大学', '北京师范大学']
                }
            },
            {
                name: '英语', code: '050201', degree: '文学学士', years: '4年',
                detail: {
                    intro: '具备扎实英语语言基础与跨文化交际能力的国际化人才。',
                    courses: '综合英语、高级英语、口译、笔译、英美文学、英语写作',
                    career: '翻译、外贸、外企职员、英语教师、涉外导游',
                    schools: ['北京外国语大学', '上海外国语大学', '南京大学']
                }
            },
            {
                name: '新闻学', code: '050301', degree: '文学学士', years: '4年',
                detail: {
                    intro: '培养具备新闻采写编评能力，熟悉媒介运作规律的新闻传播人才。',
                    courses: '新闻学概论、新闻采访写作、新闻摄影、传播学、媒介伦理',
                    career: '报社、电视台、新闻网站记者编辑、企业公关',
                    schools: ['中国人民大学', '中国传媒大学', '复旦大学']
                }
            },
            {
                name: '广告学', code: '050303', degree: '文学学士', years: '4年',
                detail: {
                    intro: '研究广告策划、创意、设计与发布的规律，培养营销传播人才。',
                    courses: '广告学概论、市场营销学、广告心理学、广告文案、品牌策划',
                    career: '4A广告公司、品牌部、媒介购买、创意总监',
                    schools: ['厦门大学', '中国传媒大学', '武汉大学']
                }
            },
            {
                name: '小语种(法/德/日/西...)', code: '0502XX', degree: '文学学士', years: '4年',
                detail: {
                    intro: '培养掌握非通用语种语言技能，了解对象国文化的专门人才。',
                    courses: '基础语言、高级语言、对象国文学、翻译理论与实践',
                    career: '外交部、跨国企业、翻译机构、外派人员',
                    schools: ['北京外国语大学', '上海外国语大学', '广东外语外贸大学']
                }
            },
            {
                name: '网络与新媒体', code: '050306T', degree: '文学学士', years: '4年',
                detail: {
                    intro: '融合互联网技术与内容生产，适应全媒体时代的传播人才。',
                    courses: '新媒体概论、网页设计、数据新闻、网络舆情分析、短视频制作',
                    career: '互联网运营、新媒体小编、内容创作者、产品运营',
                    schools: ['中国传媒大学', '暨南大学', '深圳大学']
                }
            }
        ]
    },

    // 06 历史学
    {
        code: '06',
        name: '历史学',
        icon: 'hourglass',
        desc: '以史为鉴，探究人类社会发展历程与规律',
        stats: { majors: 3, heat: '⭐⭐' },
        majors: [
            {
                name: '历史学', code: '060101', degree: '历史学学士', years: '4年',
                detail: {
                    intro: '系统掌握历史知识，培养历史思维与史料分析能力。',
                    courses: '中国通史、世界通史、史学概论、考古学通论、历史地理学',
                    career: '中学历史教师、档案馆、博物馆、出版社、政策研究',
                    schools: ['北京大学', '南开大学', '复旦大学']
                }
            },
            {
                name: '考古学', code: '060103', degree: '历史学学士', years: '4年',
                detail: {
                    intro: '通过实物遗存研究人类历史，侧重田野发掘与文物鉴定。',
                    courses: '考古学导论、田野考古学、旧石器考古、新石器考古、文物保护技术',
                    career: '考古研究所、博物馆、文物局、海关鉴定',
                    schools: ['北京大学', '吉林大学', '西北大学']
                }
            },
            {
                name: '文物与博物馆学', code: '060104', degree: '历史学学士', years: '4年',
                detail: {
                    intro: '研究文物保管、陈列、保护及博物馆运营管理的学科。',
                    courses: '博物馆学概论、文物学概论、藏品管理、博物馆陈列设计',
                    career: '博物馆策展人、文物拍卖公司、画廊、艺术品投资',
                    schools: ['南开大学', '复旦大学', '浙江大学']
                }
            }
        ]
    },

    // 07 理学
    {
        code: '07',
        name: '理学',
        icon: 'atom',
        desc: '探索自然界基本规律的基础科学，创新之源',
        stats: { majors: 7, heat: '⭐⭐⭐⭐' },
        majors: [
            {
                name: '数学与应用数学', code: '070101', degree: '理学学士', years: '4年',
                detail: {
                    intro: '培养严密的逻辑思维与数学建模能力，是计算机、金融等学科的基础。',
                    courses: '数学分析、高等代数、解析几何、概率论、数理统计、数学建模',
                    career: 'IT算法工程师、数据分析师、精算师、数学教师、科研',
                    schools: ['北京大学', '复旦大学', '山东大学']
                }
            },
            {
                name: '物理学', code: '070201', degree: '理学学士', years: '4年',
                detail: {
                    intro: '研究物质与能量的基本形式及相互转化规律的学科。',
                    courses: '力学、热学、电磁学、光学、量子力学、电动力学、固体物理',
                    career: '物理研究所、半导体行业、核能、航空航天、教育',
                    schools: ['北京大学', '中国科学技术大学', '南京大学']
                }
            },
            {
                name: '化学', code: '070301', degree: '理学学士', years: '4年',
                detail: {
                    intro: '研究物质组成、结构、性质及其变化规律的中心科学。',
                    courses: '无机化学、有机化学、分析化学、物理化学、结构化学',
                    career: '制药、日化、新材料、环境监测、检验检疫',
                    schools: ['北京大学', '南开大学', '吉林大学']
                }
            },
            {
                name: '生物科学', code: '071001', degree: '理学学士', years: '4年',
                detail: {
                    intro: '研究生命现象、生命活动规律的学科，21世纪前沿学科。',
                    courses: '动物学、植物学、微生物学、生物化学、分子生物学、遗传学',
                    career: '生物技术公司、医药研发、基因测序、农林科研',
                    schools: ['清华大学', '北京大学', '武汉大学']
                }
            },
            {
                name: '心理学', code: '071101', degree: '理学学士', years: '4年',
                detail: {
                    intro: '研究人类心理现象、精神功能和行为的科学。',
                    courses: '普通心理学、实验心理学、心理统计学、认知心理学、社会心理学',
                    career: '心理咨询、人力资源、用户体验(UX)、市场调研、学校辅导',
                    schools: ['北京师范大学', '北京大学', '华东师范大学']
                }
            },
            {
                name: '统计学', code: '071201', degree: '理学学士', years: '4年',
                detail: {
                    intro: '通过数据收集、整理、分析来推断规律，数据时代的基石。',
                    courses: '数理统计、回归分析、多元统计、时间序列分析、R语言/Python',
                    career: '数据科学家、市场分析师、金融风控、生物统计',
                    schools: ['中国人民大学', '北京大学', '厦门大学']
                }
            },
            {
                name: '地理科学', code: '070501', degree: '理学学士', years: '4年',
                detail: {
                    intro: '研究地球表面地理环境结构、分布、演变规律及人地关系。',
                    courses: '自然地理学、人文地理学、地图学、GIS原理、遥感概论',
                    career: '中学教师、城乡规划、气象局、国土资源局',
                    schools: ['北京大学', '南京大学', '兰州大学']
                }
            }
        ]
    },

    // 08 工学 (Heavy Expansion based on User Request)
    {
        code: '08',
        name: '工学',
        icon: 'cpu',
        desc: '建构现代文明的基石，涵盖信息、制造、能源等关键领域',
        stats: { majors: 15, heat: '⭐⭐⭐⭐⭐⭐' },
        majors: [
            {
                name: '计算机科学与技术', code: '080901', degree: '工学学士', years: '4年',
                detail: {
                    intro: '研究计算机系统结构、软件与应用的学科，就业之王。',
                    courses: '计算机组成原理、OS、计网、数据结构、数据库、编译原理',
                    career: '全行业IT岗，软件开发、系统架构、运维',
                    schools: ['清华大学', '国防科技大学', '北京航空航天大学']
                }
            },
            {
                name: '软件工程', code: '080902', degree: '工学学士', years: '4年',
                detail: {
                    intro: '工程化方法构建和维护软件，侧重大型软件开发与管理。',
                    courses: '软件工程导论、软件需求、软件测试、软件项目管理、Java/C++',
                    career: '互联网大厂、软件外包、CTO、产品经理',
                    schools: ['北京航空航天大学', '浙江大学', '清华大学']
                }
            },
            {
                name: '人工智能', code: '080717T', degree: '工学学士', years: '4年',
                detail: {
                    intro: '模拟、延伸和扩展人类智能的理论、方法、技术及应用系统。',
                    courses: '机器学习、深度学习、NLP、计算机视觉、知识图谱、机器人学',
                    career: 'AI算法工程师、大模型研发、自动驾驶、智能安防',
                    schools: ['清华大学', '上海交通大学', '南京大学']
                }
            },
            {
                name: '数据科学与大数据技术', code: '080910T', degree: '工学学士', years: '4年',
                detail: {
                    intro: '研究数据采集、存储、处理、分析与挖掘的学科。',
                    courses: '大数据平台技术(Hadoop/Spark)、云计算、数据可视化、NoSQL数据库',
                    career: '大数据工程师、数据挖掘专家、BI分析师',
                    schools: ['北京大学', '中南大学', '复旦大学']
                }
            },
            {
                name: '网络空间安全', code: '083901', degree: '工学学士', years: '4年',
                detail: {
                    intro: '捍卫国家网络主权与数据安全，对抗黑客与网络攻击。',
                    courses: '密码学、网络攻防、操作系统安全、恶意代码分析、Web安全',
                    career: '网安公司、公安网监、企业安全部、白帽子',
                    schools: ['四川大学', '北京邮电大学', '西安电子科技大学']
                }
            },
            {
                name: '物联网工程', code: '080905', degree: '工学学士', years: '4年',
                detail: {
                    intro: '万物互联，研究传感器、嵌入式系统与网络通信的融合。',
                    courses: 'RFID原理、传感器技术、嵌入式系统设计、无线传感器网络',
                    career: '智能家居、智慧城市、物流追踪、工业互联网',
                    schools: ['江南大学', '北京邮电大学', '电子科技大学']
                }
            },
            {
                name: '电子信息工程', code: '080701', degree: '工学学士', years: '4年',
                detail: {
                    intro: '研究信息的获取与处理，电子设备与信息系统的设计。',
                    courses: '信号与系统、数字信号处理、电磁场与微波、通信原理、FPGA',
                    career: '通信设备商(华为/中兴)、电子研发、芯片设计辅助',
                    schools: ['电子科技大学', '西安电子科技大学', '清华大学']
                }
            },
            {
                name: '自动化', code: '080801', degree: '工学学士', years: '4年',
                detail: {
                    intro: '研究自动控制理论与技术，“万金油”专业，软硬结合。',
                    courses: '自动控制原理、PLC、电机拖动、过程控制、运动控制',
                    career: '工业自动化、机器人控制、汽车电子、航空航天控制',
                    schools: ['清华大学', '东北大学', '哈尔滨工业大学']
                }
            },
            {
                name: '机械设计制造及其自动化', code: '080202', degree: '工学学士', years: '4年',
                detail: {
                    intro: '研究各种工业机械装备及机电产品的设计、制造、运行控制。',
                    courses: '机械原理、机械设计、工程力学、电工电子、数控技术',
                    career: '汽车制造、重工企业、模具设计、设备维护',
                    schools: ['华中科技大学', '西安交通大学', '大连理工大学']
                }
            },
            {
                name: '车辆工程', code: '080207', degree: '工学学士', years: '4年',
                detail: {
                    intro: '研究汽车、机车等陆上移动机械的理论、设计与制造。',
                    courses: '汽车构造、汽车理论、汽车设计、发动机原理、底盘技术',
                    career: '整车厂(上汽/一汽)、汽车零部件、新能源汽车研发',
                    schools: ['清华大学', '吉林大学', '同济大学']
                }
            },
            {
                name: '航空航天工程', code: '082001', degree: '工学学士', years: '4年',
                detail: {
                    intro: '研究飞机、航天器等飞行器的设计、制造与试验。',
                    courses: '空气动力学、飞行力学、飞行器结构设计、航空发动机原理',
                    career: '航天院所、航空公司、民用飞机制造、国防工业',
                    schools: ['北京航空航天大学', '西北工业大学', '哈尔滨工业大学']
                }
            },
            {
                name: '土木工程', code: '081001', degree: '工学学士', years: '4年',
                detail: {
                    intro: '建造各类工程设施（房屋、道路、桥梁、隧道）的科学技术。',
                    courses: '材料力学、结构力学、土力学、混凝土结构、钢结构、施工技术',
                    career: '建筑施工(中建)、设计院、房地产、工程监理',
                    schools: ['同济大学', '东南大学', '天津大学']
                }
            },
            {
                name: '建筑学', code: '082801', degree: '建筑学学士', years: '5年',
                detail: {
                    intro: '研究建筑物及其环境的设计原理与方法，兼具艺术与技术。',
                    courses: '建筑设计、建筑史、建筑构造、城市规划原理、美术基础',
                    career: '建筑事务所、规划局、地产设计部、室内设计',
                    schools: ['清华大学', '东南大学', '同济大学']
                }
            },
            {
                name: '新能源科学与工程', code: '080503T', degree: '工学学士', years: '4年',
                detail: {
                    intro: '开发利用太阳能、风能、生物质能等新型能源。',
                    courses: '工程热力学、流体力学、太阳能光伏、风力发电、储能技术',
                    career: '光伏企业、风电场、电池厂商(宁德时代)、电力设计院',
                    schools: ['西安交通大学', '华北电力大学', '浙江大学']
                }
            },
            {
                name: '生物医学工程', code: '082601', degree: '工学学士', years: '4年',
                detail: {
                    intro: '医学与工程学的交叉，研发医疗器械、人工器官、医学影像设备。',
                    courses: '医学成像原理、生物医学传感器、各种医疗仪器原理、生理学',
                    career: '医疗器械研发(GPS/迈瑞)、医院设备科、临床工程师',
                    schools: ['东南大学', '上海交通大学', '清华大学']
                }
            }
        ]
    },

    // 09 农学
    {
        code: '09',
        name: '农学',
        icon: 'sprout',
        desc: '保障人类生存与发展的绿色生命科学',
        stats: { majors: 4, heat: '⭐⭐⭐' },
        majors: [
            {
                name: '农学', code: '090101', degree: '农学学士', years: '4年',
                detail: {
                    intro: '研究作物生长发育规律、产量品质形成及高产栽培育种技术。',
                    courses: '植物生理学、遗传学、作物栽培学、作物育种学、农业生态学',
                    career: '农业技术推广、种子企业、农场管理、农业科研',
                    schools: ['中国农业大学', '南京农业大学', '华中农业大学']
                }
            },
            {
                name: '园艺', code: '090102', degree: '农学学士', years: '4年',
                detail: {
                    intro: '研究果树、蔬菜、花卉的栽培、育种及产后处理。',
                    courses: '果树栽培学、蔬菜栽培学、花卉学、设施园艺、园林规划',
                    career: '园林局、花卉公司、生态农庄、景观设计',
                    schools: ['浙江大学', '华中农业大学', '中国农业大学']
                }
            },
            {
                name: '林学', code: '090501', degree: '农学学士', years: '4年',
                detail: {
                    intro: '研究森林资源的培育、保护、经营管理及利用。',
                    courses: '森林生态学、测树学、造林学、森林经理学、林业遥感',
                    career: '林业局、林场、自然保护区、城市绿化',
                    schools: ['北京林业大学', '南京林业大学', '东北林业大学']
                }
            },
            {
                name: '动物医学', code: '090301', degree: '农学学士', years: '5年',
                detail: {
                    intro: '即兽医，研究动物疾病的诊断、治疗与预防。',
                    courses: '动物解剖、动物病理、兽医药理、兽医外科、宠物临床诊疗',
                    career: '宠物医院、动物检疫站、畜牧兽医局、养殖企业',
                    schools: ['中国农业大学', '华中农业大学', '扬州大学']
                }
            }
        ]
    },

    // 10 医学
    {
        code: '10',
        name: '医学',
        icon: 'heart-pulse',
        desc: '救死扶伤，探索生命奥秘与疾病治疗',
        stats: { majors: 6, heat: '⭐⭐⭐⭐⭐' },
        majors: [
            {
                name: '临床医学', code: '100201K', degree: '医学学士', years: '5年',
                detail: {
                    intro: '培养具备临床诊疗能力的医生，医学学制最长、分书最重。',
                    courses: '解剖学、病理学、内科学、外科学、妇产科学、儿科学、诊断学',
                    career: '各级医院临床医生',
                    schools: ['协和医学院', '北京大学医学部', '上海交通大学医学院']
                }
            },
            {
                name: '口腔医学', code: '100301K', degree: '医学学士', years: '5年',
                detail: {
                    intro: '研究口腔颚面部疾病的预防、诊断与治疗，“金眼科银外科千万别干”里的误区，其实是高薪职业。',
                    courses: '口腔解剖生理、口腔内科、口腔颌面外科、口腔修复、口腔正畸',
                    career: '口腔医生、私人牙科诊所、牙科美容',
                    schools: ['四川大学', '北京大学', '武汉大学']
                }
            },
            {
                name: '基础医学', code: '100101K', degree: '医学学士', years: '5年',
                detail: {
                    intro: '研究人体生命活动规律及疾病机制，培养医学科学家。',
                    courses: '人体解剖、组胚、生理、生化、免疫、病原生物、病理',
                    career: '医学院校教学、医学科研机构、制药企业研发',
                    schools: ['北京大学', '复旦大学', '浙江大学']
                }
            },
            {
                name: '预防医学', code: '100401K', degree: '医学学士', years: '5年',
                detail: {
                    intro: '关注人群健康，研究疾病流行规律与防控策略，“上医治未病”。',
                    courses: '流行病学、环境卫生学、营养与食品卫生、毒理学、卫生统计',
                    career: '疾控中心(CDC)、卫生监督所、海关检疫',
                    schools: ['南京医科大学', '华中科技大学', '北京大学']
                }
            },
            {
                name: '中医学', code: '100501K', degree: '医学学士', years: '5年',
                detail: {
                    intro: '传承发扬中国传统医学理论与诊疗技术。',
                    courses: '中医基础理论、中医诊断学、中药学、方剂学、中医内科、针灸',
                    career: '中医院、综合医院中医科、中医养生机构',
                    schools: ['北京中医药大学', '上海中医药大学', '广州中医药大学']
                }
            },
            {
                name: '药学', code: '100701', degree: '理学学士', years: '4年',
                detail: {
                    intro: '研究药物的设计、合成、鉴定、药理作用及临床使用。',
                    courses: '药物化学、药剂学、药理学、药物分析、天然药物化学',
                    career: '药房药师、药企研发QC/QA、医药代表',
                    schools: ['中国药科大学', '沈阳药科大学', '北京大学']
                }
            }
        ]
    },

    // 11 军事学 (Usually restricted, but adding generic intro)
    {
        code: '11',
        name: '军事学',
        icon: 'shield',
        desc: '研究战争规律与国防建设的特殊学科',
        stats: { majors: 1, heat: '⭐' },
        majors: [
            {
                name: '军事指挥', code: '1101xx', degree: '军事学学士', years: '4年',
                detail: {
                    intro: '培养各级部队指挥军官，研究作战指挥规律。',
                    courses: '军事战略、战术学、联合作战、军事运筹、指挥信息系统',
                    career: '现役军官（需报考军校）',
                    schools: ['国防大学', '国防科技大学', '陆军工程大学']
                }
            }
        ]
    },

    // 12 管理学
    {
        code: '12',
        name: '管理学',
        icon: 'briefcase',
        desc: '协调资源，提升组织效率的艺术与科学',
        stats: { majors: 5, heat: '⭐⭐⭐⭐' },
        majors: [
            {
                name: '工商管理', code: '120201K', degree: '管理学学士', years: '4年',
                detail: {
                    intro: '学习企业管理的基本理论和方法，培养职业经理人潜力。',
                    courses: '管理学、战略管理、市场营销、运营管理、人力资源管理',
                    career: '企业管培生、咨询顾问、创业、行政管理',
                    schools: ['清华大学', '厦门大学', '中山大学']
                }
            },
            {
                name: '会计学', code: '120203K', degree: '管理学学士', years: '4年',
                detail: {
                    intro: '商业语言，记录、核算与监督经济活动。',
                    courses: '初/中/高级财务会计、成本会计、审计学、财务管理、税法',
                    career: '四大会计师事务所、企业财务、内审、银行',
                    schools: ['上海财经大学', '中央财经大学', '厦门大学']
                }
            },
            {
                name: '电子商务', code: '120801', degree: '管理学/工学/经济学学士', years: '4年',
                detail: {
                    intro: '基于互联网的商务活动，技术与商务的结合。',
                    courses: '电商概论、网络营销、供应链管理、Web开发基础、电商法',
                    career: '电商运营、产品经理、数字营销、跨境电商',
                    schools: ['浙江大学', '西安交通大学', '对外经贸大学']
                }
            },
            {
                name: '行政管理', code: '120402', degree: '管理学学士', years: '4年',
                detail: {
                    intro: '研究政府及非营利组织的管理活动与规律。',
                    courses: '行政管理学、公共政策、组织行为学、政府经济学、公文写作',
                    career: '公务员、事业单位、企业行政专员、秘书',
                    schools: ['中国人民大学', '中山大学', '复旦大学']
                }
            },
            {
                name: '工业工程', code: '120701', degree: '管理学/工学学士', years: '4年',
                detail: {
                    intro: '利用工程与管理知识，优化生产系统，提高效率降低成本。',
                    courses: '运筹学、人因工程、生产计划与控制、质量管理、供应链管理',
                    career: '精益生产工程师、质量工程师、物流优化、流程改善',
                    schools: ['清华大学', '上海交通大学', '天津大学']
                }
            }
        ]
    },

    // 13 艺术学
    {
        code: '13',
        name: '艺术学',
        icon: 'palette',
        desc: '创造美、表现美，滋养人类精神世界',
        stats: { majors: 6, heat: '⭐⭐⭐⭐' },
        majors: [
            {
                name: '艺术设计学', code: '130501', degree: '艺术学学士', years: '4年',
                detail: {
                    intro: '研究设计历史与理论，培养设计策划与管理人才。',
                    courses: '世界设计史、设计美学、设计批评、艺术管理、主要设计软件',
                    career: '设计管理、时尚买手、艺术策展、设计教育',
                    schools: ['清华美院', '中国美院', '中央美院']
                }
            },
            {
                name: '视觉传达设计', code: '130502', degree: '艺术学学士', years: '4年',
                detail: {
                    intro: '平面设计，通过视觉媒介传递信息。',
                    courses: '字体设计、版式设计、品牌形象设计、包装设计、广告设计',
                    career: '平面设计师、UI设计师、品牌设计师、插画师',
                    schools: ['江南大学', '同济大学', '广州美术学院']
                }
            },
            {
                name: '环境设计', code: '130503', degree: '艺术学学士', years: '4年',
                detail: {
                    intro: '室内设计与景观设计的统称，改善人居环境。',
                    courses: '室内设计、景观规划、家具设计、展示设计、建筑制图',
                    career: '室内设计师、景观设计师、软装设计师',
                    schools: ['清华大学', '江南大学', '四川美术学院']
                }
            },
            {
                name: '数字媒体艺术', code: '130508', degree: '艺术学学士', years: '4年',
                detail: {
                    intro: '艺术与技术的融合，涉及CG、交互、虚拟现实等。',
                    courses: '数字图形处理、三维动画、交互设计、游戏美术、虚拟现实技术',
                    career: '游戏美术、特效师、交互设计师、新媒体艺术',
                    schools: ['中国传媒大学', '北京电影学院', '浙江传媒学院']
                }
            },
            {
                name: '广播电视编导', code: '130305', degree: '艺术学学士', years: '4年',
                detail: {
                    intro: '影视节目的幕后总指挥，策划与制作。',
                    courses: '视听语言、电视节目策划、非线性编辑、摄像技术、剧本创作',
                    career: '编导、导演、剪辑师、制片人',
                    schools: ['中国传媒大学', '北京电影学院', '上海戏剧学院']
                }
            },
            {
                name: '动画', code: '130310', degree: '艺术学学士', years: '4年',
                detail: {
                    intro: '赋予静态图像以生命，创造幻想世界。',
                    courses: '动画概论、原画设计、角色设计、分镜头脚本、3D动画制作',
                    career: '动画师、原画师、分镜师、模型师',
                    schools: ['北京电影学院', '中国传媒大学', '吉林动画学院']
                }
            }
        ]
    }
];

// 国际学科分类数据（基于ISCED 标准扩充）
const internationalCategories = [
    {
        code: 'STEM-01',
        name: 'Natural Sciences',
        icon: 'microscope',
        desc: 'Scientific study of the physical world.',
        majors: [
            { name: 'Physics', detail: { intro: 'Study of matter and energy.', schools: ['MIT', 'Cambridge'] } },
            { name: 'Chemistry', detail: { intro: 'Study of substances.', schools: ['Berkeley', 'ETH Zurich'] } },
            { name: 'Biology', detail: { intro: 'Study of life.', schools: ['Harvard', 'Oxford'] } },
            { name: 'Astronomy', detail: { intro: 'Study of celestial bodies.', schools: ['Caltech', 'Princeton'] } },
            { name: 'Earth Science', detail: { intro: 'Study of the planet Earth.', schools: ['Stanford', 'Zurich'] } }
        ]
    },
    {
        code: 'STEM-02',
        name: 'Engineering',
        icon: 'settings',
        desc: 'Application of science for practical ends.',
        majors: [
            { name: 'Computer Science', detail: { intro: 'Computation and information.', schools: ['CMU', 'MIT'] } },
            { name: 'Mechanical Eng.', detail: { intro: 'Machinery design.', schools: ['Stanford', 'RWTH Aachen'] } },
            { name: 'Electrical Eng.', detail: { intro: 'Electricity and electronics.', schools: ['Berkeley', 'TU Munich'] } },
            { name: 'Civil Engineering', detail: { intro: 'Infrastructure design.', schools: ['TU Delft', 'Imperial'] } },
            { name: 'Aerospace Eng.', detail: { intro: 'Aircraft and spacecraft.', schools: ['MIT', 'Caltech'] } }
        ]
    },
    {
        code: 'MED-01',
        name: 'Medicine & Health',
        icon: 'heart',
        desc: 'Health care and medical research.',
        majors: [
            { name: 'Clinical Medicine', detail: { intro: 'Treatment of patients.', schools: ['Johns Hopkins', 'Oxford'] } },
            { name: 'Public Health', detail: { intro: 'Health of populations.', schools: ['Harvard', 'LSHTM'] } },
            { name: 'Pharmacy', detail: { intro: 'Drug science.', schools: ['UCL', 'Monash'] } },
            { name: 'Nursing', detail: { intro: 'Patient care.', schools: ['UPenn', 'KCL'] } }
        ]
    },
    {
        code: 'HUM-01',
        name: 'Arts & Humanities',
        icon: 'feather',
        desc: 'Human culture and expression.',
        majors: [
            { name: 'History', detail: { intro: 'Study of the past.', schools: ['Oxford', 'Cambridge'] } },
            { name: 'Philosophy', detail: { intro: 'Fundamental questions.', schools: ['NYU', 'Rutgers'] } },
            { name: 'Literature', detail: { intro: 'Written works.', schools: ['Yale', 'Edinburgh'] } },
            { name: 'Linguistics', detail: { intro: 'Study of language.', schools: ['MIT', 'UMass'] } }
        ]
    },
    {
        code: 'SOC-01',
        name: 'Social Sciences',
        icon: 'users',
        desc: 'Scientific study of human society.',
        majors: [
            { name: 'Economics', detail: { intro: 'Production and distribution.', schools: ['Harvard', 'LSE'] } },
            { name: 'Psychology', detail: { intro: 'Mind and behavior.', schools: ['Stanford', 'UCL'] } },
            { name: 'Sociology', detail: { intro: 'Society and relationships.', schools: ['Berkeley', 'Wisconsin'] } },
            { name: 'Political Science', detail: { intro: 'Governance and power.', schools: ['Harvard', 'Sciences Po'] } }
        ]
    },
    {
        code: 'BUS-01',
        name: 'Business',
        icon: 'briefcase',
        desc: 'Commercial and organizational management.',
        majors: [
            { name: 'MBA/Business Admin', detail: { intro: 'Corporate management.', schools: ['Wharton', 'INSEAD'] } },
            { name: 'Finance', detail: { intro: 'Money management.', schools: ['NYU Stern', 'LBS'] } },
            { name: 'Marketing', detail: { intro: 'Promotion and sales.', schools: ['Kellogg', 'HEC Paris'] } }
        ]
    }
];
