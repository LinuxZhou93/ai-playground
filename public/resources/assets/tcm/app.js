/*
 * 正中生活 / 臻博园 - 手机端服务原型
 * 覆盖：智慧基地、产品矩阵、基地研学、溯源能力、预约与会员中心
 */

const asset = (path) => path;

const products = [
    {
        id: 1,
        cat: "核心产品",
        name: "臻博园破壁灵芝孢子粉",
        price: 898,
        desc: "彭州通济黄村坝林下仿野生灵芝采收，破壁工艺与批次检测双背书。",
        img: asset("assets/img/zhengzhong_spore_powder_new.png"),
        tags: ["基地直供", "批次检测", "旗舰单品"]
    },
    {
        id: 2,
        cat: "核心产品",
        name: "正中灵芝孢子油软胶囊",
        price: 1280,
        desc: "面向重视康养品质的人群，适合作为高端滋补礼赠、会员复购与合作联名产品。",
        img: asset("assets/img/zhengzhong_spore_oil.png"),
        tags: ["高端礼赠", "会员复购", "合作款"]
    },
    {
        id: 3,
        cat: "睡眠康养",
        name: "臻博园参灵枣仁膏",
        price: 358,
        desc: "灵芝、酸枣仁与药食同源配方结合，打造夜间康养轻滋补场景。",
        img: asset("assets/img/zhengzhong_zaoren_gao_new.jpg"),
        tags: ["助眠场景", "轻滋补", "组合购"]
    },
    {
        id: 4,
        cat: "茶饮文创",
        name: "灵芝桂花养生茶",
        price: 128,
        desc: "基地灵芝延展为日常茶饮，适合伴手礼、研学门店与健康生活场景。",
        img: asset("assets/tcm/tea_icon.png"),
        tags: ["伴手礼", "低门槛", "体验装"]
    },
    {
        id: 5,
        cat: "基地体验",
        name: "灵芝采收研学套票",
        price: 199,
        desc: "面向亲子、学校、企业团建的基地研学产品，适合参访预约与健康体验。",
        img: asset("assets/img/zhengzhong_museum.png"),
        tags: ["研学", "团建", "预约制"]
    },
    {
        id: 6,
        cat: "基地体验",
        name: "庄园药膳康养席",
        price: 288,
        desc: "以灵芝药膳、康养讲堂、基地参访串联半日体验，增强线下服务与复购场景。",
        img: asset("assets/img/zhengzhong_activity_expert.png"),
        tags: ["药膳", "讲堂", "半日游"]
    }
];

const researchItems = [
    {
        id: 1,
        title: "彭州通济黄村坝智慧灵芝基地",
        summary: "林下仿野生种植、环境传感、批次档案与游客动线整合，构成可参观、可销售、可复制的基地模型。",
        cover: asset("assets/img/zhengzhong_base_1.jpg"),
        tag: "智慧基地"
    },
    {
        id: 2,
        title: "正中大健康产品矩阵",
        summary: "灵芝孢子粉、孢子油、参灵枣仁膏、茶饮伴手礼和研学套票覆盖不同健康生活场景。",
        cover: asset("assets/img/zhengzhong_product_lineup.png"),
        tag: "产品矩阵"
    },
    {
        id: 3,
        title: "溯源与数字化运营能力",
        summary: "从环境数据、采收批次、质检记录到会员服务记录，为合作服务提供可信履约与复购运营基础。",
        cover: asset("assets/img/zhengzhong_forest_sensor_1775480940068.png"),
        tag: "数字能力"
    }
];

const studyTours = [
    {
        id: 101,
        name: "灵芝采收亲子研学营",
        date: "本周六/日",
        seats: "余8位",
        price: 199,
        img: asset("assets/img/zhengzhong_museum.png")
    },
    {
        id: 102,
        name: "企业基地参访半日行",
        date: "工作日可约",
        seats: "1团起订",
        price: 0,
        img: asset("assets/img/zhengzhong_activity_expo.jpg")
    },
    {
        id: 103,
        name: "庄园药膳康养体验",
        date: "每日预约",
        seats: "20人/天",
        price: 288,
        img: asset("assets/img/zhengzhong_activity_fair.jpg")
    }
];

