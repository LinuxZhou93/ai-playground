// 精诚中医 - 极致极简版逻辑 (上线预览标准)
const products = [
    {
        id: 1,
        category: "灵芝专区",
        name: "老板亲选 · 破壁灵芝孢子粉",
        price: "598",
        desc: "源头直供 | 破壁率99% | 核心萃取",
        img: "assets/tcm/lingzhi_banner.png",
        params: [
            { label: "规格", value: "1g*30袋/盒" },
            { label: "产地", value: "吉林长白山" },
            { label: "保质期", value: "24个月" },
            { label: "破壁率", value: "99.8%" }
        ],
        details: [
            "assets/tcm/lingzhi_detail_1.png",
            "assets/tcm/lingzhi_detail_2.png",
            "assets/tcm/lingzhi_detail_3.png"
        ],
        richText: `
            <div style="padding: 10px 0;">
                <h4 style="color: #8C1C13; border-left: 3px solid #8C1C13; padding-left: 8px; margin-bottom: 10px;">产品优势</h4>
                <p style="font-size: 13px; color: #666; line-height: 1.8;">采自长白山海拔1000米以上高寒林区，模拟野生环境抚育。采用超低温物理破壁技术，确保灵芝三萜与多糖成分不受损。</p>
            </div>
        `
    },
    {
        id: 2,
        category: "灵芝专区",
        name: "长白山特级灵芝切片 (礼盒装)",
        price: "128",
        desc: "野生抚育 | 煲汤首选 | 滋补养生",
        img: "assets/tcm/article_reishi.png",
        params: [
            { label: "规格", value: "250g/罐" },
            { label: "产地", value: "长白山核心产区" }
        ],
        details: ["assets/tcm/article_reishi.png"],
        richText: "<p>精选五年以上野生灵芝，手工切片，自然烘干。</p>"
    },
    { id: 3, category: "养生茶饮", name: "灵芝养生茶饮包 (护肝系列)", price: "59", desc: "上班族首选 | 护肝明目 | 独立包装", img: "assets/tcm/tea_icon.png" },
    { id: 4, category: "参茸滋补", name: "手工东阿阿胶糕 (传统工艺)", price: "198", desc: "补气养血 | 滋味醇厚 | 0添加", img: "assets/tcm/ejiao_icon.png" },
    { id: 5, category: "参茸滋补", name: "美国进口西洋参切片", price: "268", desc: "大比例切片 | 清火生津 | 软枝西洋参", img: "assets/tcm/ginseng_icon.png" },
    { id: 6, category: "药食同源", name: "宁夏特级红枸杞 (500g)", price: "45", desc: "粒大饱满 | 滋补肝肾 | 煲汤泡茶", img: "assets/tcm/article_soup.png" },
    { id: 7, category: "灵芝专区", name: "御草堂 · 灵芝浓缩胶囊", price: "398", desc: "浓缩精华 | 方便携带 | 深度滋补", img: "assets/tcm/bottle_icon.png" }
];

const articles = [
    {
        id: 1,
        title: "春季护肝正当时，中医教你如何喝出好气色",
        summary: "春天万物复苏，中医认为'春气通肝'。此时通过合理的药膳与茶饮，可以有效疏肝理气...",
        cover: "assets/tcm/article_spring.png",
        author: "张景和 老中医",
        avatar: "assets/tcm/doctor_avatar.png",
        content: "<p>春天是万物复苏的季节，中医认为\"春气通肝\"...</p>"
    },
    {
        id: 2,
        title: "中医针灸：耳朵上的健康密码",
        summary: "人体缩小在耳朵上？小小耳穴竟能调控全身健康？带你揭秘耳穴压豆的神奇疗效。",
        cover: "assets/tcm/article_acupuncture.png",
        author: "李医师",
        avatar: "assets/tcm/doctor_avatar.png",
        content: "<p>中医耳诊有着悠久的历史...</p>"
    }
];

