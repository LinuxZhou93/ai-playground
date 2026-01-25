// 精诚中医 - 数字化诊疗全链路优化版
const products = [
    {
        id: 1, category: "灵芝专区", name: "精诚 · 破壁灵芝孢子粉 (旗舰版)", price: 698,
        desc: "【金奖产品】非遗传承工艺 | 灵芝三萜 ≥ 10%", img: "assets/tcm/lingzhi_hero_premium.png",
        params: [{ label: "规格", value: "2g*30袋/木盒" }, { label: "产地", value: "长白山核心保护区" }],
        details: ["assets/tcm/lingzhi_detail_1.png", "assets/tcm/lingzhi_detail_2.png", "assets/tcm/lingzhi_detail_3.png"],
        richText: `<div style="padding: 10px 0;"><h4 style="color: #8C1C13; border-left: 3px solid #8C1C13; padding-left: 8px; margin-bottom: 10px;">大医精诚 · 选材严苛</h4><p style="font-size: 13px; color: #666; line-height: 1.8;">每一粒均经过人工筛选，确保破壁均匀且无焦苦味。</p></div>`
    },
    { id: 2, category: "灵芝专区", name: "长白山特级灵芝切片 (礼盒装)", price: 128, desc: "野生抚育 | 煲汤首选 | 滋补养生", img: "assets/tcm/article_reishi.png" },
    { id: 3, category: "养生茶饮", name: "灵芝养生茶饮包 (护肝系列)", price: 59, desc: "上班族首选 | 护肝明目 | 独立包装", img: "assets/tcm/tea_icon.png" },
    { id: 6, category: "药食同源", name: "宁夏特级红枸杞 (500g)", price: 45, desc: "粒大饱满 | 滋补肝肾 | 煲汤泡茶", img: "assets/tcm/article_soup.png" }
];

const mockData = {
    doctors: [
        { id: 1, name: "张景和", title: "首席名医", dept: "中医内科", avatar: "assets/tcm/doctor_avatar.png", tags: ["40年诊疗经验", "大医精诚传承人"], intro: "擅长调理脾胃、气血平衡。" }
    ],
    medicalHistory: [
        { id: "REC20260120", date: "2026-01-20", docName: "张景和", dept: "内科", diagnosis: "脾胃失调，营卫不和", advice: "建议服用灵芝孢子粉，忌生冷油腻。", status: "已结诊", recommendId: 1 }
    ],
    labReports: [
        { id: "LAB99827", title: "体质红外热成像报告", date: "2026-01-22", results: [{ item: "上焦热度", val: "37.2℃", status: "偏高" }, { item: "下焦热度", val: "36.1℃", status: "正常" }] },
        { id: "LAB99710", title: "血液年度复查简报", date: "2026-01-10", results: [{ item: "血红蛋白", val: "135g/L", status: "正常" }, { item: "血清铁", val: "18.5μmol/L", status: "正常" }] }
    ],
    symptoms: [
        { name: "失眠多梦", icon: "fas fa-moon", dept: "神志病科" },
        { name: "脾胃虚冷", icon: "fas fa-utensils", dept: "中医内科" },
        { name: "头晕目眩", icon: "fas fa-dizzy", dept: "中医内科" },
        { name: "腰膝酸软", icon: "fas fa-bone", dept: "中医骨伤科" },
        { name: "月经不调", icon: "fas fa-venus", dept: "中医妇科" },
        { name: "食欲不振", icon: "fas fa-apple-alt", dept: "中医脾胃科" }
    ]
};

let cart = [];
let messages = [{ role: 'doctor', text: '您好，这里是精诚中医咨询中心。我是张景和教授的助手，请问有什么可以帮您？' }];

window.switchTab = function (tabId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-item').forEach(item => item.classList.toggle('active', item.getAttribute('onclick').includes(tabId)));
    if (tabId === 'category') window.renderCategory("灵芝专区");
    if (tabId === 'knowledge') window.renderArticles();
};

