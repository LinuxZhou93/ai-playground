// 精诚中医 - 数字化诊疗旗舰版 (节气养生与理疗预约增强)
const products = [
    {
        id: 1, category: "灵芝专区", name: "精诚 · 破壁灵芝孢子粉 (旗舰版)", price: 698,
        desc: "【金奖产品】非遗传承工艺 | 灵芝三萜 ≥ 10%", img: "assets/tcm/lingzhi_hero_premium.png",
        params: [{ label: "规格", value: "2g*30袋/木盒" }, { label: "产地", value: "长白山核心保护区" }],
        details: ["assets/tcm/lingzhi_detail_1.png", "assets/tcm/lingzhi_detail_2.png", "assets/tcm/lingzhi_detail_3.png"],
        richText: `<div style="padding: 10px 0;"><h4 style="color: #8C1C13; border-left: 3px solid #8C1C13; padding-left: 8px; margin-bottom: 10px;">大医精诚 · 选材严苛</h4><p style="font-size: 13px; color: #666; line-height: 1.8;">每一粒均经过人工筛选，确保破壁均匀且无焦苦味。</p></div>`
    },
    { id: 2, category: "灵芝专区", name: "长白山特级灵芝切片 (礼盒装)", price: 128, desc: "野生抚育 | 煲汤首选 | 滋补养生", img: "assets/tcm/article_reishi.png" },
    { id: 6, category: "药食同源", name: "宁夏特级红枸杞 (500g)", price: 45, desc: "粒大饱满 | 滋补肝肾 | 煲汤泡茶", img: "assets/tcm/article_soup.png" }
];

const solarTerms = [
    { name: "大寒", date: "01-20", advice: "大寒为岁终，宜早睡晚起，劳逸结合。饮食宜温补，如红枣、桂圆，忌食生冷，保护阳气。", bg: "assets/tcm/article_spring.png" },
    { name: "立春", date: "02-04", advice: "万物复苏，肝气渐旺。宜疏肝理气，多食韭菜、菠菜等生发之物，早起散步，舒展筋骨。", bg: "assets/tcm/article_spring.png" }
];

const physioServices = [
    { id: 1, name: "头部经络深层推拿", duration: "45", price: "298", desc: "缓解顽固性失眠、偏头痛，深层放松脑部神经。", img: "assets/tcm/article_acupuncture.png", tags: ["手法细腻", "安神助眠"] },
    { id: 2, name: "肩颈理筋·专项调理", duration: "60", price: "358", desc: "针对长期伏案导致的“富贵包”、颈椎僵硬，精准松解粘连。", img: "assets/tcm/article_acupuncture.png", tags: ["立竿见影", "资深技师"] },
    { id: 3, name: "全背循经艾灸", duration: "50", price: "268", desc: "调动全身阳气，祛湿排寒，改善长期疲劳感。", img: "assets/tcm/article_soup.png", tags: ["暖宫补元", "非遗工艺"] }
];

const mockData = {
    meridians: [
        { time: "03:00-05:00", name: "肺经", action: "熟睡，促进肺部排毒", icon: "fas fa-lungs" },
        { time: "05:00-07:00", name: "大肠经", action: "起床大便，清肠排毒", icon: "fas fa-toilet" },
        { time: "07:00-09:00", name: "胃经", action: "吃早餐，摄取营养", icon: "fas fa-utensils" },
        { time: "09:00-11:00", name: "脾经", action: "适度活动，利于消化", icon: "fas fa-walking" },
        { time: "11:00-13:00", name: "心经", action: "小憩片刻，养心安神", icon: "fas fa-bed" },
        { time: "13:00-15:00", name: "小肠经", action: "多喝水，促进各器官循环", icon: "fas fa-tint" },
        { time: "15:00-17:00", name: "膀胱经", action: "适量运动，有助于代谢", icon: "fas fa-running" },
        { time: "17:00-19:00", name: "肾经", action: "静坐，补充元气", icon: "fas fa-chair" },
        { time: "19:00-21:00", name: "心包经", action: "晚餐适宜清淡，心情舒畅", icon: "fas fa-smile" },
        { time: "21:00-23:00", name: "三焦经", action: "准备入睡，免疫修复", icon: "fas fa-moon" },
        { time: "23:00-01:00", name: "胆经", action: "进入深睡眠，肝胆修复", icon: "fas fa-bed" },
        { time: "01:00-03:00", name: "肝经", action: "深度睡眠，排毒养肝", icon: "fas fa-moon" }
    ],
    healthRecord: { type: "气虚质", advice: "宜补气养血，忌食生冷。", index: 85, radarData: [80, 40, 60, 30, 50] }
};

