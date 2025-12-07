Page({
    data: {
        userInfo: {
            date: '2025-12-07',
            location: 'SHANGHAI_CN',
            server: 'ZHOU_SMP_2025',
            ping: '1ms'
        },
        stats: [
            { label: '自我管理', value: 85, color: '#22d3ee' },
            { label: '基础能力与思维', value: 78, color: '#94a3b8' },
            { label: '基础学科知识', value: 92, color: '#22d3ee' },
            { label: '全栈技能树', value: 65, color: '#22d3ee' }
        ],
        dockItems: [
            { id: 'blog', name: '教育日志', icon: '📝', page: '/pages/webview/webview?url=blog.html' },
            { id: 'map_train', name: '培养图谱', icon: '🗺️', page: '/pages/webview/webview?url=post-4.html' },
            { id: 'map_course', name: '课程地图', icon: '🧭', page: '/pages/webview/webview?url=post-6.html' },
            { id: 'map_comp', name: '竞赛地图', icon: '🏆', page: '/pages/webview/webview?url=competition-atlas.html' },
            { id: 'cog_sys', name: '认知系统', icon: '🧠', page: '/pages/webview/webview?url=post-5.html' },
            { id: 'synergy', name: '学科协同', icon: '🧬', page: '/pages/galaxy/galaxy' },
            { id: 'games', name: '玩中学', icon: '🎮', page: '/pages/webview/webview?url=games.html' },
            { id: 'wiki', name: '知识库', icon: '📖', page: '/pages/webview/webview?url=wiki.html' },
            { id: 'library', name: '读书观影', icon: '📚', page: '/pages/webview/webview?url=library.html' },
            { id: 'forum', name: '论坛', icon: '💬', page: '/pages/webview/webview?url=forum.html' },
            { id: 'coding', name: '编程', icon: '🎨', page: '/pages/coding/coding' },
            { id: 'drone', name: '无人机', icon: '🚁', page: '/pages/webview/webview?url=drone.html' },
            { id: 'labs', name: '实验', icon: '⚗️', page: '/pages/webview/webview?url=labs.html' },
            { id: '3dprint', name: '3D打印', icon: '🖨️', page: '/pages/webview/webview?url=3d-print.html' },
            { id: 'learn', name: '学习', icon: '🚀', page: '/pages/webview/webview?url=learn.html' },
            { id: 'circuits', name: '电子电路', icon: '🔌', page: '/pages/webview/webview?url=circuits.html' },
            { id: 'ai', name: '人工智能', icon: '🧠', page: '/pages/webview/webview?url=ai.html' },
            { id: 'mine', name: '登录/注册', icon: '👤', page: '/pages/mine/mine' },
            { id: 'world', name: '我的世界', icon: '⛏️', page: '/pages/webview/webview?url=minecraft.html' },
            { id: 'contact', name: '联系我们', icon: '✉️', page: '/pages/webview/webview?url=contact.html' }
        ]
    },

    onDockItemTap(e) {
        const item = e.currentTarget.dataset.item;
        if (item.page) {
            wx.navigateTo({
                url: item.page,
                fail: (err) => {
                    console.error('Navigation failed', err);
                    wx.showToast({ title: '敬请期待', icon: 'none' });
                }
            });
        }
    }
})