// 模拟用户数据
const mockData = {
    addresses: [
        { id: 1, name: "张三", phone: "138****8888", detail: "上海市静安区南京西路 1234 号", isDefault: true },
        { id: 2, name: "李梅", phone: "135****6666", detail: "北京市朝阳区三里屯 56 号", isDefault: false }
    ],
    orders: [
        { id: "ORD125688", goods: "破壁灵芝孢子粉", price: "598", status: "待付款", img: "assets/tcm/lingzhi_banner.png" },
        { id: "ORD125672", goods: "宁夏特级红枸杞", price: "45", status: "待收货", img: "assets/tcm/article_soup.png" }
    ],
    healthRecord: {
        type: "气虚质",
        advice: "宜补气养血，忌食生冷。",
        index: 85
    }
};

let cartItems = [];
let cartCount = 0;

window.switchTab = function (tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('onclick').includes(tabId));
    });
    if (tabId === 'category') window.renderCategory("灵芝专区");
    if (tabId === 'knowledge') window.renderArticles();
};

window.renderCategory = function (catName) {
    const container = document.querySelector('.main-cate');
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.innerText === catName);
    });
    const filtered = products.filter(p => p.category === catName);
    let html = `<div class="cate-grid">`;
    filtered.forEach(p => {
        html += `
            <div class="cate-item" onclick="window.openProduct(${p.id})">
                <div class="cate-img-box"><img src="${p.img}"></div>
                <span style="font-size: 11px; margin-top: 8px;">${p.name.split(' · ').pop()}</span>
                <span style="color: #8C1C13; font-weight: 700; font-size: 11px;">¥ ${p.price}</span>
            </div>`;
    });
    container.innerHTML = html + "</div>";
};

