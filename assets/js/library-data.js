/**
 * Neural Archive - Real World Content Data
 * 包含了真实的 Bilibili 嵌入链接和开源书籍在线阅读地址
 */

const libraryData = (function () {
    const data = [];

    // --- 📚 开源神书 (真实可读) ---
    const realBooks = [
        {
            id: 'rb_1', type: 'read', title: 'Hello 算法 (全动画版)',
            author: 'Krahets', category: '算法之巅', tags: ['动画', 'LeetCode'],
            difficulty: 'Beginner', rating: '9.9', year: '2023',
            description: '最适合新手的算法书，包含全方位的动画演示和代码一键运行。',
            thumbnail: 'https://www.hello-algo.com/assets/images/cover_light.png',
            url: 'https://www.hello-algo.com/', age_group: 'Primary'
        },
        {
            id: 'rb_2', type: 'read', title: '深入理解计算机系统 (CSAPP)',
            author: 'Randal E. Bryant', category: '核心内功', tags: ['底层', '操作系统'],
            difficulty: 'Legendary', rating: '9.8', year: '2015',
            description: '计算机科学不可逾越的圣经。从中译版 GitBook 接入。',
            thumbnail: 'https://m.media-amazon.com/images/I/61bIivLxnNL._SX379_BO1,204,203,200_.jpg',
            url: 'https://hansimov.gitbook.io/csapp/', age_group: 'University'
        },
        {
            id: 'rb_3', type: 'read', title: 'Rust 语言圣经',
            author: 'Course.rs', category: '前沿技术', tags: ['Rust', '底层开发'],
            difficulty: 'Advanced', rating: '9.7', year: '2024',
            description: '目前华语圈最好的 Rust 动态学习资源，涵盖从基础到异步开发。',
            thumbnail: 'https://course.rs/title.png',
            url: 'https://course.rs/', age_group: 'Secondary'
        },
        {
            id: 'rb_4', type: 'read', title: '动手学深度学习 (D2L)',
            author: '李沐', category: '人工智能', tags: ['AI', 'PyTorch'],
            difficulty: 'Advanced', rating: '9.6', year: '2023',
            description: '全球最流行的深度学习教科书之一，由李沐博士主讲。',
            thumbnail: 'https://zh.d2l.ai/_images/front.png',
            url: 'https://zh.d2l.ai/', age_group: 'University'
        },
        {
            id: 'rb_5', type: 'read', title: '计算机网络：自顶向下方法',
            author: 'Kurose/Ross', category: '核心内功', tags: ['网络', '协议'],
            difficulty: 'Intermediate', rating: '9.4', year: '2022',
            description: '经典的计网教材，从应用层开始理解互联网。',
            thumbnail: 'https://m.media-amazon.com/images/I/51r2X7z1uRL.jpg',
            url: 'https://gaia.cs.umass.edu/kurose_ross/', age_group: 'Secondary'
        }
    ];

    // --- 🎬 观影区 (真实可看 - B站 嵌入模式) ---
    // Note: bvid 对应 B站 的视频 ID
    const realMovies = [
        {
            id: 'rm_1', type: 'watch', title: '星际穿越 Interstellar',
            director: 'Christopher Nolan', category: '科幻巨制', tags: ['黑洞', '广义相对论'],
            difficulty: 'Intermediate', rating: '9.4', year: '2014',
            description: '物理学与情感的终极浪漫，由物理学家索恩担任科学顾问。',
            thumbnail: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_FMjpg_UX1000_.jpg',
            url: 'https://player.bilibili.com/player.html?bvid=BV1LK411K7d6&page=1', age_group: 'All'
        },
        {
            id: 'rm_2', type: 'watch', title: '谷歌纪录片：AlphaGo',
            director: 'Greg Kohs', category: 'AI 编年史', tags: ['神经网络', '围棋'],
            difficulty: 'Beginner', rating: '9.3', year: '2017',
            description: '记录了 AI 历史上最重要的里程碑：AlphaGo 对战李世石。',
            thumbnail: 'https://m.media-amazon.com/images/M/MV5BMjA0MDUwOTc0MV5BMl5BanBnXkFtZTgwNTI3MzY4MjI@._V1_.jpg',
            url: 'https://player.bilibili.com/player.html?bvid=BV1pW411j77u&page=1', age_group: 'All'
        },
        {
            id: 'rm_3', type: 'watch', title: '斯坦福 CS106A：编程方法学',
            director: 'Mehran Sahami', category: '大师公开课', tags: ['Java', 'CS基础'],
            difficulty: 'Beginner', rating: '9.9', year: '2008',
            description: '全球最好的计算机入门课，没有之一。跟着斯坦福名师开始你的编程之旅。',
            thumbnail: 'https://i.ytimg.com/vi/KkMDCCdjyW8/maxresdefault.jpg',
            url: 'https://player.bilibili.com/player.html?bvid=BV1Vt41197pP&page=1', age_group: 'Secondary'
        }
    ];

    data.push(...realBooks, ...realMovies);

    // --- 自动扩展示例 (带搜索路径) ---
    const topics = ['量子物理', '生物黑客', '机器人学', '区块链', '火星殖民', '古文明技术'];

    // 生成 500+ 本书
    for (let i = 1; i <= 515; i++) {
        const t = topics[i % topics.length];
        data.push({
            id: `gen_b_${i}`, type: 'read', title: `${t}深度研究报告 Vol.${i}`,
            author: 'Neural Admin', category: '研究档案', tags: [t, 'PDF'],
            difficulty: 'Advanced', rating: (8.0 + Math.random() * 2).toFixed(1),
            year: '2024', description: `关于${t}的深度研究，包含核心逻辑推导与实验数据。`,
            thumbnail: `https://picsum.photos/seed/b_${i}/300/400`,
            url: `https://www.google.com/search?q=${encodeURIComponent(t + ' PDF textbook')}`,
            age_group: 'Secondary'
        });
    }

    // 生成 200+ 电影
    for (let i = 1; i <= 205; i++) {
        const t = topics[i % topics.length];
        data.push({
            id: `gen_m_${i}`, type: 'watch', title: `${t}: 预见未来 2077`,
            director: 'Neural Cinema', category: '数字纪实', tags: [t, 'Sci-Fi'],
            difficulty: 'Intermediate', rating: (7.0 + Math.random() * 3).toFixed(1),
            year: '2023', description: `以 4K 超清视角展现了${t}可能带来的社会变革。`,
            thumbnail: `https://picsum.photos/seed/m_${i}/600/400`,
            url: `https://www.bilibili.com/search/video?keyword=${encodeURIComponent(t + ' 纪录片')}`,
            age_group: 'All'
        });
    }

    return data;
})();

if (typeof window !== 'undefined') {
    window.libraryData = libraryData;
}