window.showModuleDetail = function (title) {
    const overlay = document.getElementById('module-detail');
    const container = overlay.querySelector('.detail-content');
    document.getElementById('module-detail-title').innerText = title;
    container.innerHTML = '';

    if (title === '健康档案' || title === '我的病历') {
        renderHealthRecords(container);
    } else if (title === '智能导诊') {
        renderTriage(container);
    } else if (title === '检查报告') {
        renderLabReports(container);
    } else if (title === '客服咨询' || title === '专家问诊') {
        renderChat(container);
    } else if (title === '预约专家') {
        renderDoctorList(container);
    } else if (title === '我的购物车') {
        renderCart(container);
    } else {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-tools"></i><p>${title} 正在建设...</p></div>`;
    }
    overlay.style.display = 'flex';
};

function renderTriage(container) {
    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: white; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="font-size: 15px; margin-bottom: 8px;">按症状找科室</h4>
                <p style="font-size: 11px; color: #999;">点击下方症状，系统将为您精准推荐专家</p>
            </div>
            <div class="symptom-grid">
                ${mockData.symptoms.map(s => `
                    <div class="symptom-item" onclick="window.selectSymptom(this, '${s.dept}')">
                        <i class="${s.icon} symptom-icon"></i>
                        <div style="font-size: 11px;">${s.name}</div>
                    </div>
                `).join('')}
            </div>
            <div id="triage-result" style="margin-top: 20px;"></div>
        </div>
    `;
}

window.selectSymptom = function (el, dept) {
    document.querySelectorAll('.symptom-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    const resultBox = document.getElementById('triage-result');
    resultBox.innerHTML = `
        <div style="background: rgba(47, 82, 51, 0.05); border: 1px solid #2F5233; padding: 16px; border-radius: 12px; animation: slideUp 0.3s ease;">
            <h5 style="color: #2F5233; font-size: 14px; margin-bottom: 8px;">推荐科室：${dept}</h5>
            <p style="font-size: 12px; color: #666; margin-bottom: 15px;">匹配到资深专家张景和教授，擅长调理此类病症。</p>
            <button class="btn-primary" style="height: 36px; font-size: 13px;" onclick="window.showModuleDetail('预约专家')">预约该科室专家</button>
        </div>
    `;
};

function renderLabReports(container) {
    container.innerHTML = `
        <div style="padding: 10px 0;">
            ${mockData.labReports.map(rep => `
                <div class="lab-report-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <div style="font-weight:700; font-size:15px;">${rep.title}</div>
                            <div style="font-size:11px; color:#999; margin-top:4px;">报告编号: ${rep.id}</div>
                        </div>
                        <div style="font-size:11px; color:#999;">${rep.date}</div>
                    </div>
                    ${rep.results.map(res => `
                        <div class="report-item">
                            <span>${res.item}</span>
                            <span>${res.val} <span class="result-tag ${res.status === '正常' ? 'result-normal' : 'result-high'}">${res.status}</span></span>
                        </div>
                    `).join('')}
                    <div style="text-align:right; margin-top:10px;">
                        <button style="border:1px solid var(--secondary-color); background:none; color:var(--secondary-color); padding:4px 12px; border-radius:12px; font-size:11px;" onclick="window.showModuleDetail('客服咨询')">解读报告</button>
                    </div>
                </div>
            `).join('')}
            <div style="text-align:center; padding:20px; color:#CCC; font-size:11px;">- 仅展示近6个月检查报告 -</div>
        </div>
    `;
}

function renderHealthRecords(container) {
    container.innerHTML = `
        <div style="padding: 16px;">
            <div style="background: linear-gradient(135deg, #2F5233 0%, #1A1A1A 100%); color: white; padding: 24px; border-radius: 16px; margin-bottom: 20px; box-shadow: var(--shadow-heavy);">
                <div style="font-size: 11px; opacity: 0.7;">数字化健康卡</div>
                <div style="font-size: 24px; font-weight: 800; margin: 8px 0;">${mockData.healthRecord.type}</div>
                <div style="display:flex; justify-content:space-between; align-items:flex-end;">
                    <div style="font-size: 12px; line-height: 1.5;">建议：${mockData.healthRecord.advice}</div>
                    <div style="text-align:right;"><div style="font-size:24px; font-weight:800;">85</div><div style="font-size:10px; opacity:0.6;">健康指数</div></div>
                </div>
            </div>
            
            <div class="quick-menu" style="background:white; border-radius:12px; padding:15px; margin-bottom:20px; box-shadow:var(--shadow);">
                <div class="menu-item" onclick="window.showModuleDetail('检查报告')"><div class="menu-icon" style="background:#F9F7F2;"><i class="fas fa-file-medical"></i></div><span style="font-size:10px;">报告单</span></div>
                <div class="menu-item" onclick="window.showModuleDetail('智能导诊')"><div class="menu-icon" style="background:#F9F7F2;"><i class="fas fa-street-view"></i></div><span style="font-size:10px;">导诊台</span></div>
                <div class="menu-item" onclick="window.showModuleDetail('预约专家')"><div class="menu-icon" style="background:#F9F7F2;"><i class="fas fa-calendar-check"></i></div><span style="font-size:10px;">去挂号</span></div>
            </div>

            <div class="section-title"><span>历史就诊病历</span></div>
            <div class="record-timeline">
                ${mockData.medicalHistory.map(rec => `
                    <div class="timeline-item">
                        <div class="timeline-date">${rec.date}</div>
                        <div class="timeline-card" onclick="window.openMedicalDetail('${rec.id}')">
                            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                <span style="font-weight:700; font-size:14px;">${rec.diagnosis}</span>
                                <span class="tcm-tag tag-gold" style="font-size:9px;">${rec.status}</span>
                            </div>
                            <div style="font-size:12px; color:#666;">医师：${rec.docName} | ${rec.dept}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.openMedicalDetail = function (recordId) {
    const rec = mockData.medicalHistory.find(r => r.id === recordId);
    if (!rec) return;

    const overlay = document.getElementById('article-detail');
    overlay.querySelector('.detail-title').innerText = "数字化诊疗报告";
    overlay.querySelector('.author-name').innerText = `报告编号: ${rec.id}`;

    overlay.querySelector('.detail-body').innerHTML = `
        <div class="prescription-report">
            <div class="report-header"><div class="report-title">精诚中医馆</div><div style="font-size:10px; color:#999; margin-top:4px;">数字化诊疗病历单</div></div>
            <div class="report-row"><span>患者姓名：精诚会员</span><span>日期：${rec.date}</span></div>
            <div class="report-row"><span>科室：${rec.dept}</span><span>主理：${rec.docName}</span></div>
            <div style="margin: 20px 0; padding-top:15px; border-top: 1px dotted #D4B185;">
                <div style="font-weight:800; color:var(--primary-color); margin-bottom:10px;">初步辨证：</div>
                <p style="font-size:14px; line-height:1.6; color:#333;">${rec.diagnosis}</p>
            </div>
            <div style="margin: 20px 0;">
                <div style="font-weight:800; color:var(--primary-color); margin-bottom:10px;">调理方案：</div>
                <p style="font-size:13px; line-height:1.6; color:#555;">${rec.advice}</p>
                ${rec.recommendId ? `
                    <div class="prescription-action">
                        <button class="btn-buy-now" onclick="window.handlePrescriptionBuy(${rec.recommendId})">处方药品一键购</button>
                    </div>
                ` : ''}
            </div>
            <div style="text-align:right; margin-top:40px; position:relative;">
                <img src="assets/tcm/jingcheng_seal.png" style="width:60px; position:absolute; right:20px; top:-30px; opacity:0.6;">
                <div style="font-size:12px; font-weight:700;">医师签章：${rec.docName}</div>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
};

window.handlePrescriptionBuy = function (productId) {
    window.addToCart(productId);
    window.closeOverlay('article-detail');
    window.showModuleDetail('我的购物车');
};

window.addToCart = function (productId) {
    const p = products.find(prod => prod.id === productId);
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.qty++; else cart.push({ id: productId, qty: 1, product: p });
    updateCartIcon();
    showToast(`已加入购物袋`);
};

function updateCartIcon() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-count').forEach(b => { b.innerText = count; b.style.display = count > 0 ? 'block' : 'none'; });
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.style = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 12px 24px; border-radius: 20px; font-size: 14px; z-index: 1000; transition: 0.3s; pointer-events:none;";
    toast.innerText = msg; document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 1500);
}

