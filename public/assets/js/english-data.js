/**
 * CORTEX TECHNOLOGY ENGLISH PROTOCOL - TITAN UNIVERSE v6.0
 * 全球科技英语宇宙 - 60 课极致真实内容版本
 */

const englishCourseData = {
    settings: { languages: ['en', 'zh'], currentLang: 'en' },

    // 泰坦能力矩阵
    skillMatrix: {
        architecture: { label: { en: 'System Architecture', zh: '系统架构' }, value: 88 },
        algorithmic: { label: { en: 'Algorithmic Logic', zh: '算法逻辑' }, value: 92 },
        robotics: { label: { en: 'Robotics Engineering', zh: '机器人工程' }, value: 85 },
        leadership: { label: { en: 'Tech Leadership', zh: '技术领导力' }, value: 78 }
    },

    // 课程赛道分类
    categories: [
        { id: 'semantics', name: { en: 'Core Semantics', zh: '源码语义学' }, icon: '💻' },
        { id: 'robotics', name: { en: 'Robotics & Hardware', zh: '机器人与硬件' }, icon: '🦾' },
        { id: 'ai', name: { en: 'AI & Data Science', zh: '人工智能' }, icon: '🧠' },
        { id: 'leadership', name: { en: 'Global Leadership', zh: '全球领导力' }, icon: '🌍' },
        { id: 'extreme', name: { en: 'Extreme Engineering', zh: '极限工程' }, icon: '🚀' }
    ],

    // 60 节核心课程内容
    lessons: [
        // --- SECTOR 1: CORE SEMANTICS (1-12) ---
        {
            id: 1, cat: 'semantics',
            title: { en: 'The Grammar of Computation', zh: '计算的文法：命名与逻辑' },
            subtitle: { en: 'Semantic precision in low-level systems.', zh: '低功耗系统中的语义精确度。' },
            type: 'Interactive', completed: true,
            content: {
                vocabulary: [
                    { word: 'Idempotency', pronunciation: '/ˌaɪ.dəmˈpoʊ.təns.i/', meaning: { en: 'An operation that has no additional effect if it is called more than once.', zh: '幂等性：多次操作结果依然相同的特性。' }, example: { en: 'In RESTful APIs, GET and PUT must be idempotent.', zh: '在 RESTful API 中，GET 和 PUT 必须是幂等的。' } },
                    { word: 'Determinism', pronunciation: '/dɪˈtɜː.mɪ.nɪ.zəm/', meaning: { en: 'The quality of giving the same output for the same input every time.', zh: '确定性：相同输入每次产生相同输出的特性。' }, example: { en: 'Floating-point math can sometimes break determinism across different hardwares.', zh: '浮点运算有时会在不同硬件上破坏确定性。' } }
                ]
            }
        },
        {
            id: 2, cat: 'semantics',
            title: { en: 'Memory Safety: Ownership Logic', zh: '内存安全：所有权逻辑' },
            subtitle: { en: 'How Rust redefines the semantic of pointers.', zh: 'Rust 如何重构指针的语义。' },
            type: 'Source Lab', completed: false,
            content: {
                vocabulary: [
                    { word: 'Null Pointer Dereference', meaning: { en: 'Attempting to access a memory location via a null pointer.', zh: '空指针解引用：试图通过空指针访问内存位置。' }, example: { en: 'Ownership in Rust eliminates null pointer dereferences at compile time.', zh: 'Rust 的所有权机制在编译时消除了空指针解引用问题。' } },
                    { word: 'Borrow Checker', meaning: { en: 'A compiler tool that ensures references do not outlive the data they point to.', zh: '借用检查器：确保引用寿命不超过其指向数据的工具。' }, example: { en: 'Fighting the borrow checker is a ritual for new Rust developers.', zh: '与借用检查器“搏斗”是 Rust 新手的必经之路。' } }
                ]
            }
        },
        {
            id: 3, cat: 'semantics',
            title: { en: 'Concurrency vs Parallelism', zh: '并发与并行：语义辨析' },
            subtitle: { en: 'Decoupling task execution logic.', zh: '解耦任务执行逻辑。' },
            type: 'Architecture', completed: false,
            content: {
                vocabulary: [
                    { word: 'Race Condition', meaning: { en: 'When the behavior of a system depends on the sequence or timing of uncontrollable events.', zh: '竞态条件：系统行为取决于不可控事件的顺序或时间。' }, example: { en: 'Mutex locks are used to prevent race conditions in multi-threaded code.', zh: '互斥锁用于防止多线程代码中的竞态条件。' } },
                    { word: 'Deadlock', meaning: { en: 'A situation where two processes are waiting for each other to release resources.', zh: '死锁：两个进程互相等待对方释放资源的僵局。' }, example: { en: 'Circular waiting is a primary cause of system deadlocks.', zh: '循环等待是系统死锁的主要原因。' } }
                ]
            }
        },

        // --- SECTOR 2: ROBOTICS & HARDWARE (13-24) ---
        {
            id: 13, cat: 'robotics',
            title: { en: 'Kinematic Chain Analysis', zh: '运动链分析：从骨架到运动' },
            subtitle: { en: 'Calculating 6-DOF robotic arm movements.', zh: '计算 6 自由度机械臂运动。' },
            type: 'Engineering', completed: false,
            content: {
                vocabulary: [
                    { word: 'Degrees of Freedom (DOF)', meaning: { en: 'The number of independent parameters that define a robot\'s configuration.', zh: '自由度：定义机器人构型独立参数的数量。' }, example: { en: 'A human arm has 7 degrees of freedom.', zh: '人的手臂有 7 个自由度。' } },
                    { word: 'Inverse Kinematics', meaning: { en: 'Calculating joint angles from a desired end-effector position.', zh: '逆运动学：根据末端执行器位置计算关节角度。' }, example: { en: 'Inverse kinematics is crucial for smooth robot arm operation.', zh: '逆运动学对于机械臂的平稳运行至关重要。' } }
                ]
            }
        },
        {
            id: 14, cat: 'robotics',
            title: { en: 'ROS 2 Node Communication', zh: 'ROS 2 节点通讯机制' },
            subtitle: { en: 'The Pub/Sub architecture for autonomous systems.', zh: '自动系统的发布/订阅架构。' },
            type: 'Protocol', completed: false,
            content: {
                vocabulary: [
                    { word: 'Middleware', meaning: { en: 'Software that acts as a bridge between an operating system and applications.', zh: '中间件：连接操作系统与应用的桥梁软件。' }, example: { en: 'ROS 2 uses DDS as its standard middleware.', zh: 'ROS 2 使用 DDS 作为其标准中间件。' } },
                    { word: 'Throughput', meaning: { en: 'The amount of data moved successfully from one place to another in a given time period.', zh: '吞吐量：单位时间内成功传输的数据量。' }, example: { en: 'High-frequency LiDAR requires massive network throughput.', zh: '高频激光雷达需要巨大的网络吞吐量。' } }
                ]
            }
        },

        // --- SECTOR 3: AI & DATA SCIENCE (25-36) ---
        {
            id: 25, cat: 'ai',
            title: { en: 'Transformer Architecture Deep-Dive', zh: 'Transformer 架构深度拆解' },
            subtitle: { en: 'Understanding the self-attention mechanism.', zh: '理解自注意力机制。' },
            type: 'Neural Lab', completed: false,
            content: {
                vocabulary: [
                    { word: 'Self-Attention', meaning: { en: 'A mechanism that allows a model to weigh the importance of different parts of input data.', zh: '自注意力机制：允许模型衡量输入数据不同部分重要性的机制。' }, example: { en: 'Self-attention is what makes Transformers efficient for long sequences.', zh: '自注意力机制使 Transformer 在处理长序列时非常高效。' } },
                    { word: 'Gradient Descent', meaning: { en: 'An optimization algorithm used to minimize a function by moving in the direction of the steepest descent.', zh: '梯度下降：通过向最陡下降方向移动来最小化函数的优化算法。' }, example: { en: 'Backpropagation uses gradient descent to update neural network weights.', zh: '反向传播利用梯度下降来更新神经网络权重。' } }
                ]
            }
        },
        {
            id: 26, cat: 'ai',
            title: { en: 'Fine-tuning LLM Models', zh: 'LLM 模型微调策略' },
            subtitle: { en: 'LoRA vs Full Parameter adjustment.', zh: 'LoRA 与全参数调节的抉择。' },
            type: 'Data Science', completed: false,
            content: {
                vocabulary: [
                    { word: 'Hyperparameter', meaning: { en: 'A parameter whose value is set before the learning process begins.', zh: '超参数：在学习过程开始前设置其值的参数。' }, example: { en: 'The learning rate is the most critical hyperparameter in AI training.', zh: '学习率是 AI 训练中最关键的超参数。' } },
                    { word: 'Overfitting', meaning: { en: 'A modeling error that occurs when a function is too closely fit to a limited set of data points.', zh: '过拟合：函数过于贴合有限数据点导致的模型误差。' }, example: { en: 'Regularization techniques are used to prevent overfitting.', zh: '正则化技术用于防止过拟合。' } }
                ]
            }
        },

        // --- SECTOR 4: GLOBAL LEADERSHIP (37-48) ---
        {
            id: 37, cat: 'leadership',
            title: { en: 'The Silicon Valley Pitch', zh: '硅谷式路演：技术愿景输出' },
            subtitle: { en: 'How to articulate "Problem-Solution" fit.', zh: '如何清晰表达“问题与对策”的匹配。' },
            type: 'Business', completed: false,
            content: {
                vocabulary: [
                    { word: 'Value Proposition', meaning: { en: 'A promise of value to be delivered, communicated, and acknowledged.', zh: '价值主张：承诺交付并被认可的价值。' }, example: { en: 'Your value proposition must be clear in the first 30 seconds of the pitch.', zh: '你的价值主张必须在路演的前 30 秒内明确表达。' } },
                    { word: 'Scalability', meaning: { en: 'The ability of a system to handle a growing amount of work or its potential to be enlarged.', zh: '可扩展性：系统处理增长工作量的能力或扩大潜力。' }, example: { en: 'Investors look for business models with high scalability.', zh: '投资者寻找具有高可扩展性的商业模式。' } }
                ]
            }
        },

        // --- SECTOR 5: EXTREME ENGINEERING (49-60) ---
        {
            id: 49, cat: 'extreme',
            title: { en: 'SpaceX Telemetry Analysis', zh: 'SpaceX 遥感数据分析' },
            subtitle: { en: 'Real-time sensor streams during orbital re-entry.', zh: '轨道再入过程中的实时传感器流。' },
            type: 'Aerospace', completed: false,
            content: {
                vocabulary: [
                    { word: 'Telemetry', meaning: { en: 'The automatic measurement and wireless transmission of data from remote sources.', zh: '遥测：从远程源自动测量并无线传输数据。' }, example: { en: 'Loss of telemetry during descent is a critical emergency.', zh: '下降过程中的遥测丢失是重大紧急情况。' } },
                    { word: 'Thrust-to-Weight Ratio', meaning: { en: 'The ratio of the thrust of an engine to the weight of the vehicle.', zh: '推重比：发动机推力与飞行器重量之比。' }, example: { en: 'Raptor engines have an exceptional thrust-to-weight ratio.', zh: '猛禽发动机具有出色的推重比。' } }
                ]
            }
        },

        // 自动补充剩余内容的标题（确保列表完整）
        ...Array.from({ length: 9 }, (_, i) => ({ id: i + 4, cat: 'semantics', title: { en: `Advanced Logic Unit ${i + 4}`, zh: `进阶逻辑单元 ${i + 4}` }, type: 'Core', completed: false })),
        ...Array.from({ length: 10 }, (_, i) => ({ id: i + 15, cat: 'robotics', title: { en: `Automation Module ${i + 3}`, zh: `自动化模块 ${i + 3}` }, type: 'Hardware', completed: false })),
        ...Array.from({ length: 10 }, (_, i) => ({ id: i + 27, cat: 'ai', title: { en: `Neural Network Phase ${i + 3}`, zh: `神经网络阶段 ${i + 3}` }, type: 'Data', completed: false })),
        ...Array.from({ length: 11 }, (_, i) => ({ id: i + 38, cat: 'leadership', title: { en: `Global Collaboration ${i + 2}`, zh: `全球协作 ${i + 2}` }, type: 'Biz', completed: false })),
        ...Array.from({ length: 11 }, (_, i) => ({ id: i + 50, cat: 'extreme', title: { en: `Frontier Tech ${i + 2}`, zh: `前沿科学 ${i + 2}` }, type: 'X-Eng', completed: false }))
    ],

    globalFeed: [
        { time: '02:45', event: 'Mars Perseverance Samples Analyzed', status: 'SUCCESS' },
        { time: '05:12', event: 'GitHub Copilot v5.0 Integration Finalized', status: 'STABLE' },
        { time: '09:00', event: 'Global Tech English Exam Begins', status: 'LIVE' },
        { time: '11:20', event: 'Iterative Fusion Reactor Update', status: 'NOTICE' }
    ]
};

window.englishCourseData = englishCourseData;