const banners = [
    {
        title: "正中生活 · 臻博园",
        sub: "彭州灵芝基地手机端服务",
        img: asset("assets/img/zhengzhong_hero_bg_2.png")
    },
    {
        title: "智慧基地与健康产品",
        sub: "种植、溯源、研学、会员复购一体化",
        img: asset("assets/img/zhengzhong_base_2.jpg")
    },
    {
        title: "可参观 可销售 可运营",
        sub: "基地现场、产品服务与会员关怀相互连接",
        img: asset("assets/img/zhengzhong_homepage_top_1775481097685.png")
    }
];

const notices = [
    "今日基地状态：湿度 86% / 光照 1520 Lux / 林下灵芝长势良好",
    "手机端服务：访客可查看产品矩阵、研学预约、溯源查询",
    "本周开放：企业考察半日行、亲子采收研学、药膳康养体验"
];

const baseStats = [
    { label: "基地湿度", value: "86%", note: "适宜" },
    { label: "林下温度", value: "18.5C", note: "稳定" },
    { label: "批次档案", value: "128", note: "可追溯" },
    { label: "研学预约", value: "36", note: "本周" }
];

let currentBannerIdx = 0;
let noticeIdx = 0;

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function showToast(message) {
    let toast = document.getElementById("service-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "service-toast";
        toast.className = "service-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
}

window.switchTab = function (tabId) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".tab-item").forEach((i) => i.classList.remove("active"));

    const page = document.getElementById(tabId);
    const tab = document.querySelector(`[data-tab="${tabId}"]`);
    if (page) page.classList.add("active");
    if (tab) tab.classList.add("active");

    if (tabId === "home") renderHome();
    if (tabId === "research") renderResearch();
    if (tabId === "mall") renderMall("核心产品");
    if (tabId === "booking") renderBooking();
};

function renderHome() {
    const track = document.getElementById("banner-track");
    const dots = document.getElementById("banner-dots");
    if (track && dots) {
        track.innerHTML = banners.map((b) => `
            <div class="banner-slide" style="background-image:url('${b.img}')">
                <div class="banner-overlay">
                    <span class="hero-kicker">ZHENGZHONG LIFE</span>
                    <h2>${b.title}</h2>
                    <p>${b.sub}</p>
                    <button class="hero-cta" onclick="window.showModuleDetail('服务能力总览')">查看能力</button>
                </div>
            </div>
        `).join("");
        dots.innerHTML = banners.map((_, i) => `<div class="indicator-dot ${i === currentBannerIdx ? "active" : ""}"></div>`).join("");
        track.style.transform = `translateX(-${currentBannerIdx * 100}%)`;
    }

    const nList = document.getElementById("notice-list");
    if (nList) nList.innerHTML = `<div class="notice-item">${notices[noticeIdx]}</div>`;

    const statPanel = document.getElementById("base-stat-list");
    if (statPanel) {
        statPanel.innerHTML = baseStats.map((s) => `
            <div class="mini-stat">
                <strong>${s.value}</strong>
                <span>${s.label}</span>
                <em>${s.note}</em>
            </div>
        `).join("");
    }

    const hPanel = document.getElementById("home-product-list");
    if (hPanel) {
        hPanel.innerHTML = products.slice(0, 4).map(productCard).join("");
    }
}

function renderResearch() {
    const nPanel = document.getElementById("news-list");
    if (nPanel) {
        nPanel.innerHTML = researchItems.map((item) => `
            <div class="eco-card" onclick="window.showResearchDetail(${item.id})">
                <div class="eco-thumb" style="background-image:url('${item.cover}')"></div>
                <div class="eco-body">
                    <div class="eco-tag"># ${item.tag}</div>
                    <div class="eco-title">${item.title}</div>
                    <div class="eco-desc">${item.summary}</div>
                </div>
            </div>
        `).join("");
    }

    const tPanel = document.getElementById("tour-list");
    if (tPanel) {
        tPanel.innerHTML = studyTours.map(tourCard).join("");
    }
}

function renderMall(activeCat) {
    const cats = ["核心产品", "睡眠康养", "茶饮文创", "基地体验"];
    const catPanel = document.getElementById("mall-cats");
    if (catPanel) {
        catPanel.innerHTML = cats.map((c) => `
            <button class="tip-badge ${c === activeCat ? "active" : ""}" onclick="window.renderMall('${c}')">${c}</button>
        `).join("");
    }

    const mList = document.getElementById("mall-product-list");
    if (mList) {
        const filtered = products.filter((p) => p.cat === activeCat);
        mList.innerHTML = filtered.length ? filtered.map(productCard).join("") : `
            <div class="empty-state">该分类商品正在完善中</div>
        `;
    }
}

