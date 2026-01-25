// 精诚中医 - 数字化诊疗全链路终极旗舰版 (修复与整合版)
const products = [
    {
        id: 1, category: "灵芝专区", name: "精诚 · 破壁灵芝孢子粉 (旗舰版)", price: 698,
        desc: "【金奖产品】非遗传承工艺 | 灵芝三萜 ≥ 10%", img: "assets/tcm/lingzhi_hero_premium.png",
        params: [{ label: "规格", value: "2g*30袋/木盒" }, { label: "产地", value: "长白山核心保护区" }],
        details: ["assets/tcm/lingzhi_detail_1.png", "assets/tcm/lingzhi_detail_2.png", "assets/tcm/lingzhi_detail_3.png"],
        richText: `<div style="padding: 10px 0;"><h4 style="color: #8C1C13; border-left: 3px solid #8C1C13; padding-left: 8px; margin-bottom: 10px;">大医精诚 · 选材严苛</h4><p style="font-size: 13px; color: #666; line-height: 1.8;">每一粒均经过人工筛选，确保破壁均匀且无焦苦味。</p><div style="text-align:center;margin-top:15px;"><img src="assets/tcm/jingcheng_seal.png" style="width:40px;opacity:0.6;"></div></div>`
    },
    { id: 2, category: "灵芝专区", name: "长白山特级灵芝切片 (礼盒装)", price: 128, desc: "野生抚育 | 煲汤首选 | 滋补养生", img: "assets/tcm/article_reishi.png" },
    { id: 3, category: "养生茶饮", name: "灵芝养生茶饮包 (护肝系列)", price: 59, desc: "上班族首选 | 护肝明目 | 独立包装", img: "assets/tcm/tea_icon.png" },
    { id: 6, category: "药食同源", name: "宁夏特级红枸杞 (500g)", price: 45, desc: "粒大饱满 | 滋补肝肾 | 煲汤泡茶", img: "assets/tcm/article_soup.png" }
];

const articles = [
    { id: 1, title: "春季护肝正当时，教你喝出好气色", summary: "春天万物复苏，中医认为'春气通肝'...", cover: "assets/tcm/article_spring.png", author: "张景和 老中医", avatar: "assets/tcm/doctor_avatar.png", content: "<p>春天是养肝的黄金期...</p>", category: "四时养生" },
    { id: 2, title: "灵芝三萜与多糖的科学奥秘", summary: "为什么破壁率是衡量孢子粉的核心指标？", cover: "assets/tcm/article_reishi.png", author: "精诚研究院", avatar: "assets/tcm/doctor_avatar.png", content: "<p>灵芝的活性成分主要在于...</p>", category: "本草百科" }
];

const mockData = {
    doctors: [{ id: 1, name: "张景和", title: "首席名医", dept: "中医内科", avatar: "assets/tcm/doctor_avatar.png", tags: ["40年经验", "传承人"], intro: "擅长脾胃调理与补益。" }],
    medicalHistory: [{ id: "REC20260120", date: "2026-01-20", docName: "张景和", dept: "内科", diagnosis: "脾胃失调", advice: "建议服用灵芝孢子粉。", status: "已结诊", recommendId: 1 }],
    healthRecord: { type: "气虚质", advice: "宜补气养血。", index: 85, radarData: [80, 40, 60, 30, 50] },
    meridians: [
        { time: "05:00-07:00", name: "大肠经", action: "清肠排毒", icon: "fas fa-toilet" },
        { time: "07:00-09:00", name: "胃经", action: "吃早餐摄取营养", icon: "fas fa-utensils" },
        { time: "09:00-11:00", name: "脾经", action: "消化运化", icon: "fas fa-walking" },
        { time: "11:00-13:00", name: "心经", action: "午后小憩安神", icon: "fas fa-bed" },
        { time: "13:00-15:00", name: "小肠经", action: "多喝水促进循环", icon: "fas fa-tint" },
        { time: "15:00-17:00", name: "膀胱经", action: "适量运动代谢", icon: "fas fa-running" },
        { time: "17:00-19:00", name: "肾经", action: "静坐补充元气", icon: "fas fa-chair" },
        { time: "19:00-21:00", name: "心包经", action: "心情舒畅减压", icon: "fas fa-smile" },
        { time: "21:00-23:00", name: "三焦经", action: "准备入睡修复", icon: "fas fa-moon" },
        { time: "23:00-05:00", name: "肝胆经", action: "深度睡眠排毒", icon: "fas fa-bed" }
    ],
    symptoms: [{ name: "失眠多梦", icon: "fas fa-moon", dept: "神志病科" }, { name: "脾胃虚冷", icon: "fas fa-utensils", dept: "中医内科" }]
};

