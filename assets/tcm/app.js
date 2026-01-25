// 精诚中医 - 灵芝商城数据与逻辑
const products = [
    { id: 1, category: "灵芝专区", name: "老板亲选 · 破壁灵芝孢子粉", price: "598", desc: "源头直供 | 破壁率99% | 核心萃取", img: "assets/tcm/lingzhi_banner.png" },
    { id: 2, category: "灵芝专区", name: "长白山特级灵芝切片 (礼盒装)", price: "128", desc: "野生抚育 | 煲汤首选 | 滋补养生", img: "assets/tcm/article_reishi.png" },
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
        content: "<p>春天是万物复苏的季节，中医认为\"春气通肝\"，春季阳气升发，肝气也随之旺盛。如果肝气升发太过，容易出现急躁易怒、失眠多梦。</p><br><h3>推荐茶饮：灵芝枸杞菊花茶</h3><p>灵芝入五脏，补气安神；枸杞滋补肝肾；菊花清肝明目。三者搭配，既能护肝又能养眼，非常适合长期面对电脑的上班族。</p><br><p style='background: #F9F7F2; border: 1px solid #D4B185; padding: 15px; border-radius: 8px; color: #8C1C13; font-weight: 500;'>专家建议：每天下午3点左右饮用效果最佳。</p>"
    },
    {
        id: 2,
        title: "破壁灵芝孢子粉的选购误区，你踩雷了吗？",
        summary: "市面上孢子粉品牌繁多，价格差异巨大。如何通过'看、闻、试'三步法辨别真假？",
        cover: "assets/tcm/article_reishi.png",
        author: "精诚中医 张教授",
        avatar: "assets/tcm/doctor_avatar.png",
        content: "<h3>三步辨别法</h3><br><p><b>1. 看颜色：</b>真正的破壁孢子粉呈深褐色，粉质极其细腻。如果颜色发浅（咖啡色），可能是没破壁或掺杂了木粉。</p><br><p><b>2. 闻香气：</b>纯正孢子粉带有一种淡淡的菌香味（类似松茸或枯叶香），不应有油哈味或哈喇味。</p><br><p><b>3. 试口感：</b>放一小勺在口中，应该瞬间融化，没有明显的沙砾感，且回味微苦而清香。</p>"
    },
    {
        id: 3,
        title: "中医针灸：耳朵上的健康密码",
        summary: "人体缩小在耳朵上？小小耳穴竟能调控全身健康？带你揭秘耳穴压豆的神奇疗效。",
        cover: "assets/tcm/article_acupuncture.png",
        author: "李医师",
        avatar: "assets/tcm/doctor_avatar.png",
        content: "<h3>耳诊的神奇</h3><p>中医耳诊有着悠久的历史，耳朵就像一个倒置的胎儿，全身脏腑器官在耳廓上都有相应的反应点。</p><br><p>耳穴贴压（耳穴压豆）是通过在耳穴上贴敷王不留行籽等药物，给予适度的按压刺激，从而达到调理脏腑、平衡阴阳的作用。</p>"
    }
];

let activeTab = 'home';
let cartCount = 0;

window.switchTab = function (tabId) {
    activeTab = tabId;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
        document.querySelectorAll('.tab-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('onclick').includes(tabId));
        });
    }
    if (tabId === 'category') {
        const firstSidebarItem = document.querySelector('.sidebar-item');
        if (firstSidebarItem) window.renderCategory(firstSidebarItem.innerText);
    } else if (tabId === 'knowledge') {
        window.renderArticles();
    }
    console.log('Tab switched to:', tabId);
};

