/**
 * Simple Project Storage System using LocalStorage
 * Simulates a backend database for storing project metadata
 */

const STORAGE_KEY = 'scratch_community_projects';

const ProjectStorage = {
    /**
     * Get all projects
     * @returns {Array} List of project objects
     */
    getAllProjects: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Storage error:", e);
            return [];
        }
    },

    /**
     * Save a new project
     * @param {Object} projectData - {title, description, author, type, fileUrl/Data, etc.}
     * @returns {Object} The saved project with ID and timestamp
     */
    saveProject: (projectData) => {
        const projects = ProjectStorage.getAllProjects();
        const newProject = {
            id: 'proj_' + Date.now(),
            created_at: new Date().toISOString(),
            likes: 0,
            view_count: 0,
            ...projectData
        };
        projects.unshift(newProject);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return newProject;
    },

    updateProject: (projectData) => {
        const projects = ProjectStorage.getAllProjects();
        const index = projects.findIndex(p => p.id === projectData.id);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...projectData };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        }
    },

    getMyProjects: () => {
        const projects = ProjectStorage.getAllProjects();
        return projects.filter(p => p.isLocal === true);
    },

    getCommunityProjects: () => {
        return ProjectStorage.getAllProjects();
    },

    seedDemoData: () => {
        // Always check if we need to migrate/update data schema
        const stored = localStorage.getItem(STORAGE_KEY);
        let needsUpdate = !stored;

        // Force update if data looks old (simple check)
        if (stored) {
            const parsed = JSON.parse(stored);
            // Check if new VEX projects exist
            if (parsed.length > 0 && (!parsed[0].difficulty || !parsed.find(p => p.id === 'vex_iq_high_stakes'))) {
                needsUpdate = true;
                localStorage.removeItem(STORAGE_KEY); // Clear old data to re-seed
            }
        }

        if (needsUpdate) {
            const demoProjects = [
                // ========== 入门级游戏 (Beginner Games) ==========
                {
                    id: 'game_pong',
                    title: 'Pong 乒乓球游戏',
                    description: '经典的双人乒乓球对战游戏，学习碰撞检测和物理模拟基础。',
                    author: 'ScratchTeam',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['游戏', '双人', '经典'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128407_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128407/',
                    view_count: 1520,
                    likes: 328,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'game_catch',
                    title: '接水果游戏',
                    description: '移动篮子接住掉落的水果，学习键盘控制和随机生成。',
                    author: 'GameMaker',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['游戏', '反应', '计分'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/11656680_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/11656680/',
                    view_count: 890,
                    likes: 156,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'game_maze',
                    title: '迷宫探险',
                    description: '控制角色走出迷宫，学习碰撞检测和关卡设计。',
                    author: 'MazeDesigner',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['游戏', '迷宫', '冒险'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128431_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128431/',
                    view_count: 670,
                    likes: 145,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'game_clicker',
                    title: '点击大师',
                    description: '点击收集金币，升级道具，体验增量游戏机制。',
                    author: 'IdleGamer',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['游戏', '放置', '升级'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128456_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128456/',
                    view_count: 1200,
                    likes: 280,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 中级游戏 (Intermediate Games) ==========
                {
                    id: 'game_platformer',
                    title: '平台跳跃冒险',
                    description: '完整的横版平台游戏，包含重力、跳跃、敌人和关卡系统。',
                    author: 'PlatformPro',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['游戏', '平台', '物理'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128520_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128520/',
                    view_count: 2340,
                    likes: 567,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true
                },
                {
                    id: 'game_tower_defense',
                    title: '塔防大战',
                    description: '策略塔防游戏，建造防御塔抵御敌人进攻。',
                    author: 'StrategyMaster',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['游戏', '策略', '塔防'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128567_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128567/',
                    view_count: 1890,
                    likes: 445,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'game_rpg',
                    title: 'RPG 冒险传说',
                    description: '角色扮演游戏，包含对话系统、战斗系统和物品栏。',
                    author: 'RPGCreator',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['游戏', 'RPG', '剧情'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128601_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128601/',
                    view_count: 3120,
                    likes: 789,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true
                },
                {
                    id: 'game_racing',
                    title: '极速赛车',
                    description: '3D 视角赛车游戏，学习透视变换和速度控制。',
                    author: 'RacingFan',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['游戏', '赛车', '3D'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128634_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128634/',
                    view_count: 1560,
                    likes: 390,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 高级游戏 (Advanced Games) ==========
                {
                    id: 'game_geometry_dash',
                    title: 'Geometry Dash',
                    description: '经典的几何冲刺游戏复刻版，精准的物理和音乐同步。',
                    author: 'Griffpatch',
                    type: 'scratch',
                    difficulty: 'advanced',
                    tags: ['游戏', '平台', '音乐'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/105500895_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/105500895/',
                    view_count: 8900,
                    likes: 4500,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true,
                    isFeatured: true
                },
                {
                    id: 'game_3d_maze',
                    title: '3D 迷宫引擎',
                    description: '惊人的 3D 迷宫探索引擎，展示光线投射算法。',
                    author: 'GenericUser',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'CSP-J',
                    tags: ['算法', '3D', '数学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/21264366_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/21264366/',
                    view_count: 5670,
                    likes: 1234,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isFeatured: true
                },
                {
                    id: 'game_minecraft_2d',
                    title: 'Minecraft 2D',
                    description: '我的世界 2D 版本，包含挖掘、建造和生存机制。',
                    author: 'MinecraftFan',
                    type: 'scratch',
                    difficulty: 'advanced',
                    tags: ['游戏', '沙盒', '创造'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128701_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128701/',
                    view_count: 6780,
                    likes: 1890,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true
                },

                // ========== 算法可视化 (Algorithm Visualization) ==========
                {
                    id: 'algo_bubble_sort',
                    title: '冒泡排序可视化',
                    description: 'CSP-J 考点：直观展示冒泡排序算法的交换过程。',
                    author: 'AlgoMaster',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    competition: 'CSP-J',
                    tags: ['算法', '排序', 'CSP-J'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128734_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128734/',
                    view_count: 890,
                    likes: 234,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'algo_binary_search',
                    title: '二分查找算法',
                    description: 'CSP-J 必考：在有序数组中快速查找目标值的可视化。',
                    author: 'CS_Teacher',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    competition: 'CSP-J',
                    tags: ['算法', '二分查找', '数学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128756_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128756/',
                    view_count: 670,
                    likes: 189,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'algo_quicksort',
                    title: '快速排序演示',
                    description: 'NOIP 考点：分治算法的经典应用，动画展示分区过程。',
                    author: 'AlgoExpert',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'NOIP',
                    tags: ['算法', '排序', '分治'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128778_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128778/',
                    view_count: 1120,
                    likes: 345,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'algo_dijkstra',
                    title: 'Dijkstra 最短路径',
                    description: 'NOIP 图论：可视化展示 Dijkstra 算法寻找最短路径。',
                    author: 'GraphTheory',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'NOIP',
                    tags: ['算法', '图论', '最短路径'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128801_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128801/',
                    view_count: 980,
                    likes: 278,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'algo_bfs_dfs',
                    title: 'BFS 与 DFS 对比',
                    description: '广度优先和深度优先搜索的动画对比演示。',
                    author: 'SearchAlgo',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    competition: 'CSP-J',
                    tags: ['算法', '搜索', '图论'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128823_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128823/',
                    view_count: 760,
                    likes: 201,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 创意艺术 (Creative Art) ==========
                {
                    id: 'art_fractal',
                    title: '分形艺术生成器',
                    description: '生成美丽的分形图案，探索数学与艺术的结合。',
                    author: 'MathArtist',
                    type: 'scratch',
                    difficulty: 'advanced',
                    tags: ['艺术', '数学', '分形'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128845_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128845/',
                    view_count: 1340,
                    likes: 456,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isFeatured: true
                },
                {
                    id: 'art_particle',
                    title: '粒子系统艺术',
                    description: '交互式粒子效果，鼠标移动创造绚丽图案。',
                    author: 'ParticleDesigner',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['艺术', '粒子', '交互'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128867_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128867/',
                    view_count: 1120,
                    likes: 389,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'art_music_visualizer',
                    title: '音乐可视化',
                    description: '音乐节奏可视化，声音转化为动态图形。',
                    author: 'AudioVisual',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['艺术', '音乐', '可视化'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128889_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128889/',
                    view_count: 890,
                    likes: 267,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'art_paint_app',
                    title: '数字画板',
                    description: '功能完整的绘画应用，支持多种画笔和颜色。',
                    author: 'DigitalArtist',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['艺术', '绘画', '工具'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128912_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128912/',
                    view_count: 670,
                    likes: 178,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== VEX 机器人 (VEX Robotics) ==========
                {
                    id: 'vex_high_stakes',
                    title: 'VEX IQ 2025: High Stakes',
                    description: '2025 赛季 High Stakes 挑战赛满分自动程序演示。',
                    author: 'VEX_Champion',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'VEX',
                    tags: ['VEX', '机器人', '竞赛'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128934_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128934/',
                    view_count: 2100,
                    likes: 560,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true,
                    isFeatured: true
                },
                {
                    id: 'vex_line_follow',
                    title: 'VEX 巡线算法',
                    description: 'PID 控制的巡线机器人，学习反馈控制原理。',
                    author: 'RoboticsTeam',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'VEX',
                    tags: ['VEX', 'PID', '传感器'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128956_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128956/',
                    view_count: 1450,
                    likes: 378,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'vex_arm_control',
                    title: 'VEX 机械臂控制',
                    description: '三轴机械臂逆运动学解算，精准抓取演示。',
                    author: 'MechEngineer',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'VEX',
                    tags: ['VEX', '机械臂', '运动学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128978_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128978/',
                    view_count: 980,
                    likes: 267,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 教育工具 (Educational Tools) ==========
                {
                    id: 'edu_math_quiz',
                    title: '数学速算挑战',
                    description: '趣味数学题库，提升心算能力。',
                    author: 'MathTeacher',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['教育', '数学', '测验'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129001_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129001/',
                    view_count: 560,
                    likes: 145,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'edu_typing_game',
                    title: '打字练习游戏',
                    description: '通过游戏提升打字速度和准确度。',
                    author: 'TypingMaster',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['教育', '打字', '技能'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129023_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129023/',
                    view_count: 780,
                    likes: 198,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'edu_periodic_table',
                    title: '元素周期表探索',
                    description: '交互式元素周期表，学习化学元素知识。',
                    author: 'ChemTeacher',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['教育', '化学', '科学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129045_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129045/',
                    view_count: 450,
                    likes: 123,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'edu_solar_system',
                    title: '太阳系模拟器',
                    description: '3D 太阳系行星运动模拟，学习天文知识。',
                    author: 'AstroTeacher',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['教育', '天文', '模拟'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129067_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129067/',
                    view_count: 1230,
                    likes: 345,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 模拟器 (Simulators) ==========
                {
                    id: 'sim_physics',
                    title: '物理引擎模拟',
                    description: '重力、弹力、摩擦力的真实物理模拟。',
                    author: 'PhysicsEngine',
                    type: 'scratch',
                    difficulty: 'advanced',
                    tags: ['模拟', '物理', '引擎'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129089_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129089/',
                    view_count: 1560,
                    likes: 423,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'sim_ecosystem',
                    title: '生态系统模拟',
                    description: '捕食者与猎物的种群动态模拟。',
                    author: 'BioSimulator',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['模拟', '生物', '生态'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129112_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129112/',
                    view_count: 890,
                    likes: 234,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'sim_traffic',
                    title: '交通流量模拟',
                    description: '城市交通系统模拟，优化红绿灯控制。',
                    author: 'CityPlanner',
                    type: 'scratch',
                    difficulty: 'advanced',
                    tags: ['模拟', '交通', '优化'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129134_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129134/',
                    view_count: 670,
                    likes: 189,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 实用工具 (Utilities) ==========
                {
                    id: 'tool_calculator',
                    title: '科学计算器',
                    description: '功能完整的科学计算器，支持复杂运算。',
                    author: 'MathTools',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['工具', '计算器', '数学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129156_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129156/',
                    view_count: 450,
                    likes: 112,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'tool_timer',
                    title: '番茄钟计时器',
                    description: '专注学习的番茄工作法计时工具。',
                    author: 'ProductivityApp',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['工具', '计时', '效率'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129178_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129178/',
                    view_count: 340,
                    likes: 89,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'tool_password_gen',
                    title: '密码生成器',
                    description: '生成安全的随机密码，学习密码学基础。',
                    author: 'SecurityPro',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['工具', '安全', '密码'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129201_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129201/',
                    view_count: 290,
                    likes: 67,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== AI/ML 演示 (AI/ML Demos) ==========
                {
                    id: 'ai_neural_network',
                    title: '神经网络可视化',
                    description: '简单的神经网络训练过程可视化，理解 AI 基础。',
                    author: 'AIEducator',
                    type: 'scratch',
                    difficulty: 'advanced',
                    tags: ['AI', '机器学习', '神经网络'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129223_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129223/',
                    view_count: 1890,
                    likes: 567,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isFeatured: true
                },
                {
                    id: 'ai_face_detection',
                    title: '人脸识别演示',
                    description: '使用摄像头进行简单的人脸检测。',
                    author: 'VisionAI',
                    type: 'scratch',
                    difficulty: 'advanced',
                    tags: ['AI', '计算机视觉', '识别'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129245_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129245/',
                    view_count: 2340,
                    likes: 678,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true
                },
                {
                    id: 'ai_chatbot',
                    title: '智能聊天机器人',
                    description: '基于规则的对话系统，学习 NLP 基础。',
                    author: 'ChatbotDev',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['AI', '聊天', 'NLP'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129267_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129267/',
                    view_count: 1120,
                    likes: 334,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 音乐创作 (Music Creation) ==========
                {
                    id: 'music_piano',
                    title: '虚拟钢琴',
                    description: '可演奏的虚拟钢琴，支持录制和回放。',
                    author: 'MusicMaker',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['音乐', '钢琴', '创作'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129289_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129289/',
                    view_count: 780,
                    likes: 223,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'music_drum_machine',
                    title: '节奏鼓机',
                    description: '创建自己的节奏循环，学习音乐节拍。',
                    author: 'BeatMaker',
                    type: 'scratch',
                    difficulty: 'beginner',
                    tags: ['音乐', '节奏', '鼓'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129312_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129312/',
                    view_count: 560,
                    likes: 167,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },

                // ========== 数据可视化 (Data Visualization) ==========
                {
                    id: 'data_chart_maker',
                    title: '图表生成器',
                    description: '输入数据生成柱状图、折线图和饼图。',
                    author: 'DataViz',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['数据', '图表', '可视化'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129334_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129334/',
                    view_count: 450,
                    likes: 134,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'data_covid_tracker',
                    title: '疫情数据追踪',
                    description: '可视化展示疫情数据变化趋势。',
                    author: 'DataScience',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    tags: ['数据', '疫情', '统计'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10129356_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10129356/',
                    view_count: 670,
                    likes: 189,
                    created_at: new Date().toISOString(),
                    isLocal: false
                }
            ];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(demoProjects));
        }
    }
};

// Initialize immediately
try {
    ProjectStorage.seedDemoData();
    window.ProjectStorage = ProjectStorage;
    console.log("ProjectStorage initialized successfully");
} catch (e) {
    console.error("ProjectStorage init failed:", e);
}
