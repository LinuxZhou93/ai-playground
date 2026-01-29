/**
 * 精诚灵芝庄园 (通济黄村坝) - 智慧全产业链 App 逻辑
 * 涵盖：林下种植监控、文化研习、庄园甄选、医康旅游
 */

const products = [
    { id: 1, cat: "核心产品", name: "灵芝庄园·仿野生孢子粉", price: 898, desc: "通济黄村坝林下采收 | 林深雾养 | 院内制剂标准", img: "https://images.unsplash.com/photo-1694035449560-bbcfc84baef2?fm=jpg&q=80&w=3000&auto=format&fit=crop", type: "base" },
    { id: 2, cat: "道地药材", name: "龙门山特级灵芝切片", price: 158, desc: "湔江河谷上游直供 | 天然无害 | 足年份生长", img: "https://images.unsplash.com/photo-1559484237-0bd6c0f6c963?fm=jpg&q=80&w=3000&auto=format&fit=crop", type: "base" },
    { id: 3, cat: "文创摆件", name: "活态灵芝盆景·黄村坝特色", price: 1280, desc: "庄园特培活态灵芝 | 招财纳福 | 艺术观赏", img: "assets/tcm/jingcheng_hall.png", type: "creative" },
    { id: 4, cat: "睡眠康养", name: "酸枣仁百合舒睡茶", price: 79, desc: "庄园药膳配比 | 汉方古法 | 舒缓助眠", img: "assets/tcm/tea_icon.png", type: "sleep" },
    { id: 5, cat: "研学教育", name: "灵芝文化研习·半日通票", price: 68, desc: "文化讲座 | 现场采收体验 | 庄园康养游", img: "assets/tcm/article_acupuncture.png", type: "tour" },
    { id: 6, cat: "睡眠康养", name: "磁疗护颈决明子枕", price: 199, desc: "人体工学设计 | 决明子填充 | 模拟林间深度睡眠", img: "https://images.unsplash.com/photo-1606796913825-2b02883605e9?fm=jpg&q=80&w=3000&auto=format&fit=crop", type: "sleep" }
];

const researchItems = [
    { id: 1, title: "通济黄村坝：林深雾养出好灵芝", summary: "龙门山脉独特的亚热带季风气候，为仿野生灵芝提供了绝佳环境...", cover: "https://images.unsplash.com/photo-1694035449560-bbcfc84baef2?fm=jpg&q=80&w=3000&auto=format&fit=crop", tag: "地理优势" },
    { id: 2, title: "三位一体模式：黄村坝的致富密码", summary: "集中草药种植、生产、医康旅游于一体，打造灵芝庄园新标杆...", cover: "https://images.unsplash.com/photo-1759092912891-9f52486bb059?fm=jpg&q=80&w=3000&auto=format&fit=crop", tag: "产业创新" }
];

const studyTours = [
    { id: 101, name: "现场灵芝采收·亲子研习营", date: "本周六/日", seats: "余8位", price: 199, img: "https://images.unsplash.com/photo-1559484237-0bd6c0f6c963?fm=jpg&q=80&w=3000&auto=format&fit=crop" },
    { id: 102, name: "庄园药膳体验：灵芝养生宴", date: "每日预约", seats: "仅限20人/天", price: 288, img: "assets/tcm/jingcheng_hall.png" }
];

const banners = [
    { title: "黄村坝·灵芝庄园", sub: "龙门山脉湔江河谷 仿野生生长基地", img: "https://images.unsplash.com/photo-1694035449560-bbcfc84baef2?fm=jpg&q=80&w=3000&auto=format&fit=crop" },
    { title: "林深雾养 光阴成材", sub: "体验灵芝采收 尊享庄园药膳", img: "assets/tcm/jingcheng_hall.png" }
];