window.renderMall = renderMall;

function renderBooking() {
    const panel = document.getElementById("booking-list");
    if (panel) panel.innerHTML = studyTours.map(tourCard).join("");
}

function productCard(p) {
    return `
        <div class="product-card" onclick="window.openProduct(${p.id})">
            <div class="product-img-wrap">
                <img src="${p.img}" class="product-img" alt="${p.name}">
                <span>${p.cat}</span>
            </div>
            <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.desc}</div>
                <div class="product-meta">
                    <div class="product-price">¥ ${p.price}</div>
                    <button aria-label="查看商品"><i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        </div>
    `;
}

function tourCard(t) {
    const price = t.price > 0 ? `¥ ${t.price}` : "预约洽谈";
    return `
        <div class="eco-card tour-card" onclick="window.bookTour(${t.id})">
            <div class="eco-thumb" style="background-image:url('${t.img}')"></div>
            <div class="eco-body">
                <div class="eco-title">${t.name}</div>
                <div class="eco-desc">${t.date} | ${t.seats}</div>
                <div class="tour-row">
                    <strong>${price}</strong>
                    <button>预约</button>
                </div>
            </div>
        </div>
    `;
}

window.showResearchDetail = function (id) {
    const item = researchItems.find((x) => x.id === id);
    if (!item) return;
    openOverlay(item.title, `
        <div class="detail-hero" style="background-image:url('${item.cover}')"></div>
        <div class="detail-section">
            <span class="detail-chip">${item.tag}</span>
            <h4>${item.title}</h4>
            <p>${item.summary}</p>
            <div class="timeline-list">
                <div><b>种植端</b><span>林下环境监测、采收批次、基地巡检</span></div>
                <div><b>服务端</b><span>产品系列、研学门票、药膳体验</span></div>
                <div><b>服务端</b><span>会员档案、订单记录、复购提醒</span></div>
            </div>
        </div>
    `);
};

window.showModuleDetail = function (title) {
    const map = {
        "智慧种植": smartPlantingDetail,
        "溯源查询": traceDetail,
        "睡眠康养": sleepDetail,
        "基地实景": baseLiveDetail,
        "服务能力总览": investmentDetail
    };
    const renderer = map[title];
    openOverlay(title, renderer ? renderer() : `<div class="empty-state">${title} 模块内容正在完善中</div>`);
};

function smartPlantingDetail() {
    return `
        <div class="detail-hero live-hero" style="background-image:url('assets/img/zhengzhong_forest_sensor_1775480940068.png')">
            <span>LIVE · 彭州通济黄村坝</span>
        </div>
        <div class="metric-grid">
            <div><strong>18.5C</strong><span>林下温度</span></div>
            <div><strong>86%</strong><span>环境湿度</span></div>
            <div><strong>1520</strong><span>光照 Lux</span></div>
            <div><strong>420</strong><span>CO2 ppm</span></div>
        </div>
        <div class="detail-section">
            <h4>基地可视化管理</h4>
            <p>通过传感器、巡检记录和批次档案，把“好灵芝在哪里生长、什么时候采收、如何质检”变成现场可展示的数据资产。</p>
            <button class="btn-primary" onclick="window.showModuleDetail('基地实景')">查看基地实景</button>
        </div>
    `;
}

function traceDetail() {
    return `
        <div class="trace-card">
            <div class="trace-qr"><i class="fas fa-qrcode"></i><span></span></div>
            <h4>臻博园批次 ZBY-2026-0616</h4>
            <p>扫描产品码后展示产地、采收、检测、仓储和流通信息，让产品可信链路更直观。</p>
        </div>
        <div class="timeline-list">
            <div><b>产地</b><span>四川彭州 · 通济黄村坝灵芝基地</span></div>
            <div><b>采收</b><span>林下仿野生灵芝，第 5 批次采收</span></div>
            <div><b>检测</b><span>水分、破壁率、重金属、微生物指标记录</span></div>
            <div><b>流通</b><span>基地仓发货，用户可查看订单履约状态</span></div>
        </div>
    `;
}

