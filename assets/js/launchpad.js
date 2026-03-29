window.Launchpad = (() => {
    // Configuration
    const CATEGORIES = {
        LABS: { id: 'labs', title: 'TITAN LABS / 核心实验室', icon: '⚡' },
        ACADEMIC: { id: 'academic', title: 'ACADEMIC / 国家学科中心', icon: '🏮' },
        DISCOVERY: { id: 'discovery', title: 'DISCOVERY / 探索与发现', icon: '🌏' },
        SYSTEM: { id: 'system', title: 'SYSTEM & TOOLS / 系统与规划', icon: '🛠️' }
    };

    // App Data (Full List - Ordered for DOCK)
    const apps = [
        { name: '数字取证与溯源工程', icon: '🔍', link: 'hub-auto-200.html', color: '#818cf8', category: 'discovery' },
        { name: '生物-机器杂合系统', icon: '🤖', link: 'hub-auto-199.html', color: '#818cf8', category: 'discovery' },
        { name: '极端热管理工程', icon: '🔥', link: 'hub-auto-198.html', color: '#f472b6', category: 'discovery' },
        { name: '微振动精密控制工程', icon: '📳', link: 'hub-auto-197.html', color: '#f472b6', category: 'discovery' },
        { name: '类脑视觉系统', icon: '👁️', link: 'hub-auto-196.html', color: '#fbbf24', category: 'discovery' },
        { name: '高光谱遥感与智能辨识', icon: '🌈', link: 'hub-auto-195.html', color: '#34d399', category: 'discovery' },
        { name: '原子级制造工程', icon: '⚛️', link: 'hub-auto-194.html', color: '#fb7185', category: 'discovery' },
        { name: '电磁脉冲防护工程', icon: '⚡', link: 'hub-auto-193.html', color: '#818cf8', category: 'discovery' },
        { name: '近空间飞行器工程', icon: '✈️', link: 'hub-auto-192.html', color: '#818cf8', category: 'discovery' },
        { name: '空间太阳能电站工程', icon: '☀️', link: 'hub-auto-191.html', color: '#fb7185', category: 'discovery' },
        { name: '生物数字数据存储', icon: '🧬', link: 'hub-auto-190.html', color: '#818cf8', category: 'discovery' },
        { name: '光子计算工程', icon: '💡', link: 'hub-auto-189.html', color: '#f87171', category: 'discovery' },
        { name: '全息显示与光场成像', icon: '📽️', link: 'hub-auto-188.html', color: '#c084fc', category: 'discovery' },
        { name: '极端环境机器人工程', icon: '🏚️', link: 'hub-auto-187.html', color: '#818cf8', category: 'discovery' },
        { name: '仿生推进与水下机器人', icon: '🐟', link: 'hub-auto-186.html', color: '#f87171', category: 'discovery' },
        { name: '水声隐身与声场伪装', icon: '🚢', link: 'hub-auto-185.html', color: '#2dd4bf', category: 'discovery' },
        { name: '碳捕集、封存与转化（CCUS）', icon: '☁️', link: 'hub-auto-184.html', color: '#f87171', category: 'discovery' },
        { name: '高温超导工程应用', icon: '⚡', link: 'hub-auto-183.html', color: '#2dd4bf', category: 'discovery' },
        { name: '微纳流控技术', icon: '🧪', link: 'hub-auto-182.html', color: '#f472b6', category: 'discovery' },
        { name: '自修复结构材料', icon: '🩹', link: 'hub-auto-181.html', color: '#818cf8', category: 'discovery' },
        { name: '智能织物工程', icon: '👕', link: 'hub-auto-180.html', color: '#34d399', category: 'discovery' },
        { name: '认知智能工程', icon: '💡', link: 'hub-auto-179.html', color: '#34d399', category: 'academic' },
        { name: '中微子探测工程', icon: '🌌', link: 'hub-auto-178.html', color: '#818cf8', category: 'academic' },
        { name: '低温电子学', icon: '❄️', link: 'hub-auto-177.html', color: '#f472b6', category: 'academic' },
        { name: '合成生物自动化工厂', icon: '🧪', link: 'hub-auto-176.html', color: '#34d399', category: 'academic' },
        { name: '柔性生物电子学', icon: '🩹', link: 'hub-auto-175.html', color: '#34d399', category: 'academic' },
        { name: '真空微电子技术', icon: '📻', link: 'hub-auto-174.html', color: '#fb7185', category: 'academic' },
        { name: '月面原位建造工程', icon: '🌑', link: 'hub-auto-173.html', color: '#34d399', category: 'academic' },
        { name: '深空自主导航技术', icon: '🚀', link: 'hub-auto-172.html', color: '#34d399', category: 'academic' },
        { name: '卫星星座群智感知', icon: '🛰️', link: 'hub-auto-171.html', color: '#fbbf24', category: 'academic' },
        { name: '算法治理与伦理工程', icon: '⚖️', link: 'hub-auto-170.html', color: '#f87171', category: 'academic' },
        { name: '计算社会科学工程', icon: '📊', link: 'hub-auto-169.html', color: '#34d399', category: 'academic' },
        { name: '城市矿山与资源循环科学', icon: '♻️', link: 'hub-auto-168.html', color: '#34d399', category: 'academic' },
        { name: '大气集水与水能转化', icon: '🚰', link: 'hub-auto-167.html', color: '#2dd4bf', category: 'academic' },
        { name: '确定性网络工程', icon: '⛓️', link: 'hub-auto-166.html', color: '#f87171', category: 'academic' },
        { name: '语义通信工程', icon: '🗣️', link: 'hub-auto-165.html', color: '#818cf8', category: 'academic' },
        { name: '4D打印与形状记忆工程', icon: '🖨️', link: 'hub-auto-164.html', color: '#c084fc', category: 'academic' },
        { name: '器官芯片工程', icon: '🧫', link: 'hub-auto-163.html', color: '#2dd4bf', category: 'academic' },
        { name: '类脑神经形态硬件设计', icon: '🧠', link: 'hub-auto-162.html', color: '#f87171', category: 'academic' },
        { name: '量子精密测量工程', icon: '⏱️', link: 'hub-auto-161.html', color: '#2dd4bf', category: 'academic' },
        { name: '深海资源勘探与原位加工', icon: '🌊', link: 'hub-auto-160.html', color: '#34d399', category: 'academic' },
        { name: '仿生触觉感知技术', icon: '🖐️', link: 'hub-auto-159.html', color: '#c084fc', category: 'academic' },
        { name: '分子机器人学', icon: '🧬', link: 'hub-auto-158.html', color: '#f87171', category: 'academic' },
        { name: '液态金属电子工程', icon: '💧', link: 'hub-auto-157.html', color: '#818cf8', category: 'academic' },
        { name: '太赫兹科学与工程', icon: '📡', link: 'hub-auto-156.html', color: '#fbbf24', category: 'academic' },
        { name: '声学超构材料与波动控制', icon: '🔉', link: 'hub-auto-155.html', color: '#2dd4bf', category: 'academic' },
        { name: '元宇宙基础设施架构', icon: '🌐', link: 'hub-auto-154.html', color: '#34d399', category: 'academic' },
        { name: '数字孪生城市工程', icon: '🏙️', link: 'hub-auto-153.html', color: '#f87171', category: 'academic' },
        { name: '行星防御与近地小天体干预', icon: '🛡️', link: 'hub-auto-152.html', color: '#fb7185', category: 'academic' },
        { name: '空间碎屑主动清理工程', icon: '🛰️', link: 'hub-auto-151.html', color: '#f472b6', category: 'academic' },
        { name: '仿生科学与工程', icon: '🦗', link: 'hub-auto-150.html', color: '#fb7185', category: 'academic' },
        { name: '纳米材料与技术', icon: '💠', link: 'hub-auto-149.html', color: '#2dd4bf', category: 'academic' },
        { name: '智能医学工程', icon: '🩺', link: 'hub-auto-148.html', color: '#34d399', category: 'academic' },
        { name: '储能科学与工程', icon: '🏦', link: 'hub-auto-147.html', color: '#c084fc', category: 'academic' },
        { name: '生物育种科学', icon: '🌱', link: 'hub-auto-146.html', color: '#818cf8', category: 'academic' },
        { name: '电子科学与技术', icon: '📡', link: 'hub-auto-145.html', color: '#2dd4bf', category: 'academic' },
        { name: '精密仪器与机械', icon: '📐', link: 'hub-auto-144.html', color: '#34d399', category: 'academic' },
        { name: '智能采矿工程', icon: '⛏️', link: 'hub-auto-143.html', color: '#f87171', category: 'academic' },
        { name: '工业智能', icon: '⚙️', link: 'hub-auto-142.html', color: '#fb7185', category: 'academic' },
        { name: '信息安全', icon: '⌨️', link: 'hub-auto-141.html', color: '#fb7185', category: 'academic' },
        { name: '系统科学与工程', icon: '🔄', link: 'hub-auto-140.html', color: '#f87171', category: 'academic' },
        { name: '柔性电子学', icon: '🩹', link: 'hub-auto-139.html', color: '#fb7185', category: 'academic' },
        { name: '碳中和科学与工程', icon: '🍃', link: 'hub-auto-138.html', color: '#f472b6', category: 'academic' },
        { name: '氢能科学与工程', icon: '💧', link: 'hub-auto-137.html', color: '#c084fc', category: 'academic' },
        { name: '智能车辆工程', icon: '🚗', link: 'hub-auto-136.html', color: '#34d399', category: 'academic' },
        { name: '智能交通工程', icon: '🚦', link: 'hub-auto-135.html', color: '#f87171', category: 'academic' },
        { name: '物联网工程', icon: '🌐', link: 'hub-auto-134.html', color: '#f87171', category: 'academic' },
        { name: '区块链工程', icon: '⛓️', link: 'hub-auto-133.html', color: '#2dd4bf', category: 'academic' },
        { name: '虚拟现实技术', icon: '🕶️', link: 'hub-auto-132.html', color: '#f87171', category: 'academic' },
        { name: '智能建造', icon: '🏗️', link: 'hub-auto-131.html', color: '#f472b6', category: 'academic' },
        { name: '地理信息科学', icon: '📍', link: 'hub-auto-130.html', color: '#fbbf24', category: 'academic' },
        { name: '遥感科学与技术', icon: '🛰️', link: 'hub-auto-129.html', color: '#f472b6', category: 'academic' },
        { name: '地球信息科学与技术', icon: '🌍', link: 'hub-auto-128.html', color: '#2dd4bf', category: 'academic' },
        { name: '深海探测与高技术装备', icon: '🚢', link: 'hub-auto-127.html', color: '#2dd4bf', category: 'academic' },
        { name: '水声工程', icon: '🌊', link: 'hub-auto-126.html', color: '#fb7185', category: 'academic' },
        { name: '海洋工程与技术', icon: '⚓', link: 'hub-auto-125.html', color: '#f87171', category: 'academic' },
        { name: '无人驾驶航空器系统工程', icon: '🚁', link: 'hub-auto-124.html', color: '#2dd4bf', category: 'academic' },
        { name: '飞行器设计与工程', icon: '✈️', link: 'hub-auto-123.html', color: '#818cf8', category: 'academic' },
        { name: '航空航天工程', icon: '🚀', link: 'hub-auto-122.html', color: '#34d399', category: 'academic' },
        { name: '脑科学与类脑智能', icon: '🧠', link: 'hub-auto-121.html', color: '#f87171', category: 'academic' },
        { name: '合成生物学', icon: '🧪', link: 'hub-auto-120.html', color: '#f472b6', category: 'academic' },
        { name: '生物信息学', icon: '🧬', link: 'hub-auto-119.html', color: '#f87171', category: 'academic' },
        { name: '生物医学工程', icon: '🏥', link: 'hub-auto-118.html', color: '#2dd4bf', category: 'academic' },
        { name: '辐射防护与核安全', icon: '⚠️', link: 'hub-auto-117.html', color: '#2dd4bf', category: 'academic' },
        { name: '核工程与核技术', icon: '☢️', link: 'hub-auto-116.html', color: '#fb7185', category: 'academic' },
        { name: '智能电网信息工程', icon: '⚡', link: 'hub-auto-115.html', color: '#2dd4bf', category: 'academic' },
        { name: '新能源材料与器件', icon: '🔋', link: 'hub-auto-114.html', color: '#818cf8', category: 'academic' },
        { name: '智能制造工程', icon: '🏭', link: 'hub-auto-113.html', color: '#2dd4bf', category: 'academic' },
        { name: '光电信息科学与工程', icon: '🔦', link: 'hub-auto-112.html', color: '#f87171', category: 'academic' },
        { name: '密码学', icon: '🔐', link: 'hub-auto-111.html', color: '#818cf8', category: 'academic' },
        { name: '网络空间安全', icon: '🛡️', link: 'hub-auto-110.html', color: '#818cf8', category: 'academic' },
        { name: '数据科学与大数据技术', icon: '📊', link: 'hub-auto-109.html', color: '#fbbf24', category: 'academic' },
        { name: '机器人工程', icon: '🤖', link: 'hub-auto-108.html', color: '#f472b6', category: 'academic' },
        { name: '智能科学与技术', icon: '👁️', link: 'hub-auto-107.html', color: '#818cf8', category: 'academic' },
        { name: '人工智能', icon: '🧠', link: 'hub-auto-106.html', color: '#c084fc', category: 'academic' },
        { name: '量子信息科学', icon: '⚛️', link: 'hub-auto-105.html', color: '#fbbf24', category: 'academic' },
        { name: '集成电路设计与集成系统', icon: '💾', link: 'hub-auto-104.html', color: '#2dd4bf', category: 'academic' },
        { name: '微电子科学与工程', icon: '🔬', link: 'hub-auto-103.html', color: '#fbbf24', category: 'academic' },
        { name: '人形机器人技术', icon: '🤖', link: 'assets/js/hubs/hub-template.html?id=hub-auto-102.html', color: '#06b6d4', category: 'academic' },
        { name: '脑机接口工程', icon: '🧠', link: 'assets/js/hubs/hub-template.html?id=hub-auto-101.html', color: '#8b5cf6', category: 'academic' },
        { name: '智慧交通', icon: '🚗', link: 'assets/js/hubs/hub-template.html?id=hub-auto-100.html', color: '#fb7185', category: 'academic' },
        { name: '纳米材料与技术', icon: '🔬', link: 'hub-auto-99.html', color: '#f472b6', category: 'academic' },
        { name: '新能源科学与工程', icon: '☀️', link: 'hub-auto-98.html', color: '#34d399', category: 'academic' },
        { name: '光电信息科学与工程', icon: '💡', link: 'hub-auto-97.html', color: '#818cf8', category: 'academic' },
        { name: '智能无人系统工程', icon: '🤖', link: 'hub-auto-96.html', color: '#818cf8', category: 'academic' },
        { name: '增材制造工程', icon: '🖨️', link: 'hub-auto-95.html', color: '#34d399', category: 'academic' },
        { name: '氢能科学与工程', icon: '🔋', link: 'hub-auto-94.html', color: '#2dd4bf', category: 'academic' },
        { name: '脑科学与工程', icon: '🧠', link: 'hub-auto-93.html', color: '#f472b6', category: 'academic' },
        { name: '合成生物学', icon: '🧪', link: 'hub-auto-92.html', color: '#fbbf24', category: 'academic' },
        { name: '仿生科学与工程', icon: '🦎', link: 'hub-auto-91.html', color: '#2dd4bf', category: 'academic' },
        { name: '智能感知工程', icon: '📡', link: 'hub-auto-90.html', color: '#818cf8', category: 'academic' },
        { name: '密码科学与技术', icon: '🔐', link: 'hub-auto-89.html', color: '#fb7185', category: 'academic' },
        { name: '海洋机器人', icon: '🌊', link: 'hub-auto-88.html', color: '#2dd4bf', category: 'academic' },
        { name: '飞行器控制与信息工程', icon: '🚀', link: 'hub-auto-87.html', color: '#818cf8', category: 'academic' },
        { name: '集成电路设计与集成系统', icon: '💾', link: 'hub-auto-86.html', color: '#fbbf24', category: 'academic' },
        { name: '柔性电子学', icon: '📱', link: 'hub-auto-85.html', color: '#818cf8', category: 'academic' },
        { name: '碳储科学与工程', icon: '🌍', link: 'hub-auto-84.html', color: '#c084fc', category: 'academic' },
        { name: '智能医学工程', icon: '🧬', link: 'hub-auto-83.html', color: '#bae6fd', category: 'academic' },
        { name: '量子信息科学', icon: '⚛️', link: 'hub-auto-82.html', color: '#c084fc', category: 'academic' },
        { name: '智能科学与技术', icon: '🧠', link: 'hub-auto-81.html', color: '#2dd4bf', category: 'academic' },
        { name: '极地工程与前沿技术', icon: '🧊', link: 'hub-auto-80.html', color: '#34d399', category: 'academic' },
        { name: '空间制造与在轨服务', icon: '🛠️', link: 'hub-auto-79.html', color: '#2dd4bf', category: 'academic' },
        { name: '微纳机器人与精准医疗', icon: '🔬', link: 'hub-auto-78.html', color: '#c084fc', category: 'academic' },
        { name: '硅光子与光计算工程', icon: '💡', link: 'hub-auto-77.html', color: '#2dd4bf', category: 'academic' },
        { name: '低空经济与 eVTOL 工程', icon: '🚁', link: 'hub-auto-76.html', color: '#818cf8', category: 'academic' },
        { name: '智能无人系统与集群技术', icon: '🐝', link: 'hub-auto-75.html', color: '#34d399', category: 'academic' },
        { name: '柔性电子与生物集成系统', icon: '🩹', link: 'hub-auto-74.html', color: '#fbbf24', category: 'academic' },
        { name: '先进核能与聚变技术', icon: '☀️', link: 'hub-auto-73.html', color: '#fbbf24', category: 'academic' },
        { name: '碳封存与负排放技术', icon: '🌳', link: 'hub-auto-72.html', color: '#f472b6', category: 'academic' },
        { name: '氢能与长时储能工程', icon: '🔋', link: 'hub-auto-71.html', color: '#fb7185', category: 'academic' },
        { name: '脑机接口与类脑工程', icon: '🧠', link: 'hub-auto-70.html', color: '#2dd4bf', category: 'academic' },
        { name: '合成生物制造', icon: '🧬', link: 'hub-auto-69.html', color: '#fbbf24', category: 'academic' },
        { name: '量子信息工程', icon: '⚛️', link: 'hub-auto-68.html', color: '#fbbf24', category: 'academic' },
        { name: '深地空间工程', icon: '🌏', link: 'hub-auto-67.html', color: '#fbbf24', category: 'academic' },
        { name: '深空探测工程', icon: '🚀', link: 'hub-auto-66.html', color: '#2dd4bf', category: 'academic' },
        { name: '极端环境材料工程', icon: '🛡️', link: 'hub-auto-65.html', color: '#fb7185', category: 'academic' },
        { name: '工业智能', icon: '🏭', link: 'hub-auto-64.html', color: '#0EA5E9', category: 'academic' },
        { name: '智能建造', icon: '🏗️', link: 'hub-auto-63.html', color: '#F59E0B', category: 'academic' },
        { name: '机器人工程', icon: '🤖', link: 'hub-auto-62.html', color: '#F43F5E', category: 'academic' },
        { name: '量子信息科学与工程', icon: '⚛️', link: 'hub-auto-61.html', color: '#A855F7', category: 'academic' },
        { name: '柔性电子学', icon: '🦾', link: 'hub-auto-60.html', color: '#F472B6', category: 'academic' },
        { name: '智慧海洋技术', icon: '🌊', link: 'hub-auto-59.html', color: '#06B6D4', category: 'academic' },
        { name: '空天智能电网', icon: '🛰️', link: 'hub-auto-58.html', color: '#EAB308', category: 'academic' },
        { name: '仿生科学与工程', icon: '🧬', link: 'hub-auto-57.html', color: '#84CC16', category: 'academic' },
        { name: '集成电路设计与集成系统', icon: '🔲', link: 'hub-auto-56.html', color: '#38BDF8', category: 'academic' },
        { name: '虚拟现实技术', icon: '🥽', link: 'hub-auto-55.html', color: '#D946EF', category: 'academic' },
        { name: '智能医学工程', icon: '🏥', link: 'hub-auto-54.html', color: '#10B981', category: 'academic' },
        { name: '区块链工程', icon: '🔗', link: 'hub-auto-53.html', color: '#C084FC', category: 'academic' },
        { name: '数据科学与大数据技术', icon: '📊', link: 'hub-auto-52.html', color: '#F59E0B', category: 'academic' },
        { name: '智能无人系统技术', icon: '🚁', link: 'hub-auto-51.html', color: '#0EA5E9', category: 'academic' },
        { name: '智慧交通', icon: '🚦', link: 'hub-auto-50.html', color: '#F43F5E', category: 'academic' },
        { name: '密码科学与技术', icon: '🔐', link: 'hub-auto-49.html', color: '#3B82F6', category: 'academic' },
        { name: '智能测控工程', icon: '🎛️', link: 'hub-auto-48.html', color: '#0891B2', category: 'academic' },
        { name: '智能感知工程', icon: '📡', link: 'hub-auto-47.html', color: '#10B981', category: 'academic' },
        { name: '智能科学与技术', icon: '🧠', link: 'hub-auto-46.html', color: '#C084FC', category: 'academic' },
        { name: '微电子科学与工程', icon: '🖥️', link: 'hub-auto-45.html', color: '#EAB308', category: 'academic' },
        { name: '智能建造', icon: '🏗️', link: 'hub-auto-44.html', color: '#F59E0B', category: 'academic' },
        { name: '新能源材料与器件', icon: '☀️', link: 'hub-auto-43.html', color: '#38BDF8', category: 'academic' },
        { name: '机器人工程', icon: '🤖', link: 'hub-auto-42.html', color: '#EC4899', category: 'academic' },
        { name: '智能制造工程', icon: '🦾', link: 'hub-auto-41.html', color: '#A855F7', category: 'academic' },
        { name: '智慧矿山与采矿工程', icon: '⛏️', link: 'hub-auto-40.html', color: '#10b981', category: 'academic' },
        { name: '循环经济与资源循环科学', icon: '🔄', link: 'hub-auto-39.html', color: '#10b981', category: 'academic' },
        { name: '低温工程与深冷技术', icon: '❄️', link: 'hub-auto-38.html', color: '#10b981', category: 'academic' },
        { name: '智能交通系统工程', icon: '🚦', link: 'hub-auto-37.html', color: '#10b981', category: 'academic' },
        { name: '仿生机器人技术', icon: '🐾', link: 'hub-auto-36.html', color: '#10b981', category: 'academic' },
        { name: '数字孪生技术与应用', icon: '🌐', link: 'hub-auto-35.html', color: '#10b981', category: 'academic' },
        { name: '生物制造工程', icon: '🧪', link: 'hub-auto-34.html', color: '#10b981', category: 'academic' },
        { name: '卫星互联网技术', icon: '🛰️', link: 'hub-auto-33.html', color: '#10b981', category: 'academic' },
        { name: '工业互联网工程', icon: '🏭', link: 'hub-auto-32.html', color: '#10b981', category: 'academic' },
        { name: '能源互联网工程', icon: '⚡', link: 'hub-auto-31.html', color: '#10b981', category: 'academic' },
        { name: '生物医学材料与器械', icon: '🦴', link: 'hub-auto-30.html', color: '#10b981', category: 'academic' },
        { name: '增材制造工程', icon: '🖨️', link: 'hub-auto-29.html', color: '#10b981', category: 'academic' },
        { name: '深海探测与海洋矿产工程', icon: '⚓', link: 'hub-auto-28.html', color: '#10b981', category: 'academic' },
        { name: '低空经济与无人系统工程', icon: '🚁', link: 'hub-auto-27.html', color: '#10b981', category: 'academic' },
        { name: '类脑智能科学与技术', icon: '🤖', link: 'hub-auto-26.html', color: '#10b981', category: 'academic' },
        { name: '脑机接口工程', icon: '🧠', link: 'hub-auto-25.html', color: '#10b981', category: 'academic' },
        { name: '柔性电子学', icon: '📱', link: 'hub-auto-24.html', color: '#10b981', category: 'academic' },
        { name: '智能电网信息工程', icon: '⚡', link: 'hub-auto-23.html', color: '#10b981', category: 'academic' },
        { name: '储能科学与工程', icon: '🔋', link: 'hub-auto-22.html', color: '#10b981', category: 'academic' },
        { name: '碳储科学与工程', icon: '🌿', link: 'hub-auto-21.html', color: '#10b981', category: 'academic' },
        { name: '数字媒体技术', icon: '🥽', link: 'hub-metaverse.html', color: '#22d3ee', category: 'academic' },
        { name: '天文学', icon: '🔭', link: 'hub-cosmology.html', color: '#c084fc', category: 'academic' },
        { name: '人工智能', icon: '🧠', link: 'hub-ai.html', color: '#8b5cf6', category: 'academic' },
        { name: '环境科学与工程', icon: '🍃', link: 'hub-environment.html', color: '#10b981', category: 'academic' },
        { name: '航空航天工程', icon: '🚀', link: 'hub-aerospace.html', color: '#3b82f6', category: 'academic' },
        { name: '地球物理学', icon: '🌍', link: 'hub-earth.html', color: '#10b981', category: 'academic' },
        { name: '材料科学与工程', icon: '💎', link: 'hub-materials.html', color: '#14b8a6', category: 'academic' },
        { name: '数学与应用数学', icon: '🧮', link: 'hub-math.html', color: '#fbbf24', category: 'academic' },
        { name: '量子信息科学', icon: '🔐', link: 'hub-quantum-info.html', color: '#06b6d4', category: 'academic' },
        { name: '物理学', icon: '🌌', link: 'hub-physics.html', color: '#c084fc', category: 'academic' },
        { name: '智慧农业', icon: '🌾', link: 'hub-agronomy.html', color: '#84cc16', category: 'academic' },
        { name: '生态学', icon: '🌿', link: 'hub-ecology.html', color: '#22c55e', category: 'academic' },
        { name: '地质学', icon: '🪨', link: 'hub-geology.html', color: '#f97316', category: 'academic' },
        { name: '海洋工程与技术', icon: '🌊', link: 'hub-marine.html', color: '#06b6d4', category: 'academic' },
        { name: '核工程与核技术', icon: '⚛️', link: 'hub-nuclear.html', color: '#a855f7', category: 'academic' },
        { name: '药学', icon: '💊', link: 'hub-pharmacology.html', color: '#f43f5e', category: 'academic' },
        { name: '生物信息学', icon: '🧬', link: 'hub-bioinformatics.html', color: '#14b8a6', category: 'academic' },
        { name: '法医学', icon: '🕵️‍♂️', link: 'hub-forensics.html', color: '#22d3ee', category: 'academic' },
        { name: '应用心理学', icon: '🧠', link: 'hub-psychology.html', color: '#22d3ee', category: 'academic' },
        // --- CORE SYSTEM (Items 1-7 in user order) ---
        // Note: Rocket (Launchpad) is handled specifically as it opens the overlay
        { name: '系统说明', icon: 'ℹ️', link: 'system-intro.html', color: 'var(--mc-cyan)', category: 'system' },
        { name: '个人中心', icon: '👤', link: 'profile.html', color: 'var(--mc-cyan)', category: 'system' },
        { name: '培养图谱', icon: '🗺️', link: 'post-4.html', color: '#fff', category: 'system' },
        { name: '课程地图', icon: '📚', link: 'post-6.html', color: '#fff', category: 'system' },
        { name: '竞赛地图', icon: '🏆', link: 'competition-atlas.html', color: '#fbbf24', category: 'system' },
        { name: '认知系统', icon: '🧠', link: 'post-5.html', color: '#fff', category: 'system' },
        { name: '神经进化', icon: '🧬', link: 'psyche_x_system/index.html', color: 'var(--accent)', category: 'system' },
        { name: '学习方法', icon: '🧠', link: 'study-methods.html', color: '#8b5cf6', category: 'system' },
        { name: '学习中心', icon: '🏫', link: 'learn.html', color: '#8B5CF6', category: 'system' },
        { name: '叮当状态', icon: '💻', link: 'dingdang-status.html', color: '#00f0ff', category: 'system' },
        { name: '升学指南', icon: '🎓', link: 'admission-guide.html', color: '#10b981', category: 'system' },

        // --- SUBJECT MODULES (Items 8-25 in user order) ---
        { name: '临床医学', icon: '🩺', link: 'hub-medicine.html', color: '#00f0ff', category: 'academic' },
        { name: '源码交响中心', icon: '💻', link: 'coding.html', color: '#8B5CF6', category: 'labs' },
        { name: '计算创意工作室', icon: '🎨', link: 'ai-art.html', color: '#FF00E5', category: 'labs' },
        { name: '智电实验室', icon: '🔋', link: 'circuits.html', color: '#00FF9D', category: 'labs' },
        { name: '智造工场', icon: '🖨️', link: '3d-print.html', color: '#FF2D55', category: 'labs' },
        { name: '航天指挥中心', icon: '🛸', link: 'aerospace.html', color: '#6366f1', category: 'labs' },
        { name: '探空火箭工程', icon: '🚀', link: 'course-rocketry.html', color: '#F97316', category: 'labs' },
        { name: 'OpenClaw 开发', icon: '🤖', link: 'course-openclaw.html', color: '#8b5cf6', category: 'labs' },
        { name: '万物实验室', icon: '🧪', link: 'labs.html', color: '#00f3ff', category: 'labs' },
        { name: 'API 科普', icon: '🔗', link: 'api.html', color: '#06B6D4', category: 'discovery' },
        { name: '寰宇观测站', icon: '🌌', link: 'astronomy.html', color: '#bc13fe', category: 'discovery' },
        { name: '生命科学', icon: '🧬', link: 'course-life.html', color: '#d946ef', category: 'discovery' },
        { name: '恐龙世界', icon: '🦖', link: 'dino.html', color: '#4ade80', category: 'discovery' },
        { name: '深海探索', icon: '🌊', link: 'ocean.html', color: '#00f0ff', category: 'discovery' },
        { name: '地球科学', icon: '🌍', link: 'earth.html', color: '#06b6d4', category: 'discovery' },
        { name: '读书观影', icon: '📖', link: 'library.html', color: '#ec4899', category: 'discovery' },
        { name: '知识库', icon: '📂', link: 'wiki.html', color: '#fff', category: 'discovery' },
        { name: '历史探秘', icon: '🏛️', link: 'history.html', color: '#fbbf24', category: 'discovery' },
        { name: '打字训练', icon: '⌨️', link: 'typing.html', color: '#fff', category: 'labs' },
        { name: '无人机战术中心', icon: '🚁', link: 'drone.html', color: '#06B6D4', category: 'labs' },
        { name: '智核研究院', icon: '🤖', link: 'ai.html', color: '#d946ef', category: 'labs' },
        { name: 'AI 音乐', icon: '🎵', link: 'music.html', color: '#ff4d4d', category: 'labs' },
        { name: '智力挑战', icon: '🧩', link: 'brain.html', color: '#10b981', category: 'labs' },
        { name: '科技英语', icon: '🔤', link: 'english.html', color: '#00F5FF', category: 'labs' },
        { name: '金融科技', icon: '💰', link: 'fintech.html', color: '#fbbf24', category: 'labs' },

        // --- ACADEMIC CENTER ---
        { name: '语文中心', icon: '🏮', link: 'chinese-hub.html', color: '#ff4d4d', category: 'academic' },
        { name: '数学中心', icon: '📐', link: 'math-hub.html', color: '#3b82f6', category: 'academic' },
        { name: '英语中心', icon: '🔤', link: 'english-hub.html', color: '#10b981', category: 'academic' },
        { name: '科学中心', icon: '🔬', link: 'science-hub.html', color: '#a855f7', category: 'academic' },
        { name: '物理中心', icon: '⚛️', link: 'physics-hub.html', color: '#3b82f6', category: 'academic' },
        { name: '化学中心', icon: '🧪', link: 'chemistry-hub.html', color: '#00f3ff', category: 'academic' },
        { name: '生物中心', icon: '🧬', link: 'biology-hub.html', color: '#4ade80', category: 'academic' },
        { name: '思政中心', icon: '🛡️', link: 'politics-hub.html', color: '#ff4d4d', category: 'academic' },
        { name: '历史中心', icon: '📜', link: 'history-hub.html', color: '#fbbf24', category: 'academic' },
        { name: '地理中心', icon: '🌍', link: 'geography-hub.html', color: '#10b981', category: 'academic' },
        { name: '信息科技中心', icon: '🖥️', link: 'infotech-hub.html', color: '#8b5cf6', category: 'academic' },
        { name: '艺术中心', icon: '🎨', link: 'arts-hub.html', color: '#f472b6', category: 'academic' },
        { name: '体育与健康', icon: '🏃', link: 'pe-hub.html', color: '#10b981', category: 'academic' },
        { name: '劳动实践中心', icon: '⚒️', link: 'labor-hub.html', color: '#f59e0b', category: 'academic' },
        { name: '通用技术中心', icon: '⚙️', link: 'tech-hub.html', color: '#3b82f6', category: 'academic' },
        { name: '全球智慧中心', icon: '🌐', link: 'international-hub.html', color: '#fbbf24', category: 'academic' },
        { name: '科技新闻', icon: '📰', link: 'news.html', color: '#00F0FF', category: 'system' },

        // --- LEGACY/OTHER (Still in Launchpad Search) ---
        { name: '军事科技', icon: '🛡️', link: 'military.html', color: '#4caf50', category: 'discovery' },
        { name: '数学视界', icon: '📐', link: 'math.html', color: '#F44336', category: 'discovery' },
        { name: '全球课堂', icon: '🌍', link: 'global-class.html', color: '#0ea5e9', category: 'discovery' },
        { name: '学科协同', icon: '🔗', link: 'subject-synergy.html', color: '#8b5cf6', category: 'discovery' },
        { name: '汽车世界', icon: '🏎️', link: 'car-world.html', color: '#f43f5e', category: 'discovery' },
        { name: 'GAIA引擎', icon: '🌍', link: 'gaia.html', color: '#4CAF50', category: 'discovery' },
        { name: 'DNA模拟', icon: '🧬', link: 'helix.html', color: '#E91E63', category: 'discovery' },
        { name: '物理仿真', icon: '⚛️', link: 'walter_fendt.html', color: '#FFC107', category: 'discovery' },
        { name: '虚拟实验(旧)', icon: '🔬', link: 'cc_vlabs.html', color: '#00BCD4', category: 'discovery' },
        { name: '智慧星图', icon: '🌌', link: 'synergy-galaxy.html', color: '#6366f1', category: 'discovery' },
        { name: '我的世界', icon: '⛏️', link: 'minecraft.html', color: 'var(--mc-green)', category: 'discovery' },
        { name: '大学先修', icon: '🎓', link: 'universities.html', color: '#f59e0b', category: 'system' },
        { name: '荣誉殿堂', icon: '🏆', link: 'trophy.html', color: '#fbbf24', category: 'system' },
        { name: '教材中心', icon: '📚', link: 'textbook.html', color: '#fff', category: 'system' },
        { name: '社区论坛', icon: '💬', link: 'forum.html', color: '#06b6d4', category: 'system' }
    ];

    function init() {
        injectStyles();

        // Prevent Duplicate
        if (document.getElementById('launchpadOverlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'launchpad-overlay custom-scroll';
        overlay.id = 'launchpadOverlay';

        // Search Bar Container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'lp-header';

        const search = document.createElement('input');
        search.className = 'lp-search-bar';
        search.placeholder = 'Search Titan OS...';
        search.type = 'text';
        search.addEventListener('input', (e) => renderPages(e.target.value));
        search.addEventListener('click', (e) => e.stopPropagation());

        searchContainer.appendChild(search);
        overlay.appendChild(searchContainer);

        // Content Container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'lp-content-container';
        contentContainer.id = 'lpContent';
        overlay.appendChild(contentContainer);

        // Close Button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'lp-close-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.onclick = close;
        overlay.appendChild(closeBtn);

        // Click outside to close
        // Click outside to close - Improved Event Handling
        overlay.addEventListener('click', (e) => {
            // Only close if clicking the backdrop itself or the header background, 
            // NOT when clicking any child content like inputs, buttons, or app icons.
            if (e.target === overlay || e.target.classList.contains('lp-header')) {
                e.stopPropagation(); // Stop bubbling
                close();
            }
        });

        document.body.appendChild(overlay);
        renderPages();

        // Listen for subscription updates
        window.addEventListener('subscription_updated', () => {
            renderPages();
            updateDock(); // Keep locks updated but don't rebuild
        });
        // setTimeout(updateDock, 500); // Disabling dynamic dock override
    }

    function injectStyles() {
        if (document.getElementById('lp-styles')) return;
        const style = document.createElement('style');
        style.id = 'lp-styles';
        style.textContent = `
            .launchpad-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(3, 7, 18, 0.95);
                backdrop-filter: blur(20px);
                z-index: 10000000; /* Increased to ensure it covers titan-global-native-header which is 9999998 */
                display: none;
                flex-direction: column;
                align-items: center;
                overflow-y: auto;
                padding-bottom: 100px;
                opacity: 0;
                transition: opacity 0.3s;
                -webkit-app-region: drag; /* Allow window drag by clicking empty background */
            }
            .launchpad-overlay.active { display: flex; opacity: 1; }
            .lp-header { 
                width: 100%; display: flex; justify-content: center; 
                padding: 60px 20px 40px; position: sticky; top: 0; z-index: 10; 
                background: linear-gradient(to bottom, rgba(3, 7, 18, 1), rgba(3, 7, 18, 0)); 
            }
            .lp-search-bar {
                width: 100%; max-width: 500px; padding: 15px 25px;
                background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 50px; color: white; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;
                transition: all 0.3s;
                font-size: 16px;
                -webkit-app-region: no-drag; /* Make input clickable */
            }
            .lp-search-bar:focus { 
                background: rgba(255, 255, 255, 0.1); border-color: var(--primary, #00f3ff); 
                outline: none; box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); 
            }
            
            .lp-content-container { 
                width: 100%; max-width: 1100px; padding: 0 30px; 
                display: flex; flex-direction: column; gap: 50px; 
                animation: lp-slide-up 0.5s ease-out; 
                -webkit-app-region: no-drag; /* Make buttons clickable */
            }
            
            .lp-category-section { width: 100%; }
            .lp-category-header { 
                display: flex; align-items: center; gap: 10px; 
                border-bottom: 1px solid rgba(255, 255, 255, 0.1); 
                padding-bottom: 15px; margin-bottom: 25px; 
            }
            .lp-category-icon { font-size: 24px; }
            .lp-category-title { 
                font-family: 'Orbitron', sans-serif; font-size: 16px; 
                color: rgba(255, 255, 255, 0.8); letter-spacing: 2px; font-weight: 700; 
            }
            
            .lp-grid { 
                display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
                gap: 20px; row-gap: 30px; 
            }
            
            .lp-app-item { 
                display: flex; flex-direction: column; align-items: center; 
                gap: 12px; text-decoration: none; transition: transform 0.2s; cursor: pointer; 
            }
            .lp-app-item:hover { transform: translateY(-5px); }
            .lp-app-item:hover .lp-app-icon-box { 
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.2); 
                border-color: white; transform: scale(1.05); 
            }
            .lp-app-icon-box {
                width: 64px; height: 64px; background: rgba(255, 255, 255, 0.05);
                border-radius: 18px; display: flex; align-items: center; justify-content: center;
                font-size: 30px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s;
                position: relative;
            }
            .lp-app-text { 
                font-size: 11px; color: rgba(255, 255, 255, 0.7); 
                text-align: center; max-width: 100px; line-height: 1.4; 
            }
            .lp-app-item:hover .lp-app-text { color: white; }
            
            .lp-close-btn { 
                position: fixed; top: 30px; right: 30px; font-size: 24px; 
                color: rgba(255, 255, 255, 0.5); cursor: pointer; 
                width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; 
                background: rgba(0, 0, 0, 0.5); border-radius: 50%; z-index: 20; transition: all 0.2s; 
                -webkit-app-region: no-drag; pointer-events: auto; /* Required to beat Electron drag interception */
            }
            .lp-close-btn:hover { color: white; background: rgba(255, 255, 255, 0.1); }

            @keyframes lp-slide-up { 
                from { opacity: 0; transform: translateY(20px); } 
                to { opacity: 1; transform: translateY(0); } 
            }
            
            .dock-locked { filter: grayscale(1); opacity: 0.6; }
            .lp-app-item.locked .lp-app-icon-box::after, .dock-locked .dock-icon-bg::after {
                content: '🔒'; position: absolute; top: -5px; right: -5px; font-size: 14px;
                background: black; border-radius: 50%; padding: 2px; border: 1px solid #333;
            }

            /* Responsive */
            @media(max-width: 768px) {
                .lp-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
                .lp-app-icon-box { width: 50px; height: 50px; font-size: 24px; border-radius: 14px; }
                .lp-search-bar { padding: 12px 20px; font-size: 14px; }
            }
        `;
        document.head.appendChild(style);
    }


    function renderPages(filterT = '') {
        const container = document.getElementById('lpContent');
        if (!container) return;

        container.innerHTML = '';
        const filterText = filterT.toLowerCase();

        // Group apps
        const groups = { labs: [], academic: [], discovery: [], system: [] };

        // --- TEE INTEGRATION ---
        const evolvedApps = window.TitanEvolutionEngine ? 
            window.TitanEvolutionEngine.getEvolvedApps(apps) : apps;

        evolvedApps.forEach(app => {
            if (!app.name) return; // Skip invalid
            if (app.name.toLowerCase().includes(filterText) && groups[app.category]) {
                groups[app.category].push(app);
            }
        });

        console.log('Launchpad: Rendering apps...', { labs: groups.labs.length, discovery: groups.discovery.length });

        // Render Groups
        Object.keys(CATEGORIES).forEach(key => {
            const cat = CATEGORIES[key];
            const groupApps = groups[cat.id];

            if (groupApps && groupApps.length > 0) {
                const section = document.createElement('div');
                section.className = 'lp-category-section';

                // Header
                const header = document.createElement('div');
                header.className = 'lp-category-header';
                header.innerHTML = `<span class="lp-category-icon">${cat.icon}</span><span class="lp-category-title">${cat.title}</span>`;
                section.appendChild(header);

                // Grid
                const grid = document.createElement('div');
                grid.className = 'lp-grid';

                groupApps.forEach((app, i) => {
                    const item = document.createElement('a');
                    item.className = 'lp-app-item';
                    
                    // Virtual Hub Link Handling
                    let finalLink = app.link || '#';
                    if (finalLink.includes('hub-auto-') && !finalLink.includes('hub-template.html')) {
                        finalLink = `assets/js/hubs/hub-template.html?id=${finalLink}`;
                    }
                    item.href = finalLink;
                    
                    // Stagger animation - REMOVED 'backwards' to ensure visibility
                    item.style.animation = `lp-slide-up 0.4s ease-out ${i * 30}ms both`;

                    // Subscription Check Logic
                    let isLocked = false;
                    try {
                        // Safe check for SubscriptionManager
                        const sm = window.SubscriptionManager;
                        if (sm && sm.FREE_PAGES) {
                            const isAlwaysFree = sm.FREE_PAGES.some(p => app.link && app.link.includes(p));

                            if (!isAlwaysFree) {
                                let isSubscribed = false;
                                if (sm.isSubscribed && typeof sm.isSubscribed === 'function') {
                                    isSubscribed = sm.isSubscribed();
                                }
                                if (!isSubscribed) isLocked = true;
                            }
                        }
                    } catch (e) {
                        console.warn('Launchpad: Auth check error', e);
                    }

                    if (isLocked) {
                        item.classList.add('locked');
                        item.href = 'javascript:void(0)';
                        item.onclick = (e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (window.SubscriptionManager && window.SubscriptionManager.showPaywall) {
                                window.SubscriptionManager.showPaywall();
                            } else {
                                alert('会员专享功能 (Premium Feature)');
                            }
                        };
                    }

                    // Icon
                    const iconBox = document.createElement('div');
                    iconBox.className = 'lp-app-icon-box';
                    iconBox.innerHTML = app.icon || '📦';
                    if (app.color && app.color !== '#fff') iconBox.style.boxShadow = `0 4px 15px ${app.color}30`;

                    const text = document.createElement('div');
                    text.className = 'lp-app-text';
                    text.innerText = app.name || 'App';

                    item.appendChild(iconBox);
                    item.appendChild(text);
                    grid.appendChild(item);
                });

                section.appendChild(grid);
                container.appendChild(section);
            }
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div style="color:white; text-align:center; padding:50px; opacity:0.5">No apps found</div>';
        }
    }

    function updateDock() {
        if (typeof window.SubscriptionManager === 'undefined') return;

        const dockItems = document.querySelectorAll('.dock-icon-box');
        dockItems.forEach(item => {
            // Support both old HTML onclick and new dynamic dataset.link
            let link = item.dataset.link;
            let onclickStr = null;
            
            // If we previously locked it and moved onclick to originalClick, use that
            if (!link && item.dataset.originalClick) {
                onclickStr = item.dataset.originalClick;
            } else if (!link) {
                onclickStr = item.getAttribute('onclick');
            }

            if (!link && onclickStr && onclickStr.includes('location.href')) {
                link = onclickStr.match(/['"]([^'"]+)['"]/)?.[1];
            }
            
            if (!link) return;

            let isLocked = false;
            // Check permission
            const isAlwaysFree = window.SubscriptionManager.FREE_PAGES.some(p => link.includes(p));
            if (!isAlwaysFree) {
                let isSubscribed = window.SubscriptionManager.isSubscribed && window.SubscriptionManager.isSubscribed();
                if (!isSubscribed) isLocked = true;
            }

            const existingLock = item.querySelector('.dock-lock-overlay');
            if (existingLock) existingLock.remove();

            if (isLocked) {
                item.classList.add('dock-locked');
                item.style.opacity = '0.5';
                item.style.position = 'relative';
                const lock = document.createElement('div');
                lock.className = 'dock-lock-overlay';
                lock.innerHTML = '🔒';
                Object.assign(lock.style, { position: 'absolute', top: '-5px', right: '-5px', fontSize: '10px', background: 'black', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' });
                item.appendChild(lock);
                
                // Save original action and override with paywall
                if (item.dataset.link) {
                    item.dataset.originalLink = item.dataset.link;
                } else if (onclickStr) {
                    item.dataset.originalClick = onclickStr;
                    item.removeAttribute('onclick');
                }
                item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); window.SubscriptionManager.showPaywall(); };
            } else {
                item.classList.remove('dock-locked');
                item.style.opacity = '1';
                
                // Restore original action
                if (item.dataset.originalLink) {
                    item.dataset.link = item.dataset.originalLink;
                    delete item.dataset.originalLink;
                    item.onclick = function() { window.location.href = link; };
                } else if (item.dataset.originalClick) {
                    item.setAttribute('onclick', item.dataset.originalClick);
                    item.onclick = null;
                    delete item.dataset.originalClick;
                }
            }
        });
    }

    function open() {
        const overlay = document.getElementById('launchpadOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const search = overlay.querySelector('.lp-search-bar');
                if (search) search.focus();
            }, 100);
        } else {
            console.error('Launchpad overlay Not Found');
            init(); // Try to recover
            open();
        }
    }

    function close() {
        const overlay = document.getElementById('launchpadOverlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function initDock(containerSelector) {
        const dock = document.querySelector(containerSelector);
        if (!dock) return;

        // --- TITAN 2.0 ORIENTATION MODE SYNC ---
        // 初始注入新手村呼吸光效
        if (window.TitanEvolutionEngine && window.TitanEvolutionEngine.isNewbie()) {
            dock.classList.add('orientation-mode');
        } else {
            dock.classList.remove('orientation-mode');
        }

        // Keep the first element (The Launchpad Rocket Button) and remove the rest
        // assuming the first one is the "Start" button.
        // If we want to be safer, we can look for the specific ID.
        const launchpadBtn = document.getElementById('newLaunchpadEntry');
        dock.innerHTML = ''; // Clear all
        if (launchpadBtn) dock.appendChild(launchpadBtn); // Put the rocket back

        // Ensure overflow is correct for scrolling
        dock.style.justifyContent = 'flex-start'; // Align left so scrolling works naturally

        // --- TEE INTEGRATION ---
        const evolvedApps = window.TitanEvolutionEngine ? 
            window.TitanEvolutionEngine.getEvolvedApps(apps) : apps;

        evolvedApps.forEach((app, i) => {
            // Do not render full academic/discipline hubs in the bottom dock to save space
            if (app.link && app.link.startsWith('hub-')) return;

            const item = document.createElement('div');
            item.className = 'dock-icon-box';
            item.style.minWidth = '60px'; // Fix width for scrolling

            // Staggered Fade In Animation
            item.style.opacity = '0';
            item.style.animation = `dockFadeIn 0.5s forwards ${i * 20}ms`;

            // Special Styling for System Intro
            if (app.name === '系统说明') {
                item.style.borderColor = 'var(--secondary)';
                item.style.background = 'rgba(112, 0, 255, 0.1)';
                item.style.boxShadow = '0 0 15px rgba(112, 0, 255, 0.3)';
            }

            // Click Handler & Data Attributes for permissions
            let finalLink = app.link;
            if (finalLink && finalLink.includes('hub-auto-') && !finalLink.includes('hub-template.html')) {
                finalLink = `assets/js/hubs/hub-template.html?id=${finalLink}`;
            }
            item.dataset.link = finalLink;
            item.onclick = function () {
                window.location.href = finalLink;
            };

            // Icon Background
            const iconBg = document.createElement('div');
            iconBg.className = 'dock-icon-bg';
            iconBg.innerHTML = app.icon;

            // Add subtle glow based on app color
            if (app.color && app.color !== '#fff') {
                iconBg.style.textShadow = `0 0 10px ${app.color}`;
            }
            item.appendChild(iconBg);

            // Label
            const label = document.createElement('div');
            label.className = 'dock-label';
            label.innerText = app.name;
            if (app.name === '系统说明') {
                label.style.color = 'var(--secondary)';
                label.style.fontWeight = 'bold';
            }
            item.appendChild(label);

            dock.appendChild(item);
        });

        // Add animation keyframes if not exists
        if (!document.getElementById('dock-anim-style')) {
            const style = document.createElement('style');
            style.id = 'dock-anim-style';
            style.innerHTML = `@keyframes dockFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
            document.head.appendChild(style);
        }

        // Re-run lock logic
        setTimeout(updateDock, 100);
    }

    // Initialize TEE Listener
    window.addEventListener('titan_evolution_trigger', () => {
        console.log("🎬 Evolution UI Animation Triggered");
        // 为 VFX 庆典留出 800ms 的闪烁与收缩时间
        setTimeout(() => {
            renderPages();
            const dockSelector = document.querySelector('.dock-container') ? '.dock-container' : '#dock-items';
            initDock(dockSelector);
        }, 800);
    });

    return { init, open, close, updateDock, initDock, getApps: () => apps, render: renderPages };
})();

// Auto-init for reliability
if (typeof window !== 'undefined' && window.Launchpad) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.Launchpad.init());
    } else {
        window.Launchpad.init();
    }
}
