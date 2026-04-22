/* ============================================================
   2026 世界锦标赛赴美行程单 — 数据 & 渲染
   ============================================================
   ★ 修改行程只需编辑下方 DATA 对象，页面会自动渲染 ★
   ============================================================ */

/* ----- Auth: 敏感信息保护 ----- */
let _unlocked = sessionStorage.getItem("auth_unlocked") === "1";

function getValidPassports() {
  const pp = [];
  DATA.members.forEach(g => g.persons.forEach(p => {
    if (p.passport && p.passportStatus === "verified") pp.push(p.passport.toUpperCase());
  }));
  return pp;
}

function mask(text) {
  if (_unlocked) return text;
  return text.replace(/[A-Za-z0-9]/g, "•");
}

function showAuthModal(onSuccess) {
  const modal = document.getElementById("auth-modal");
  const input = document.getElementById("auth-input");
  const err = document.getElementById("auth-error");
  input.value = "";
  err.style.display = "none";
  modal.classList.add("show");
  input.focus();
  window._authCallback = onSuccess || null;
}

function submitAuth() {
  const input = document.getElementById("auth-input");
  const err = document.getElementById("auth-error");
  const val = input.value.trim().toUpperCase();
  const valid = getValidPassports();
  if (valid.includes(val)) {
    _unlocked = true;
    sessionStorage.setItem("auth_unlocked", "1");
    document.getElementById("auth-modal").classList.remove("show");
    render();
    if (window._authCallback) { window._authCallback(); window._authCallback = null; }
  } else {
    err.style.display = "block";
    input.select();
  }
}

function requireAuth(callback) {
  if (_unlocked) { callback(); return; }
  showAuthModal(callback);
}

