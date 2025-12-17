// AI课程专属数据
// 在course-ai.html的loadMockData函数中添加新的courseId条件

// 在 course.value.title = '恐龙复活...' 前面添加：

else if (courseId == '106') {
    course.value.title = 'AI先锋：从零到智能系统';
    course.value.description = '全面掌握人工智能核心技术，从机器学习基础到深度神经网络实战。';
    data.lessons = [
        {
            id: 1,
            title: '第一课：AI的过去、现在与未来',
            type: 'video',
            duration_seconds: 900,
            completed: false,
            content_url: 'https://www.bilibili.com/video/BV1LKcceQEYM' // 占位视频
        },
        {
            id: 2,
            title: '第二课：机器学习基础概念',
            type: 'reading',
            completed: false,
            content: '## 什么是机器学习

Machine Learning(ML) 是人工智能的核心分支...

### 监督学习 vs 无监督学习
- ** 监督学习 **: 有标签数据训练
        - ** 无监督学习 **: 从未标记数据中发现模式
        - ** 强化学习 **: 通过奖励机制学习策略'
        },
{
    id: 3,
        title: '第三课：神经网络入门',
            type: 'video',
                duration_seconds: 1200,
                    completed: false,
                        content_url: 'https://www.bilibili.com/video/BV13W411j7rA'
},
{
    id: 4,
        title: '第四课：Python 与 NumPy 实战',
            type: 'video',
                duration_seconds: 1500,
                    completed: false,
                        content_url: 'https://www.bilibili.com/video/BV1ks411H7y7'
},
{
    id: 5,
        title: '第五课：深度学习框架：PyTorch vs TensorFlow',
            type: 'reading',
                content: '## 主流深度学习框架对比

### PyTorch
Facebook 开发，动态计算图，研究友好...

### TensorFlow  
Google 开发，生产部署优势...'
},
{
    id: 6,
        title: '第六课：卷积神经网络 (CNN)',
            type: 'video',
                duration_seconds: 1400,
                    completed: false,
                        content_url: 'https://www.bilibili.com/video/BV1LKcceQEYM'
},
{
    id: 7,
        title: '第七课：项目实战：图像分类器',
            type: 'video',
                duration_seconds: 1800,
                    completed: false,
                        content_url: 'https://www.bilibili.com/video/BV13W411j7rA'
},
{
    id: 8,
        title: '第八课：[考核] AI工程师认证测试',
            type: 'quiz',
                content: {
        questions: [
            {
                id: 1,
                text: "神经网络的基本单元是？",
                options: ["神经元(Neuron)", "卷积层", "池化层", "激活函数"],
                correctIndex: 0
            },
            {
                id: 2,
                text: "以下哪个不是常用的激活函数？",
                options: ["ReLU", "Sigmoid", "Tanh", "Dropout"],
                correctIndex: 3
            },
            {
                id: 3,
                text: "CNN主要用于处理什么类型的数据？",
                options: ["文本数据", "图像数据", "时间序列", "音频信号"],
                correctIndex: 1
            },
            {
                id: 4,
                text: "反向传播算法的主要作用是？",
                options: ["数据增强", "特征提取", "梯度计算", "模型部署"],
                correctIndex: 2
            }
        ]
    }
}
    ];
}