window.renderArticles = function () {
    const container = document.getElementById('knowledge');
    let html = `<div class="article-list">`;
    articles.forEach(art => {
        html += `
            <div class="article-card" onclick="window.openArticle(${art.id})">
                <div class="art-cover" style="background-image: url('${art.cover}')"></div>
                <div class="art-content">
                    <div class="art-title">${art.title}</div>
                    <div class="art-footer">
                        <div class="art-author"><div class="author-avatar" style="background-image: url('${art.avatar}')"></div><span>${art.author}</span></div>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html + "</div>";
};

window.openProduct = function (id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('detail-title').innerText = p.name;
    document.getElementById('detail-price').innerText = `¥ ${p.price}`;
    document.getElementById('detail-desc').innerText = p.desc;
    document.getElementById('detail-img-box').style.backgroundImage = `url('${p.img}')`;

    // 渲染参数列表与富文本内容
    let paramsHtml = '';
    if (p.params) {
        paramsHtml = '<div class="list-group" style="margin: 15px 0; border: 1px solid rgba(0,0,0,0.05);">';
        p.params.forEach(param => {
            paramsHtml += `<div class="list-item" style="padding: 10px 16px; border-bottom: 1px solid rgba(0,0,0,0.05);"><span style="color: #999; font-size: 13px;">${param.label}</span><span style="font-size: 13px; font-weight: 500;">${param.value}</span></div>`;
        });
        paramsHtml += '</div>';
    }

    let detailHtml = `<div style="padding: 0 16px;">${p.richText || ''}`;
    if (p.details) {
        p.details.forEach(img => {
            detailHtml += `<img src="${img}" style="width: 100%; border-radius: 8px; margin-top: 12px; box-shadow: var(--shadow);">`;
        });
    }
    detailHtml += '</div>';

    document.getElementById('product-full-content').innerHTML = paramsHtml + detailHtml;
    document.getElementById('product-detail').style.display = 'flex';
};

window.openArticle = function (id) {
    const art = articles.find(a => a.id === id);
    const overlay = document.getElementById('article-detail');
    overlay.querySelector('.detail-title').innerText = art.title;
    overlay.querySelector('.author-name').innerText = art.author;
    overlay.querySelector('.detail-body').innerHTML = art.content;
    overlay.style.display = 'flex';
};

window.showModuleDetail = function (title) {
    const overlay = document.getElementById('module-detail');
    const container = overlay.querySelector('.detail-content');

    document.getElementById('module-detail-title').innerText = title;
    container.style.display = 'block';
    container.style.padding = '0';
    container.innerHTML = '';

    if (title === '收货地址') {
        mockData.addresses.forEach(addr => {
            container.innerHTML += `
                <div class="list-item">
                    <div class="list-item-content">
                        <div class="list-item-title">${addr.name} ${addr.phone} ${addr.isDefault ? '<span class="tcm-tag tag-red">默认</span>' : ''}</div>
                        <div class="list-item-subtitle">${addr.detail}</div>
                    </div>
                    <i class="fas fa-edit" style="color: #999;"></i>
                </div>`;
        });
        container.innerHTML += `<div class="action-footer" style="position: absolute; bottom: 0; width: 100%;"><button class="btn-primary" onclick="alert('添加新地址')">+ 新增地址</button></div>`;
    }
    else if (title.includes('订单')) {
        const filtered = title === '评价管理' ? [] : mockData.orders;
        if (filtered.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-file-invoice"></i><p>暂无相关订单</p></div>`;
        } else {
            filtered.forEach(ord => {
                container.innerHTML += `
                    <div class="order-card">
                        <div class="order-no"><span>订单号: ${ord.id}</span><span style="color: #8C1C13;">${ord.status}</span></div>
                        <div class="order-goods">
                            <div class="goods-img" style="background-image: url('${ord.img}')"></div>
                            <div class="goods-info"><div>${ord.goods}</div><div style="font-weight: 700;">¥ ${ord.price}</div></div>
                        </div>
                    </div>`;
            });
        }
    }
    else if (title === '健康档案') {
        container.innerHTML = `
            <div style="padding: 20px;">
                <div style="background: white; border-radius: 12px; padding: 24px; text-align: center; box-shadow: var(--shadow);">
                    <div style="font-size: 14px; color: #999;">经中医 AI 体质辨识</div>
                    <div style="font-size: 32px; font-weight: 800; color: var(--primary-color); margin: 12px 0;">${mockData.healthRecord.type}</div>
                    <div class="tcm-tag tag-gold">调理建议</div>
                    <p style="margin-top: 10px; font-size: 13px; line-height: 1.6;">${mockData.healthRecord.advice}</p>
                </div>
                <div class="list-group" style="margin: 20px 0;">
                    <div class="list-item"><span>健康积分</span><span>${mockData.healthRecord.index}</span></div>
                    <div class="list-item"><span>饮食禁忌</span><span style="color: var(--primary-color);">辛辣、油腻</span></div>
                </div>
                <button class="btn-primary" onclick="alert('正在重新分析...')">重新辨识体质</button>
            </div>`;
    }
    else {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-tools"></i><p>${title} 功能筹备中</p></div>`;
    }
    overlay.style.display = 'flex';
};

window.handleSearch = function (query) {
    const overlay = document.getElementById('search-overlay');
    if (!query) return overlay.style.display = 'none';
    overlay.style.display = 'flex';
    const q = query.toLowerCase();
    const resultsContainer = document.getElementById('search-results-container');
    const matched = products.filter(p => p.name.includes(q));
    resultsContainer.innerHTML = matched.length ? '' : '<p style="text-align: center; color: #999; margin-top: 40px;">未发现相关药材</p>';
    matched.forEach(p => {
        resultsContainer.innerHTML += `<div class="list-item" onclick="window.openProduct(${p.id}); window.closeSearch();"><span>${p.name}</span><span style="color: var(--primary-color);">¥ ${p.price}</span></div>`;
    });
};

window.closeSearch = function () {
    document.getElementById('search-overlay').style.display = 'none';
    document.getElementById('main-search-input').value = '';
};

window.closeOverlay = function (id) {
    document.getElementById(id).style.display = 'none';
};

window.addToCart = function () {
    cartCount++;
    document.querySelectorAll('.cart-count').forEach(b => {
        b.innerText = cartCount;
        b.style.display = 'block';
    });
};

window.addEventListener('load', () => {
    window.switchTab('home');
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => window.renderCategory(e.target.innerText));
    });
});
