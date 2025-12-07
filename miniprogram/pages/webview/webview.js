Page({
    data: {
        url: ''
    },
    onLoad(options) {
        console.log('Webview onLoad, options:', options);
        if (options.url) {
            // Decode URL if it was encoded
            const url = decodeURIComponent(options.url);
            console.log('Decoded URL:', url);
            this.setData({ url });
        } else {
            console.error('No URL parameter provided');
            wx.showToast({
                title: 'URL参数缺失',
                icon: 'error'
            });
        }
    }
})
