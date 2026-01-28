/**
 * 精诚灵芝科创基地 - 智慧全产业链 App 逻辑
 * 涵盖：种植监控、科创研习、甄选商城、文创中心、研学预约
 */

const products = [
    { id: 1, cat: "核心产品", name: "臻博园·破壁灵芝孢子粉", price: 898, desc: "科创基地核心产出 | 院内制剂级标准 | 高倍三萜", img: "assets/tcm/lingzhi_hero_premium.png", type: "base" },
    { id: 2, cat: "道地药材", name: "原产地特级灵芝切片", price: 158, desc: "长白山基地直供 | 无硫熏蒸 | 足年份采集", img: "assets/tcm/article_reishi.png", type: "base" },
    { id: 3, cat: "文创摆件", name: "活态灵芝盆景·大医精诚", price: 1280, desc: "基地特培活态灵芝 | 招财纳福 | 艺术观赏", img: "assets/tcm/jingcheng_hall.png", type: "creative" },
    { id: 4, cat: "文创摆件", name: "微缩基地·灵芝景观玻璃盒", price: 298, desc: "纯手工复刻基地微景观 | 桌面治愈系", img: "assets/tcm/article_spring.png", type: "creative" },
    { id: 5, cat: "研学教育", name: "灵芝科教标本礼包", price: 198, desc: "青少年科创套装 | 含灵艺剪纸与生长观察", img: "assets/tcm/article_soup.png", type: "edu" },
    { id: 6, cat: "研学教育", name: "基地实地研习·半日通票", price: 68, desc: "专业导师讲解 | 实验室参观 | 亲手采摘体验", img: "assets/tcm/article_acupuncture.png", type: "tour" },
    { id: 7, cat: "睡眠康养", name: "酸枣仁百合舒睡茶", price: 79, desc: "汉方古法配比 | 0糖0卡 | 舒缓助眠", img: "assets/tcm/tea_icon.png", type: "sleep" },
    { id: 8, cat: "睡眠康养", name: "薰衣草灵芝助眠香囊", price: 49, desc: "安神定志 | 随身携带 | 纯天然草本", img: "assets/tcm/tcm_herbs_art_v2_1768660271435.png", type: "sleep" },
    { id: 9, cat: "睡眠康养", name: "磁疗护颈决明子枕", price: 199, desc: "人体工学设计 | 决明子填充 | 深度睡眠", img: "assets/tcm/article_spring.png", type: "sleep" }
];

const researchItems = [
    { id: 1, title: "新型低温破壁技术通过国家专利认证", summary: "精诚实验室历时三年研发，实现了全活性成分保留...", cover: "assets/tcm/lingzhi_detail_1.png", tag: "研发前沿" },
    { id: 2, title: "5G+物联网在灵芝种植基地的深度应用", summary: "每一株灵芝都有一个实时监控系统，精准控制温湿光...", cover: "assets/tcm/lingzhi_detail_2.png", tag: "智慧农业" }
];