const DATA = {

  /* ---------- 基本信息 ---------- */
  team: {
    name: "川渝VEX",
    event: "2026 世界锦标赛",
    destination: "美国 · 圣路易斯 St. Louis, Missouri",
    departureCity: "成都天府 (TFU)",
    departDate: "2026-04-19",
    returnDate: "高中组 4/26 · 初中组 4/29",
    headcount: 12,
    status: "preparing"    // preparing | active | completed
  },

  /* ---------- 队伍人员 ---------- */
  members: [
    {
      group: "高中组 · 1690X",
      color: "#2563eb",
      persons: [
        { name: "王致衡", english: "WANG, ZHIHENG", role: "队员", passport: "EN9308604", passportExpiry: "2035-01-19", passportStatus: "verified", passportImg: "护照/微信图片_20260416184835_25_34.jpg" },
        { name: "Marco", english: "", role: "队员", passport: "美国护照", passportExpiry: "", passportStatus: "na", passportImg: "" },
        { name: "陈泊凡", english: "CHEN, BOFAN", role: "队员", passport: "EJ6559611", passportExpiry: "2027-11-06", passportStatus: "verified", passportImg: "护照/微信图片_20260416184540_19_34.jpg" }
      ]
    },
    {
      group: "高中组 · 291Z",
      color: "#7c3aed",
      persons: [
        { name: "张倍睿", english: "ZHANG, BEIRUI", role: "队员", passport: "EP2025588", passportExpiry: "2035-03-05", passportStatus: "verified", passportImg: "护照/微信图片_20260416184607_22_34.jpg" },
        { name: "邓小勇", english: "DENG, XIAOYONG", role: "队员", passport: "EK5402421", passportExpiry: "2028-06-04", passportStatus: "verified", passportImg: "护照/微信图片_20260416184754_24_34.jpg" },
        { name: "徐浩然", english: "XU, HAORAN", role: "队员", passport: "EJ3204814", passportExpiry: "2028-01-11", passportStatus: "verified", passportImg: "护照/微信图片_20260416184738_23_34.jpg" }
      ]
    },
    {
      group: "高中组 · 11P",
      color: "#6366f1",
      persons: [
        { name: "李哲旭", english: "", role: "队员（仅去程）", passport: "", passportExpiry: "", passportStatus: "self", passportImg: "" }
      ]
    },
    {
      group: "高中组 · 教练",
      color: "#1e40af",
      persons: [
        { name: "何子超", english: "HE, ZICHAO", role: "教练", passport: "EF8435172", passportExpiry: "2029-03-25", passportStatus: "verified", passportImg: "护照/微信图片_20260416184603_21_34.jpg" }
      ]
    },
    {
      group: "初中组 · 7977A",
      color: "#059669",
      persons: [
        { name: "欧起纶", english: "OU, QILUN", role: "队员", passport: "EP2034918", passportExpiry: "2030-03-16", passportStatus: "verified", passportImg: "护照/微信图片_20260413224504_11_34.jpg" },
        { name: "谢一平", english: "XIE, YIPING", role: "队员", passport: "EK6360102", passportExpiry: "2028-06-29", passportStatus: "verified", passportImg: "护照/微信图片_20260413224457_9_34.jpg" }
      ]
    },
    {
      group: "初中组 · 教练",
      color: "#047857",
      persons: [
        { name: "陈照君", english: "CHEN, ZHAOJUN", role: "教练", passport: "EL7985798", passportExpiry: "2034-02-28", passportStatus: "verified", passportImg: "护照/微信图片_20260413224500_10_34.jpg" }
      ]
    },
    {
      group: "后勤保障",
      color: "#e11d48",
      persons: [
        { name: "王奕轩", english: "WANG, YIXUAN", role: "问鼎之路摄像", passport: "EN6220243", passportExpiry: "2034-12-03", passportStatus: "verified", passportImg: "护照/微信图片_20260416184547_20_34.jpg" }
      ]
    }
  ],

  /* ---------- 统计数据卡片 ---------- */
  stats: [
    { label: "统一出发",    value: "4月19日",  hint: "中国时间 · 周日" },
    { label: "高中组返程",  value: "4月26日",  hint: "美国时间 · 周日" },
    { label: "初中组返程",  value: "4月29日",  hint: "美国时间 · 周三" },
    { label: "参赛人数",    value: "12人",     hint: "9选手+2教练+1摄像" },
    { label: "参赛队伍",    value: "3支",      hint: "高中2支 · 初中1支" },
    { label: "酒店",        value: "1家",      hint: "赛场附近" }
  ],

  /* ---------- 总览亮点 ---------- */
  highlights: [
    { icon: "✈️", type: "flight", title: "统一去程 3U3837", desc: "4/19 成都→洛杉矶，4/20 AA1736 洛杉矶→芝加哥" },
    { icon: "✈️", type: "flight", title: "分批返程",        desc: "高中组4/25 AA1666→4/26 3U3838 · 初中组4/29 CX801→5/1 CX986" },
    { icon: "🚨", type: "hotel",  title: "赛场酒店",        desc: "待确认，赛场附近" },
    { icon: "🚌", type: "bus",    title: "地面交通",        desc: "ORD包车到STL·高中Marco租车·初中随姜楠大巴" }
  ],

  /* ---------- 赛事信息 ---------- */
  eventInfo: {
    name: "VEX Robotics World Championship 2026",
    date: "2026年4月21日–30日",
    venue: "America's Center Convention Complex",
    venueAddress: "701 Convention Plaza, St. Louis, MO 63101",
    organizer: "Robotics Education & Competition Foundation (RECF)",
    website: "https://recf.org/vex-robotics-world-championship/",
    divisions: [
      { team: "1690X", division: "Arts Division", date: "4月21日–24日", file: "分区信息/arts-division-list-v5rc-high-school-2026-vex-robotics-world-championship.pdf" },
      { team: "291Z", division: "Research Division", date: "4月21日–24日", file: "分区信息/research-division-list-v5rc-high-school-2026-vex-robotics-world-championship.pdf" }
    ],
    links: [
      { label: "赛事官网", url: "https://recf.org/vex-robotics-world-championship/" },
      { label: "Division Lists（分区）", url: "https://recf.org/vex_worlds/division-lists/" },
      { label: "赛程 Agenda", url: "https://recf.org/vex-robotics-world-championship/vex-robotics-world-championship-agenda/" },
      { label: "Check-In 签到", url: "https://recf.org/vex_worlds/team-check-in/" },
      { label: "Inspection 检录", url: "https://recf.org/vex_worlds/inspection-process/" },
      { label: "场馆地图 Venue Maps", url: "https://recf.org/vex_worlds/venue-maps/" },
      { label: "Pit Areas 维修区", url: "https://recf.org/vex_worlds/pit-areas/" },
      { label: "Driver Meeting 选手会", url: "https://recf.org/vex_worlds/drivers-meeting/" },
      { label: "Judging 评审", url: "https://recf.org/vex_worlds/judging-guidelines-and-processes-2/" },
      { label: "Notebook 工程笔记提交", url: "https://recf.org/vex_worlds/how-to-submit-digital-engineering-notebooks-2/" },
      { label: "Team FAQ", url: "https://recf.org/vw_faq/" },
      { label: "VEX TV 直播", url: "https://www.vexworlds.tv/" },
      { label: "当地交通方案", url: "https://recf.org/vex_worlds/local-transportation-solutions-vex-robotics-world-championship/" },
      { label: "了解圣路易斯", url: "https://recf.org/vex_worlds/learn-more-about-st-louis/" }
    ]
  },

  /* ---------- 机票信息 ---------- */
  flights: [
    /* ---- 去程：成都→洛杉矶（9人，Marco除外） ---- */
    {
      person: "团队 11人（Marco除外）",
      segment: "去程-国际段",
      date: "4月19日（周日）",
      flightNo: "3U3837",
      time: "22:10 → 20:30（同日）",
      airport: "成都天府 TFU → 洛杉矶 LAX",
      transfer: "洛杉矶转机",
      luggage: "经济舱",
      orderNo: "多组订单（见下方原始机票）",
      badgeClass: "badge--depart",
      tickets: [
        { label: "何子超 + 王致衡（2人单程）", pnr: "NHSL3P / HSQPKH", file: "机票图片/2人成都洛杉矶.pdf" },
        { label: "初中组（陈照君 欧起纶 谢一平，3人单程）", pnr: "NJ0MSM / KFGS5K", file: "机票图片/3人成都洛杉矶.pdf" },
        { label: "291Z（邓小勇 徐浩然 张倍睿，3人往返）", pnr: "GCNZCT / NHSKHR", file: "机票图片/3人成都洛杉矶往返.pdf" },
        { label: "陈泊凡（往返）", pnr: "NVBKL2", file: "机票图片/CHEN成都洛杉矶往返.pdf" },
        { label: "王奕轩（往返）", pnr: "CMY47O", file: "机票图片/WANG成都-洛杉矶往返.pdf" }
      ]
    },
    /* ---- 去程：洛杉矶→芝加哥（10人，Marco在LAX汇合） ---- */
    {
      person: "全员 12人（Marco在LAX汇合）",
      segment: "去程-美国国内段",
      date: "4月20日（周一）",
      flightNo: "AA1736",
      time: "01:01 → 07:18",
      airport: "洛杉矶 LAX → 芝加哥 ORD（T3到达）",
      transfer: "—",
      luggage: "经济舱",
      orderNo: "PNR: GCQ1P6（8人）",
      badgeClass: "badge--transfer",
      tickets: [
        { label: "8人（何子超 王致衡 陈照君 欧起纶 谢一平 邓小勇 徐浩然 张倍睿）", pnr: "GCQ1P6", file: "机票图片/8人洛杉矶-芝加哥.pdf" },
        { label: "陈泊凡", pnr: "FDCYQF", file: "机票图片/CHEN洛杉矶-芝加哥.pdf" },
        { label: "王奕轩", pnr: "JZZUSV", file: "机票图片/WANG洛杉矶-芝加哥.pdf" }
      ]
    },
    /* ---- 返程：291Z + 王奕轩 + 陈泊凡（5人） ---- */
    {
      person: "291Z 3人 + 王奕轩 + 陈泊凡",
      segment: "返程-美国国内段",
      date: "4月25日（周五）",
      flightNo: "AA1666",
      time: "13:18 → 15:54",
      airport: "芝加哥 ORD（T3出发）→ 洛杉矶 LAX",
      transfer: "LAX过夜中转",
      luggage: "经济舱",
      orderNo: "291Z+王奕轩已出票 · ❗陈泊凡待出票",
      badgeClass: "badge--return",
      tickets: [
        { label: "291Z（邓小勇 张倍睿 徐浩然）", pnr: "MQGGJK / NCJHEQ", file: "机票图片/3人芝加哥-洛杉矶.pdf" },
        { label: "王奕轩", pnr: "OMAJGT / UUKWZL", file: "机票图片/WANG芝加哥-洛杉矶.pdf" },
        { label: "❗陈泊凡", pnr: "待出票", file: "" }
      ]
    },
    {
      person: "291Z 3人 + 王奕轩 + 陈泊凡",
      segment: "返程-国际段",
      date: "4月26日（周日）",
      flightNo: "3U3838",
      time: "23:15 → 06:00+2天",
      airport: "洛杉矶 LAX → 成都天府 TFU",
      transfer: "—",
      luggage: "经济舱",
      orderNo: "往返票已含",
      badgeClass: "badge--return",
      tickets: [
        { label: "291Z（3人往返票含此段）", pnr: "NHSKHR", file: "机票图片/3人成都洛杉矶往返.pdf" },
        { label: "陈泊凡（往返票含此段）", pnr: "NVBKL2", file: "机票图片/CHEN成都洛杉矶往返.pdf" },
        { label: "王奕轩（往返票含此段）", pnr: "CMY47O", file: "机票图片/WANG成都-洛杉矶往返.pdf" }
      ]
    },
    /* ---- 返程：初中组（3人） ---- */
    {
      person: "初中组（欧起纶 谢一平 陈照君）",
      segment: "返程-国际段①",
      date: "4月29日（周三）",
      flightNo: "CX801",
      time: "16:15 → 21:00+1",
      airport: "芝加哥 ORD T5 → 香港 HKG T1",
      transfer: "香港转机",
      luggage: "待确认",
      orderNo: "陈照君自行订票",
      badgeClass: "badge--return"
    },
    {
      person: "初中组（欧起纶 谢一平 陈照君）",
      segment: "返程-国际段②",
      date: "5月1日（周五）",
      flightNo: "CX986",
      time: "10:00 → 12:35",
      airport: "香港 HKG T1 → 成都天府 TFU T1",
      transfer: "—",
      luggage: "同上",
      orderNo: "陈照君自行订票",
      badgeClass: "badge--return"
    },
    /* ---- 返程：Marco（自行） ---- */
    {
      person: "Marco（1690X·自行返回）",
      segment: "返程",
      date: "待确认",
      flightNo: "待确认",
      time: "待确认",
      airport: "待确认",
      transfer: "待确认",
      luggage: "待确认",
      orderNo: "待确认",
      badgeClass: "badge--return"
    },
    /* ---- 王致衡 + 何子超 暂不返回 ---- */
    {
      person: "王致衡 + 何子超（暂不返回）",
      segment: "返程",
      date: "待定",
      flightNo: "—",
      time: "—",
      airport: "—",
      transfer: "—",
      luggage: "—",
      orderNo: "—",
      badgeClass: "badge--return"
    },
    /* ---- 李哲旭（仅去程，自行安排返回） ---- */
    {
      person: "李哲旭（11P·仅去程）",
      segment: "返程",
      date: "自行安排",
      flightNo: "—",
      time: "—",
      airport: "去程机票自行购买",
      transfer: "—",
      luggage: "—",
      orderNo: "—",
      badgeClass: "badge--return"
    }
  ],

  /* ---------- 大巴 / 接送 ---------- */
  transport: [
    {
      title: "全员 · 芝加哥 ORD → 圣路易斯 STL",
      subtitle: "4月20日 抵达后包车",
      rows: [
        { label: "日期", value: "4月20日（周一）" },
        { label: "人数", value: "全员 12人" },
        { label: "路线", value: "芝加哥 ORD → 圣路易斯 酒店（约4.5小时车程）" },
        { label: "车型", value: "15座大车" },
        { label: "安排方", value: "旅行社包车" },
        { label: "集合地点", value: "ORD T3 到达层出口" },
        { label: "备注", value: "下机后直接上车，车上可休息" }
      ]
    },
    {
      title: "高中组 · 每日酒店 ↔ 赛场",
      subtitle: "比赛期间（Marco 租车驾驶）",
      rows: [
        { label: "适用人员", value: "高中组（1690X + 291Z + 何子超 + 王奕轩）" },
        { label: "车型", value: "商务七座 SUV" },
        { label: "司机", value: "Marco" },
        { label: "日常去程", value: "酒店大堂集合出发" },
        { label: "日常返程", value: "赛后赛场出口集合" },
        { label: "备注", value: "请提前5分钟到大堂集合" }
      ]
    },
    {
      title: "初中组 · 每日酒店 ↔ 赛场",
      subtitle: "比赛期间（随姜楠大巴）",
      rows: [
        { label: "适用人员", value: "初中组（7977A + 陈照君）" },
        { label: "车型", value: "大巴" },
        { label: "安排方", value: "姜楠统一安排" },
        { label: "日常去程", value: "随大巴统一出发" },
        { label: "日常返程", value: "随大巴统一返回" },
        { label: "备注", value: "服从姜楠安排的时间和路线" }
      ]
    },
    {
      title: "高中组 · Amtrak 火车 STL → CHI",
      subtitle: "4月25日（周五）· 王奕轩带队",
      rows: [
        { label: "日期", value: "4月25日（周五）" },
        { label: "人数", value: "291Z 3人 + 王奕轩 + 陈泊凡 = 5人" },
        { label: "带队人", value: "王奕轩" },
        { label: "交通方式", value: "Amtrak 火车 Train 300（Lincoln Service）" },
        { label: "出发", value: "04:30 St. Louis Gateway Station" },
        { label: "到达", value: "09:25 Chicago Union Station" },
        { label: "订单号", value: "E6DCDF" },
        { label: "座位", value: "5 Coach Seats" },
        { label: "备注", value: "建议提前30分钟到达车站，到达后需从 Union Station 前往 ORD 机场，AA1666 13:18起飞" }
      ]
    },
    {
      title: "初中组 · 送机",
      subtitle: "4月29日（周三）",
      rows: [
        { label: "日期", value: "4月29日（周三）" },
        { label: "人数", value: "初中组 3人（7977A + 陈照君）" },
        { label: "路线", value: "待确认" },
        { label: "车型", value: "待确认" },
        { label: "备注", value: "请前晚整理好行李" }
      ]
    }
  ],

  /* ---------- 酒店信息 ---------- */
  hotels: [
    {
      name: "Embassy Suites Hotel St Louis Airport（已订 5间）",
      confirmStatus: "verified",
      confirmFiles: [
        { label: "订单①② 确认单（AHX6EYLI + 4WYPMX0S）", file: "酒店/extracted/VEX-2026-Hotel-EB-0420-0424-2RMS-2-DL.pdf_page1.png" },
        { label: "订单③④ 确认单（XYP97E3W + S26I2LCU）", file: "酒店/extracted/VEX-2026-Hotel-EB-0420-0424-2RMS-DL.pdf_page1.png" },
        { label: "订单⑤ 确认单（17174578187 陈泊凡）", file: "酒店/2026-04-20-St. Louis-Embassy Suites by Hilton St. Louis Airport-17174578187.pdf" }
      ],
      rows: [
        { label: "英文地址", value: "11237 Lone Eagle Drive, St. Louis, MO 63044-2739" },
        { label: "入住", value: "4月20日（周一）" },
        { label: "退房", value: "4月24日（周五）" },
        { label: "住宿天数", value: "4晚（4/20–4/24）" },
        { label: "房型", value: "King-bed Suite with sleeper sofa ×5" },
        { label: "房间数", value: "5间" },
        { label: "订单号①", value: "AHX6EYLI（王致衡 何子超 王奕轩）" },
        { label: "订单号②", value: "4WYPMX0S（邓小勇 徐浩然）" },
        { label: "订单号③", value: "XYP97E3W（陈照君 张倍睿）" },
        { label: "订单号④", value: "S26I2LCU（欧起纶 谢一平）" },
        { label: "订单号⑤", value: "17174578187（陈泊凡）" },
        { label: "前台电话", value: "1-314-739-8929" }
      ]
    },
    {
      name: "Crowne Plaza Hotel St. Louis Airport（4/24–25，已订 3间）",
      confirmStatus: "verified",
      confirmFiles: [
        { label: "订单① 确认单（1493518658151014400）", file: "酒店/2026-04-24-Crowne Plaza Hotel St. Louis Airport, an IHG Hotel-1493518658151014400.pdf" },
        { label: "订单② 确认单（1493629717482696704）", file: "酒店/2026-04-24-Crowne Plaza Hotel St. Louis Airport, an IHG Hotel-1493629717482696704.pdf" }
      ],
      rows: [
        { label: "英文地址", value: "11228 Lone Eagle Dr, Bridgeton, MO" },
        { label: "前台电话", value: "+1-314-2916700" },
        { label: "入住", value: "4月24日" },
        { label: "退房", value: "4月25日" },
        { label: "住宿天数", value: "1晚（4/24–4/25）" },
        { label: "房型", value: "King Bed Standard ×2 + Standard Room ×1，均含早餐×2" },
        { label: "房间数", value: "3间" },
        { label: "订单号①", value: "1493518658151014400（2间：何子超+王致衡、邓小勇+徐浩然）" },
        { label: "订单号②", value: "1493629717482696704（1间：陈泊凡+王奕轩）" },
        { label: "入住人", value: "王致衡、何子超、王奕轩、邓小勇、徐浩然、陈泊凡" },
        { label: "备注", value: "Embassy Suites 4/24退房后入住，4/25退房后出发前往 ORD" }
      ]
    }
  ],

  /* ---------- 房间分配 ---------- */
  rooms: [
    { room: "Embassy Suites ①", guests: "王致衡、何子超、王奕轩", note: "AHX6EYLI，4/20–4/24" },
    { room: "Embassy Suites ②", guests: "邓小勇、徐浩然", note: "4WYPMX0S，4/20–4/24" },
    { room: "Embassy Suites ③", guests: "陈照君、张倍睿", note: "XYP97E3W，4/20–4/24" },
    { room: "Embassy Suites ④", guests: "欧起纶、谢一平", note: "S26I2LCU，4/20–4/24" },
    { room: "Embassy Suites ⑤", guests: "陈泊凡", note: "17174578187，4/20–4/24" },
    { room: "Marco 自行处理", guests: "Marco（1690X）", note: "酒店自行安排" },
    { room: "Crowne Plaza ① 4/24–25", guests: "何子超、王致衡", note: "King Bed，订单 1493518658151014400" },
    { room: "Crowne Plaza ② 4/24–25", guests: "邓小勇、徐浩然", note: "King Bed，订单 1493518658151014400" },
    { room: "Crowne Plaza ③ 4/24–25", guests: "陈泊凡、王奕轩", note: "Standard Room，订单 1493629717482696704" }
  ],

  /* ---------- 租车信息 ---------- */
  rentals: [
    {
      title: "高中组用车 · 商务七座",
      subtitle: "Marco 租车 & 驾驶，比赛期间日常用车",
      rows: [
        { label: "租车公司", value: "待确认" },
        { label: "车型", value: "商务七座 SUV" },
        { label: "取车日期", value: "4月20日（抵达圣路易斯后）" },
        { label: "还车日期", value: "4月24日（比赛结束当天）" },
        { label: "取车地点", value: "圣路易斯当地" },
        { label: "还车地点", value: "圣路易斯当地" },
        { label: "主驾驶", value: "Marco（需持有效驾照）" },
        { label: "保险", value: "待确认" },
        { label: "用途", value: "比赛期间酒店↔赛场日常接送（4/20–4/24）" },
        { label: "订单号", value: "待确认" }
      ]
    }
  ],

  /* ---------- 每日安排 ---------- */
  schedule: [
    {
      date: "4月19日（周日）· 出发日",
      events: [
        { time: "22:10", desc: "3U3837 成都天府起飞（11人，Marco除外）", location: "TFU", transport: "飞机" },
        { time: "20:30", desc: "抵达洛杉矶 LAX（当地同日），Marco在此汇合", location: "LAX", transport: "" }
      ]
    },
    {
      date: "4月20日（周一）· 抵达日",
      events: [
        { time: "01:01", desc: "AA1736 洛杉矶→芝加哥，全员12人", location: "LAX → ORD", transport: "飞机" },
        { time: "07:18", desc: "抵达芝加哥 ORD T3", location: "ORD", transport: "" },
        { time: "上午", desc: "15座包车 ORD→圣路易斯酒店（约4.5h）", location: "ORD → STL 酒店", transport: "包车" },
        { time: "下午", desc: "休整 / 赛事注册", location: "酒店/赛场", transport: "" }
      ]
    },
    {
      date: "4月21日–24日 · 比赛日",
      events: [
        { time: "上午", desc: "高中组：Marco租车送往赛场 / 初中组：随姜楠大巴", location: "酒店 → 赛场", transport: "" },
        { time: "全天", desc: "比赛（具体赛程另附）", location: "赛场", transport: "" },
        { time: "赛后", desc: "高中组：Marco租车接回 / 初中组：随姜楠大巴", location: "赛场 → 酒店", transport: "" }
      ]
    },
    {
      date: "4月24日（周四）· 高中组最后比赛日 + Marco还车",
      events: [
        { time: "全天", desc: "高中组最后比赛 / 闭幕式", location: "赛场", transport: "Marco租车" },
        { time: "赛后", desc: "Marco 还车，租车使用结束", location: "圣路易斯", transport: "" },
        { time: "晚间", desc: "高中组回酒店整理行李，Embassy Suites退房", location: "酒店", transport: "" }
      ]
    },
    {
      date: "4月25日（周五）· 高中组返程（王奕轩带队，5人）",
      events: [
        { time: "04:00", desc: "Crowne Plaza 退房，前往 St. Louis Gateway Station", location: "酒店 → 车站", transport: "" },
        { time: "04:30", desc: "Amtrak Train 300 出发（Lincoln Service），5人", location: "STL Gateway Station", transport: "火车" },
        { time: "09:25", desc: "抵达 Chicago Union Station，转往 ORD 机场", location: "CHI → ORD", transport: "" },
        { time: "13:18", desc: "AA1666 芝加哥ORD T3→洛杉矶LAX", location: "ORD → LAX", transport: "飞机" },
        { time: "15:54", desc: "抵达洛杉矶 LAX，需过夜等待次日国际航班", location: "LAX", transport: "" }
      ]
    },
    {
      date: "4月26日（周日）· 高中组5人 回国",
      events: [
        { time: "23:15", desc: "3U3838 洛杉矶起飞回成都", location: "LAX → TFU", transport: "飞机" }
      ]
    },
    {
      date: "4月25日–28日 · 初中组继续比赛",
      events: [
        { time: "全天", desc: "初中组（7977A+陈照君）继续比赛", location: "赛场", transport: "姜楠大巴" },
        { time: "赛后", desc: "返回酒店", location: "酒店", transport: "" }
      ]
    },
    {
      date: "4月28日（周二）· 初中组最后比赛日",
      events: [
        { time: "全天", desc: "初中组最后比赛 / 闭幕式", location: "赛场", transport: "姜楠大巴" },
        { time: "晚间", desc: "初中组回酒店整理行李", location: "酒店", transport: "" }
      ]
    },
    {
      date: "4月29日（周三）· 初中组返程",
      events: [
        { time: "上午", desc: "初中组出发前往ORD机场（约4.5h车程）", location: "STL → ORD", transport: "待确认" },
        { time: "16:15", desc: "CX801 芝加哥ORD T5 → 香港HKG T1", location: "ORD → HKG", transport: "飞机" }
      ]
    },
    {
      date: "4月30日（周四）· 初中组飞行中",
      events: [
        { time: "21:00", desc: "抵达香港 HKG T1，等待次日转机", location: "HKG", transport: "" }
      ]
    },
    {
      date: "5月1日（周五）· 初中组抵达成都",
      events: [
        { time: "10:00", desc: "CX986 香港HKG T1 → 成都天府TFU T1", location: "HKG → TFU", transport: "飞机" },
        { time: "12:35", desc: "抵达成都天府，初中组行程结束", location: "TFU T1", transport: "" }
      ]
    }
  ],

  /* ---------- 联系人 ---------- */
  /* ---------- 晚餐推荐（4/20–24） ---------- */
  dining: [
    {
      zone: "酒店附近 · Embassy Suites / Crowne Plaza（Bridgeton）",
      restaurants: [
        { name: "Anne Morrow's（酒店内餐厅）", cuisine: "美式", distance: "0 min · 酒店大堂", avg: "$15–25", note: "Embassy Suites 自带餐厅，5–9pm 营业，小食/沙拉/正餐" },
        { name: "IHOP", cuisine: "美式早餐/简餐", distance: "步行 3 min", avg: "$10–15", note: "全天候营业，汉堡/煎饼/三明治" },
        { name: "Fazoli's", cuisine: "意式快餐", distance: "车程 3 min", avg: "$8–12", note: "平价意面/披萨，性价比高" },
        { name: "Applebee's", cuisine: "美式休闲", distance: "车程 5 min", avg: "$15–20", note: "牛排/汉堡/沙拉，适合团队聚餐" },
        { name: "Olive Garden", cuisine: "意式", distance: "车程 5 min", avg: "$15–22", note: "无限面包棒+沙拉，意面/披萨" },
        { name: "Red Lobster", cuisine: "海鲜", distance: "车程 5 min", avg: "$18–25", note: "龙虾/虾/鱼，海鲜爱好者首选" },
        { name: "Cracker Barrel", cuisine: "南方家常", distance: "车程 5 min", avg: "$12–18", note: "炸鸡/烤肉/家常菜，分量足" },
        { name: "Bob Evans", cuisine: "美式家常", distance: "车程 5 min", avg: "$12–18", note: "家庭风格正餐，价格适中" },
        { name: "Panda Express", cuisine: "中式快餐", distance: "车程 5 min", avg: "$8–12", note: "橙子鸡/炒面，熟悉的中式口味" },
        { name: "Chick-fil-A", cuisine: "炸鸡快餐", distance: "车程 5 min", avg: "$8–12", note: "炸鸡三明治/鸡块，周日不营业" }
      ]
    },
    {
      zone: "赛场附近 · America's Center（Downtown STL）",
      restaurants: [
        { name: "Sugarfire Smoke House", cuisine: "美式BBQ", distance: "步行 < 5 min", avg: "$12–18", note: "圣路易斯风味烧烤，拉猪肉/牛胸肉/排骨" },
        { name: "Sen Thai", cuisine: "泰餐", distance: "步行 < 5 min", avg: "$12–18", note: "泰式炒面/冬阴功/咖喱，口味丰富" },
        { name: "Hi-Pointe Drive-In", cuisine: "汉堡", distance: "步行 < 5 min", avg: "$10–15", note: "本地名汉堡店，食材新鲜" },
        { name: "Sauce on the Side", cuisine: "意式卡颂", distance: "步行 < 5 min", avg: "$10–15", note: "特色卡颂（Calzone），曾上美食节目" },
        { name: "Aubergine Cafe", cuisine: "泰餐", distance: "步行 < 5 min", avg: "$10–15", note: "咖喱角/泰式炒面，价格友好" },
        { name: "Sushi Ai", cuisine: "日料寿司", distance: "步行 < 10 min", avg: "$15–20", note: "新鲜寿司，$20以内可吃饱" },
        { name: "Rosalita's Cantina", cuisine: "墨西哥", distance: "步行 < 10 min", avg: "$12–18", note: "Tex-Mex 风味，适合家庭/团队" },
        { name: "Kimchi Guys", cuisine: "韩餐", distance: "步行 < 15 min", avg: "$12–16", note: "韩式炸鸡/拌饭/炒年糕" },
        { name: "Condado Tacos", cuisine: "墨西哥 Taco", distance: "步行 < 15 min", avg: "$12–16", note: "DIY Taco，Ballpark Village 内" },
        { name: "Salt + Smoke", cuisine: "美式BBQ", distance: "步行 < 15 min", avg: "$15–22", note: "慢烤牛胸肉/猪肉，配芝士面包" },
        { name: "Katie's", cuisine: "意式", distance: "步行 < 15 min", avg: "$20–30", note: "获奖意大利餐厅，手工披萨/意面" },
        { name: "Ramsay's Kitchen", cuisine: "高端西餐", distance: "步行 < 15 min", avg: "$40–60", note: "Gordon Ramsay 主理，四季酒店8楼" }
      ]
    }
  ],

  contacts: [
    { role: "高中组教练",   name: "何子超", phone: "待补充", note: "1690X + 291Z" },
    { role: "初中组教练",   name: "陈照君", phone: "待补充", note: "7977A" },
    { role: "摄像",         name: "王奕轩", phone: "待补充", note: "问鼎之路" },
    { role: "机票平台",     name: "待确认", phone: "待确认", note: "出票 & 改签" },
    { role: "大巴/租车",    name: "待确认", phone: "待确认", note: "" },
    { role: "酒店前台",     name: "待确认", phone: "待确认", note: "" },
    { role: "中国驻美使馆", name: "驻芝加哥总领馆", phone: "+1(312)803-0095", note: "紧急求助" }
  ],

  /* ---------- 出行提醒 ---------- */
  checklist: [
    {
      group: "📄 证件",
      items: ["护照（有效期 > 6个月）","美国签证（B1/B2）","身份证","驾照 + 国际驾照翻译件","机票行程单打印件","酒店确认单打印件","参赛邀请函"]
    },
    {
      group: "📱 通讯",
      items: ["美国电话卡 / 国际漫游","WhatsApp 提前注册","酒店英文地址截图","赛场英文地址截图","领队微信群置顶"]
    },
    {
      group: "💳 资金",
      items: ["Visa/Mastercard 信用卡","少量美元现金（$200+）","可支付押金的银行卡"]
    },
    {
      group: "🧳 出行",
      items: ["托运行李 ≤ 23kg×2/人","随身行李尺寸 < 56cm","转机时间充足（≥3小时）","入境材料齐全","美国插头转换器","常用药品"]
    }
  ]
};


