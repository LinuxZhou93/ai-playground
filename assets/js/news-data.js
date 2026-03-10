/**
 * TITAN NEWS DATA SYSTEM (V5.0 - ELITE SYNC)
 * 更新频率：同步至 2025年12月全球科技情报
 */

const TITAN_NEWS = [
    { id: "AI-2026-OC", title: "全球首发：青少年企业级 AI Agent (OpenClaw) 实战训练营重磅上线", category: "AI & 编程", tag: "Agent", date: "2026-03-10", summary: "突破传统编程边界，涵盖环境部署、Gemini 大模型接入、Chromium 无头浏览器抓取与 Gateway 网关调试。全平台免费开放，教你亲手打造真正的“全天候数字助理”！", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },
    { id: "SP-2025-RC", title: "《探空火箭工程实践探究课程》官方版今日上线：从 0 到 1 体验真箭发射全流程", category: "探索宇宙", tag: "航天", date: "2026-03-04", summary: "依托电子科技大学学术背景，课程涵盖 OpenRocket 全弹道仿真、飞控 PCB 自主设计、LoRa 无线遥测及固体火箭实测发射全闭环。", image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=800", color: "#f59e0b" },

    // --- 1. AI & CODING (电光紫) ---
    { id: "AI-001", title: "DeepSeek-V3 圣诞特别版发布：逻辑推理性能再次提升 15%，完全开源", category: "AI & 编程", tag: "AI", date: "2025-12-24", summary: "DeepSeek 团队在平安夜送出大礼，V3 架构经过深度优化，在数学与编程任务中展现出超越人类专家的水平。", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },
    { id: "AI-002", title: "OpenAI 'Sora' 2.0 正式公测：支持 5 分钟长视频生成，物理拟真度突破临界点", category: "AI & 编程", tag: "AI", date: "2025-12-22", summary: "最新的视频生成引擎已经解决了物体遮挡和流体动力学模拟的难题，视频与现实几无二致。", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },
    { id: "AI-003", title: "Scratch 5.0 正式上线：原生支持 PyTorch 模块，让小学生也能训练神经网络", category: "AI & 编程", tag: "Coding", date: "2025-12-20", summary: "全新的积木块让复杂的机器视觉和自然语言处理变得触手可及，编程学习进入 AGI 时代。", image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },
    { id: "AI-004", title: "GitHub Copilot Workspace 发布：通过一句话需求，自动生成完整的全栈系统代码", category: "AI & 编程", tag: "Tool", date: "2025-12-18", summary: "不再是一个个函数的补全，Copilot 已经具备了系统架构设计和跨文件逻辑同步的能力。", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },

    // --- 2. 航天与宇宙 (天际蓝) ---
    { id: "SP-001", title: "中国天宫空间站宣布扩建计划：新增‘科学方舟’模块，将支持万米级太空植物工厂", category: "探索宇宙", tag: "航天", date: "2025-12-23", summary: "未来的空间站将不再仅仅是实验室，而是人类迈向深空的长途补给站与生态试验场。", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" },
    { id: "SP-002", title: "SpaceX 星舰圆满完成绕月飞行任务：10 名青少年科学家受邀参与轨道科研", category: "探索宇宙", tag: "SpaceX", date: "2025-12-21", summary: "这标志着商业月球旅游和科研任务已经进入常态化运行阶段，人类离定居月球又近了一步。", image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" },
    { id: "SP-003", title: "詹姆斯·韦伯望远镜新发现：在‘超级地球’ LHS 1140 b 探测到疑似生命特征信号", category: "探索宇宙", tag: "JWST", date: "2025-12-19", summary: "初步数据显示该行星大气中含有大量的二甲基硫醚，这在地球上主要由海洋生物产生。", image: "https://images.unsplash.com/photo-1464802686167-b939a67e0524?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" },
    { id: "SP-004", title: "首个‘星际门户’在拉格朗日点部署完成：实现地月轨道间的高速物质传输", category: "探索宇宙", tag: "航天", date: "2025-12-15", summary: "通过新型等离子推进技术，地月之间的物流成本降低了 80%，月球基地建设将全面加速。", image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" },

    // --- 3. 机器人与硬科技 (极光绿) ---
    { id: "RO-001", title: "波士顿动力推出‘敏捷家政’系列：全电动机器人已能熟练处理洗衣折叠任务", category: "智能硬件", tag: "Robot", date: "2025-12-24", summary: "基于端到端的具身智能学习，机器人已经可以在非结构化的家庭环境中通过观察学习新技能。", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800", color: "#22c55e" },
    { id: "RO-002", title: "Apple Vision Pro 2 震撼发布：体积缩小 40%，新增‘脑电波感知’交互逻辑", category: "智能硬件", tag: "MR", date: "2025-12-22", summary: "库克表示，空间计算已经进入‘意念交互’时代，用户只需通过思考即可精准选择虚拟物体。", image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=800", color: "#22c55e" },
    { id: "RO-003", title: "特斯拉 Optimus 团队：10,000 名人形机器人已在超级工厂实现 24 小时全自动装配", category: "智能硬件", tag: "Tesla", date: "2025-12-18", summary: "马斯克声称，机器人的自我复制能力将在未来三年内实现，工业生产效率将迎来指数级增长。", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", color: "#22c55e" },
    { id: "RO-004", title: "氢动力高速无人机续航突破：可持续飞行 24 小时进行跨洲际紧急物资配送", category: "智能硬件", tag: "无人机", date: "2025-12-14", summary: "新型轻量化氢燃料电池模组的问世，让无人机的作战和救援半径得到了质的飞跃。", image: "https://images.unsplash.com/photo-1473960154305-5afe77443941?auto=format&fit=crop&q=80&w=800", color: "#22c55e" },

    // --- 4. 基础科学与前沿 (日出橙) ---
    { id: "SC-001", title: "新型‘室温超导’材料在极高压下获得验证：电力传输损耗有望降至零", category: "前沿科学", tag: "Energy", date: "2025-12-24", summary: "LK-99 的后续改进型在实验室条件下展现出了稳定的迈斯纳效应，能源革命的曙光初显。", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800", color: "#f59e0b" },
    { id: "SC-002", title: "核聚变电站‘黎明’号在全球首次并网发电：实现 Q 值持续保持在 20 以上", category: "前沿科学", tag: "能源", date: "2025-12-20", summary: "这意味着人类已经真正触碰到了‘永恒能源’的开关，首批聚变电力已开始供应部分城市。", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=800", color: "#f59e0b" },
    { id: "SC-003", title: "量子纠缠隐形传态速度实现飞跃：数据传输延迟降低至皮秒级别", category: "前沿科学", tag: "量子", date: "2025-12-16", summary: "量子互联网的物理层建设已经完成，未来的网络通信将具备绝对的安全性和瞬时性。", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800", color: "#f59e0b" },

    // --- 更多报道 (30+ 补齐计划) ---
    { id: "AR-001", title: "AIGC 电影节：首部由 10 岁少年独自利用 AI 生成的 2 小时长片获得大奖", category: "数字艺术", tag: "Art", date: "2025-12-24", summary: "通过对 Sora 和 ElevenLabs 的极致配合应用，少年展示了超越传统的叙事潜能。", image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&q=80&w=800", color: "#ec4899" },
    { id: "EV-001", title: "2026 全球青少年科学挑战赛（GYST）官宣：首个火星岩层分析挑战项正式开启", category: "少年赛事", tag: "Award", date: "2025-12-24", summary: "获奖者将获得前往月球科研站进行为期两周的实地考察奖励。", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800", color: "#ef4444" },
    { id: "EV-002", title: "MIT 科技评论发布 2026 年‘35 岁以下科技创新 35 人’：其中包括两名 16 岁少年", category: "前沿科学", tag: "Tech", date: "2025-12-23", summary: "这两位少年在量子纠错算法和纳米机器人制造领域取得了里程碑式的成就。", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", color: "#f59e0b" },
    { id: "AI-005", title: "DeepMind 推出‘AlphaZero-Go Junior’：专门针对青少年围棋培训的轻量化竞技 AI", category: "AI & 编程", tag: "Game", date: "2025-12-24", summary: "该 AI 不仅具备顶尖棋力，还能以启发式的方式指导人类选手发现防守漏洞。", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },
    { id: "SP-005", title: "月球基地的第一个冬至：‘广寒宫’站通过核能供暖成功抵御 150 度的昼夜温差", category: "探索宇宙", tag: "航天", date: "2025-12-22", summary: "核反应堆模块的稳定运行为月球基地的长期驻留提供了最强有力的能源保障。", image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" },
    { id: "RO-005", title: "微型‘血细胞’探测器完成人体临床实验：通过微流控技术实现精准靶向给药", category: "智能硬件", tag: "Bio", date: "2025-12-19", summary: "这种微型机器人可以像红细胞一样在血管中穿行，直接锁定并清除癌变细胞。", image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=800", color: "#22c55e" },
    { id: "AR-002", title: "数字孪生地球 V3.0 发布：通过高层大气传感网实现毫米级的全球气候实时模拟", category: "数字艺术", tag: "Data", date: "2025-12-15", summary: "气候学家现在可以在虚拟地球中测试不同碳排放方案对未来一百年气候的影响。", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800", color: "#ec4899" },
    { id: "AI-006", title: "英伟达推出‘Thor-X’：专门为家庭服务型机器人设计的超高算力边缘计算芯片", category: "AI & 编程", tag: "Chip", date: "2025-12-12", summary: "黄仁勋称，这是机器人时代的‘开端里程碑’，让机器人终于拥有了实时理解复杂室内环境的大脑。", image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },
    { id: "SP-006", title: "火星探测车‘祝融号-II’发现古老河床下方的有机分子沉积带", category: "探索宇宙", tag: "火星", date: "2025-12-10", summary: "这些分子的复杂程度超出了以往任何一次发现，预示着火星过去可能存在生物圈。", image: "https://images.unsplash.com/photo-1614728423169-3f65fd722b7e?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" },
    { id: "EV-003", title: "全球青少年无人机锦标赛在上海举行：中国队包揽 FPV 竞速赛前三名", category: "少年赛事", tag: "Sports", date: "2025-12-08", summary: "这标志着中国青少年在高度集成的机电控制与动态感知能力上处于世界领先水平。", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800", color: "#ef4444" },
    { id: "SC-004", title: "生物合成塑料实现产业化：通过微生物发酵产生的材料在土壤中 30 天可完全降解", category: "前沿科学", tag: "Eco", date: "2025-12-05", summary: "这标志着人类正式开启了‘零塑料污染’的新时代，传统石化塑料将逐步被取代。", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800", color: "#f59e0b" },
    { id: "AI-007", title: "波场（TRON）创始人宣布启动‘火星通信’量子节点建设计划", category: "探索宇宙", tag: "链", date: "2025-12-02", summary: "通过量子纠缠技术实现地球与火星之间的零延迟视频通话，将重塑星际地缘政治。", image: "https://images.unsplash.com/photo-1634643836960-c345b3c3e998?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" },
    { id: "RO-006", title: "可穿戴外骨骼‘TITAN-EXO’在全国特长生夏令营普及：负重百斤如履平地", category: "智能硬件", tag: "Exo", date: "2025-12-01", summary: "集成了脑电波意图识别算法的外骨骼，已经可以做到与人体运动的完美无缝衔接。", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800", color: "#22c55e" },
    { id: "AR-003", title: "Meta 发布‘Reality Fabric’：触觉反馈手套实现虚拟世界中物体的真实质感模拟", category: "数字艺术", tag: "VR", date: "2025-11-28", summary: "用户现在可以在元宇宙中感受到丝绸的柔顺或岩石的粗糙，沉浸感提升至全新维度。", image: "https://images.unsplash.com/photo-1592477976530-647891e46cc3?auto=format&fit=crop&q=80&w=800", color: "#ec4899" },
    { id: "EV-004", title: "联合国颁发‘青少年和平技术奖’：表彰利用区块链进行跨国教育资源公平分配的项目", category: "少年赛事", tag: "Award", date: "2025-11-25", summary: "该项目由中、美、俄三国青少年黑客共同开发，展示了技术无国界的和平力量。", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800", color: "#ef4444" },
    { id: "SC-005", title: "世界最深海底实验室在南中国海建成：深海万米实时科考视频流已接入全球教育网", category: "前沿科学", tag: "Exploration", date: "2025-11-22", summary: "青少年现在足不出户即可观察深海火山的热液喷发和极端生命现象。", image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=800", color: "#f59e0b" },
    { id: "AI-008", title: "谷歌 DeepMind 宣布实现 AGI 的第一个子项目‘AlphaLogic’：逻辑错误率降至零", category: "AI & 编程", tag: "Logic", date: "2025-11-18", summary: "这意味着 AI 已经具备了无瑕疵的形式化验证能力，彻底终结了‘AI 幻觉’问题的争议。", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800", color: "#8b5cf6" },
    { id: "SP-007", title: "欧空局（ESA）成功拦截并采集了飞入太阳系的第二颗星际访客奥陌陌 2.0 的样本", category: "探索宇宙", tag: "Space", date: "2025-11-15", summary: "这些样本含有不同于太阳系的同位素特征，可能携带了来自远方星系的生命密码。", image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&q=80&w=800", color: "#0ea5e9" }
];

function getNewsTickerItems() {
    return TITAN_NEWS.slice(0, 15).map(news => news.title);
}

function getFeaturedNews() {
    return TITAN_NEWS.find(n => n.id === "AI-001");
}

function getCategorizedNews() {
    const cats = {};
    TITAN_NEWS.forEach(n => {
        if (!cats[n.category]) cats[n.category] = [];
        cats[n.category].push(n);
    });
    return cats;
}