function renderCart(container) {
    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-shopping-basket"></i><p>购物袋空空如也</p></div>`;
        return;
    }
    let html = '<div style="padding-bottom: 100px;">';
    let total = 0;
    cart.forEach((item, idx) => {
        total += item.product.price * item.qty;
        html += `<div class="cart-item"><div class="cart-item-img" style="background-image: url('${item.product.img}')"></div><div class="cart-item-info"><div style="font-weight:700;">${item.product.name}</div><div style="display:flex; justify-content:space-between;"><span>¥ ${item.product.price}</span><span>x${item.qty}</span></div></div></div>`;
    });
    html += `</div><div class="checkout-bar"><span>合计: ¥ ${total}</span><button class="btn-primary" style="width:120px;" onclick="window.payOrder()">确认结算</button></div>`;
    container.innerHTML = html;
}

window.renderCategory = function (catName) {
    const container = document.querySelector('.main-cate');
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.toggle('active', item.innerText === catName));
    const filtered = products.filter(p => p.category === catName);
    let html = `<div class="cate-grid">`;
    filtered.forEach(p => { html += `<div class="cate-item" onclick="window.openProduct(${p.id})"><div class="cate-img-box"><img src="${p.img}"></div><span style="font-size:11px;margin-top:8px;">${p.name.split(' · ').pop()}</span><span style="color:#8C1C13;font-weight:700;font-size:11px;">¥ ${p.price}</span></div>`; });
    container.innerHTML = html + "</div>";
};

