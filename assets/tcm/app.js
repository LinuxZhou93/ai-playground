/**
 * 精诚灵芝科创基地 - 智慧全产业链 App 逻辑
 * 涵盖：种植监控、科创研习、甄选商城、文创中心、研学预约
 */

const products = [
    { id: 1, cat: "核心产品", name: "精诚极选·破壁灵芝孢子粉", price: 898, desc: "科创基地核心产出 | 破壁率>99.9% | 高倍三萜", img: "assets/tcm/lingzhi_hero_premium.png", type: "base" },
    { id: 2, cat: "道地药材", name: "原产地特级灵芝切片", price: 158, desc: "长白山基地直供 | 无硫熏蒸 | 足年份采集", img: "assets/tcm/article_reishi.png", type: "base" },
    { id: 3, cat: "文创摆件", name: "活态灵芝盆景·大医精诚", price: 1280, desc: "基地特培活态灵芝 | 招财纳福 | 艺术观赏", img: "assets/tcm/jingcheng_hall.png", type: "creative" },
    { id: 4, cat: "文创摆件", name: "微缩基地·灵芝景观玻璃盒", price: 298, desc: "纯手工复刻基地微景观 | 桌面治愈系", img: "assets/tcm/article_spring.png", type: "creative" },
    { id: 5, cat: "研学教育", name: "灵芝科教标本礼包", price: 198, desc: "青少年科创套装 | 含灵艺剪纸与生长观察", img: "assets/tcm/article_soup.png", type: "edu" },
    { id: 6, cat: "研学教育", name: "基地实地研习·半日通票", price: 68, desc: "专业导师讲解 | 实验室参观 | 亲手采摘体验", img: "assets/tcm/article_acupuncture.png", type: "tour" }
];

const researchItems = [
    { id: 1, title: "新型低温破壁技术通过国家专利认证", summary: "精诚实验室历时三年研发，实现了全活性成分保留...", cover: "assets/tcm/article_reishi.png", tag: "研发前沿" },
    { id: 2, title: "5G+物联网在灵芝种植基地的深度应用", summary: "每一株灵芝都有一个实时监控系统，精准控制温湿光...", cover: "assets/tcm/article_spring.png", tag: "智慧农业" }
];

const studyTours = [
    { id: 101, name: "周末亲子·小小科创家营", date: "本周六/日", seats: "余5位", price: 299, img: "assets/tcm/article_spring.png" },
    { id: 102, name: "行业研讨：深加工产业闭门会", date: "2026-03-15", seats: "余20位", price: 0, img: "assets/tcm/jingcheng_hall.png" }
];

const banners = [
    { title: "智慧灵芝·科创未来", sub: "国家农业科技重点示范基地", img: "assets/tcm/jingcheng_hall.png" },
    { title: "寻找灵芝合伙人", sub: "云端认领专属灵芝 实时全程监控", img: "assets/tcm/lingzhi_hero_premium.png" }
];

const notices = [
    "基地快讯：长白山核心区第一批优质灵芝开始采粉",
    "科研突破：灵芝三萜抗皱系列文创护肤品面世",
    "研学预告：下周将举办社区居民基地参观日"
];

let cart = [];
let currentBannerIdx = 0;

