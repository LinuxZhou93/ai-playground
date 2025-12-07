const app = getApp()

const moduleData = {
    'math': {
        title: '数学基石',
        desc: '数学是宇宙的语言，也是所有科技的根基。本模块涵盖从基础代数到高等微积分的核心课程。',
        courses: [
            { name: '线性代数基础', tag: '必修', status: '进行中' },
            { name: '离散数学', tag: '进阶', status: '未开始' },
            { name: '微积分 I', tag: '核心', status: '未开始' }
        ]
    },
    'physics': {
        title: '物理法则',
        desc: '探索物质世界的运行规律，从经典力学到量子物理的奇妙旅程。',
        courses: [
            { name: '经典力学', tag: '必修', status: '已完成' },
            { name: '电磁学', tag: '核心', status: '进行中' },
            { name: '量子力学导论', tag: '高阶', status: '锁定' }
        ]
    },
    'cs': {
        title: '计算机科学',
        desc: '掌握数字化时代的创造力工具，编程、算法与系统架构。',
        courses: [
            { name: 'Python编程基础', tag: '入门', status: '已完成' },
            { name: '数据结构与算法', tag: '核心', status: '进行中' },
            { name: '计算机组成原理', tag: '进阶', status: '未开始' }
        ]
    },
    'ai': {
        title: '人工智能',
        desc: '赋予机器智慧，探索深度学习、神经网络与自然语言处理的前沿。',
        courses: [
            { name: '机器学习导论', tag: '热门', status: '进行中' },
            { name: '深度学习实践', tag: '进阶', status: '未开始' },
            { name: '计算机视觉', tag: '高阶', status: '锁定' }
        ]
    },
    // Default fallback
    'default': {
        title: '未知模块',
        desc: '该模块正在建设中...',
        courses: []
    }
}

Page({
    data: {
        id: '',
        info: {}
    },

    onLoad(options) {
        const id = options.id || 'math'
        const info = moduleData[id] || moduleData['default']

        this.setData({
            id,
            info
        })

        wx.setNavigationBarTitle({
            title: info.title
        })
    },

    onStartCourse(e) {
        const index = e.currentTarget.dataset.index
        wx.showToast({
            title: `开始课程: ${this.data.info.courses[index].name}`,
            icon: 'none'
        })
    }
})
