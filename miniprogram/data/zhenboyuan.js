const img = (name) => `/images/zhenboyuan/${name}`;

const brand = {
  name: "臻博园 · 正中大健康",
  shortName: "正中生活",
  subtitle: "中医药 · 灵芝全产业链 · 康养服务",
  slogan: "从彭州龙门山灵芝基地，到日常健康生活方式"
};

const homeCards = [
  { key: "base", title: "真实基地", desc: "林下仿野生种植、标准化管护与基地实景", image: img("base-row.jpg") },
  { key: "digital", title: "数字基地", desc: "环境监测、批次档案、产业数据与数字大屏", image: img("digital-twin.jpg") },
  { key: "trace", title: "批次溯源", desc: "来源可溯、去向可追、质量可控", image: img("base-close.jpg") }
];

const syncMap = [
  { web: "基地实景", mini: "了解基地、查看状态、预约参访", component: "基地介绍 / 状态服务" },
  { web: "臻萃产品系列", mini: "查看商品、加入购物车、提交订单", component: "便捷选购 / 会员复购" },
  { web: "数字基地与溯源", mini: "输入批次号或扫码查询产品来源", component: "批次查询 / 可查可追" },
  { web: "研学康养体验", mini: "预约活动、查看权益、保存服务记录", component: "活动预约 / 会员服务" }
];

const stats = [
  { label: "基地湿度", value: "86%", note: "适宜" },
  { label: "林下温度", value: "18.5C", note: "稳定" },
  { label: "批次档案", value: "128", note: "可追溯" },
  { label: "研学预约", value: "36", note: "本周" }
];

const products = [
  {
    id: "spore",
    cat: "核心产品",
    name: "臻博园破壁灵芝孢子粉",
    price: 898,
    desc: "彭州通济黄村坝灵芝基地源头，适合日常营养补充、礼赠和会员复购。",
    image: img("product-spore.jpg"),
    tags: ["基地源头", "批次溯源", "健康礼赠"]
  },
  {
    id: "zaoren",
    cat: "睡眠康养",
    name: "臻博园参灵枣仁膏",
    price: 358,
    desc: "围绕药食同源、睡眠康养和家庭滋养场景设计的轻滋补产品。",
    image: img("product-zaoren.jpg"),
    tags: ["药食同源", "睡眠康养", "组合购"]
  },
  {
    id: "tea",
    cat: "茶饮文创",
    name: "灵芝桂花养生茶",
    price: 128,
    desc: "适合基地参访、研学门店、直播间和日常伴手礼的低门槛产品。",
    image: img("base-close.jpg"),
    tags: ["伴手礼", "茶饮", "体验装"]
  },
  {
    id: "tour",
    cat: "基地体验",
    name: "灵芝采收研学套票",
    price: 199,
    desc: "亲子研学、学校活动和企业团建均可预约，适合基地参访与健康体验。",
    image: img("activity-forest.jpg"),
    tags: ["研学", "预约", "团建"]
  }
];

const tours = [
  { id: "visit", name: "基地参观半日线", time: "工作日可约", seats: "1团起订", image: img("base-wide.jpg") },
  { id: "family", name: "亲子研学一日线", time: "周末开放", seats: "余8位", image: img("activity-forest.jpg") },
  { id: "sleep", name: "睡眠康养主题线", time: "每日预约", seats: "20人/天", image: img("activity-fair.jpg") }
];

const trace = {
  defaultCode: "ZZ-PZ-LZ-2026-LZ01",
  result: "已匹配批次：彭州通济黄村坝基地，林下仿野生种植，采收加工记录完整，产品流向可追踪。",
  timeline: [
    { step: "01", title: "基地建档", desc: "菌种、基地、种植环境与管护标准进入批次档案。" },
    { step: "02", title: "林下管护", desc: "记录温湿度、光照、土壤和采收过程。" },
    { step: "03", title: "加工质检", desc: "关联采收、初加工、检测与包装信息。" },
    { step: "04", title: "流通服务", desc: "产品二维码、手机端查询和会员服务保持一致。" }
  ]
};

module.exports = { brand, homeCards, syncMap, stats, products, tours, trace };