/* ============================================================
   渲染函数
   ============================================================ */

function render() {
  renderHero();
  renderOverview();
  renderMembers();
  renderEventInfo();
  fetchLiveData();
  setInterval(fetchLiveData, 300000); // 5分钟自动刷新
  renderFlights();
  renderTransport();
  renderHotels();
  renderRooms();
  renderRentals();
  renderSchedule();
  renderDining();
  renderContacts();
  renderChecklist();
  bindActions();
}

/* ----- Hero ----- */
function renderHero() {
  document.getElementById("team-title").textContent =
    DATA.team.name + " — " + DATA.team.event;
  document.getElementById("team-subtitle").textContent =
    "目的地：" + DATA.team.destination;

  const meta = document.getElementById("hero-meta");
  const items = [
    { icon: svgCalendar, text: DATA.team.departDate + " → " + DATA.team.returnDate },
    { icon: svgPin,      text: DATA.team.destination },
    { icon: svgUsers,    text: DATA.team.headcount + " 人" },
    { icon: svgPlane,    text: "出发城市：" + DATA.team.departureCity }
  ];
  meta.innerHTML = items
    .map(i => `<span class="hero__meta-item">${i.icon}${i.text}</span>`)
    .join("");
}

/* ----- Overview ----- */
function renderOverview() {
  const statusMap = {
    preparing: ["筹备中", "tag--preparing"],
    active:    ["进行中", "tag--active"],
    completed: ["已完成", "tag--completed"]
  };
  const [label, cls] = statusMap[DATA.team.status] || statusMap.preparing;
  const tag = document.getElementById("trip-status");
  tag.textContent = label;
  tag.className = "section-card__tag " + cls;

  const statsEl = document.getElementById("overview-stats");
  statsEl.innerHTML = DATA.stats
    .map(s => `
      <article class="stat-card">
        <p class="stat-card__label">${s.label}</p>
        <p class="stat-card__value">${s.value}</p>
        <p class="stat-card__hint">${s.hint}</p>
      </article>`)
    .join("");

  const hlEl = document.getElementById("highlights");
  hlEl.innerHTML = DATA.highlights
    .map(h => `
      <div class="highlight-item">
        <div class="highlight-item__icon highlight-item__icon--${h.type}">${h.icon}</div>
        <div class="highlight-item__text">
          <strong>${h.title}</strong>
          <span>${h.desc}</span>
        </div>
      </div>`)
    .join("");
}

