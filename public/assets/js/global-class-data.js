/**
 * TITAN GLOBAL LEARNING HUB - DATABASE V3.5 (Unified Data)
 */

const courseCategories = [
    { id: 'all', name: '全部课程', icon: 'grid' },
    { id: 'science', name: '自然科学', icon: 'flask-conical' },
    { id: 'tech', name: '通用技术', icon: 'cpu' },
    { id: 'art', name: '视觉艺术', icon: 'palette' },
    { id: 'humanities', name: '人文社科', icon: 'library' },
    { id: 'business', name: '商业管理', icon: 'trending-up' },
    { id: 'math', name: '数学逻辑', icon: 'function' },
    { id: 'programming', name: '计算机编程', icon: 'code' },
    { id: 'ai', name: '人工智能', icon: 'zap' },
    { id: 'history', name: '历史文化', icon: 'pillar' }
];

const catColors = {
    'all': '#3b82f6', 'science': '#ef4444', 'tech': '#22c55e', 'art': '#a855f7',
    'humanities': '#f97316', 'business': '#eab308', 'math': '#6366f1',
    'programming': '#0ea5e9', 'ai': '#c026d3', 'history': '#dc2626',
    'default': '#1e293b'
};

const globalResources = [
    {
        id: 'cs-001',
        title: 'Python 网络爬虫与信息提取',
        provider: 'Bilibili / 北京理工大学',
        category: 'programming',
        tags: ['Python', '数据分析'],
        difficulty: 'Medium',
        rating: 4.9,
        link: 'https://www.bilibili.com/video/BV1zs411o7Gv',
        img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
        desc: '嵩天教授经典之作，国内学习Python爬虫的首选课程。'
    },
    {
        id: 'hum-001',
        title: '罗翔说刑法（精选集）',
        provider: 'Bilibili / 厚大法考',
        category: 'humanities',
        tags: ['法律', '哲学'],
        difficulty: 'Easy',
        rating: 5.0,
        link: 'https://www.bilibili.com/video/BV1pE411R7uG',
        img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
        desc: '不只是法律，更是关于正义、良知与人性的哲学启蒙。'
    }
];

const generateRobustDataset = () => {
    const mockList = [];
    const providers = ['Bilibili', '学堂在线', '中国大学MOOC', '网易公开课', '清华大学', '北京大学'];
    const catsArr = courseCategories.filter(c => c.id !== 'all').map(c => c.id);

    for (let i = 1; i <= 1000; i++) {
        const cat = catsArr[i % catsArr.length];
        const safeImg = `https://picsum.photos/seed/${i + 888}/600/400`;

        mockList.push({
            id: `course-gen-${i}`,
            title: `[深度专栏] 探索 ${cat.toUpperCase()} 领域的未来视野 No.${i}`,
            provider: providers[i % providers.length],
            category: cat,
            tags: ['精品精编', '公开课'],
            difficulty: i % 3 === 0 ? 'Easy' : (i % 3 === 1 ? 'Medium' : 'Hard'),
            rating: (4.4 + (Math.random() * 0.6)).toFixed(1),
            link: 'https://www.bilibili.com',
            img: safeImg,
            desc: `模块化的 No.${i} 教学案例。这门课将复杂理论拆解为简单易懂的步骤，非常适合青少年自主探索。`
        });
    }
    return mockList;
};

const fullCourseDatabase = [...globalResources, ...generateRobustDataset()];
