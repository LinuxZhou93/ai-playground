/**
 * TITAN FINTECH LAB - COMPREHENSIVE CURRICULUM DATA v1.0
 * Deciphering the algorithms of wealth for the next generation.
 */

const fintechCourseData = {
    settings: {
        theme: 'gold-fusion',
        accentColor: '#fbbf24'
    },

    tracks: [
        {
            id: 'economics-basics',
            title: '少年经济学底层逻辑',
            icon: '🏛️',
            tag: 'Foundation',
            desc: '理解稀缺性、复利与游戏化博弈，建立伴随一生的商业洞察力。',
            lessons: [
                {
                    id: 'eco-01',
                    title: '稀缺性：为什么钻石比水贵？',
                    type: 'reading',
                    content: `
                        ### 经济学的起点：稀缺性 (Scarcity)
                        如果任何东西都是无限的，就没有任何东西有价值。
                        - **需求 (Demand)**: 你有多想要这个东西？
                        - **供给 (Supply)**: 这个世界上有多少这个东西？
                        
                        **游戏化案例：**
                        想象在一款游戏里，所有人都有“屠龙宝刀”，那它还能卖出高价吗？
                    `
                },
                {
                    id: 'eco-02',
                    title: '复利：世界第八大奇迹',
                    type: 'interactive',
                    desc: '通过简单的百分比计算，理解金钱是如何随着时间自我生长的。',
                    tasks: ['计算 1.01 的 365 次方 vs 0.99 的 365 次方', '理解利滚利的惊人逻辑']
                }
            ]
        },
        {
            id: 'blockchain-tech',
            title: '区块链与共识契约',
            icon: '⛓️',
            tag: 'Web 3.0',
            desc: '从比特币到智能合约。学习分布式的力量，它是如何改变全球信任体系的。',
            lessons: [
                {
                    id: 'blk-01',
                    title: '什么是区块链？（乐高模拟版）',
                    type: 'video',
                    url: 'https://player.bilibili.com/player.html?bvid=BV1os411r7Pz',
                    desc: '用最通俗易懂的视觉动画，拆解“去中心化”的运行机制。'
                },
                {
                    id: 'blk-02',
                    title: 'NFT：拥有数字艺术的权利',
                    type: 'reading',
                    content: `
                        ### 从“复制”到“唯一”
                        在互联网时代，图片可以被无限次 CTRL+C，但 NFT 通过区块链为数字内容打上了“身份证”。
                        - **非同质化 (Non-Fungible)**: 每一份都是独一无二的。
                        - **智能合约 (Smart Contracts)**: 自动执行的数字契约。
                    `
                }
            ]
        },
        {
            id: 'algo-finance',
            title: '算法金融与大数据',
            icon: '📊',
            tag: 'Algorithm',
            desc: '当数学模型接管买卖盘。学习量化交易的基础知识与 AI 反欺诈逻辑。',
            lessons: [
                {
                    id: 'alg-01',
                    title: '量化交易初探：数学接管市场',
                    type: 'reading',
                    content: `
                        ### 算法是如何赚到钱的？
                        1. **识别模式**: 寻找价格波动的历史规律。
                        2. **高速执行**: 在微秒级别完成买卖，比人类手动快 1000 倍。
                        3. **风险控制**: 设定止损逻辑（Stop Loss）。
                    `
                },
                {
                    id: 'alg-02',
                    title: 'AI 反欺诈：谁在动我的钱包？',
                    type: 'video',
                    url: 'https://player.bilibili.com/player.html?bvid=BV1v4411v7S4',
                    desc: '了解支付平台如何利用机器学习，在 0.1 秒内识别出盗刷行为。'
                }
            ]
        },
        {
            id: 'future-payment',
            title: '未来支付与数字货币',
            icon: '📱',
            tag: 'Future Money',
            desc: '从法定货币到 CBDC。探索纸币消失后的世界，以及数字钱包的安全性。',
            lessons: [
                {
                    id: 'pay-01',
                    title: '无感支付：技术背后的逻辑',
                    type: 'reading',
                    desc: '解析 NFC、人脸识别支付以及数字人民币 (e-CNY) 的原理。'
                }
            ]
        }
    ]
};

window.fintechCourseData = fintechCourseData;