/* ----- Event Info ----- */
function renderEventInfo() {
  const ev = DATA.eventInfo;
  const el = document.getElementById("event-info");

  const divisionsHtml = ev.divisions.map(d => `
    <tr>
      <td><strong>${d.team}</strong></td>
      <td><span class="badge badge--transfer">${d.division}</span></td>
      <td>${d.date}</td>
      <td>
        <a href="javascript:void(0)" onclick="openTicket('${d.file}','${d.team} — ${d.division}')" class="ticket-item__btn">📄 查看分区名单</a>
      </td>
    </tr>`).join("");

  const linksHtml = ev.links.map(l => `
    <a href="${l.url}" target="_blank" rel="noopener" class="event-link">${l.label}</a>`).join("");

  el.innerHTML = `
    <div class="event-overview">
      <div class="event-detail-grid">
        <div class="event-detail"><span class="event-detail__label">赛事名称</span><span class="event-detail__value">${ev.name}</span></div>
        <div class="event-detail"><span class="event-detail__label">赛事日期</span><span class="event-detail__value">${ev.date}</span></div>
        <div class="event-detail"><span class="event-detail__label">比赛场馆</span><span class="event-detail__value">${ev.venue}</span></div>
        <div class="event-detail"><span class="event-detail__label">场馆地址</span><span class="event-detail__value">${ev.venueAddress}</span></div>
        <div class="event-detail"><span class="event-detail__label">主办方</span><span class="event-detail__value">${ev.organizer}</span></div>
        <div class="event-detail"><span class="event-detail__label">官网</span><span class="event-detail__value"><a href="${ev.website}" target="_blank" rel="noopener">${ev.website}</a></span></div>
      </div>
    </div>
    <div class="event-programs">
      <h3>分区信息</h3>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>队伍</th><th>分区</th><th>比赛日期</th><th>操作</th></tr></thead>
          <tbody>${divisionsHtml}</tbody>
        </table>
      </div>
    </div>
    <div class="event-links">
      <h3>常用链接</h3>
      <div class="event-links-grid">${linksHtml}</div>
    </div>`;
}