const physioServices = [
    { id: 1, name: "头部经络深层推拿", price: "298", duration: "45", desc: "缓解失眠头痛。", img: "assets/tcm/article_acupuncture.png", tags: ["安神"] },
    { id: 2, name: "肩颈理筋专项调理", price: "358", duration: "60", desc: "针对富贵包、颈椎僵硬。", img: "assets/tcm/article_acupuncture.png", tags: ["解压"] }
];

let cart = [];
let messages = [{ role: 'doctor', text: '您好，精诚咨询为您服务。有什么症状可以反馈？' }];

window.switchTab = function (tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-item').forEach(item => item.classList.toggle('active', item.getAttribute('onclick').includes(tabId)));
    if (tabId === 'home') renderHomeComponents();
    if (tabId === 'category') renderCategory("灵芝专区");
    if (tabId === 'knowledge') renderArticles();
};

const banners = [
    { title: "大医精诚", subtitle: "百年传承核心 · 道地药食专供", img: "assets/tcm/jingcheng_hall.png" },
    { title: "春季护肝", subtitle: "春木生发 · 顺时养生正当时", img: "assets/tcm/article_spring.png" },
    { title: "邻里健康计划", subtitle: "进社区 · 送康养 · 惠居民", img: "assets/tcm/lingzhi_hero_premium.png" }
];

let currentBannerIndex = 0;

function renderHomeComponents() {
    const home = document.getElementById('home');
    home.querySelectorAll('.health-clock, .solar-term-section').forEach(el => {
        if (!el.classList.contains('solar-term-section') || el.style.background.includes('E8F5E9')) {
            // 仅保留社区横幅，移除旧的时钟和旧的节气
            if (!el.onclick || !el.onclick.toString().includes('社区药房')) el.remove();
        }
    });

    // 渲染 Banner 轮播
    const track = document.getElementById('banner-track');
    const dots = document.getElementById('banner-dots');

    if (track && dots) {
        track.innerHTML = banners.map(b => `
            <div class="banner-slide" style="background-image: url('${b.img}')">
                <div class="banner-overlay">
                    <h2 style="font-size: 22px; font-weight: 800; letter-spacing: 2px;">${b.title}</h2>
                    <p style="font-size: 11px; opacity: 0.85;">${b.subtitle}</p>
                </div>
            </div>
        `).join('');

        dots.innerHTML = banners.map((_, i) => `<div class="indicator-dot ${i === 0 ? 'active' : ''}"></div>`).join('');

        if (window.bannerTimer) clearInterval(window.bannerTimer);
        window.bannerTimer = setInterval(() => {
            currentBannerIndex = (currentBannerIndex + 1) % banners.length;
            track.style.transform = `translateX(-${currentBannerIndex * 100}%)`;
            const allDots = dots.querySelectorAll('.indicator-dot');
            allDots.forEach((d, i) => d.classList.toggle('active', i === currentBannerIndex));
        }, 4000);
    }

    // 1. 渲染养生时钟
    const h = new Date().getHours();
    const curr = mockData.meridians.find(m => {
        const [start, end] = m.time.split('-').map(s => parseInt(s));
        return h >= start && h < (end || 24);
    }) || mockData.meridians[0];
    const clockHtml = `<div class="health-clock"><div class="clock-icon-box"><i class="${curr.icon}"></i></div><div class="clock-content"><div style="font-weight:700;font-size:14px;color:var(--primary-color);">子午流注 · ${curr.name}执事</div><div style="font-size:11px;color:#666;margin-top:4px;">时辰建议：${curr.action}</div></div></div>`;

    const bannerContainer = document.getElementById('main-banner');
    if (!home.querySelector('.health-clock')) {
        bannerContainer.insertAdjacentHTML('afterend', clockHtml);
    }
}

