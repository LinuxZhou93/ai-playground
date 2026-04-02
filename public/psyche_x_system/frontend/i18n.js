/**
 * PSYCHE-X I18N MODULE v1.0
 * Global Localization Engine
 */

const DICTIONARY = {
    'EN': {
        'system.online': 'SYSTEM ONLINE',
        'nav.hub': 'Global Index',
        'nav.new': 'Latest Protocols',
        'nav.memory': 'Memory Layer',
        'nav.attention': 'Attention Layer',
        'nav.logic': 'Logic Layer',
        'nav.perception': 'Perception Layer',
        'nav.users': 'Researcher',
        'search.placeholder': 'Search neural protocols...',
        'mode.junior': 'JUNIOR MODE',
        'mode.analytics': 'ANALYTICS',
        'header.title': 'Global Protocols',
        'header.subtitle': 'Active Sequences available for deployment.',
        'status.stable': 'System Stable',
        'card.new': 'NEW',
        'card.ready': 'RDY'
    },
    'CN': {
        'system.online': '系统在线',
        'nav.hub': '全球索引',
        'nav.new': '最新协议',
        'nav.memory': '记忆层级',
        'nav.attention': '注意力层级',
        'nav.logic': '逻辑层级',
        'nav.perception': '感知层级',
        'nav.users': '研究员',
        'search.placeholder': '搜索神经协议...',
        'mode.junior': '青少年模式',
        'mode.analytics': '数据分析',
        'header.title': '全球协议库',
        'header.subtitle': '可部署的活跃序列。',
        'status.stable': '系统稳定',
        'card.new': '新',
        'card.ready': '就绪'
    }
};

class I18nCore {
    constructor() {
        this.lang = localStorage.getItem('psyche_lang') || 'EN';
        this.observers = [];
        console.log(`[I18N] Init in ${this.lang}`);
    }

    setLang(lang) {
        if (!DICTIONARY[lang]) return;
        this.lang = lang;
        localStorage.setItem('psyche_lang', lang);
        this.updatePage();
        this.notify();
    }

    t(key) {
        return DICTIONARY[this.lang][key] || key;
    }

    // Auto-replace text for elements with data-i18n attribute
    updatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (DICTIONARY[this.lang][key]) {
                if (el.placeholder) el.placeholder = DICTIONARY[this.lang][key];
                else el.innerText = DICTIONARY[this.lang][key];
            }
        });
    }

    subscribe(fn) {
        this.observers.push(fn);
    }

    notify() {
        this.observers.forEach(fn => fn(this.lang));
    }
}

window.I18n = new I18nCore();

// Auto-run on load
window.addEventListener('DOMContentLoaded', () => window.I18n.updatePage());