/* ----- Flights ----- */
function renderFlights() {
  const tbody = document.getElementById("flights-table");
  tbody.innerHTML = DATA.flights
    .map(f => {
      const ticketHtml = (f.tickets && f.tickets.length)
        ? `<tr class="ticket-detail-row"><td colspan="9">
            <div class="ticket-details">
              ${f.tickets.map(t => `
                <div class="ticket-item">
                  <span class="ticket-item__label">${t.label}</span>
                  <span class="ticket-item__pnr">PNR: ${mask(t.pnr)}</span>
                  ${t.file ? `<a href="javascript:void(0)" onclick="event.stopPropagation();openTicket('${t.file}','${t.label.replace(/'/g,"\\&#39;")}')" class="ticket-item__btn">📄 查看原始机票</a>` : '<span class="ticket-item__pending">⏳ 待出票</span>'}
                </div>`).join("")}
            </div>
          </td></tr>`
        : "";
      return `
      <tr class="flight-main-row${f.tickets ? ' has-tickets' : ''}" ${f.tickets ? 'onclick="this.classList.toggle(\'expanded\');this.nextElementSibling&&this.nextElementSibling.classList.toggle(\'show\')"' : ''}>
        <td><strong>${f.person}</strong></td>
        <td><span class="badge ${f.badgeClass}">${f.segment}</span></td>
        <td>${f.date}</td>
        <td><strong>${f.flightNo}</strong></td>
        <td>${f.time}</td>
        <td>${f.airport}</td>
        <td>${f.transfer}</td>
        <td>${f.luggage}</td>
        <td>${mask(f.orderNo)}${f.tickets ? ' <span class="ticket-toggle">▼</span>' : ''}</td>
      </tr>${ticketHtml}`;
    })
    .join("");
}