const studyTours = [
    { id: 101, name: "周末亲子·小小科创家营", date: "本周六/日", seats: "余5位", price: 299, img: "assets/tcm/lingzhi_banner.png" },
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
                    <img src="assets/tcm/tcm_shanshui_bg_1768660221872.png" style="width:100%; height:100%; object-fit:cover; opacity:0.6;">
                    <div style="position:absolute; top:10px; right:10px; background:rgba(255,0,0,0.7); font-size:10px; padding:3px 6px; border-radius:4px; color:white;">LIVE</div>
                    <i class="fas fa-play-circle" style="font-size:48px; position:absolute;"></i>
                </div>
                <div style="margin-top:20px; text-align:left;">
                    <h4 style="color:var(--primary-color);">您的云认领灵芝：GC-9908</h4>
                    <p style="font-size:12px; color:#666; margin-top:8px;">状态：<span style="color:green;">生长期</span> | 土壤湿度：68% | 光照：适宜</p>
                    <div style="height:4px; background:#EEE; margin-top:10px; border-radius:2px;"><div style="width:70%; height:4px; background:var(--primary-color); border-radius:2px;"></div></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:20px;">
                        <button class="btn-primary" style="height:36px; padding:0; font-size:12px;">🎥 生长延时摄影</button>
                        <button class="btn-primary" style="height:36px; padding:0; font-size:12px; background:var(--secondary-color);">🌧️ 远程喷灌</button>
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
                <p style="font-size:14px; color:#666;">扫描产品包装上的溯源二维码</p>
                
                <div style="margin-top:30px; padding:16px; background:#F9F7F2; border-radius:12px; text-align:left; border:1px solid rgba(0,0,0,0.05);">
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                        <i class="fas fa-check-circle" style="color:green;"></i>
                        <span style="font-weight:700;">正品认证通过</span>
                    </div>
                    <div style="font-size:11px; color:#666; line-height:1.8;">
                        <div>产品名称：臻博园®破壁灵芝孢子粉</div>
                        <div>溯源编码：8827-1928-3847</div>
                        <div>采摘日期：2025-09-15</div>
                        <div>检测报告：<span style="color:blue; text-decoration:underline;">CTI检测合格.pdf</span></div>
                    </div>
                </div>
            </div>
         `;
    } else if (title === '睡眠康养') {
        content.innerHTML = `
            <div style="padding:20px;">
                <!-- Night Tech Card -->
                <div style="position:relative; border-radius:16px; overflow:hidden; padding:24px; color:white; box-shadow:0 10px 30px rgba(10,20,50,0.4);">
                    <!-- Background with Filter -->
                    <div style="position:absolute; inset:0; background-image:url('assets/tcm/tcm_shanshui_bg_1768660221872.png'); background-size:cover; filter: brightness(0.3) hue-rotate(190deg) saturate(1.5) contrast(1.2);"></div>
                    <!-- Tech Grid Overlay -->
                    <div style="position:absolute; inset:0; background-image: linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent); background-size:50px 50px;"></div>
                    
                    <div style="position:relative; z-index:1; text-align:center;">
                        <div style="width:60px; height:60px; margin:0 auto 15px; background:rgba(255,255,255,0.1); border-radius:30px; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(5px);">
                            <i class="fas fa-moon" style="font-size:28px; color:#FFD700; text-shadow:0 0 10px rgba(255, 215, 0, 0.5);"></i>
                        </div>
                        <h3 style="margin-bottom:8px; font-size:20px; letter-spacing:1px;">中医情志助眠检测</h3>
                        <p style="font-size:12px; opacity:0.8; font-family:'Songti SC', serif;">“阳入于阴则寐，阳出于阴则寤”</p>
                        
                        <div style="margin-top:20px; display:flex; justify-content:center; gap:15px; font-size:11px; opacity:0.9;">
                            <div style="background:rgba(0,0,0,0.3); padding:5px 10px; border-radius:12px;"><i class="fas fa-fingerprint"></i> 体质辨识</div>
                            <div style="background:rgba(0,0,0,0.3); padding:5px 10px; border-radius:12px;"><i class="fas fa-wave-square"></i> 脑波分析</div>
                        </div>

                        <button style="margin-top:25px; background:linear-gradient(90deg, #FFD700, #FFA000); color:#333; border:none; padding:10px 28px; border-radius:25px; font-weight:700; box-shadow:0 4px 15px rgba(255,160,0,0.4);">开始 AI 问诊</button>
                    </div>
                </div>

                <div style="margin-top:25px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h4 style="border-left:4px solid var(--primary-color); padding-left:10px;">好眠甄选</h4>
                        <span style="font-size:12px; color:#999;">院内制剂标准</span>
                    </div>
                    <div style="display:flex; overflow-x:auto; gap:12px; padding-bottom:10px;">
                        ${products.filter(p => p.type === 'sleep').map(p => `
                            <div style="flex-shrink:0; width:120px; background:white; border-radius:10px; padding:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); position:relative; overflow:hidden;" onclick="window.openProduct(${p.id})">
                                <img src="${p.img}" style="width:100%; height:90px; object-fit:contain; border-radius:6px; background:#F8F8F8;">
                                <div style="font-size:12px; font-weight:700; margin-top:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
                                <div style="color:var(--primary-color); font-weight:600; font-size:12px;">¥ ${p.price}</div>
                                <div style="position:absolute; top:5px; right:5px; width:6px; height:6px; background:#4CAF50; border-radius:50%;"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="margin-top:15px;">
                    <h4 style="border-left:4px solid var(--secondary-color); padding-left:10px; margin-bottom:15px;">五行音乐疗愈</h4>
                    <div style="background:white; border-radius:12px; padding:6px 16px; box-shadow:var(--shadow-soft);">
                         <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid #F5F5F5;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:36px; height:36px; background:#E8F5E9; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#2E7D32;"><i class="fas fa-water"></i></div>
                                <div>
                                    <div style="font-size:14px; font-weight:600;">羽音 · 长白流水</div>
                                    <div style="font-size:10px; color:#999;">清凉降火，入肾经</div>
                                </div>
                            </div>
                            <i class="fas fa-play-circle" style="color:var(--secondary-color); font-size:24px; cursor:pointer; opacity:0.8;"></i>
                         </div>
                         <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 0;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div style="width:36px; height:36px; background:#E3F2FD; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#1565C0;"><i class="fas fa-wind"></i></div>
                                <div>
                                    <div style="font-size:14px; font-weight:600;">角音 · 林海松涛</div>
                                    <div style="font-size:10px; color:#999;">疏肝理气，入肝经</div>
                                </div>
                            </div>
                            <i class="fas fa-play-circle" style="color:var(--secondary-color); font-size:24px; cursor:pointer; opacity:0.8;"></i>
                         </div>
                    </div>
                </div>
            </div>
        `;
    } else if (title === '基地实景') {
        content.innerHTML = `
             <div style="position:relative; width:100%; height:450px; background:#000; overflow:hidden;">
                <!-- Live Feed BG -->
                <img src="assets/tcm/tcm_shanshui_bg_1768660221872.png" style="width:100%; height:100%; object-fit:cover; opacity:0.6; filter:grayscale(0.4);">
                
                <!-- HUD Overlay -->
                <div style="position:absolute; inset:0; padding:20px; font-family:'Courier New', monospace; color:rgba(100,255,100,0.9); pointer-events:none;">
                    <!-- Top Corners -->
                    <div style="display:flex; justify-content:space-between;">
                        <div style="border:1px solid rgba(100,255,100,0.5); padding:4px 8px; font-size:10px;">CAM_04 [LIVE]</div>
                        <div style="border:1px solid rgba(100,255,100,0.5); padding:4px 8px; font-size:10px;">REC ● 00:42:15</div>
                    </div>
                    
                    <!-- Center Crosshair -->
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:60px; height:60px; border:1px solid rgba(100,255,100,0.3); border-radius:30px; display:flex; justify-content:center; align-items:center;">
                        <div style="width:4px; height:4px; background:rgba(100,255,100,0.8); border-radius:2px;"></div>
                    </div>

                    <!-- Sensor Data Grid -->
                    <div style="position:absolute; bottom:80px; left:20px; font-size:10px; line-height:1.6; text-shadow:0 0 5px rgba(0,255,0,0.5);">
                        <div>TEMP: <span style="font-size:14px; font-weight:700;">22.4°C</span></div>
                        <div>HUMID: <span style="font-size:14px; font-weight:700;">68%</span></div>
                        <div>CO2: <span style="font-size:14px; font-weight:700;">412 ppm</span></div>
                    </div>

                     <div style="position:absolute; bottom:80px; right:20px; font-size:10px; line-height:1.6; text-align:right;">
                        <div>SPORE_DENSITY</div>
                        <div style="font-size:14px; font-weight:700;">HIGH</div>
                        <div>GROWTH_RATE: +12%</div>
                    </div>
                </div>

                <div style="position:absolute; bottom:20px; left:20px; right:20px; background:rgba(0,0,0,0.6); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; backdrop-filter:blur(4px);">
                    <div style="color:white; font-size:12px;">当前机位：1号大棚 · 核心育种区</div>
                    <div style="display:flex; gap:15px; color:white;">
                        <i class="fas fa-expand" style="cursor:pointer;"></i>
                        <i class="fas fa-camera" style="cursor:pointer;"></i>
                    </div>
                </div>
                
                <div style="position:absolute; top:50%; width:100%; text-align:center; color:rgba(100,255,100,0.8); font-size:10px; letter-spacing:2px; animation:blink 2s infinite;">System Calibrated</div>
                <style>@keyframes blink { 0%,100% {opacity:0.3} 50% {opacity:1} }</style>
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
                    <span style="font-size:10px; background:#FFF0F0; color:var(--primary-color); padding:2px 6px; border-radius:4px;">自营</span>
                </div>
                
                <div style="margin-top:20px; background:#F9F9F9; padding:15px; border-radius:12px;">
                    <div style="font-size:13px; font-weight:700; margin-bottom:8px;">商品简介</div>
                    <p style="color:#666; font-size:13px; line-height:1.6;">${p.desc}。本产品源自精诚科创基地，严格遵循GMP标准生产，全程可溯源。</p>
                </div>

                <div style="margin-top:20px;">
                    <div style="font-size:13px; font-weight:700; margin-bottom:10px;">基地服务</div>
                    <div style="display:flex; gap:15px; flex-wrap:wrap;">
                        <div style="display:flex; align-items:center; gap:5px; font-size:12px; color:#555;"><i class="fas fa-check-circle" style="color:var(--primary-color);"></i> 官方直营</div>
                        <div style="display:flex; align-items:center; gap:5px; font-size:12px; color:#555;"><i class="fas fa-truck-fast" style="color:var(--primary-color);"></i> 顺丰包邮</div>
                        <div style="display:flex; align-items:center; gap:5px; font-size:12px; color:#555;"><i class="fas fa-shield-alt" style="color:var(--primary-color);"></i> 正品保险</div>
                    </div>
                </div>

                <div style="margin-top:30px; display:flex; gap:15px;">
                    <button style="flex:1; height:44px; border:1px solid #DDD; background:white; border-radius:22px; color:#333; font-weight:600;">加入购物车</button>
                    <button class="btn-primary" style="flex:1; height:44px; border-radius:22px; box-shadow:0 4px 10px rgba(140,28,19,0.3);" onclick="alert('已成功下单！工作人员将尽快联系您。')">立即购买</button>
                </div>
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
