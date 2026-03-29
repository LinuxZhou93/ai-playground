/**
 * ONBOARDING PROTOCOL (OP) v1.0
 * The "Newbie Village" quiz logic for TITAN OS 2.0.
 */

window.OnboardingProtocol = (() => {
    const QUESTS = [
        {
            id: 1,
            question: "欢迎来到 TITAN 数字基地！我是小创老师。首先，如果我们要组建一支火星开拓队，你更想担任什么角色？",
            options: [
                { text: "🤖 智械工程师 (负责机器人与自动化)", category: "robotics", score: 10 },
                { text: "🧠 架构分析师 (负责 AI 与数据决策)", category: "ai", score: 10 },
                { text: "🚀 领航员 (负责航天动力与航线)", category: "space", score: 10 }
            ]
        },
        {
            id: 2,
            question: "在基站实验室里，你发现了一台神秘的坏掉的仪器，你的第一反应是？",
            options: [
                { text: "直接拆开看看内部电路 (动手派)", category: "robotics", score: 5 },
                { text: "尝试重写控制代码使其重启 (代码派)", category: "coding", score: 10 },
                { text: "观察其外形并绘制结构草图 (设计派)", category: "design", score: 10 }
            ]
        },
        {
            id: 3,
            question: "你最希望拥有哪种“数字天赋”？",
            options: [
                { text: "万物互联：控制所有电子设备", category: "robotics", score: 8 },
                { text: "逻辑之瞳：看穿算法的运行逻辑", category: "ai", score: 10 },
                { text: "生命重组：用合成生物学创造物种", category: "bio", score: 10 }
            ]
        },
        {
            id: 4,
            question: "你的秘密基地会建在哪里？",
            options: [
                { text: "深海实验室 (海洋探测)", category: "bio", score: 5 },
                { text: "同步轨道空间站 (航天工程)", category: "space", score: 10 },
                { text: "元宇宙服务器集群 (数字设计)", category: "design", score: 8 }
            ]
        },
        // ... (以此类推，简化版先实现 4 个关键维度)
    ];

    let currentStep = 0;

    function start() {
        currentStep = 0;
        sendNextQuest();
    }

    function sendNextQuest() {
        if (currentStep >= QUESTS.length) {
            finish();
            return;
        }

        const quest = QUESTS[currentStep];
        const ai = window.TitanAIAssistantInstance;
        
        if (ai) {
            // 使用简易格式发送问题
            const optionsText = quest.options.map((opt, i) => `${i + 1}. ${opt.text}`).join('\n');
            ai.appendMessage('ai', `${quest.question}\n\n${optionsText}`);
            
            // 注入快捷磁片供用户点击
            if (typeof ai.updateQuickChips === 'function') {
                const chipsData = quest.options.map(opt => ({
                    label: opt.text.split(' ')[0], // 只取 Emoji
                    text: opt.text
                }));
                // 暂时手动覆盖磁片逻辑 (需要 TAA 支持)
                renderQuestChips(chipsData);
            }
        }
    }

    function renderQuestChips(chips) {
        // 这一步需要 TAA 暴露接口，或者我们在这里直接操作 DOM
        const container = document.querySelector('.ai-quick-chips');
        if (!container) return;
        container.innerHTML = '';
        chips.forEach(c => {
            const chip = document.createElement('div');
            chip.className = 'ai-chip';
            chip.innerText = c.text;
            chip.onclick = () => handleAnswer(c.text);
            container.appendChild(chip);
        });
    }

    function handleAnswer(text) {
        const quest = QUESTS[currentStep];
        const option = quest.options.find(opt => text.includes(opt.text) || text.includes(opt.category));
        
        if (option) {
            // 向 TEE 推送数据
            window.dispatchEvent(new CustomEvent('titan_onboarding_step', {
                detail: { category: option.category, score: option.score }
            }));
            
            currentStep++;
            setTimeout(() => sendNextQuest(), 500);
        }
    }

    function finish() {
        const ai = window.TitanAIAssistantInstance;
        if (ai) {
            ai.appendMessage('ai', "🎉 初始感知完成！TITAN OS 正在根据你的天赋进行全量架构重组...");
            
            // 触发 TEE 的最终演化
            window.dispatchEvent(new CustomEvent('titan_onboarding_finish'));
            
            // 清理磁片
            const container = document.querySelector('.ai-quick-chips');
            if (container) container.innerHTML = '';
        }
    }

    return { start, handleAnswer, isProcessing: () => currentStep < QUESTS.length };
})();