/* ----- Transport ----- */
function renderTransport() {
  const el = document.getElementById("transport-cards");
  el.innerHTML = DATA.transport.map(t => buildInfoCard(t, "bus")).join("");
}

/* ----- Hotels ----- */
function renderHotels() {
  const el = document.getElementById("hotel-cards");
  el.innerHTML = DATA.hotels.map(h => buildInfoCard(h, "hotel")).join("");
}

/* ----- Rooms ----- */
function renderRooms() {
  const tbody = document.getElementById("rooms-table");
  tbody.innerHTML = DATA.rooms
    .map(r => `<tr><td><strong>${r.room}</strong></td><td>${r.guests}</td><td>${mask(r.note)}</td></tr>`)
    .join("");
}

/* ----- Rentals ----- */
function renderRentals() {
  const el = document.getElementById("rental-cards");
  el.innerHTML = DATA.rentals.map(r => buildInfoCard(r, "car")).join("");
}

/* ----- Schedule ----- */
function renderSchedule() {
  const el = document.getElementById("schedule-timeline");
  el.innerHTML = DATA.schedule
    .map(day => {
      const events = day.events
        .map(e => {
          const transport = e.transport
            ? `<span class="timeline-event__transport">${e.transport}</span>`
            : "";
          const loc = e.location
            ? `<span class="timeline-event__location">📍 ${e.location}</span>`
            : "";
          return `
            <div class="timeline-event">
              <span class="timeline-event__time">${e.time}</span>
              <span class="timeline-event__desc">${e.desc}</span>
              ${loc}${transport}
            </div>`;
        })
        .join("");
      return `
        <div class="timeline-day">
          <h3 class="timeline-day__title">${day.date}</h3>
          ${events}
        </div>`;
    })
    .join("");
}

