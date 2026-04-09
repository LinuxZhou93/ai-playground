/**
 * Titan Virtual Hub Data
 * 
 * Contains all the dynamic content for the hub-template.html
 * and manages the transformation from hub-auto-*.html to virtual hubs.
 */

window.TitanHubData = {
    // Categories and their default settings
    CATEGORIES: {
        'academic': {
            themeColor: '#8b5cf6',
            textColor: 'violet',
            icon: '🏮',
            tagPrefix: 'MAJOR_SYS',
            suffix: '国家学科中心'
        },
        'discovery': {
            themeColor: '#0ea5e9',
            textColor: 'sky',
            icon: '🌏',
            tagPrefix: 'EXP_SYS',
            suffix: '探索与发现'
        },
        'labs': {
            themeColor: '#10b981',
            textColor: 'emerald',
            icon: '⚡',
            tagPrefix: 'LAB_SYS',
            suffix: '核心实验室'
        }
    },

    // Maps hub filenames to their specific metadata
    HUB_MAP: {
        // --- Examples from extracted data ---
        'hub-auto-101.html': { 
            name: '脑机接口工程', 
            icon: '🧠', 
            id: 'BCI_ENGINEERING',
            desc: '脑机接口工程是一门将神经科学、信号处理与人工智能深度融合的颠覆性交叉学科。致力于打破碳基生命与硅基计算的边界，实现大脑意念对外部设备的直接控制，以及外部信息向神经系统的高速写入。',
            category: 'academic',
            subSectors: [
                { id: '01', title: '非侵入式脑电解码', label: 'DECODING', color: 'violet', desc: '基于高密度穿戴式干电极系统与时空图卷积神经网络，实现思维信号的三维重建。', classroom: 'course-robotics.html' },
                { id: '02', title: '神经外骨骼控制', label: 'PROSTHETIC', color: 'fuchsia', desc: '深度整合运动皮层信号与机械动力学模型，研发纯意念驱动的仿生外骨骼。', classroom: 'course-robotics-advanced.html' },
                { id: '03', title: '双向神经接口', label: 'WRITE_MODE', color: 'indigo', desc: '研发基于无创光遗传学的精确“神经写入”技术，为大脑注入视觉画面反馈。', classroom: 'course-robotics.html' },
                { id: '04', title: '认知增强系统', label: 'COGNITION', color: 'emerald', desc: '探索海马体记忆波形，研究利用闭环神经刺激靶向提升注意力。', classroom: 'course-robotics-advanced.html' }
            ],
            telemetry: {
                main: { label: 'SYNAPSE_ACTIVITY', value: '42.8 TFlops', trend: '↑ 12.4% ABOVE NORM', color: 'fuchsia' },
                sub: { label: 'SIGNAL_TO_NOISE', value: '98.2 dB', trend: 'OPTIMAL STATE', color: 'indigo' }
            },
            heroImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
        },
        'hub-auto-102.html': {
            name: '人形机器人技术',
            icon: '🤖',
            id: 'HUMANOID_ROBOTICS',
            desc: '专注于高自由度仿生关节、实时姿态平衡算法与具身智能在复杂物理环境中的深度协同，旨在构建具备类人交互能力与精细操作柔性的下一代通用移动平台。',
            category: 'academic',
            subSectors: [
                { id: '01', title: '高度集成驱动器', label: 'ACTUATORS', color: 'sky', desc: '研发具备高功率密度、高力矩闭环反馈与低能耗比的集成式关节动力源。', classroom: 'course-robotics.html' },
                { id: '02', title: '实时平衡算法', label: 'KINEMATICS', color: 'blue', desc: '基于模型预测控制（MPC）的动态平衡算法，实现机器人在崎岖地形下的稳健行走。', classroom: 'course-robotics-advanced.html' },
                { id: '03', title: '触觉皮肤传感器', label: 'SENSORY', color: 'cyan', desc: '柔性触觉传感阵列覆盖，提供高分辨率的压力反馈，实现更安全的人机协作。', classroom: 'course-robotics.html' },
                { id: '04', title: '视觉SLAM感知', label: 'VISION', color: 'indigo', desc: '多传感器融合技术，实现对复杂环境的三维语义地图构建与目标实时追踪。', classroom: 'course-robotics-advanced.html' }
            ]
        }
        // ... more hubs will be added dynamically or stored in a separate JSON
    },

    // Get hub data by link/id
    getHubData: function(link) {
        // Handle path inconsistencies
        const filename = link.split('/').pop() || 'hub-auto-101.html';
        const data = this.HUB_MAP[filename];
        
        if (!data) {
            // Return fallback for non-mapped hubs
            return {
                name: '学科实验室',
                icon: '🔬',
                id: 'GENERIC_LAB',
                desc: '本模块正在同步动态数据。TITAN OS 将为您提供高保真的学科前沿探索体验，涵盖理论、实验与工程实践。',
                category: 'academic'
            };
        }
        return data;
    }
};