function sleepDetail() {
    return `
        <div class="detail-hero" style="background-image:url('assets/img/zhengzhong_zaoren_gao_new.jpg')"></div>
        <div class="detail-section">
            <span class="detail-chip">睡眠康养场景</span>
            <h4>从产品销售到会员服务</h4>
            <p>以参灵枣仁膏、灵芝茶饮、助眠问卷和复购提醒组成轻量健康管理流程，适合会员健康服务与复购。</p>
            <div class="action-row">
                <button class="btn-secondary" onclick="window.openProduct(3)">查看产品</button>
                <button class="btn-primary" onclick="window.reserveService('睡眠康养问诊')">预约问诊</button>
            </div>
        </div>
    `;
}

function baseLiveDetail() {
    return `
        <div class="detail-hero live-hero tall" style="background-image:url('assets/img/zhengzhong_base_1.jpg')">
            <span>CAM 01 · 林下种植区</span>
        </div>
        <div class="detail-section">
            <h4>沉浸式基地参观</h4>
            <p>用于现场讲解：让访客先看到基地、再看到产品、最后进入预约与采购服务。</p>
            <button class="btn-primary" onclick="window.switchTab('booking'); window.closeOverlay('module-detail')">去预约考察</button>
        </div>
    `;
}

function investmentDetail() {
    return `
        <div class="capability-grid">
            <div><i class="fas fa-seedling"></i><strong>智慧基地</strong><span>可视化种植与环境数据</span></div>
            <div><i class="fas fa-boxes-stacked"></i><strong>产品矩阵</strong><span>高端滋补到轻茶饮</span></div>
            <div><i class="fas fa-route"></i><strong>研学体验</strong><span>亲子、企业、药膳路线</span></div>
            <div><i class="fas fa-shield-halved"></i><strong>可信溯源</strong><span>批次质检与流通记录</span></div>
        </div>
        <div class="detail-section">
            <h4>服务体验链路</h4>
            <p>基地实力、产品选购、研学体验、预约记录和会员关怀相互连接，让健康服务更清晰、更连续。</p>
            <button class="btn-primary" onclick="window.switchTab('mall'); window.closeOverlay('module-detail')">查看产品矩阵</button>
        </div>
    `;
}

window.openProduct = function (id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    openOverlay(p.name, `
        <div class="product-detail-img" style="background-image:url('${p.img}')"></div>
        <div class="detail-section product-detail">
            <div class="price-line">
                <h4>${p.name}</h4>
                <strong>¥ ${p.price}</strong>
            </div>
            <div class="tag-row">${p.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
            <p>${p.desc}</p>
            <div class="trace-mini" onclick="window.showModuleDetail('溯源查询')">
                <i class="fas fa-shield-halved"></i>
                <div><b>查看产品溯源</b><span>产地、批次、质检、流通记录</span></div>
                <i class="fas fa-chevron-right"></i>
            </div>
            <div class="action-row sticky-actions">
                <button class="btn-secondary" onclick="window.reserveService('咨询购买：${p.name}')">咨询购买</button>
                <button class="btn-primary" onclick="window.quickOrder(${p.id})">在线选购</button>
            </div>
        </div>
    `);
};

window.bookTour = function (id) {
    const t = studyTours.find((x) => x.id === id);
    if (!t) return;
    openOverlay(t.name, `
        <div class="detail-hero" style="background-image:url('${t.img}')"></div>
        <div class="detail-section">
            <span class="detail-chip">${t.date} · ${t.seats}</span>
            <h4>${t.name}</h4>
            <p>填写姓名、电话和到访人数即可生成预约记录，可用于企业参访、亲子研学、药膳康养三类服务。</p>
            <div class="booking-form">
                <label>联系人<input value="参访人"></label>
                <label>到访人数<input value="6"></label>
                <label>联系电话<input value="138****2026"></label>
            </div>
            <button class="btn-primary" onclick="window.reserveService('${t.name}')">提交预约</button>
        </div>
    `);
};

window.quickOrder = function (id) {
    const p = products.find((x) => x.id === id);
    showToast(`${p ? p.name : "商品"}已提交订单确认`);
};

window.reserveService = function (label) {
    showToast(`${label}已加入预约记录`);
};

function openOverlay(title, html) {
    const overlay = document.getElementById("module-detail");
    const content = document.getElementById("module-detail-content");
    setText("module-detail-title", title);
    if (content) content.innerHTML = html;
    if (overlay) overlay.style.display = "flex";
};

window.closeOverlay = function (id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
};

window.addEventListener("load", () => {
    window.switchTab("home");
    setInterval(() => {
        currentBannerIdx = (currentBannerIdx + 1) % banners.length;
        noticeIdx = (noticeIdx + 1) % notices.length;
        renderHome();
    }, 5000);
});