window.openProduct = function (id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    document.getElementById('detail-title').innerText = p.name;
    document.getElementById('detail-price').innerText = `¥ ${p.price}`;
    document.getElementById('detail-desc').innerText = p.desc;
    document.getElementById('detail-img-box').style.backgroundImage = `url('${p.img}')`;
    document.getElementById('product-full-content').innerHTML = p.richText || '';
    document.getElementById('product-detail').style.display = 'flex';
};

function renderDoctorList(container) {
    mockData.doctors.forEach(doc => {
        container.innerHTML += `<div class="doctor-consult-card"><div class="doc-avatar-large" style="background-image:url('${doc.avatar}')"></div><div class="doc-info-action"><div><div style="font-weight:700;">${doc.name}</div><div style="font-size:12px; color:var(--secondary-color);">${doc.dept}</div></div><button class="btn-primary" style="height:30px; font-size:12px; margin-top:10px;" onclick="window.showModuleDetail('客服咨询')">立即咨询</button></div></div>`;
    });
}

function renderChat(container) {
    container.style.padding = '0';
    container.innerHTML = `<div class="chat-container"><div class="chat-messages" id="chat-msgs-box">${messages.map(m => `<div class="msg-row ${m.role}"><div class="msg-bubble">${m.text}</div></div>`).join('')}</div><div class="chat-input-bar"><input type="text" class="chat-input" id="chat-val" placeholder="描述症状"><i class="fas fa-paper-plane" onclick="window.sendMessage()" style="color:var(--primary-color);"></i></div></div>`;
}

window.sendMessage = function () {
    const input = document.getElementById('chat-val'); const text = input.value.trim(); if (!text) return;
    messages.push({ role: 'user', text: text }); input.value = ''; renderChat(document.querySelector('#module-detail .detail-content'));
    setTimeout(() => { messages.push({ role: 'doctor', text: "系统已收到，专家将尽快为您辨证。" }); renderChat(document.querySelector('#module-detail .detail-content')); }, 1000);
};

window.closeOverlay = function (id) { document.getElementById(id).style.display = 'none'; };

window.addEventListener('load', () => {
    window.switchTab('home');
    document.querySelectorAll('.sidebar-item').forEach(item => item.addEventListener('click', (e) => window.renderCategory(e.target.innerText)));
});