function renderCategory(catName) {
    const container = document.querySelector('.main-cate');
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.toggle('active', item.innerText === catName));
    const filtered = products.filter(p => p.category === catName);
    let html = `<div class="cate-grid">`;
    filtered.forEach(p => { html += `<div class="cate-item" onclick="window.openProduct(${p.id})"><div class="cate-img-box"><img src="${p.img}"></div><span style="font-size:11px;margin-top:8px;">${p.name.split(' · ').pop()}</span><span style="font-size:11px;color:var(--primary-color);font-weight:700;">¥ ${p.price}</span></div>`; });
    container.innerHTML = html + "</div>";
}

function renderArticles() {
    const container = document.getElementById('knowledge');
    let html = `<div style="padding:16px;display:flex;gap:10px;overflow-x:auto;"><div class="tip-badge">全部</div><div class="tip-badge">四时养生</div></div><div class="article-list">`;
    articles.forEach(art => { html += `<div class="article-card" onclick="window.openArticle(${art.id})"><div class="art-cover" style="background-image:url('${art.cover}')"></div><div class="art-content"><div style="font-size:10px;color:var(--secondary-color);"># ${art.category}</div><div class="art-title">${art.title}</div><div class="art-footer"><div class="art-author"><div class="author-avatar" style="background-image:url('${art.avatar}')"></div><span>${art.author}</span></div></div></div></div>`; });
    container.innerHTML = html + "</div>";
}

window.openProduct = function (id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    document.getElementById('detail-title').innerText = p.name;
    document.getElementById('detail-price').innerText = `¥ ${p.price}`;
    document.getElementById('detail-desc').innerText = p.desc;
    document.getElementById('detail-img-box').style.backgroundImage = `url('${p.img}')`;
    document.getElementById('product-full-content').innerHTML = p.richText || "";
    document.querySelector('#product-detail .btn-primary').setAttribute('onclick', `window.addToCart(${id})`);
    document.getElementById('product-detail').style.display = 'flex';
};

window.showModuleDetail = function (title) {
    const overlay = document.getElementById('module-detail');
    const container = overlay.querySelector('.detail-content');
    document.getElementById('module-detail-title').innerText = title;
    container.innerHTML = '';
    if (title === '智能导诊') renderTriage(container);
    else if (title === '社区药房' || title === '邻里服务') renderCommunityPortal(container);
    else if (title === 'AI 舌诊') renderTongueScan(container);
    else if (title === '健康档案' || title === '我的病历') renderHealthRecords(container);
    else if (title === '预约理疗') renderPhysioServices(container);
    else if (title === '关于精诚') renderBrandStory(container);
    else if (title === '客服咨询' || title === '专家问诊') renderChat(container);
    else if (title === '我的购物车') renderCart(container);
    else container.innerHTML = `<div class="empty-state"><i class="fas fa-tools"></i><p>${title} 建设中</p></div>`;
    overlay.style.display = 'flex';
};

