Page({
    data: {
        url: ''
    },
    onLoad(options) {
        if (options.url) {
            // Decode URL if it was encoded
            const url = decodeURIComponent(options.url);
            this.setData({ url });
        } else {
            wx.showToast({
                title: 'URL Empty',
                icon: 'error'
            });
        }
    }
})
