Page({
    data: {
        ides: [
            { id: 'scratch', name: 'Scratch 3.0', desc: 'Visual Coding', color: '#855CD6', icon: 'S' },
            { id: 'jr', name: 'ScratchJr', desc: 'For Kids 5-7y', color: '#FFAB19', icon: 'Jr' },
            { id: 'python', name: 'Python', desc: 'AI & Data', color: '#306998', icon: '🐍' },
            { id: 'js', name: 'JavaScript', desc: 'Web Interactive', color: '#F7DF1E', icon: 'JS' },
            { id: 'cpp', name: 'C++', desc: 'System Core', color: '#00599C', icon: 'C++' },
            { id: 'arduino', name: 'Arduino', desc: 'Maker Basics', color: '#00979D', icon: '∞' }
        ]
    },
    onTapItem(e) {
        const id = e.currentTarget.dataset.id
        wx.showModal({
            title: '即将打开 IDE',
            content: `由于小程序限制，真实 IDE 需要在 Webview 中加载。此处演示点击响应：${id}`,
            showCancel: false
        })
        // Real implementation: wx.navigateTo({ url: `/pages/webview/webview?url=...` })
    }
})
