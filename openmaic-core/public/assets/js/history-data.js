const HISTORY_DATA = {
    eras: [
        {
            id: 'cognitive',
            title: { en: 'Cognitive Revolution', zh: '认知革命' },
            period: { en: '70,000 Years Ago', zh: '7万年前' },
            description: {
                en: 'Sapiens acquired the ability to talk about things that do not exist, allowing for cooperation in large groups.',
                zh: '智人出现了新的思维方式，能够谈论并不真实存在的事物。这让成千上万的陌生人能够为了共同的虚构故事（如神灵、国家、金钱）而协作。'
            },
            icon: '🧠',
            color: '#fbbf24',
            keyPoints: [
                { title: { en: 'Fiction', zh: '虚构故事' }, desc: { en: 'Shared myths created social glue.', zh: '共同的虚构神话成为社会的粘合剂。' } },
                { title: { en: 'Gossip', zh: '八卦理论' }, desc: { en: 'Language developed for social bonding.', zh: '语言的发展最初是为了交流社会关系。' } }
            ]
        },
        {
            id: 'agricultural',
            title: { en: 'Agricultural Revolution', zh: '农业革命' },
            period: { en: '12,000 Years Ago', zh: '1.2万年前' },
            description: {
                en: 'Humans transitioned from hunter-gatherers to farmers, a change Harari calls "History\'s Biggest Fraud".',
                zh: '人类从采集者转变为农夫。由于有了稳定的粮食保障，人口激增，但也导致了精英阶层的崛起和繁重的工作，哈拉里称之为“史上最大的骗局”。'
            },
            icon: '🌾',
            color: '#f87171',
            keyPoints: [
                { title: { en: 'Domestication', zh: '小麦驯化' }, desc: { en: 'Wheat domesticated humans, not vice versa.', zh: '不是人类驯化了小麦，是从小麦的角度说，它驯化了人类。' } },
                { title: { en: 'Property', zh: '私有财产' }, desc: { en: 'Settled life gave birth to ownership.', zh: '定居生活催生了领土观念和私有制。' } }
            ]
        },
        {
            id: 'unification',
            title: { en: 'Unification of Mankind', zh: '融合统一' },
            period: { en: '2,500 Years Ago', zh: '2500年前' },
            description: {
                en: 'Global unification driven by money, imperial visions, and universal religions.',
                zh: '通过金钱、帝国和全球性宗教，曾经破碎的人类世界逐渐统合为一个紧密的全球文明体系。'
            },
            icon: '🌍',
            color: '#60a5fa',
            keyPoints: [
                { title: { en: 'Money', zh: '金钱' }, desc: { en: 'The most universal trust system.', zh: '金钱是全世界通用的一种可以跨越文化、宗教和阶层的互信体系。' } },
                { title: { en: 'Empire', zh: '帝国' }, desc: { en: 'Diverse cultures merged under one rule.', zh: '帝国的版图跨越了民族限制。' } }
            ]
        },
        {
            id: 'scientific',
            title: { en: 'Scientific Revolution', zh: '科学革命' },
            period: { en: '500 Years Ago', zh: '500年前' },
            description: {
                en: 'Humankind admitted its ignorance and gained unprecedented power through science and capital.',
                zh: '人类发现自己“承认无知”后反而获得了巨大的力量。科学实验室与帝国扩张、资本信贷紧密结合，彻底改变了地球的面貌。'
            },
            icon: '🧪',
            color: '#34d399',
            keyPoints: [
                { title: { en: 'Ignorance', zh: '承认无知' }, desc: { en: 'The discovery of the unknown.', zh: '科学进步的基础在于人类公开承认自己对重要的问题一无所知。' } },
                { title: { en: 'Technology', zh: '工业革命' }, desc: { en: 'From biological to cyborg life.', zh: '人类正试图突破生物极限，迈向智慧生物的新纪元。' } }
            ]
        }
    ],
    timeline: [
        { year: '-70,000', event: 'Cognitive Revolution / 认知革命', detail: 'Sapiens spread out of Africa / 智人走出非洲' },
        { year: '-45,000', event: 'Australia Settled / 定居澳洲', detail: 'Megafauna extinction / 巨型动物灭绝' },
        { year: '-12,000', event: 'Agricultural Revolution / 农业革命', detail: 'Settled life starts / 定居开始' },
        { year: '-500', event: 'Paper Money / 纸币出现', detail: 'Credit system begins / 信用体系萌芽' },
        { year: '1500', event: 'Scientific Revolution / 科学革命', detail: 'Conquest of knowledge / 知识的征服' },
        { year: '1780', event: 'Industrial Revolution / 工业革命', detail: 'Steam engine / 蒸汽机发明' }
    ]
};

if (typeof window !== 'undefined') window.HISTORY_DATA = HISTORY_DATA;
