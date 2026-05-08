
/**
 * API科普模块数据中心
 * 包含课程、漫画章节、交互实验等内容
 */
const apiData = {
    course: {
        title: "API 的奇幻旅程：从代码到万物互联",
        description: "API (应用程序编程接口) 是数字世界的‘胶水’。通过生动的漫画和交互实验，探索 API 如何让大模型开口说话，如何让不同的软件系统相互协作。",
        target: "中小学生、初中生、AI 兴趣爱好者",
        category: "Computer Science / AI",
        duration: "45-60 min",
        difficulty: "入门"
    },
    lessons: [
        {
            id: 1,
            title: "什么是 API？——餐厅里的‘服务员’",
            type: "reading",
            completed: false,
            content: `
## 📖 核心概念：生活中的 API

想象一下你正在一家餐厅吃饭：

1. **你 (客户端)**：想点一份汉堡。
2. **厨房 (服务器)**：负责做汉堡，但你不能直接冲进厨房大喊大叫。
3. **服务员 (API)**：你告诉服务员你想吃什么。服务员把订单送到厨房。厨房做好了，服务员再把香喷喷的汉堡端给你。

**API 就是这位“服务员”。** 它负责在不同的软件程序之间传递信息。

### 为什么大模型需要 API？
当你和 ChatGPT 聊天时，你的手机应用并不是自己“思考”。它通过 API 把你的问题发给遥远云端的一台超级计算机（大模型），然后把答案接回来。
            `
        },
        {
            id: 2,
            title: "漫画：小明的魔法翻译官",
            type: "video",
            duration_seconds: 120,
            completed: false,
            // 采用动态视频或动效展示漫画逻辑
            content_url: "https://www.bilibili.com/video/BV1Gv4y1E7PZ" // 示例视频：API 详解
        },
        {
            id: 3,
            title: "API 的三种‘魔法格式’",
            type: "reading",
            completed: false,
            content: `
## 🛠️ API 是怎么传递消息的？

为了让电脑之间不吵架，它们约定了一套秘密语言。最流行的一种叫 **JSON**。

### 看看 JSON 长什么样：
\`\`\`json
{
  "角色": "超人",
  "技能": ["飞行", "力大无穷"],
  "等级": 99
}
\`\`\`

就像填空题一样，API 把数据装进这些大括号里，发送给另一台电脑。对方一拆开，就能立刻明白是什么意思！
            `
        },
        {
            id: 4,
            title: "交互实验：手动调用 AI 接口",
            type: "code",
            completed: false
        },
        {
            id: 5,
            title: "API 结业小测试",
            type: "quiz",
            completed: false
        }
    ],
    experiments: [
        {
            id: 'api-exp-1',
            title: '猫咪图片 API 调用',
            desc: '通过调用公共 API，实时从网络获取一张可爱的猫咪图片。',
            url: 'https://thecatapi.com/'
        },
        {
            id: 'api-exp-2',
            title: '天气查询 API 模拟',
            desc: '学习输入城市名，获取实时气象数据的 JSON 反馈。',
            url: 'https://codepen.io/freeCodeCamp/full/KzRByx'
        }
    ]
};

// 暴露给 window
window.apiData = apiData;