window.renderCategory = function (catName) {
    const container = document.querySelector('.main-cate');
    if (!container) return;
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.toggle('active', item.innerText === catName);
    });
    const filtered = products.filter(p => p.category === catName);
    let html = `<div class="cate-grid">`;
    if (filtered.length === 0) {
        html = `<div style="text-align: center; padding: 50px 0; color: #999; font-size: 13px; width: 100%;">精品筹备中...</div>`;
    } else {
        filtered.forEach(p => {
            html += `
                <div class="cate-item" onclick="window.openProduct(${p.id})">
                    <div class="cate-img-box"><img src="${p.img}" loading="lazy"></div>
                    <span style="font-size: 11px; margin-top: 8px; text-align: center;">${p.name.split(' · ').pop()}</span>
                    <span style="color: #8C1C13; font-weight: 700; font-size: 12px; margin-top: 4px;">¥ ${p.price}</span>
                </div>`;
        });
        html += `</div>`;
    }
    container.innerHTML = html;
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
                    <div class="art-summary">${art.summary}</div>
                    <div class="art-footer">
                        <div class="art-author">
                            <div class="author-avatar" style="background-image: url('${art.avatar}')"></div>
                            <span class="author-name">${art.author}</span>
                        </div>
                        <div class="art-stats">最近 3.2k 阅读</div>
                    </div>
                </div>
            </div>`;
    });
    html += `<div style="text-align: center; font-size: 11px; color: #999; padding: 10px 0;">- 更多专家专栏持续更新中 -</div></div>`;
    container.innerHTML = html;
};

window.openProduct = function (id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    document.getElementById('detail-title').innerText = p.name;
    document.getElementById('detail-price').innerText = `¥ ${p.price}`;
    document.getElementById('detail-desc').innerText = p.desc;
    document.getElementById('detail-img-box').style.backgroundImage = `url('${p.img}')`;
    document.getElementById('product-detail').style.display = 'flex';
};

window.openArticle = function (id) {
    const art = articles.find(a => a.id === id);
    if (!art) return;
    const overlay = document.getElementById('article-detail');
    overlay.querySelector('.detail-title').innerText = art.title;
    overlay.querySelector('.author-name').innerText = art.author;
    overlay.querySelector('.author-avatar').style.backgroundImage = `url('${art.avatar}')`;
    overlay.querySelector('.detail-body').innerHTML = art.content;
    overlay.style.display = 'flex';
};

window.handleSearch = function (query) {
    const overlay = document.getElementById('search-overlay');
    const container = document.getElementById('search-results-container');
    if (!query || query.trim() === '') {
        overlay.style.display = 'none';
        return;
    }
    overlay.style.display = 'flex';
    const q = query.toLowerCase();
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
    let html = '';
    if (filteredProducts.length > 0) {
        html += `<div class="section-title" style="padding:10px 0;"><span>匹配商品</span></div>`;
        filteredProducts.forEach(p => {
            html += `
                <div onclick="window.openProduct(${p.id}); window.closeSearch();" style="display:flex; align-items:center; gap:12px; padding:12px; background:white; border-radius:8px; margin-bottom:10px; box-shadow:var(--shadow);">
                    <img src="${p.img}" style="width:50px; height:50px; border-radius:4px; object-fit:cover;">
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:600;">${p.name}</div>
                        <div style="font-size:11px; color:#8C1C13; font-weight:700;">¥ ${p.price}</div>
                    </div>
                </div>`;
        });
    }
    if (filteredArticles.length > 0) {
        html += `<div class="section-title" style="padding:10px 0; margin-top:10px;"><span>健康百科</span></div>`;
        filteredArticles.forEach(a => {
            html += `
                <div onclick="window.openArticle(${a.id}); window.closeSearch();" style="display:flex; align-items:center; gap:12px; padding:12px; background:white; border-radius:8px; margin-bottom:10px; box-shadow:var(--shadow);">
                    <img src="${a.cover}" style="width:50px; height:50px; border-radius:4px; object-fit:cover;">
                    <div style="flex:1;">
                        <div style="font-size:13px; font-weight:600;">${a.title}</div>
                        <div style="font-size:11px; color:#999;">阅读全文 ></div>
                    </div>
                </div>`;
        });
    }
    if (filteredProducts.length === 0 && filteredArticles.length === 0) {
        html = `<div style="text-align:center; padding:50px 0; color:#999;">未找到与 "${query}" 相关的结果</div>`;
    }
    container.innerHTML = html;
};

window.closeSearch = function () {
    document.getElementById('search-overlay').style.display = 'none';
    document.getElementById('main-search-input').value = '';
};

window.showModuleDetail = function (title) {
    const overlay = document.getElementById('module-detail');
    document.getElementById('module-detail-title').innerText = title;
    document.getElementById('module-detail-msg').innerText = `${title} - 即将上线`;
    const icon = overlay.querySelector('#module-detail-icon');
    if (title.includes('地址')) icon.className = 'fas fa-map-marked-alt';
    else if (title.includes('收藏')) icon.className = 'fas fa-heart';
    else if (title.includes('档案')) icon.className = 'fas fa-id-card-alt';
    else if (title.includes('历史')) icon.className = 'fas fa-history';
    else if (title.includes('订单')) icon.className = 'fas fa-receipt';
    else icon.className = 'fas fa-tools';
    overlay.style.display = 'flex';
};

window.closeOverlay = function (id) {
    document.getElementById(id).style.display = 'none';
};

window.addToCart = function () {
    const btn = document.querySelector('.btn-primary-action');
    const originalText = btn.innerText;
    cartCount++;
    window.updateCartCount();
    btn.innerText = "已加入购物车";
    btn.style.background = "#2F5233";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "#8C1C13";
    }, 2000);
};

window.updateCartCount = function () {
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(b => {
        b.innerText = cartCount;
        b.style.display = cartCount > 0 ? 'block' : 'none';
        b.style.transform = 'scale(1.3)';
        setTimeout(() => b.style.transform = 'scale(1)', 200);
    });
};

window.addEventListener('load', () => {
    window.switchTab('home');
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => window.renderCategory(item.innerText));
    });
    console.log('App Initialized');
});