function renderCommunityPortal(container) {
    container.style.padding = '0';
    container.innerHTML = `
        <div class="community-portal">
            <div class="delivery-status">
                <i class="fas fa-truck-moving"></i>
                <span>您的订单正在飞速配送，预计15分钟内送达</span>
            </div>

            <div class="community-banner">
                <div>
                    <h3 style="font-size:20px;">邻里精诚 · 社区药房</h3>
                    <p style="font-size:12px; opacity:0.8; margin-top:5px;">您身边的专业本草管家</p>
                </div>
                <i class="fas fa-clinic-medical" style="font-size:40px; opacity:0.2;"></i>
            </div>

            <div class="section-title"><span>附近门店</span></div>
            <div class="neighbor-card">
                <div style="width:50px; height:50px; background:var(--primary-color); border-radius:8px; display:flex; justify-content:center; align-items:center; color:white;">
                    <i class="fas fa-map-marked-alt"></i>
                </div>
                <div class="neighbor-info">
                    <h4>精诚中医馆 (静安社区旗舰店)</h4>
                    <p>距离您 450m | 营业中 08:00-21:00</p>
                    <div style="margin-top:8px;"><span class="tcm-tag tag-gold" style="font-size:9px;">药剂师在岗</span><span class="tcm-tag" style="font-size:9px; background:#E8F5E9; color:#2E7D32;">支持医保</span></div>
                </div>
            </div>

            <div class="section-title"><span>社区常备 · 快捷购药</span></div>
            <div class="quick-buy-grid">
                <div class="quick-buy-item" onclick="window.addToCart(3)">
                    <div style="font-size:18px; color:var(--primary-color);"><i class="fas fa-mug-hot"></i></div>
                    <div><div style="font-size:13px; font-weight:700;">感冒止咳</div><div style="font-size:10px; color:#999;">本草特配</div></div>
                </div>
                <div class="quick-buy-item" onclick="window.addToCart(6)">
                    <div style="font-size:18px; color:var(--primary-color);"><i class="fas fa-leaf"></i></div>
                    <div><div style="font-size:13px; font-weight:700;">清火解毒</div><div style="font-size:10px; color:#999;">宁夏枸杞</div></div>
                </div>
                <div class="quick-buy-item" onclick="window.addToCart(1)">
                    <div style="font-size:18px; color:var(--primary-color);"><i class="fas fa-shield-alt"></i></div>
                    <div><div style="font-size:13px; font-weight:700;">提高免疫</div><div style="font-size:10px; color:#999;">孢子粉特刊</div></div>
                </div>
                <div class="quick-buy-item" onclick="window.showModuleDetail('客服咨询')">
                    <div style="font-size:18px; color:#666; text-align:center; width:100%;"><i class="fas fa-ellipsis-h"></i><div style="font-size:12px; margin-top:5px;">更多建议</div></div>
                </div>
            </div>

            <div class="action-footer" style="margin-top:40px;">
                <button class="btn-primary" onclick="window.showModuleDetail('专家问诊')">连线社区全科中医</button>
            </div>
        </div>
    `;
}

function renderTongueScan(container) {
    container.style.padding = '0';
    container.innerHTML = `
        <div class="tongue-scan-container">
            <div class="scan-viewfinder">
                <div class="scan-frame">
                    <div id="scan-line-active" style="display:none;" class="scan-line"></div>
                </div>
                <div style="position:absolute; top:40px; text-align:center; width:100%;">
                    <h4 style="letter-spacing:2px;">AI 智能辨证扫描</h4>
                    <p style="font-size:11px; opacity:0.6; margin-top:8px;">请将舌体对准框内，保持光线充沛</p>
                </div>
            </div>
            <div class="scan-tips">
                <div id="scan-status-text" style="font-size:13px; margin-bottom:15px;">等待拍摄...</div>
                <div class="scan-btn-capture" onclick="window.startScanningEffect()"></div>
                <p style="font-size:10px; color:#666; margin-top:10px;">由 精诚中医AI实验室 提供技术支持</p>
            </div>
        </div>
    `;
}

