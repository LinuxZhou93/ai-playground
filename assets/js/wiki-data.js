const wikiData = [
    // --- 小学阶段 (Elementary) ---
    // 编程与逻辑
    { title: "Scratch", category: "course", stage: "elementary", tags: ["Coding", "Block-based"], content: "MIT开发的图形化编程工具，通过积木拼接学习编程逻辑，适合零基础入门。" },
    { title: "Code.org", category: "course", stage: "elementary", tags: ["Coding", "CS"], content: "全球知名的少儿编程公益平台，提供《我的世界》、《冰雪奇缘》等主题的编程一小时课程。" },
    { title: "Python Turtle", category: "tool", stage: "elementary", tags: ["Coding", "Art"], content: "Python内置的海龟绘图库，通过简单的指令控制小海龟画图，直观理解代码执行顺序。" },
    { title: "流程图", category: "concept", stage: "elementary", tags: ["Logic", "Thinking"], content: "用图形符号表示算法思路的图表，包括开始、结束、判断、循环等基本结构。" },
    { title: "二进制", category: "concept", stage: "elementary", tags: ["CS", "Math"], content: "计算机的基础语言，只用0和1表示数字。理解开关的通断与数据的关系。" },

    // 机器人与硬件
    { title: "LEGO WeDo", category: "tool", stage: "elementary", tags: ["Robotics", "LEGO"], content: "乐高教育推出的入门级机器人套装，结合积木搭建和简单编程，学习机械传动。" },
    { title: "Micro:bit", category: "tool", stage: "elementary", tags: ["Hardware", "BBC"], content: "BBC推出的微型电脑开发板，集成了LED阵列、按钮、蓝牙和传感器，适合创意制作。" },
    { title: "Makey Makey", category: "tool", stage: "elementary", tags: ["Hardware", "Creative"], content: "创意电路板，可以将水果、橡皮泥等导电物体变成键盘按键，制作香蕉钢琴。" },
    { title: "齿轮传动", category: "concept", stage: "elementary", tags: ["Mechanics", "Physics"], content: "理解齿轮比、加速、减速和改变力的方向。常见于赛车和机械臂制作。" },
    { title: "杠杆原理", category: "concept", stage: "elementary", tags: ["Mechanics", "Physics"], content: "阿基米德的名言“给我一个支点，我可以撬动地球”。理解省力杠杆和费力杠杆。" },

    // 科学探索
    { title: "3D打印笔", category: "tool", stage: "elementary", tags: ["Design", "3D"], content: "手持式3D打印工具，可以直接在空气中“画”出立体物体，培养空间想象力。" },
    { title: "Tinkercad", category: "tool", stage: "elementary", tags: ["Design", "CAD"], content: "Autodesk推出的在线3D建模工具，操作简单，适合小学生设计自己的3D打印模型。" },
    { title: "显微镜", category: "tool", stage: "elementary", tags: ["Biology", "Optics"], content: "观察肉眼看不见的微观世界，如洋葱表皮细胞、昆虫翅膀结构。" },
    { title: "电路基础", category: "concept", stage: "elementary", tags: ["Physics", "Electronics"], content: "认识电池、灯泡、导线、开关，理解通路、断路和短路的概念。" },
    { title: "太阳能", category: "concept", stage: "elementary", tags: ["Energy", "Physics"], content: "了解光能转化为电能的原理，制作太阳能小车或风扇。" },
    { title: "水的循环", category: "concept", stage: "elementary", tags: ["Earth Science"], content: "理解蒸发、凝结、降水的过程，认识地球上的水资源。" },
    { title: "光合作用", category: "concept", stage: "elementary", tags: ["Biology"], content: "植物利用阳光、水和二氧化碳制造养分并释放氧气的过程。" },
    { title: "磁铁", category: "concept", stage: "elementary", tags: ["Physics"], content: "认识磁极、磁力线，理解同极相斥、异极相吸。" },
    { title: "浮力", category: "concept", stage: "elementary", tags: ["Physics"], content: "阿基米德原理，理解物体在水中沉浮的原因。" },
    { title: "声音的传播", category: "concept", stage: "elementary", tags: ["Physics"], content: "理解声音是由振动产生的，需要介质传播。" },

    // 数学思维
    { title: "数独", category: "course", stage: "elementary", tags: ["Math", "Logic"], content: "经典的逻辑填数字游戏，锻炼逻辑推理和观察能力。" },
    { title: "七巧板", category: "tool", stage: "elementary", tags: ["Math", "Geometry"], content: "中国传统智力玩具，通过拼接图形培养几何直觉。" },
    { title: "莫比乌斯环", category: "concept", stage: "elementary", tags: ["Math", "Topology"], content: "只有一个面和一个边界的曲面，神奇的拓扑学结构。" },
    { title: "斐波那契数列", category: "concept", stage: "elementary", tags: ["Math", "Nature"], content: "1, 1, 2, 3, 5... 自然界中常见的数列，如向日葵花盘的排列。" },
    { title: "对称", category: "concept", stage: "elementary", tags: ["Math", "Art"], content: "轴对称和中心对称，在建筑和自然界中广泛存在。" },

    // --- 初中阶段 (Middle) ---
    // 编程进阶
    { title: "Python 基础", category: "course", stage: "middle", tags: ["Coding", "Text-based"], content: "从图形化转向代码，学习变量、循环、函数、列表等核心语法。" },
    { title: "C++ 入门", category: "course", stage: "middle", tags: ["Coding", "CSP"], content: "信息学奥赛（CSP-J）指定语言，学习强类型语言特性和基本算法。" },
    { title: "App Inventor", category: "tool", stage: "middle", tags: ["Coding", "Mobile"], content: "MIT开发的安卓应用开发工具，通过积木块制作手机APP。" },
    { title: "HTML/CSS", category: "course", stage: "middle", tags: ["Web", "Design"], content: "网页开发基础，学习构建网页结构和美化页面样式。" },
    { title: "算法复杂度", category: "concept", stage: "middle", tags: ["CS", "Algorithm"], content: "理解时间复杂度和空间复杂度，学会评估程序的效率（Big O表示法）。" },

    // 电子与硬件
    { title: "Arduino", category: "tool", stage: "middle", tags: ["Hardware", "C++"], content: "全球最流行的开源硬件平台，学习C语言控制传感器和执行器。" },
    { title: "面包板", category: "tool", stage: "middle", tags: ["Electronics"], content: "无需焊接即可搭建电路的实验工具，电子制作必备。" },
    { title: "万用表", category: "tool", stage: "middle", tags: ["Electronics", "Tool"], content: "测量电压、电流、电阻的仪表，排查电路故障的神器。" },
    { title: "传感器", category: "concept", stage: "middle", tags: ["Hardware", "IoT"], content: "将物理量（光、热、声）转换为电信号的元件，如超声波测距、温湿度传感器。" },
    { title: "PWM", category: "concept", stage: "middle", tags: ["Electronics", "Control"], content: "脉冲宽度调制，用于控制LED亮度、电机转速等模拟量。" },

    // 物理与工程
    { title: "牛顿运动定律", category: "concept", stage: "middle", tags: ["Physics", "Dynamics"], content: "惯性定律、F=ma、作用力与反作用力，经典力学的基石。" },
    { title: "欧姆定律", category: "concept", stage: "middle", tags: ["Physics", "Electricity"], content: "I=U/R，理解电压、电流、电阻之间的定量关系。" },
    { title: "激光切割", category: "tool", stage: "middle", tags: ["Engineering", "Fabrication"], content: "利用高能激光束切割或雕刻材料（木板、亚克力），快速制造结构件。" },
    { title: "游标卡尺", category: "tool", stage: "middle", tags: ["Engineering", "Measurement"], content: "高精度长度测量工具，工程制图和加工必备。" },
    { title: "能量守恒", category: "concept", stage: "middle", tags: ["Physics"], content: "能量不会凭空产生或消失，只会从一种形式转化为另一种形式。" },

    // 数学与逻辑
    { title: "勾股定理", category: "concept", stage: "middle", tags: ["Math", "Geometry"], content: "直角三角形三边关系，a²+b²=c²，几何学的基石。" },
    { title: "函数", category: "concept", stage: "middle", tags: ["Math", "Analysis"], content: "描述变量之间依赖关系的数学模型，如一次函数、二次函数。" },
    { title: "概率", category: "concept", stage: "middle", tags: ["Math", "Statistics"], content: "描述事件发生可能性的数值，理解随机现象。" },
    { title: "逻辑门", category: "concept", stage: "middle", tags: ["CS", "Logic"], content: "与门、或门、非门，数字电路和计算机逻辑的基础。" },
    { title: "博弈论入门", category: "concept", stage: "middle", tags: ["Math", "Strategy"], content: "研究决策主体在相互影响作用下的决策和均衡问题，如囚徒困境。" },

    // 竞赛相关
    { title: "CSP-J/S", category: "course", stage: "middle", tags: ["Competition", "NOI"], content: "CCF非专业级软件能力认证，信息学奥赛的入门级和提高级。" },
    { title: "VEX 机器人", category: "course", stage: "middle", tags: ["Competition", "Robotics"], content: "全球规模最大的机器人竞赛之一，考验机械设计、编程和团队合作。" },
    { title: "FLL", category: "course", stage: "middle", tags: ["Competition", "LEGO"], content: "FIRST LEGO League，乐高机器人工程挑战赛。" },
    { title: "蓝桥杯", category: "course", stage: "middle", tags: ["Competition", "Coding"], content: "国内知名的IT类学科竞赛，涵盖Python、C++、单片机等。" },
    { title: "科技创新大赛", category: "course", stage: "middle", tags: ["Competition", "Innovation"], content: "青少年科技创新成果竞赛，鼓励发明创造和科学研究。" },

    // --- 高中阶段 (High) ---
    // 高级算法
    { title: "数据结构", category: "course", stage: "high", tags: ["CS", "NOI"], content: "栈、队列、链表、树、图等数据的组织方式，决定算法效率。" },
    { title: "动态规划", category: "concept", stage: "high", tags: ["Algorithm", "DP"], content: "通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法。" },
    { title: "图论", category: "concept", stage: "high", tags: ["Math", "CS"], content: "研究图（由节点和边组成）的数学理论，如最短路径、最小生成树。" },
    { title: "贪心算法", category: "concept", stage: "high", tags: ["Algorithm"], content: "在每一步选择中都采取在当前状态下最好或最优的选择。" },
    { title: "二分查找", category: "concept", stage: "high", tags: ["Algorithm"], content: "在有序数组中查找特定元素的搜索算法，效率极高。" },

    // 硬件与嵌入式
    { title: "Raspberry Pi", category: "tool", stage: "high", tags: ["Hardware", "Linux"], content: "树莓派，卡片式电脑，运行Linux系统，适合搭建服务器、AI终端。" },
    { title: "ESP32", category: "tool", stage: "high", tags: ["Hardware", "IoT"], content: "集成了Wi-Fi和蓝牙的双核MCU，物联网开发的利器。" },
    { title: "PCB 设计", category: "tool", stage: "high", tags: ["Engineering", "EDA"], content: "使用EasyEDA或KiCad设计印刷电路板，将面包板电路产品化。" },
    { title: "示波器", category: "tool", stage: "high", tags: ["Electronics", "Tool"], content: "观察电信号波形变化的仪器，分析高频信号和噪声。" },
    { title: "I2C/SPI/UART", category: "concept", stage: "high", tags: ["Embedded", "Protocol"], content: "常见的芯片间通信协议，连接传感器和控制器的桥梁。" },

    // 物理与数学建模
    { title: "微积分", category: "course", stage: "high", tags: ["Math", "Analysis"], content: "研究变化的数学，导数描述瞬时变化率，积分描述累积量。" },
    { title: "线性代数", category: "course", stage: "high", tags: ["Math", "AI"], content: "向量、矩阵、行列式，是计算机图形学和机器学习的数学基础。" },
    { title: "MATLAB", category: "tool", stage: "high", tags: ["Math", "Simulation"], content: "强大的数学计算和仿真软件，用于数据分析、信号处理。" },
    { title: "LaTeX", category: "tool", stage: "high", tags: ["Academic", "Writing"], content: "高质量排版系统，特别适合排版复杂的数学公式和科技论文。" },
    { title: "电磁感应", category: "concept", stage: "high", tags: ["Physics"], content: "法拉第发现的磁生电现象，发电机和变压器的原理。" },

    // 人工智能入门
    { title: "机器学习", category: "concept", stage: "high", tags: ["AI", "Data"], content: "让计算机从数据中学习规律，而不是显式编程。包括监督学习、无监督学习。" },
    { title: "OpenCV", category: "tool", stage: "high", tags: ["AI", "Vision"], content: "开源计算机视觉库，用于图像处理、人脸识别、物体检测。" },
    { title: "神经网络", category: "concept", stage: "high", tags: ["AI", "Biology"], content: "模仿人脑神经元连接的计算模型，深度学习的基础。" },
    { title: "Python Pandas", category: "tool", stage: "high", tags: ["Data Science"], content: "Python数据分析库，高效处理表格数据。" },
    { title: "Kaggle", category: "course", stage: "high", tags: ["AI", "Competition"], content: "全球最大的数据科学竞赛平台，提供真实数据集和实战项目。" },

    // 综合素养
    { title: "GitHub", category: "tool", stage: "high", tags: ["CS", "Git"], content: "全球最大的代码托管平台，学习版本控制和开源协作。" },
    { title: "ISEF", category: "course", stage: "high", tags: ["Competition", "Research"], content: "英特尔国际科学与工程大奖赛，全球最高等级的中学生科研竞赛。" },
    { title: "第一性原理", category: "concept", stage: "high", tags: ["Thinking"], content: "回归事物最基本的条件，将其拆分成要素进行解构分析。" },
    { title: "项目管理", category: "concept", stage: "high", tags: ["Management"], content: "甘特图、敏捷开发（Agile），规划和控制项目进度。" },
    { title: "专利申请", category: "concept", stage: "high", tags: ["Law", "Innovation"], content: "保护知识产权，撰写专利说明书和权利要求书。" },

    // --- 大学阶段 (University) ---
    // 计算机科学核心
    { title: "操作系统", category: "course", stage: "university", tags: ["CS", "Core"], content: "管理计算机硬件与软件资源的程序，理解进程、线程、内存管理。" },
    { title: "计算机网络", category: "course", stage: "university", tags: ["CS", "Core"], content: "TCP/IP协议栈，HTTP/HTTPS，理解互联网如何工作。" },
    { title: "编译原理", category: "course", stage: "university", tags: ["CS", "Core"], content: "代码如何被翻译成机器语言，词法分析、语法分析。" },
    { title: "分布式系统", category: "concept", stage: "university", tags: ["CS", "Cloud"], content: "多台计算机协同工作，解决单机无法处理的大规模计算问题。" },
    { title: "数据库原理", category: "course", stage: "university", tags: ["CS", "Data"], content: "SQL语言，关系型数据库（MySQL）与非关系型数据库（MongoDB）。" },

    // 人工智能深造
    { title: "深度学习", category: "course", stage: "university", tags: ["AI", "DL"], content: "Deep Learning，使用多层神经网络解决复杂问题，如AlphaGo。" },
    { title: "PyTorch", category: "tool", stage: "university", tags: ["AI", "Framework"], content: "Facebook推出的深度学习框架，动态图机制，学术界首选。" },
    { title: "TensorFlow", category: "tool", stage: "university", tags: ["AI", "Framework"], content: "Google推出的深度学习框架，工业界部署广泛。" },
    { title: "Transformer", category: "concept", stage: "university", tags: ["AI", "NLP"], content: "注意力机制模型，ChatGPT等大语言模型（LLM）的基石。" },
    { title: "强化学习", category: "concept", stage: "university", tags: ["AI", "RL"], content: "智能体通过与环境交互获得奖励来学习策略，如机器人控制。" },

    // 前沿科技
    { title: "量子计算", category: "concept", stage: "university", tags: ["Physics", "Future"], content: "利用量子叠加和纠缠进行计算，理论上破解RSA加密只需瞬间。" },
    { title: "脑机接口", category: "concept", stage: "university", tags: ["Bio", "Tech"], content: "BCI，大脑与外部设备的直接通信，如Neuralink。" },
    { title: "区块链", category: "concept", stage: "university", tags: ["Crypto", "Tech"], content: "去中心化的分布式账本技术，比特币和以太坊的底层技术。" },
    { title: "基因编辑", category: "concept", stage: "university", tags: ["Bio", "CRISPR"], content: "CRISPR-Cas9技术，像剪刀一样精准修改DNA序列。" },
    { title: "元宇宙", category: "concept", stage: "university", tags: ["VR/AR", "Future"], content: "虚拟现实与增强现实结合的沉浸式数字世界。" },

    // 工程与工具
    { title: "Docker", category: "tool", stage: "university", tags: ["DevOps"], content: "容器化技术，保证程序在任何环境中都能一致运行。" },
    { title: "Kubernetes", category: "tool", stage: "university", tags: ["DevOps"], content: "K8s，容器编排系统，管理大规模集群。" },
    { title: "ROS", category: "tool", stage: "university", tags: ["Robotics"], content: "机器人操作系统，提供驱动、算法和开发工具。" },
    { title: "FPGA", category: "tool", stage: "university", tags: ["Hardware", "Chip"], content: "现场可编程门阵列，硬件级别的编程，速度极快。" },
    { title: "SolidWorks", category: "tool", stage: "university", tags: ["Engineering", "CAD"], content: "专业的工业级三维CAD设计软件。" },

    // 科研与学术
    { title: "arXiv", category: "tool", stage: "university", tags: ["Research", "Paper"], content: "康奈尔大学运营的预印本网站，第一时间获取最新科研论文。" },
    { title: "SCI", category: "concept", stage: "university", tags: ["Research", "Index"], content: "科学引文索引，衡量学术期刊影响力的重要指标。" },
    { title: "同行评审", category: "concept", stage: "university", tags: ["Research"], content: "Peer Review，学术论文发表前的质量审查机制。" },
    { title: "Zotero", category: "tool", stage: "university", tags: ["Research", "Tool"], content: "开源文献管理工具，自动抓取引用信息。" },
    { title: "学术道德", category: "concept", stage: "university", tags: ["Research", "Ethics"], content: "抄袭、造假、篡改数据是科研红线。" },

    // 更多补充词条 (Filling up to ~100+ visible here, user asked for 200, I will add more condensed items)
    { title: "Linux", category: "tool", stage: "university", tags: ["OS"], content: "开源操作系统内核，服务器领域的霸主。" },
    { title: "Vim", category: "tool", stage: "university", tags: ["Editor"], content: "编辑器之神，高效的命令行文本编辑器。" },
    { title: "Git", category: "tool", stage: "high", tags: ["Version Control"], content: "分布式版本控制系统，Linus Torvalds开发。" },
    { title: "Unity", category: "tool", stage: "high", tags: ["Game", "3D"], content: "跨平台游戏引擎，C#脚本，开发王者荣耀等游戏。" },
    { title: "Unreal Engine", category: "tool", stage: "university", tags: ["Game", "3D"], content: "虚幻引擎，C++开发，画质顶级的游戏引擎。" },
    { title: "Blender", category: "tool", stage: "high", tags: ["Design", "3D"], content: "开源全能3D创作套件，建模、动画、渲染。" },
    { title: "Figma", category: "tool", stage: "high", tags: ["Design", "UI"], content: "在线协作界面设计工具，UI/UX设计师首选。" },
    { title: "Notion", category: "tool", stage: "high", tags: ["Productivity"], content: "All-in-one笔记软件，构建个人知识库。" },
    { title: "Obsidian", category: "tool", stage: "university", tags: ["Productivity"], content: "双向链接笔记，构建第二大脑。" },
    { title: "Markdown", category: "tool", stage: "middle", tags: ["Writing"], content: "轻量级标记语言，程序员写文档的标准。" },

    { title: "熵", category: "concept", stage: "university", tags: ["Physics", "Info"], content: "热力学第二定律，描述系统的混乱程度；信息论中描述信息量。" },
    { title: "薛定谔的猫", category: "concept", stage: "high", tags: ["Physics", "Quantum"], content: "量子叠加态的思想实验。" },
    { title: "图灵测试", category: "concept", stage: "high", tags: ["AI"], content: "判断机器是否具有人类智能的标准。" },
    { title: "摩尔定律", category: "concept", stage: "middle", tags: ["Tech"], content: "集成电路上的晶体管数量每18个月翻一番。" },
    { title: "奇点", category: "concept", stage: "university", tags: ["Future"], content: "人工智能超越人类智能的时间点。" },

    { title: "傅里叶变换", category: "concept", stage: "university", tags: ["Math"], content: "将时域信号转换为频域信号的数学工具。" },
    { title: "麦克斯韦方程组", category: "concept", stage: "university", tags: ["Physics"], content: "描述电磁场行为的四个方程，物理学最美的公式之一。" },
    { title: "欧拉公式", category: "concept", stage: "university", tags: ["Math"], content: "e^ix = cosx + isinx，上帝公式。" },
    { title: "黄金分割", category: "concept", stage: "middle", tags: ["Math", "Art"], content: "0.618，最具美感的比例。" },
    { title: "分形", category: "concept", stage: "high", tags: ["Math", "Art"], content: "自相似的几何结构，如曼德勃罗集。" },

    { title: "云计算", category: "concept", stage: "high", tags: ["Tech"], content: "通过互联网提供计算服务（服务器、存储、数据库）。" },
    { title: "大数据", category: "concept", stage: "high", tags: ["Tech"], content: "无法用常规软件处理的海量数据集合。" },
    { title: "物联网", category: "concept", stage: "middle", tags: ["IoT"], content: "Internet of Things，万物互联。" },
    { title: "5G", category: "concept", stage: "middle", tags: ["Tech"], content: "第五代移动通信技术，高速度、低延迟。" },
    { title: "边缘计算", category: "concept", stage: "university", tags: ["Tech"], content: "在靠近数据源头的地方进行计算，减少延迟。" },

    { title: "React", category: "tool", stage: "university", tags: ["Web"], content: "Facebook开源的前端框架，组件化开发。" },
    { title: "Vue", category: "tool", stage: "high", tags: ["Web"], content: "尤雨溪开发的渐进式前端框架，易学易用。" },
    { title: "Node.js", category: "tool", stage: "high", tags: ["Web"], content: "让JavaScript运行在服务端的环境。" },
    { title: "SQL", category: "tool", stage: "high", tags: ["Data"], content: "结构化查询语言，操作数据库的标准。" },
    { title: "JSON", category: "concept", stage: "middle", tags: ["Data"], content: "轻量级的数据交换格式。" },

    { title: "API", category: "concept", stage: "middle", tags: ["CS"], content: "应用程序接口，软件之间对话的桥梁。" },
    { title: "SDK", category: "concept", stage: "high", tags: ["CS"], content: "软件开发工具包。" },
    { title: "IDE", category: "concept", stage: "middle", tags: ["CS"], content: "集成开发环境，如VS Code, PyCharm。" },
    { title: "Bug", category: "concept", stage: "elementary", tags: ["CS"], content: "程序中的错误或漏洞。" },
    { title: "Debug", category: "concept", stage: "elementary", tags: ["CS"], content: "调试，找出并修复Bug的过程。" },

    { title: "开源", category: "concept", stage: "middle", tags: ["Culture"], content: "Open Source，源代码公开，允许自由使用和修改。" },
    { title: "黑客", category: "concept", stage: "middle", tags: ["Culture"], content: "Hacker，热衷于钻研技术、解决难题的人，不一定是坏人。" },
    { title: "极客", category: "concept", stage: "middle", tags: ["Culture"], content: "Geek，对特定领域（如科技、动漫）狂热的人。" },
    { title: "创客", category: "concept", stage: "middle", tags: ["Culture"], content: "Maker，将创意变为现实的人。" },
    { title: "STEAM", category: "concept", stage: "elementary", tags: ["Education"], content: "科学、技术、工程、艺术、数学的跨学科教育。" },

    // --- 补充词条 (Additional Entries) ---
    // 编程库与框架
    { title: "NumPy", category: "tool", stage: "university", tags: ["Python", "Data"], content: "Python科学计算的基础库，提供高性能的多维数组对象。" },
    { title: "Matplotlib", category: "tool", stage: "university", tags: ["Python", "Data"], content: "Python绘图库，可以生成各种静态、动态、交互式的图表。" },
    { title: "Scikit-learn", category: "tool", stage: "university", tags: ["AI", "ML"], content: "简单高效的数据挖掘和数据分析工具，基于NumPy, SciPy和matplotlib。" },
    { title: "Spring Boot", category: "tool", stage: "university", tags: ["Java", "Web"], content: "基于Spring框架的快速开发脚手架，简化了配置。" },
    { title: "Django", category: "tool", stage: "university", tags: ["Python", "Web"], content: "高层次的Python Web框架，鼓励快速开发和干净、实用的设计。" },
    { title: "Flask", category: "tool", stage: "high", tags: ["Python", "Web"], content: "轻量级的Web应用框架，核心简单，扩展丰富。" },
    { title: "Bootstrap", category: "tool", stage: "high", tags: ["Web", "UI"], content: "最流行的HTML、CSS和JS框架，用于开发响应式布局、移动设备优先的WEB项目。" },
    { title: "Tailwind CSS", category: "tool", stage: "high", tags: ["Web", "UI"], content: "一个功能类优先的CSS框架，通过组合原子类快速构建界面。" },
    { title: "jQuery", category: "tool", stage: "middle", tags: ["Web", "JS"], content: "经典的JavaScript库，简化了HTML文档遍历、事件处理、动画和Ajax交互。" },
    { title: "TypeScript", category: "tool", stage: "university", tags: ["Web", "JS"], content: "JavaScript的超集，添加了可选的静态类型，适合大型项目开发。" },

    // 硬件与传感器
    { title: "Jetson Nano", category: "tool", stage: "university", tags: ["Hardware", "AI"], content: "NVIDIA推出的AI开发套件，可以在边缘设备上运行现代AI工作负载。" },
    { title: "DHT11", category: "tool", stage: "middle", tags: ["Sensor", "IoT"], content: "常用的温湿度传感器，数字信号输出，价格低廉。" },
    { title: "MPU6050", category: "tool", stage: "high", tags: ["Sensor", "IoT"], content: "六轴运动处理组件，包含3轴陀螺仪和3轴加速度计。" },
    { title: "HC-SR04", category: "tool", stage: "middle", tags: ["Sensor", "IoT"], content: "超声波测距模块，常用于机器人避障。" },
    { title: "舵机", category: "tool", stage: "middle", tags: ["Hardware", "Robotics"], content: "可以精确控制转动角度的电机，广泛用于机器人关节。" },
    { title: "步进电机", category: "tool", stage: "high", tags: ["Hardware", "Robotics"], content: "将电脉冲信号转变为角位移的执行机构，用于3D打印机和CNC。" },
    { title: "继电器", category: "tool", stage: "middle", tags: ["Electronics"], content: "用小电流控制大电流的自动开关。" },
    { title: "二极管", category: "concept", stage: "middle", tags: ["Electronics"], content: "只允许电流单向通过的电子元件，LED就是发光二极管。" },
    { title: "三极管", category: "concept", stage: "high", tags: ["Electronics"], content: "具有电流放大作用的半导体元件，电子电路的核心。" },
    { title: "电容", category: "concept", stage: "middle", tags: ["Electronics"], content: "储存电荷的元件，具有隔直通交的特性。" },

    // 数学进阶
    { title: "矩阵乘法", category: "concept", stage: "high", tags: ["Math", "Linear Algebra"], content: "线性代数中的基本运算，在图形变换和神经网络中应用广泛。" },
    { title: "特征值", category: "concept", stage: "university", tags: ["Math", "Linear Algebra"], content: "描述线性变换特征的数值，用于主成分分析（PCA）。" },
    { title: "贝叶斯定理", category: "concept", stage: "university", tags: ["Math", "Prob"], content: "描述在已知一些条件下，某事件发生概率的定理，机器学习基础。" },
    { title: "正态分布", category: "concept", stage: "high", tags: ["Math", "Stats"], content: "高斯分布，自然界中最常见的概率分布，呈钟形曲线。" },
    { title: "复数", category: "concept", stage: "high", tags: ["Math"], content: "实数与虚数的和，解决了负数开方的问题，在电路分析中很重要。" },
    { title: "极限", category: "concept", stage: "high", tags: ["Math", "Calc"], content: "微积分的基础概念，描述函数在某一点附近的变化趋势。" },
    { title: "导数", category: "concept", stage: "high", tags: ["Math", "Calc"], content: "函数在某一点的切线斜率，表示瞬时变化率。" },
    { title: "积分", category: "concept", stage: "high", tags: ["Math", "Calc"], content: "求曲边梯形的面积，导数的逆运算。" },
    { title: "集合论", category: "concept", stage: "high", tags: ["Math", "Logic"], content: "现代数学的基础，研究集合的性质和运算。" },
    { title: "排列组合", category: "concept", stage: "high", tags: ["Math", "Prob"], content: "研究从给定个数的元素中取出指定个数的元素进行排序或组合的方法。" },

    // 物理深入
    { title: "热力学定律", category: "concept", stage: "high", tags: ["Physics"], content: "描述热量、功和能量之间转换关系的定律。" },
    { title: "相对论", category: "concept", stage: "university", tags: ["Physics", "Einstein"], content: "爱因斯坦提出的关于时空和引力的理论，分为狭义相对论和广义相对论。" },
    { title: "流体力学", category: "concept", stage: "university", tags: ["Physics", "Engineering"], content: "研究流体（液体和气体）的力学运动规律。" },
    { title: "伯努利原理", category: "concept", stage: "high", tags: ["Physics", "Fluid"], content: "流体速度越快，压强越小。飞机升力的来源之一。" },
    { title: "多普勒效应", category: "concept", stage: "high", tags: ["Physics", "Wave"], content: "波源和观察者相对运动时，接收到的频率发生变化的现象。" },
    { title: "光电效应", category: "concept", stage: "high", tags: ["Physics", "Quantum"], content: "光照射在金属表面上，使电子逸出的现象，证实了光的粒子性。" },
    { title: "半导体", category: "concept", stage: "high", tags: ["Physics", "Material"], content: "导电性能介于导体和绝缘体之间的材料，芯片的基础。" },
    { title: "超导", category: "concept", stage: "university", tags: ["Physics", "Material"], content: "某些材料在低温下电阻消失的现象。" },
    { title: "核裂变", category: "concept", stage: "high", tags: ["Physics", "Energy"], content: "重原子核分裂成两个或多个轻原子核，释放巨大能量。" },
    { title: "核聚变", category: "concept", stage: "high", tags: ["Physics", "Energy"], content: "轻原子核结合成重原子核，太阳能量的来源。" },

    // 化学与生物
    { title: "元素周期表", category: "concept", stage: "middle", tags: ["Chemistry"], content: "化学元素按原子序数排列的表格，揭示了元素性质的周期性规律。" },
    { title: "共价键", category: "concept", stage: "high", tags: ["Chemistry"], content: "原子间通过共用电子对形成的化学键。" },
    { title: "酸碱中和", category: "concept", stage: "middle", tags: ["Chemistry"], content: "酸和碱反应生成盐和水的化学反应。" },
    { title: "DNA复制", category: "concept", stage: "high", tags: ["Biology", "Gene"], content: "DNA分子以自身为模板合成两个相同DNA分子的过程。" },
    { title: "蛋白质合成", category: "concept", stage: "high", tags: ["Biology"], content: "细胞根据遗传信息合成蛋白质的过程，包括转录和翻译。" },
    { title: "细胞分裂", category: "concept", stage: "middle", tags: ["Biology"], content: "一个细胞分裂成两个细胞的过程，分为有丝分裂和减数分裂。" },
    { title: "生态系统", category: "concept", stage: "middle", tags: ["Biology", "Eco"], content: "生物群落与非生物环境构成的一个统一整体。" },
    { title: "进化论", category: "concept", stage: "middle", tags: ["Biology", "Darwin"], content: "达尔文提出的生物演化理论，物竞天择，适者生存。" },
    { title: "酶", category: "concept", stage: "high", tags: ["Biology", "Chem"], content: "生物催化剂，加速生物体内的化学反应。" },
    { title: "ATP", category: "concept", stage: "high", tags: ["Biology", "Energy"], content: "三磷酸腺苷，生物体内的直接能源物质。" },

    // 著名科学家与人物
    { title: "艾伦·图灵", category: "concept", stage: "high", tags: ["Figure", "CS"], content: "计算机科学之父，人工智能之父，提出了图灵机模型。" },
    { title: "冯·诺依曼", category: "concept", stage: "high", tags: ["Figure", "CS"], content: "现代计算机之父，提出了存储程序型计算机体系结构。" },
    { title: "爱因斯坦", category: "concept", stage: "middle", tags: ["Figure", "Physics"], content: "最伟大的物理学家之一，提出了相对论。" },
    { title: "牛顿", category: "concept", stage: "elementary", tags: ["Figure", "Physics"], content: "经典力学的奠基人，发现了万有引力定律。" },
    { title: "居里夫人", category: "concept", stage: "middle", tags: ["Figure", "Chem"], content: "发现了镭和钋，两次获得诺贝尔奖的女性科学家。" },
    { title: "达尔文", category: "concept", stage: "middle", tags: ["Figure", "Biology"], content: "提出了生物进化论，著有《物种起源》。" },
    { title: "特斯拉", category: "concept", stage: "high", tags: ["Figure", "Elec"], content: "交流电系统的发明者，被誉为“创造出二十世纪的人”。" },
    { title: "埃隆·马斯克", category: "concept", stage: "middle", tags: ["Figure", "Tech"], content: "SpaceX和Tesla创始人，致力于火星移民和电动汽车普及。" },
    { title: "袁隆平", category: "concept", stage: "elementary", tags: ["Figure", "Agri"], content: "杂交水稻之父，解决了数亿人的吃饭问题。" },
    { title: "钱学森", category: "concept", stage: "middle", tags: ["Figure", "Space"], content: "中国航天之父，空气动力学家。" },

    // 更多工具与软件
    { title: "VS Code", category: "tool", stage: "middle", tags: ["Editor", "MS"], content: "微软开发的免费开源代码编辑器，插件生态极其丰富。" },
    { title: "PyCharm", category: "tool", stage: "high", tags: ["IDE", "Python"], content: "JetBrains开发的Python IDE，智能代码补全功能强大。" },
    { title: "IntelliJ IDEA", category: "tool", stage: "university", tags: ["IDE", "Java"], content: "最好的Java开发工具之一。" },
    { title: "Eclipse", category: "tool", stage: "university", tags: ["IDE", "Java"], content: "老牌的开源集成开发环境。" },
    { title: "Android Studio", category: "tool", stage: "university", tags: ["IDE", "Mobile"], content: "Google官方的Android应用开发工具。" },
    { title: "Xcode", category: "tool", stage: "university", tags: ["IDE", "Apple"], content: "苹果公司开发的macOS和iOS应用开发工具。" },
    { title: "Postman", category: "tool", stage: "high", tags: ["Web", "API"], content: "API调试工具，用于发送HTTP请求和查看响应。" },
    { title: "Wireshark", category: "tool", stage: "university", tags: ["Network", "Security"], content: "网络封包分析软件，用于网络故障排查和安全审计。" },
    { title: "VMware", category: "tool", stage: "high", tags: ["Virtualization"], content: "虚拟机软件，可以在一台电脑上运行多个操作系统。" },
    { title: "VirtualBox", category: "tool", stage: "high", tags: ["Virtualization"], content: "开源免费的虚拟机软件。" },

    // 更多概念
    { title: "API网关", category: "concept", stage: "university", tags: ["CS", "Arch"], content: "系统的统一入口，处理请求路由、负载均衡、认证等。" },
    { title: "微服务", category: "concept", stage: "university", tags: ["CS", "Arch"], content: "将单一应用程序划分成一组小的服务，服务之间互相协调。" },
    { title: "DevOps", category: "concept", stage: "university", tags: ["CS", "Culture"], content: "开发（Development）和运维（Operations）的组合，强调协作和自动化。" },
    { title: "CI/CD", category: "concept", stage: "university", tags: ["CS", "DevOps"], content: "持续集成和持续交付/部署。" },
    { title: "敏捷开发", category: "concept", stage: "high", tags: ["CS", "Method"], content: "以用户需求进化为核心，采用迭代、循序渐进的方法进行软件开发。" },
    { title: "Scrum", category: "concept", stage: "high", tags: ["CS", "Method"], content: "一种敏捷开发框架，包含Sprint、Daily Standup等实践。" },
    { title: "看板", category: "concept", stage: "high", tags: ["CS", "Method"], content: "Kanban，可视化工作流管理方法。" },
    { title: "MVP", category: "concept", stage: "high", tags: ["Product"], content: "Minimum Viable Product，最小可行性产品。" },
    { title: "UI/UX", category: "concept", stage: "high", tags: ["Design"], content: "用户界面（User Interface）和用户体验（User Experience）。" },
    { title: "A/B测试", category: "concept", stage: "high", tags: ["Product", "Data"], content: "为同一个目标制定两个版本，让一部分用户使用A，另一部分使用B，看谁效果好。" },

    // 航天与天文
    { title: "黑洞", category: "concept", stage: "high", tags: ["Astro", "Physics"], content: "引力极大，连光都无法逃脱的天体。" },
    { title: "引力波", category: "concept", stage: "university", tags: ["Astro", "Physics"], content: "时空的涟漪，由大质量天体加速运动产生。" },
    { title: "哈勃望远镜", category: "tool", stage: "middle", tags: ["Astro", "Tool"], content: "运行在地球轨道上的光学望远镜，拍摄了许多宇宙深空照片。" },
    { title: "韦伯望远镜", category: "tool", stage: "high", tags: ["Astro", "Tool"], content: "JWST，史上最强大的红外太空望远镜。" },
    { title: "空间站", category: "concept", stage: "middle", tags: ["Space"], content: "长期在近地轨道运行，供宇航员居住和工作的航天器。" },
    { title: "火星车", category: "tool", stage: "middle", tags: ["Space", "Robot"], content: "在火星表面行驶并进行科学考察的移动探测机器人，如好奇号、毅力号。" },
    { title: "北斗系统", category: "concept", stage: "middle", tags: ["Space", "GPS"], content: "中国自主建设的卫星导航系统。" },
    { title: "逃逸速度", category: "concept", stage: "high", tags: ["Physics", "Space"], content: "物体摆脱天体引力束缚所需的最小速度。" },
    { title: "光年", category: "concept", stage: "elementary", tags: ["Astro", "Unit"], content: "光在真空中行走一年的距离，是长度单位，不是时间单位。" },
    { title: "宇宙大爆炸", category: "concept", stage: "middle", tags: ["Astro", "Origin"], content: "宇宙起源于约138亿年前的一个奇点。" }
];