window.switchTab = function (tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(i => i.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[onclick="window.switchTab('${tabId}')"]`).classList.add('active');

    if (tabId === 'home') renderHome();
    if (tabId === 'research') renderResearch();
    if (tabId === 'mall') renderMall("核心产品");
};

function renderHome() {
    // Banner 轮播逻辑 (已在之前实现过增强，这里简化)
    const track = document.getElementById('banner-track');
    const dots = document.getElementById('banner-dots');
    if (track) {
        track.innerHTML = banners.map(b => `<div class="banner-slide" style="background-image:url('${b.img}')"><div class="banner-overlay"><h2>${b.title}</h2><p>${b.sub}</p></div></div>`).join('');
        dots.innerHTML = banners.map((_, i) => `<div class="indicator-dot ${i === 0 ? 'active' : ''}"></div>`).join('');
    }

    // 跑马灯
    const nList = document.getElementById('notice-list');
    if (nList) nList.innerHTML = notices.map(n => `<div class="notice-item">${n}</div>`).join('');

    // 推荐商品
    const hPanel = document.getElementById('home-product-list');
    hPanel.innerHTML = products.slice(0, 4).map(p => `
        <div class="product-card" onclick="window.openProduct(${p.id})">
            <img src="${p.img}" class="product-img">
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-price">¥ ${p.price}</div>
            </div>
        </div>
    `).join('');
}

function renderResearch() {
    const nPanel = document.getElementById('news-list');
    nPanel.innerHTML = researchItems.map(item => `
        <div class="eco-card">
            <div class="eco-thumb" style="background-image:url('${item.cover}')"></div>
            <div class="eco-body">
                <div style="font-size:10px; color:var(--secondary-color); margin-bottom:4px;"># ${item.tag}</div>
                <div class="eco-title">${item.title}</div>
                <div class="eco-desc">${item.summary}</div>
            </div>
        </div>
    `).join('');

    const tPanel = document.getElementById('tour-list');
    tPanel.innerHTML = studyTours.map(t => `
        <div class="eco-card" onclick="window.showModuleDetail('研学预约详情')">
            <div class="eco-thumb" style="background-image:url('${t.img}')"></div>
            <div class="eco-body">
                <div class="eco-title">${t.name}</div>
                <div class="eco-desc">${t.date} | ${t.seats}</div>
                <div style="color:var(--primary-color); font-weight:700; font-size:13px; margin-top:5px;">¥ ${t.price}</div>
            </div>
        </div>
    `).join('');
}

function renderMall(activeCat) {
    const cats = ["核心产品", "道地药材", "文创摆件", "研学教育"];
    const catPanel = document.getElementById('mall-cats');
    catPanel.innerHTML = cats.map(c => `<div class="tip-badge ${c === activeCat ? 'active' : ''}" onclick="window.renderMall('${c}')" style="background:${c === activeCat ? 'var(--primary-color)' : 'rgba(0,0,0,0.05)'}; color:${c === activeCat ? '#FFF' : '#666'}">${c}</div>`).join('');

    const mList = document.getElementById('mall-product-list');
    const filtered = products.filter(p => p.cat === activeCat);
    mList.innerHTML = filtered.map(p => `
        <div class="product-card" onclick="window.openProduct(${p.id})">
            <img src="${p.img}" class="product-img">
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-price">¥ ${p.price}</div>
            </div>
        </div>
    `).join('');
}

window.showModuleDetail = function (title) {
    const overlay = document.getElementById('module-detail');
    const content = document.getElementById('module-detail-content');
    document.getElementById('module-detail-title').innerText = title;
    content.innerHTML = '';
    overlay.style.display = 'flex';

    if (title === '智慧种植') {
        content.innerHTML = `
            <div style="padding:24px; text-align:center;">
                <div style="width:100%; height:200px; background:#000; border-radius:12px; display:flex; justify-content:center; align-items:center; color:white;">
                    <i class="fas fa-play-circle" style="font-size:48px;"></i>
                    <span style="margin-left:10px;">连接基地实时监控...</span>
                </div>
                <div style="margin-top:20px; text-align:left;">
                    <h4 style="color:var(--primary-color);">您的云认领灵芝：GC-9908</h4>
                    <p style="font-size:12px; color:#666; margin-top:8px;">状态：生长期 | 下次浇灌：3小时后</p>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:15px;">
                        <button class="btn-primary" style="height:36px; padding:0; font-size:12px;">查看生长延时摄影</button>
                        <button class="btn-primary" style="height:36px; padding:0; font-size:12px; background:var(--secondary-color);">云端除草/防病</button>
                    </div>
                </div>
            </div>
        `;
    } else if (title === '溯源查询') {
        content.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <i class="fas fa-qrcode" style="font-size:100px; color:#DDD; margin:40px 0;"></i>
                <p style="font-size:14px; color:#666;">扫描产品包装上的溯源二维码</p>
                <div style="margin-top:30px; padding:16px; background:#F9F7F2; border-radius:12px; text-align:left;">
                    <div style="font-weight:700; border-bottom:1px solid #EEE; padding-bottom:8px;">模拟数据 (GC-8827)</div>
                    <div style="font-size:11px; color:#999; margin-top:10px;">产地：长白山东麓海拔800米核心产区</div>
                    <div style="font-size:11px; color:#999;">种植周期：24个月</div>
                    <div style="font-size:11px; color:#999;">检测合格：2025-12-20</div>
                    <div style="font-size:11px; color:#999;">基地签章：精诚质量科创中心 (有效)</div>
                </div>
            </div>
         `;
    } else {
        content.innerHTML = `<div style="text-align:center; padding-top:100px; color:#999;"><i class="fas fa-tools" style="font-size:40px;"></i><p style="margin-top:15px;">${title} 模块升级中</p></div>`;
    }
};

window.openProduct = function (id) {
    const p = products.find(x => x.id === id);
    window.showModuleDetail(p.name);
    const content = document.getElementById('module-detail-content');
    content.innerHTML = `
        <div style="padding:0;">
            <div style="width:100%; height:300px; background-image:url('${p.img}'); background-size:cover;"></div>
            <div style="padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <h3 style="font-size:20px;">${p.name}</h3>
                    <div style="color:var(--primary-color); font-size:22px; font-weight:800;">¥ ${p.price}</div>
                </div>
                <p style="color:#666; font-size:13px; margin:10px 0;">${p.desc}</p>
                <div style="margin-top:20px; padding-top:20px; border-top:1px solid #EEE;">
                    <div style="font-weight:700;">基地服务</div>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <span style="font-size:10px; background:#E8F5E9; color:#2E7D32; padding:4px 8px; border-radius:4px;">全程溯源</span>
                        <span style="font-size:10px; background:#E8F5E9; color:#2E7D32; padding:4px 8px; border-radius:4px;">产地顺丰直达</span>
                        <span style="font-size:10px; background:#E8F5E9; color:#2E7D32; padding:4px 8px; border-radius:4px;">研习会员特惠</span>
                    </div>
                </div>
                <button class="btn-primary" style="margin-top:40px; width:100%;" onclick="alert('已加入基地购药篮')">立即订购</button>
            </div>
        </div>
    `;
};

window.closeOverlay = function (id) { document.getElementById(id).style.display = 'none'; };

window.addEventListener('load', () => {
    window.switchTab('home');
    // 自动轮播 Banner
    setInterval(() => {
        currentBannerIdx = (currentBannerIdx + 1) % banners.length;
        const track = document.getElementById('banner-track');
        if (track) {
            track.style.transform = `translateX(-${currentBannerIdx * 100}%)`;
            document.querySelectorAll('.indicator-dot').forEach((d, i) => d.classList.toggle('active', i === currentBannerIdx));
        }
    }, 5000);
});