window.startScanningEffect = function () {
    const line = document.getElementById('scan-line-active');
    const status = document.getElementById('scan-status-text');
    line.style.display = 'block';
    status.innerText = '正在提取舌苔特征...';

    setTimeout(() => {
        status.innerText = '比对《大医精诚》古籍数据库...';
    }, 1500);

    setTimeout(() => {
        renderTongueResult(document.querySelector('#module-detail .detail-content'));
    }, 3500);
};

function renderTongueResult(container) {
    container.style.padding = '10px 0';
    container.innerHTML = `
        <div class="tongue-result-card" style="animation: slideUp 0.5s ease;">
            <div style="text-align:center; margin-bottom:20px;">
                <div class="tcm-tag tag-gold">扫描分析报告</div>
                <h3 style="font-size:20px; color:var(--primary-color); margin-top:10px;">脾胃湿热 · 辨证参考</h3>
            </div>
            
            <div class="result-stat-grid">
                <div class="stat-box">
                    <div style="font-size:11px; color:#999;">舌质</div>
                    <div style="font-weight:700; margin-top:4px; color:#8C1C13;">偏红</div>
                </div>
                <div class="stat-box">
                    <div style="font-size:11px; color:#999;">舌苔</div>
                    <div style="font-weight:700; margin-top:4px; color:#8C1C13;">黄腻</div>
                </div>
            </div>

            <div style="margin-top:20px;">
                <div style="font-weight:800; border-left:3px solid var(--primary-color); padding-left:10px; margin-bottom:10px;">症状解读</div>
                <p style="font-size:13px; color:#666; line-height:1.6;">AI通过色彩识别分析发现，您的舌质偏红、苔色发黄且略显粘腻，这在中医辨证上常表现为“脾胃湿热”。可能伴有口苦、大便黏滞、困倦等感受。</p>
            </div>

            <div style="margin-top:20px; padding-top:15px; border-top:1px dashed #DDD;">
                <div style="font-weight:800; color:var(--secondary-color); margin-bottom:10px;">调理方案</div>
                <p style="font-size:13px; color:#666; line-height:1.6;">宜清热利湿。建议饮食清淡，可适当饮用薏米芡实水，配合灵芝养生茶饮，辅助运化脾胃。</p>
            </div>

            <button class="btn-primary" style="margin-top:30px;" onclick="window.showModuleDetail('问诊谈话')">咨询张教授获取精准方案</button>
        </div>
    `;
}

function renderTriage(container) {
    container.innerHTML = `<div style="padding:20px;"><div class="symptom-grid">${mockData.symptoms.map(s => `<div class="symptom-item" onclick="window.selectSymptom(this, '${s.dept}')"><i class="${s.icon} symptom-icon"></i><div style="font-size:11px;">${s.name}</div></div>`).join('')}</div><div id="triage-result"></div></div>`;
}
window.selectSymptom = function (el, dept) {
    document.querySelectorAll('.symptom-item').forEach(i => i.classList.remove('active')); el.classList.add('active');
    document.getElementById('triage-result').innerHTML = `<div style="background:rgba(47, 82, 51, 0.05);padding:16px;border-radius:12px;margin-top:20px;"><h5 style="color:#2F5233;">推荐：${dept}</h5><button class="btn-primary" style="height:32px;margin-top:10px;" onclick="window.showModuleDetail('客服咨询')">立即咨询</button></div>`;
};