/* ----- Dining ----- */
function renderDining() {
  const el = document.getElementById("dining-info");
  el.innerHTML = DATA.dining.map(zone => {
    const rows = zone.restaurants.map(r => `
      <tr>
        <td><strong>${r.name}</strong></td>
        <td>${r.cuisine}</td>
        <td>${r.distance}</td>
        <td><strong>${r.avg}</strong></td>
        <td>${r.note}</td>
      </tr>`).join("");
    return `
      <div class="dining-zone">
        <h3 class="dining-zone__title">${zone.zone}</h3>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>餐厅</th>
                <th>菜系</th>
                <th>距离</th>
                <th>人均</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }).join("");
}

/* ----- Contacts ----- */
function renderContacts() {
  const el = document.getElementById("contact-cards");
  el.innerHTML = DATA.contacts
    .map(c => `
      <div class="info-card">
        <div class="info-card__header">
          <div class="info-card__icon info-card__icon--contact">👤</div>
          <div>
            <div class="info-card__title">${c.name}</div>
            <div class="info-card__subtitle">${c.role}</div>
          </div>
        </div>
        <div class="info-card__body">
          <div class="info-card__row">
            <span class="info-card__row-label">电话</span>
            <span class="info-card__row-value">${c.phone}</span>
          </div>
          ${c.note ? `<div class="info-card__row">
            <span class="info-card__row-label">备注</span>
            <span class="info-card__row-value">${c.note}</span>
          </div>` : ""}
        </div>
      </div>`)
    .join("");
}

/* ----- Checklist ----- */
function renderChecklist() {
  const el = document.getElementById("checklist-groups");
  el.innerHTML = DATA.checklist
    .map(g => `
      <div class="checklist-group">
        <p class="checklist-group__title">${g.group}</p>
        <ul class="checklist-group__list">
          ${g.items.map(i => `<li>${i}</li>`).join("")}
        </ul>
      </div>`)
    .join("");
}

/* ----- Members ----- */
function renderMembers() {
  const total = DATA.members.reduce((sum, g) => sum + g.persons.length, 0);
  document.getElementById("member-count").textContent = total + " 人";

  const el = document.getElementById("roster-groups");
  el.innerHTML = DATA.members
    .map(g => {
      const persons = g.persons
        .map(p => {
          const eng = p.english ? `<span class="roster-person__eng">${p.english}</span>` : "";
          const passportStatusMap = {
            verified: { label: "✅ 已核验", cls: "passport-ok" },
            missing:  { label: "❌ 缺失", cls: "passport-missing" },
            self:     { label: "⚠️ 自行管理", cls: "passport-self" },
            na:       { label: "— 不适用", cls: "passport-na" }
          };
          const ps = passportStatusMap[p.passportStatus] || passportStatusMap.missing;
          const passportInfo = p.passport
            ? `<span class="roster-person__passport-no">${mask(p.passport)}</span>`
            : "";
          const expiryInfo = p.passportExpiry
            ? `<span class="roster-person__passport-expiry">有效期至 ${_unlocked ? p.passportExpiry : '••••-••-••'}</span>`
            : "";
          const viewBtn = p.passportImg
            ? `<a href="javascript:void(0)" onclick="openTicket('${p.passportImg}','${p.name} 护照')" class="ticket-item__btn">📄 查看护照</a>`
            : "";
          return `
            <div class="roster-person">
              <div class="roster-person__avatar" style="background:${g.color}">${p.name.charAt(0)}</div>
              <div class="roster-person__info">
                <span class="roster-person__name">${p.name}${eng}</span>
                <span class="roster-person__role">${p.role}</span>
                <div class="roster-person__passport">
                  <span class="roster-person__passport-status ${ps.cls}">${ps.label}</span>
                  ${passportInfo}${expiryInfo}${viewBtn}
                </div>
              </div>
            </div>`;
        })
        .join("");
      return `
        <div class="roster-group">
          <div class="roster-group__header">
            <span class="roster-group__badge" style="background:${g.color}">${g.group}</span>
            <span class="roster-group__count">${g.persons.length}人</span>
          </div>
          <div class="roster-group__members">${persons}</div>
        </div>`;
    })
    .join("");
}

/* ----- Shared: info card builder ----- */
function buildInfoCard(data, iconType) {
  const iconMap = { bus: "🚌", hotel: "🏨", car: "🚗" };
  const sensitiveLabels = /订单号|参考号|Reference|PNR|前台电话/i;
  const rows = data.rows
    .map(r => {
      const val = sensitiveLabels.test(r.label) ? mask(r.value) : r.value;
      return `
      <div class="info-card__row">
        <span class="info-card__row-label">${r.label}</span>
        <span class="info-card__row-value">${val}</span>
      </div>`;
    })
    .join("");

  // Confirm status + view-original buttons
  let confirmHtml = "";
  if (data.confirmStatus) {
    const statusMap = {
      verified: { label: "✅ 已核验", cls: "passport-ok" },
      pending:  { label: "⏳ 待确认", cls: "passport-self" },
    };
    const s = statusMap[data.confirmStatus] || statusMap.pending;
    const btns = (data.confirmFiles || []).map(f =>
      `<a href="javascript:void(0)" onclick="openTicket('${f.file.replace(/'/g,"\\'")}','${f.label.replace(/'/g,"\\'")}')" class="ticket-item__btn">📄 ${f.label}</a>`
    ).join("");
    confirmHtml = `
      <div class="info-card__confirm">
        <span class="roster-person__passport-status ${s.cls}">${s.label}</span>
        <div class="info-card__confirm-btns">${btns}</div>
      </div>`;
  }

  return `
    <div class="info-card">
      <div class="info-card__header">
        <div class="info-card__icon info-card__icon--${iconType}">${iconMap[iconType]}</div>
        <div>
          <div class="info-card__title">${data.title || data.name}</div>
          ${data.subtitle ? `<div class="info-card__subtitle">${data.subtitle}</div>` : ""}
        </div>
      </div>
      <div class="info-card__body">${rows}</div>
      ${confirmHtml}
    </div>`;
}

