/**
 * TITAN EVOLUTION ENGINE (TEE) v1.0
 * The central brain of TITAN OS 2.0 - Managing Newbie Village to Mastery Evolution.
 */

window.TitanEvolutionEngine = (() => {
    // 1. 系统预装的 10 个基础模块 (新手村种子)
    const SYSTEM_RESERVED_APPS = [
        { name: 'AI 实验室', icon: '🤖', link: 'assets/js/hubs/hub-template.html?id=hub-ai.html', color: '#8b5cf6', category: 'system' },
        { name: '脑机互动系统', icon: '🧠', link: 'assets/js/hubs/hub-template.html?id=hub-auto-101.html', color: '#ec4899', category: 'system' },
        { name: '机器人基础中心', icon: '🦾', link: 'assets/js/hubs/hub-template.html?id=hub-auto-108.html', color: '#0ea5e9', category: 'system' },
        { name: '成电创客新闻', icon: '📰', link: 'news.html', color: '#f59e0b', category: 'system' },
        { name: 'TITAN 系统设置', icon: '⚙️', link: 'settings.html', color: '#64748b', category: 'system' },
        { name: '天文探测档案', icon: '🔭', link: 'assets/js/hubs/hub-template.html?id=hub-cosmology.html', color: '#a855f7', category: 'system' },
        { name: '生命科学实验', icon: '🧬', link: 'assets/js/hubs/hub-template.html?id=hub-auto-119.html', color: '#10b981', category: 'system' },
        { name: '3D 工程建模', icon: '📐', link: 'assets/js/hubs/hub-template.html?id=hub-auto-95.html', color: '#f43f5e', category: 'system' },
        { name: '创客共创广场', icon: '🏟️', link: 'community.html', color: '#38bdf8', category: 'system' },
        { name: '新手导航中心', icon: '🗺️', link: 'help.html', color: '#14b8a6', category: 'system' }
    ];

    // 2. 状态管理
    const STATE = {
        isNewbie: true,
        xp: 0,
        preferenceVector: {
            ai: 0,
            robotics: 0,
            space: 0,
            bio: 0,
            coding: 0,
            design: 0
        },
        questStep: 0, // 0-10 问引导
        onboardingComplete: false
    };

    /**
     * 初始化引擎并拦截新手状态
     */
    function init() {
        console.log("🚀 Titan Evolution Engine: Active.");
        
        // 读取持久化状态
        const savedState = localStorage.getItem('titan_evolution_dna');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            Object.assign(STATE, parsed);
        } else {
            // 如果是绝对的新手，强制开启新手村锁死模式
            sessionStorage.setItem('titan_newbie_village_lock', 'true');
        }

        // 监听来自 AI 助手的问答数据推送
        window.addEventListener('titan_onboarding_step', (e) => {
            const { category, score } = e.detail;
            updatePreference(category, score);
        });

        window.addEventListener('titan_onboarding_finish', () => {
            completeEvolution();
        });
    }

    /**
     * 更新偏好向量
     */
    function updatePreference(category, score) {
        if (STATE.preferenceVector[category] !== undefined) {
            STATE.preferenceVector[category] += score;
            // 限制最大分值 100
            if (STATE.preferenceVector[category] > 100) STATE.preferenceVector[category] = 100;
            saveDNA();
            
            // 实时同步给可视化引擎
            window.dispatchEvent(new CustomEvent('titan_onboarding_step', { 
                detail: { category, score: STATE.preferenceVector[category] } 
            }));
        }
    }

    /**
     * 保存 DNA 到本地存储
     */
    function saveDNA() {
        localStorage.setItem('titan_evolution_dna', JSON.stringify(STATE));
    }

    /**
     * 核心演化重组：由新手村进化为个性化门户
     */
    function completeEvolution() {
        STATE.isNewbie = false;
        STATE.onboardingComplete = true;
        saveDNA();
        
        sessionStorage.removeItem('titan_newbie_village_lock');

        // 发送原子能级广播，通知 UI 爆裂重组
        window.dispatchEvent(new CustomEvent('titan_evolution_trigger', {
            detail: { vector: STATE.preferenceVector }
        }));
        
        console.log("✨ Titan OS: Evolution Complete. Personalized UI active.");
    }

    /**
     * 获取当前应显示的 App 列表
     * @param {Array} originalApps - 原始全量库
     * @returns {Array} 过滤/演化后的 10/20 个 App
     */
    function getEvolvedApps(originalApps) {
        // 如果处于新手村锁定态，只返回 10 个系统预装
        if (sessionStorage.getItem('titan_newbie_village_lock') === 'true' || STATE.isNewbie) {
            return SYSTEM_RESERVED_APPS;
        }

        // 否则返回基于偏好的推荐 (此处为简化算法：按权重排序并选取前 10 个)
        // 实际逻辑中可以使用更复杂的向量距离计算
        const sorted = [...originalApps].sort((a, b) => {
            const scoreA = getAppScore(a);
            const scoreB = getAppScore(b);
            return scoreB - scoreA;
        });

        return sorted.slice(0, 10);
    }

    function getAppScore(app) {
        let score = 0;
        const vec = STATE.preferenceVector;
        // 关键词匹配增强 (这只是一个示例逻辑，可根据实际 hub 名进行更精准映射)
        const name = app.name.toLowerCase();
        if (name.includes('ai') || name.includes('智能')) score += vec.ai;
        if (name.includes('机器人') || name.includes('机械')) score += vec.robotics;
        if (name.includes('空') || name.includes('卫星') || name.includes('星')) score += vec.space;
        if (name.includes('生物') || name.includes('脑') || name.includes('基因')) score += vec.bio;
        if (name.includes('代码') || name.includes('编程') || name.includes('算法')) score += vec.coding;
        if (name.includes('设计') || name.includes('建模') || name.includes('视觉')) score += vec.design;
        return score;
    }

    init();

    return {
        STATE,
        getEvolvedApps,
        completeEvolution,
        updatePreference,
        isNewbie: () => STATE.isNewbie,
        getEvolutionDNA: () => STATE.preferenceVector
    };
})();