function renderHealthRecords(container) {
    container.innerHTML = `<div style="padding:16px;"><div style="background:linear-gradient(135deg,#2F5233, #1A1A1A);color:white;padding:24px;border-radius:16px;margin-bottom:20px;"><h3>${mockData.healthRecord.type}</h3><p style="font-size:12px;">建议：${mockData.healthRecord.advice}</p></div><div id="radar-box" class="radar-chart-container"></div><div class="section-title"><span>就诊史</span></div><div class="record-timeline">${mockData.medicalHistory.map(rec => `<div class="timeline-item"><div class="timeline-date">${rec.date}</div><div class="timeline-card" onclick="window.openMedicalDetail('${rec.id}')"><div style="font-weight:700;">${rec.diagnosis}</div></div></div>`).join('')}</div></div>`;
    setTimeout(drawRadarChart, 100);
}
function drawRadarChart() {
    const box = document.getElementById('radar-box'); if (!box) return;
    const size = 200, center = 100, radius = 80, data = mockData.healthRecord.radarData;
    const pts = data.map((v, i) => { const a = (i * 2 * Math.PI) / 5 - Math.PI / 2; const r = (radius * v) / 100; return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`; }).join(' ');
    box.innerHTML = `<svg viewBox="0 0 200 200"><polygon points="${pts}" fill="rgba(140, 28, 19, 0.2)" stroke="var(--primary-color)" stroke-width="2"/></svg>`;
}

function renderPhysioServices(container) {
    container.innerHTML = `<div class="service-list-grid">` + physioServices.map(s => `<div class="service-card" onclick="window.openBooking(${s.id})"><div class="service-img" style="background-image:url('${s.img}')"></div><div class="service-info"><h4 style="font-size:16px;">${s.name}</h4><div style="color:var(--primary-color);font-weight:700;">¥ ${s.price}</div></div></div>`).join('') + `</div>`;
}
window.openBooking = function (id) { const s = physioServices.find(x => x.id === id); alert(`已触发[${s.name}]预约面板...\n此处模拟打开预约时段选择。`); };

function renderBrandStory(container) {
    container.innerHTML = `<div class="brand-story-container"><div class="story-hero" style="background-image:url('assets/tcm/jingcheng_hall.png');"></div><div class="story-section"><h3>大医精诚 · 创始初衷</h3><div class="story-content">精诚中医馆由灵芝世家传人创立，坚持地道本草，匠心诊疗...</div></div></div>`;
}

function renderChat(container) {
    container.style.padding = '0'; container.innerHTML = `<div class="chat-container"><div class="chat-messages" id="msgs-box">${messages.map(m => `<div class="msg-row ${m.role}"><div class="msg-bubble">${m.text}</div></div>`).join('')}</div><div class="chat-input-bar"><input type="text" class="chat-input" id="c-val" placeholder="描述症状"><i class="fas fa-paper-plane" onclick="window.sendMessage()" style="color:var(--primary-color);"></i></div></div>`;
}
window.sendMessage = function () { const v = document.getElementById('c-val').value; if (!v) return; messages.push({ role: 'user', text: v }); setTimeout(() => { messages.push({ role: 'doctor', text: "收到，助手正在为您对接张教授。" }); renderChat(document.querySelector('#module-detail .detail-content')); }, 800); renderChat(document.querySelector('#module-detail .detail-content')); };

window.addToCart = function (id) { const p = products.find(x => x.id === id); cart.push({ product: p, qty: 1 }); updateCartIcon(); showToast("已入购物袋"); };
function updateCartIcon() { const c = cart.length; document.querySelectorAll('.cart-count').forEach(b => { b.innerText = c; b.style.display = c > 0 ? 'block' : 'none'; }); }
function showToast(m) { const t = document.createElement('div'); t.style = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.7);color:white;padding:10px 20px;border-radius:20px;z-index:9999;"; t.innerText = m; document.body.appendChild(t); setTimeout(() => t.remove(), 1500); }

window.openArticle = function (id) { const a = articles.find(x => x.id === id); const o = document.getElementById('article-detail'); o.querySelector('.detail-title').innerText = a.title; o.querySelector('.detail-body').innerHTML = a.content; o.style.display = 'flex'; };
window.openMedicalDetail = function (id) { alert("正在调取编号[" + id + "]的处方电子存根..."); };
window.closeOverlay = function (id) { document.getElementById(id).style.display = 'none'; };

window.addEventListener('load', () => {
    window.switchTab('home');
    document.querySelectorAll('.sidebar-item').forEach(i => i.click()); // 初始化首个分类
});