const notices = [
    "庄园动态：黄村坝仿野生灵芝进入最佳采收期",
    "文化讲座：本周六将举办灵芝文化深度课堂",
    "新品上市：灵芝庄园定制款助眠组合上架"
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
    const track = document.getElementById('banner-track');
    const dots = document.getElementById('banner-dots');
    if (track) {
        track.innerHTML = banners.map(b => `<div class="banner-slide" style="background-image:url('${b.img}')"><div class="banner-overlay"><h2>${b.title}</h2><p>${b.sub}</p></div></div>`).join('');
        dots.innerHTML = banners.map((_, i) => `<div class="indicator-dot ${i === 0 ? 'active' : ''}"></div>`).join('');
    }

    const nList = document.getElementById('notice-list');
    if (nList) nList.innerHTML = notices.map(n => `<div class="notice-item">${n}</div>`).join('');

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
    const cats = ["核心产品", "睡眠康养", "道地药材", "文创摆件", "研学教育"];
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
                <div style="width:100%; height:200px; background:#000; border-radius:12px; display:flex; justify-content:center; align-items:center; color:white; overflow:hidden; position:relative;">
                    <img src="https://images.unsplash.com/photo-1694035449560-bbcfc84baef2?fm=jpg&q=80&w=3000&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover; opacity:0.6;">
                    <div style="position:absolute; top:10px; right:10px; background:rgba(255,0,0,0.7); font-size:10px; padding:3px 6px; border-radius:4px; color:white;">LIVE: 黄村坝</div>
                    <i class="fas fa-play-circle" style="font-size:48px; position:absolute;"></i>
                </div>
                <div style="margin-top:20px; text-align:left;">
                    <h4 style="color:var(--primary-color);">黄村坝庄园：林下仿野生灵芝</h4>
                    <p style="font-size:12px; color:#666; margin-top:8px;">状态：<span style="color:green;">林深雾养</span> | 湿度：88% | 海拔：龙门山上游</p>
                    <div style="height:4px; background:#EEE; margin-top:10px; border-radius:2px;"><div style="width:70%; height:4px; background:var(--primary-color); border-radius:2px;"></div></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:20px;">
                        <button class="btn-primary" style="height:36px; padding:0; font-size:12px;">🎥 现场实况</button>
                        <button class="btn-primary" style="height:36px; padding:0; font-size:12px; background:var(--secondary-color);">🌧️ 智慧环境管理</button>
                    </div>
                </div>
            </div>
        `;
    } else if (title === '溯源查询') {
        content.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <div style="position:relative; width:150px; height:150px; margin:20px auto;">
                    <i class="fas fa-qrcode" style="font-size:150px; color:#DDD;"></i>
                    <div style="position:absolute; top:0; left:0; width:100%; height:2px; background:var(--primary-color); box-shadow:0 0 4px var(--primary-color); animation: scan 2s infinite linear;"></div>
                </div>
                <style>@keyframes scan { 0% {top:0} 100% {top:100%} }</style>
                <p style="font-size:14px; color:#666;">扫描黄村坝产品溯源二维码</p>
                
                <div style="margin-top:30px; padding:16px; background:#F9F7F2; border-radius:12px; text-align:left; border:1px solid rgba(0,0,0,0.05);">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                        <i class="fas fa-check-circle" style="color:green;"></i>
                        <span style="font-weight:700;">正品认证：灵芝庄园</span>
                    </div>
                    <div style="font-size:11px; color:#666; line-height:1.8;">
                        <div>产地：龙门山通济黄村坝核心区</div>
                        <div>质量等级：院内制剂标准</div>
                        <div>检测签章：精诚质量中心 (通济站)</div>
                    </div>
                </div>
            </div>
         `;
    } else if (title === '睡眠康养') {
        content.innerHTML = `
            <div style="padding:20px;">
                <div style="position:relative; border-radius:16px; overflow:hidden; padding:24px; color:white; box-shadow:0 10px 30px rgba(10,20,50,0.4);">
                    <div style="position:absolute; inset:0; background-image:url('https://images.unsplash.com/photo-1619166855707-bba87a7772a2?fm=jpg&q=80&w=3000&auto=format&fit=crop'); background-size:cover; filter: brightness(0.4);"></div>
                    <div style="position:relative; z-index:1; text-align:center;">
                        <div style="width:60px; height:60px; margin:0 auto 15px; background:rgba(255,255,255,0.1); border-radius:30px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(5px);">
                            <i class="fas fa-moon" style="font-size:28px; color:#FFD700;"></i>
                        </div>
                        <h3 style="margin-bottom:8px;">中医情志助眠检测</h3>
                        <p style="font-size:12px; opacity:0.8;">模拟黄村坝林间舒睡感</p>
                        <button style="margin-top:20px; background:linear-gradient(90deg, #FFD700, #FFA000); color:#333; border:none; padding:10px 28px; border-radius:25px; font-weight:700;">开始问诊</button>
                    </div>
                </div>
                <div style="margin-top:25px;">
                    <h4 style="border-left:4px solid var(--primary-color); padding-left:10px; margin-bottom:15px;">好眠甄选</h4>
                    <div style="display:flex; overflow-x:auto; gap:12px; padding-bottom:10px;">
                        ${products.filter(p => p.type === 'sleep').map(p => `
                            <div style="flex-shrink:0; width:130px; background:white; border-radius:12px; padding:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05);" onclick="window.openProduct(${p.id})">
                                <img src="${p.img}" style="width:100%; height:90px; object-fit:cover; border-radius:8px;">
                                <div style="font-size:12px; font-weight:700; margin-top:8px;">${p.name}</div>
                                <div style="color:var(--primary-color); font-weight:600; font-size:12px;">¥ ${p.price}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (title === '基地实景') {
        content.innerHTML = `
             <div style="position:relative; width:100%; height:450px; background:#000; overflow:hidden;">
                <img src="https://images.unsplash.com/photo-1694035449560-bbcfc84baef2?fm=jpg&q=80&w=3000&auto=format&fit=crop" style="width:100%; height:100%; object-fit:cover; opacity:0.6;">
                <div style="position:absolute; inset:0; padding:20px; font-family:'Courier New', monospace; color:rgba(100,255,100,0.9); pointer-events:none;">
                    <div style="display:flex; justify-content:space-between;">
                        <div style="border:1px solid rgba(100,255,100,0.5); padding:4px 8px; font-size:10px;">HUANGCUNBA_LIVE</div>
                        <div style="border:1px solid rgba(100,255,100,0.5); padding:4px 8px; font-size:10px;">LONGMEN_MTN</div>
                    </div>
                    <div style="position:absolute; bottom:80px; left:20px; font-size:10px; line-height:1.6;">
                        <div>海拔: 1200m</div>
                        <div>气压: 1013hPa</div>
                        <div>湿度: 92% (林深雾养)</div>
                    </div>
                </div>
                <div style="position:absolute; bottom:20px; left:20px; right:20px; background:rgba(0,0,0,0.6); padding:12px; border-radius:8px; color:white; font-size:12px; display:flex; justify-content:space-between;">
                    <span>机位：黄村坝 · 灵芝庄园上空</span>
                    <i class="fas fa-camera"></i>
                </div>
             </div>
        `;
    } else {
        content.innerHTML = `<div style="text-align:center; padding-top:100px; color:#999;"><i class="fas fa-tools" style="font-size:40px;"></i><p style="margin-top:15px;">${title} 筹备中...</p></div>`;
    }
};