let cart = [];
let selectedTime = null;

window.switchTab = function (tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-item').forEach(item => item.classList.toggle('active', item.getAttribute('onclick').includes(tabId)));
    if (tabId === 'home') renderHomeComponents();
};

function renderHomeComponents() {
    const home = document.getElementById('home');
    const existing = home.querySelectorAll('.health-clock, .solar-term-section');
    existing.forEach(el => el.remove());

    // 1. 渲染养生时钟
    const h = new Date().getHours();
    const curr = mockData.meridians.find(m => {
        const [start, end] = m.time.split('-').map(s => parseInt(s.split(':')[0]));
        return h >= start && h < (end === 1 ? 25 : end);
    }) || mockData.meridians[0];

    const clockHtml = `
        <div class="health-clock">
            <div class="clock-icon-box"><i class="${curr.icon}"></i></div>
            <div class="clock-content">
                <div style="font-weight:700; font-size:14px; color:var(--primary-color);">子午流注 · ${curr.name}执事</div>
                <div style="font-size:11px; color:#666; margin-top:4px;">建议：${curr.action}</div>
            </div>
        </div>
    `;

    // 2. 渲染24节气建议
    const term = solarTerms[0]; // 模拟当前为大寒
    const termHtml = `
        <div class="solar-term-section" onclick="window.showModuleDetail('节气养生')">
            <div class="brand-seal-watermark" style="opacity: 0.05; width:120px; height:120px; right:-20px; top:-20px;"></div>
            <div class="solar-term-title"><span># ${term.name}时序</span><span style="font-size: 10px; font-weight: 400; background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 10px;">岁末温补</span></div>
            <p class="solar-term-desc">${term.advice}</p>
        </div>
    `;

    const banner = home.querySelector('.banner');
    banner.insertAdjacentHTML('afterend', clockHtml + termHtml);
}

window.showModuleDetail = function (title) {
    const overlay = document.getElementById('module-detail');
    const container = overlay.querySelector('.detail-content');
    document.getElementById('module-detail-title').innerText = title;
    container.innerHTML = '';

    if (title === '预约理疗' || title === '物理理疗') {
        renderPhysioServices(container);
    } else if (title === '健康档案') {
        renderHealthRecords(container);
    } else if (title === '品牌故事' || title === '关于精诚') {
        renderBrandStory(container);
    } else {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-tools"></i><p>${title} 建设中</p></div>`;
    }
    overlay.style.display = 'flex';
};

function renderBrandStory(container) {
    container.innerHTML = `
        <div class="brand-story-container">
            <div class="story-hero" style="background-image: url('assets/tcm/jingcheng_hall.png');"></div>
            
            <div class="story-section">
                <h3>从灵芝骨子里走出的医者</h3>
                <div class="story-content">
                    精诚中医馆的创始人，是位深耕长白山灵芝抚育数十载的“林中匠人”。他常说：“药材好，医术才能显神威。”
                    在多年抚育顶级孢子粉的过程中，他目睹了太多因为药材不地道、辨证不准确而延误病情的案例。
                </div>
            </div>

            <div class="story-section">
                <h3>大医精诚 · 馆开百载心</h3>
                <div class="story-content">
                    于是，“精诚中医馆”应运而生。在这里，我们坚持“道地药材，古法炮制”。所有的本草均来自创始人自有的灵芝基地及道地产区。
                    我们不只是在提供医疗方案，更是在延续一种“精于心、诚于行”的草本医疗文化。
                </div>
            </div>

            <div class="vision-card">
                <i class="fas fa-quote-left"></i>
                <div style="font-size: 16px; font-weight: 800; color: var(--primary-color); margin-bottom: 8px;">我们的信条</div>
                <div style="font-size: 13px; color: #666;">凡为医者，侠骨柔情；<br>凡为药者，地道精诚。</div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; opacity: 0.3;">
                <img src="assets/tcm/jingcheng_seal.png" style="width: 50px;">
            </div>
        </div>
    `;
}

