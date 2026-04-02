// Language Configuration for Psyche-X
const LANG = {
    en: {
        // Login Panel
        title: "PSYCHE-X",
        subtitle: "Dual N-Back Cognitive Training",
        callsign: "Participant ID",
        initialize: "START",
        standby: "SYSTEM READY",

        // Game UI
        protocol: "PROTOCOL",
        score: "SCORE",
        load: "Level",
        posMatch: "POSITION MATCH",
        audioMatch: "AUDIO MATCH",
        instructions: "Press 'A' for position match, 'L' for audio match",

        // Results
        complete: "SESSION COMPLETE",
        upload: "SUBMIT DATA",
        viewReport: "VIEW REPORT",
        restart: "NEW SESSION",
        failed: "UPLOAD FAILED",
        success: "DATA SUBMITTED",

        // Report
        reportTitle: "COGNITIVE ASSESSMENT REPORT",
        recommendations: "Personalized Recommendations",
        dimensions: {
            Gf: "Fluid Intelligence",
            Gwm: "Working Memory",
            Att: "Executive Function",
            Meta: "Metacognition",
            Res: "Resilience"
        },

        // MIT Branding
        institution: "Supported by MIT Cognitive & Learning Lab",
        consent: "By participating, you consent to data collection for research purposes.",

        // Tutorial
        tutorialTitle: "How to Play",
        tutorialSteps: [
            "Watch the grid - a square will light up",
            "Listen to the letter being spoken",
            "Press 'A' if current POSITION matches N steps back",
            "Press 'L' if current LETTER matches N steps back",
            "You can press both keys if both match"
        ]
    },

    zh: {
        // Login Panel
        title: "PSYCHE-X",
        subtitle: "双重 N-Back 认知训练",
        callsign: "受试者编号",
        initialize: "开始",
        standby: "系统就绪",

        // Game UI
        protocol: "训练模式",
        score: "得分",
        load: "难度",
        posMatch: "位置匹配",
        audioMatch: "声音匹配",
        instructions: "按 'A' 键匹配位置，按 'L' 键匹配声音",

        // Results
        complete: "训练完成",
        upload: "提交数据",
        viewReport: "查看报告",
        restart: "新训练",
        failed: "提交失败",
        success: "数据已提交",

        // Report
        reportTitle: "认知评估报告",
        recommendations: "个性化建议",
        dimensions: {
            Gf: "流体智力",
            Gwm: "工作记忆",
            Att: "执行功能",
            Meta: "元认知",
            Res: "心理韧性"
        },

        // MIT Branding
        institution: "麻省理工学院 认知与学习实验室 支持",
        consent: "参与即表示您同意将数据用于研究目的。",

        // Tutorial
        tutorialTitle: "游戏规则",
        tutorialSteps: [
            "观察网格 - 会有一个方块点亮",
            "聆听播报的字母",
            "如果当前位置与 N 步之前相同，按 'A' 键",
            "如果当前字母与 N 步之前相同，按 'L' 键",
            "如果两者都匹配，可以同时按两个键"
        ]
    }
};

// Get current language from localStorage or default to English
function getCurrentLang() {
    return localStorage.getItem('psyche_lang') || 'en';
}

function setLanguage(lang) {
    localStorage.setItem('psyche_lang', lang);
    location.reload();
}

function t(key) {
    const lang = getCurrentLang();
    const keys = key.split('.');
    let value = LANG[lang];
    for (let k of keys) {
        value = value[k];
        if (!value) return key;
    }
    return value;
}