window.openProduct = function (id) {
    const p = products.find(x => x.id === id);
    window.showModuleDetail(p.name);
    const content = document.getElementById('module-detail-content');
    content.innerHTML = `
        <div style="padding:0;">
            <div style="width:100%; height:300px; background-image:url('${p.img}'); background-size:cover; position:relative;">
                <div style="position:absolute; bottom:0; left:0; width:100%; height:60px; background:linear-gradient(to top, rgba(0,0,0,0.6), transparent);"></div>
            </div>
            <div style="padding:24px; position:relative; top:-20px; background:white; border-radius:20px 20px 0 0;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h3 style="font-size:22px; font-weight:700; width:70%;">${p.name}</h3>
                    <div style="color:var(--primary-color); font-size:24px; font-weight:800;">¥ ${p.price}</div>
                </div>
                <div style="display:flex; gap:6px; margin-top:8px;">
                    <span style="font-size:10px; background:#F0F0F0; color:#666; padding:2px 6px; border-radius:4px;">${p.cat}</span>
                    <span style="font-size:10px; background:#FFF0F0; color:var(--primary-color); padding:2px 6px; border-radius:4px;">黄村坝直供</span>
                </div>
                <div style="margin-top:20px; background:#F9F9F9; padding:15px; border-radius:12px;">
                    <div style="font-size:13px; font-weight:700; margin-bottom:8px;">商品简介</div>
                    <p style="color:#666; font-size:13px; line-height:1.6;">${p.desc}。源自龙门山通济黄村坝，采用三位一体模式，天然无害。订单包含庄园直发顺丰速运。</p>
                </div>
                <div style="margin-top:30px; display:flex; gap:15px;">
                    <button style="flex:1; height:44px; border:1px solid #DDD; background:white; border-radius:22px; color:#333; font-weight:600;">加入购物车</button>
                    <button class="btn-primary" style="flex:1; height:44px; border-radius:22px;" onclick="alert('庄园订单已接收，感谢支持！')">立即下单</button>
                </div>
            </div>
        </div>
    `;
};

window.closeOverlay = function (id) { document.getElementById(id).style.display = 'none'; };

window.addEventListener('load', () => {
    window.switchTab('home');
    setInterval(() => {
        currentBannerIdx = (currentBannerIdx + 1) % banners.length;
        const track = document.getElementById('banner-track');
        if (track) {
            track.style.transform = `translateX(-${currentBannerIdx * 100}%)`;
            document.querySelectorAll('.indicator-dot').forEach((d, i) => d.classList.toggle('active', i === currentBannerIdx));
        }
    }, 5000);
});