function renderPhysioServices(container) {
    container.innerHTML = `<div class="service-list-grid">`;
    physioServices.forEach(srv => {
        container.innerHTML += `
            <div class="service-card" onclick="window.openBooking(${srv.id})">
                <div class="service-img" style="background-image: url('${srv.img}')"></div>
                <div class="service-info">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <h4 style="font-size:16px; font-weight:800;">${srv.name}</h4>
                        <span style="color:var(--primary-color); font-weight:700;">¥ ${srv.price}</span>
                    </div>
                    <p style="font-size:12px; color:#999; margin: 8px 0;">${srv.desc}</p>
                    <div class="service-tags">
                        ${srv.tags.map(t => `<span class="tcm-tag tag-gold" style="font-size:10px;">${t}</span>`).join('')}
                        <span class="tcm-tag" style="background:#F0F0F0; color:#666; font-size:10px;">${srv.duration}min</span>
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML += `</div>`;
}

window.openBooking = function (serviceId) {
    const srv = physioServices.find(s => s.id === serviceId);
    const overlay = document.getElementById('article-detail');
    overlay.querySelector('.detail-title').innerText = "理疗预约确认";
    overlay.querySelector('.author-name').innerText = srv.name;

    overlay.querySelector('.detail-body').innerHTML = `
        <div class="booking-panel">
            <h5 style="font-size:14px; margin-bottom:10px;">选择预约时段 (今日)</h5>
            <div class="time-slot-grid">
                <div class="time-slot" onclick="window.selectTime(this)">10:00</div>
                <div class="time-slot" onclick="window.selectTime(this)">14:30</div>
                <div class="time-slot" onclick="window.selectTime(this)">16:00</div>
                <div class="time-slot" onclick="window.selectTime(this)">19:00</div>
            </div>
            <div style="background:white; padding:16px; border-radius:12px; margin-top:20px;">
                <div style="font-size:12px; color:#999;">理疗技师：精诚认证资深理疗师</div>
                <div style="font-size:12px; color:#999; margin-top:5px;">地点：精诚中医旗舰馆(静安店)</div>
            </div>
            <button class="btn-primary" style="margin-top:30px;" onclick="window.confirmBooking('${srv.name}')">立即预约</button>
        </div>
    `;
    overlay.style.display = 'flex';
};

window.selectTime = function (el) {
    document.querySelectorAll('.time-slot').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    selectedTime = el.innerText;
};

window.confirmBooking = function (name) {
    if (!selectedTime) { alert('请先选择预约时间'); return; }
    alert(`预约成功！\n服务内容：${name}\n预约时间：今日 ${selectedTime}\n请准时于精诚中医馆候诊。`);
    window.closeOverlay('article-detail');
};

function renderHealthRecords(container) {
    // 逻辑保持，仅确保支持 radar
    container.innerHTML = `<div style="padding:16px;"><div style="background:#2F5233; color:white; padding:20px; border-radius:12px; margin-bottom:20px;"><h3>气虚质</h3><p>健康指数: 85</p></div><div id="radar-box" class="radar-chart-container"></div></div>`;
    setTimeout(drawRadarChart, 100);
}

function drawRadarChart() {
    const box = document.getElementById('radar-box');
    if (!box) return;
    const size = 200, center = 100, radius = 80;
    const data = [80, 40, 60, 30, 50];
    const points = data.map((val, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const r = (radius * val) / 100;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
    box.innerHTML = `<svg viewBox="0 0 200 200"><polygon points="${points}" fill="rgba(140, 28, 19, 0.2)" stroke="var(--primary-color)" stroke-width="2"/></svg>`;
}

window.closeOverlay = function (id) { document.getElementById(id).style.display = 'none'; };

window.addEventListener('load', () => {
    window.switchTab('home');
    console.log('Jingcheng TCM Season+ Ready');
});