/* ----- Ticket / Passport Modal ----- */
function openTicket(fileUrl, title) {
  if (!_unlocked) { requireAuth(() => openTicket(fileUrl, title)); return; }
  const modal = document.getElementById("ticket-modal");
  const inner = modal.querySelector(".ticket-modal__inner");
  const iframe = document.getElementById("ticket-iframe");
  const imgWrap = document.getElementById("ticket-img-wrap");
  const imgEl = document.getElementById("ticket-img");
  const titleEl = document.getElementById("ticket-modal-title");
  titleEl.textContent = title;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
  if (isImage) {
    iframe.style.display = "none";
    iframe.src = "";
    imgWrap.style.display = "block";
    imgEl.src = fileUrl;
    inner.classList.add("ticket-modal__inner--img");
  } else {
    imgWrap.style.display = "none";
    imgEl.src = "";
    iframe.style.display = "block";
    iframe.src = fileUrl;
    inner.classList.remove("ticket-modal__inner--img");
  }
  modal.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeTicket() {
  const modal = document.getElementById("ticket-modal");
  const inner = modal.querySelector(".ticket-modal__inner");
  const iframe = document.getElementById("ticket-iframe");
  const imgWrap = document.getElementById("ticket-img-wrap");
  const imgEl = document.getElementById("ticket-img");
  modal.classList.remove("show");
  inner.classList.remove("ticket-modal__inner--img");
  iframe.src = "";
  imgEl.src = "";
  imgWrap.style.display = "none";
  document.body.style.overflow = "";
}

/* ----- Live Data ----- */
function fetchLiveData() {
  fetch("live_data.json?" + Date.now())
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(data => renderLive(data))
    .catch(() => {
      document.getElementById("live-data").innerHTML =
        '<p class="live-data__loading">⚠️ 暂无实时数据，请先运行 <code>python fetch_live.py --loop</code></p>';
      document.getElementById("live-updated").textContent = "";
    });
}

function renderLive(data) {
  const el = document.getElementById("live-data");
  const tag = document.getElementById("live-updated");
  tag.textContent = "更新: " + data.updated;

  const teamBlocks = data.teams.map(t => {
    const hasMatches = t.matches && t.matches.length > 0;
    const hasRanking = !!t.ranking;

    // Ranking card
    let rankHtml = "";
    if (hasRanking) {
      const r = t.ranking;
      rankHtml = `
        <div class="live-ranking">
          <div class="live-ranking__rank">#${r.rank}</div>
          <div class="live-ranking__stats">
            <span class="live-stat"><strong>${r.wins}</strong>胜</span>
            <span class="live-stat"><strong>${r.losses}</strong>负</span>
            <span class="live-stat"><strong>${r.ties}</strong>平</span>
            <span class="live-stat">WP <strong>${r.wp}</strong></span>
            <span class="live-stat">AP <strong>${r.ap}</strong></span>
            <span class="live-stat">SP <strong>${r.sp}</strong></span>
          </div>
        </div>`;
    } else {
      rankHtml = '<div class="live-ranking"><span class="live-ranking__pending">暂无排名数据</span></div>';
    }

    // Matches table
    let matchHtml = "";
    if (hasMatches) {
      const rows = t.matches.map(m => {
        const resultCls = m.result === "win" ? "live-win" : m.result === "loss" ? "live-loss" : m.result === "tie" ? "live-tie" : "live-pending";
        const resultLabel = m.result === "win" ? "✅ 胜" : m.result === "loss" ? "❌ 负" : m.result === "tie" ? "🟰 平" : "⏳ 待赛";
        const scoreText = (m.red_score !== null && m.blue_score !== null)
          ? `<span class="live-score-red">${m.red_score}</span> : <span class="live-score-blue">${m.blue_score}</span>`
          : "— : —";
        const ourCls = m.our_alliance === "red" ? "live-our-red" : m.our_alliance === "blue" ? "live-our-blue" : "";
        return `<tr class="${resultCls}">
          <td>${m.name}</td>
          <td class="${ourCls}">${m.red_teams.join(" & ")}</td>
          <td>${scoreText}</td>
          <td>${m.blue_teams.join(" & ")}</td>
          <td><span class="live-result-badge ${resultCls}">${resultLabel}</span></td>
        </tr>`;
      }).join("");
      matchHtml = `
        <div class="table-wrapper">
          <table class="live-match-table">
            <thead><tr><th>场次</th><th>红方</th><th>比分</th><th>蓝方</th><th>结果</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    } else {
      matchHtml = '<p class="live-data__no-match">暂无对阵数据（比赛尚未开始）</p>';
    }

    return `
      <div class="live-team-block">
        <div class="live-team-header">
          <span class="live-team-name">${t.team}</span>
          <span class="badge badge--transfer">${t.division} Division</span>
        </div>
        ${rankHtml}
        ${matchHtml}
      </div>`;
  }).join("");

  el.innerHTML = teamBlocks;
}

/* ----- Actions ----- */
function bindActions() {
  document.getElementById("print-button").addEventListener("click", () => {
    window.print();
  });

  let expanded = false;
  document.getElementById("expand-button").addEventListener("click", function () {
    expanded = !expanded;
    document.querySelectorAll(".section-card").forEach(card => {
      card.style.display = expanded ? "block" : "";
    });
    this.textContent = expanded ? "收起全部模块" : "展开全部模块";
  });
}

/* ============================================================
   小图标 SVG
   ============================================================ */
const svgCalendar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const svgPin = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const svgUsers = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const svgPlane = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`;


/* ============================================================
   启动
   ============================================================ */
document.addEventListener("DOMContentLoaded", render);
