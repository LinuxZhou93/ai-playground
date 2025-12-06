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
                {
                    id: 'feat_1',
                    title: 'Witch Magic (Demo)',
                    description: '体验魔法世界的奇妙冒险！点击绿旗开始。',
                    author: 'ScratchTeam',
                    type: 'scratch',
                    difficulty: 'beginner',
                    competition: null,
                    tags: ['游戏', '冒险', '魔法'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128431_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/10128431/',
                    view_count: 520,
                    likes: 128,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: false
                },
                {
                    id: 'feat_2',
                    title: 'Geometry Dash',
                    description: '经典的几何冲刺游戏复刻版。',
                    author: 'Griffpatch',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: null,
                    tags: ['游戏', '平台', '音乐'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/105500895_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/105500895/',
                    view_count: 8900,
                    likes: 4500,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true
                },
                {
                    id: 'feat_3',
                    title: '3D Maze Engine',
                    description: '惊人的 3D 迷宫探索引擎，展示光线投射算法。',
                    author: 'GenericUser',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'CSP-J',
                    tags: ['算法', '3D', '数学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/21264366_480x360.png',
                    project_url: 'https://scratch.mit.edu/projects/21264366/',
                    view_count: 345,
                    likes: 77,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: false
                },
                {
                    id: 'vex_demo_1',
                    title: 'VEX IQ: 自动驾驶挑战',
                    description: 'VEX IQ 机器人自动驾驶程序，包含巡线和避障逻辑，适用于 2025 赛季规则。',
                    author: 'RoboticsCoach',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'VEX',
                    tags: ['机器人', 'PID控制', '传感器'],
                    thumbnail_url: 'https://via.placeholder.com/480x360/4CBF56/FFFFFF?text=VEX+Auto+Pilot',
                    project_url: null,
                    view_count: 1250,
                    likes: 340,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true
                },
                {
                    id: 'maker_demo_1',
                    title: 'Arduino 智能家居中控',
                    description: '基于 ESP32 的物联网控制中心，支持语音指令控制灯光和温度监测。',
                    author: 'MakerLab',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    competition: '创意编程',
                    tags: ['硬件', '物联网', '创客'],
                    thumbnail_url: 'https://via.placeholder.com/480x360/F5A623/FFFFFF?text=Smart+Home+IoT',
                    project_url: null,
                    view_count: 890,
                    likes: 156,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: false
                },
                {
                    id: 'vex_demo_2',
                    title: 'VEX V5: 机械臂运动学',
                    description: '三轴机械臂逆运动学解算演示，精准抓取目标物体。',
                    author: 'EngUser_01',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'VEX',
                    tags: ['工程', '数学', '机械臂'],
                    thumbnail_url: 'https://via.placeholder.com/480x360/E11D48/FFFFFF?text=Robotic+Arm',
                    project_url: null,
                    view_count: 567,
                    likes: 210,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true
                },
                {
                    id: 'feat_5',
                    title: '冒泡排序可视化',
                    description: 'CSP-J 考点：直观展示冒泡排序算法的交换过程。',
                    author: 'AlgoMaster',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    competition: 'CSP-J',
                    tags: ['算法', 'CSP-J'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/10128431_480x360.png',
                    project_url: null,
                    view_count: 234,
                    likes: 89,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'vex_iq_high_stakes',
                    title: 'VEX IQ 2025: High Stakes',
                    description: '2025 赛季 High Stakes 挑战赛满分自动程序演示。',
                    author: 'VEX_Champion',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: 'VEX',
                    tags: ['VEX', '机器人', '竞赛'],
                    thumbnail_url: 'https://cdn.vexrobotics.com/vexverse/viqc-high-stakes-field.png',
                    project_url: null,
                    view_count: 2100,
                    likes: 560,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isLiked: true,
                    isFeatured: true
                },
                {
                    id: 'csp_binary_search',
                    title: '二分查找算法演示',
                    description: 'CSP-J 必考：在有序数组中快速查找目标值的可视化过程。',
                    author: 'CS_Teacher',
                    type: 'scratch',
                    difficulty: 'intermediate',
                    competition: 'CSP-J',
                    tags: ['算法', '二分查找', '数学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/321456_480x360.png',
                    project_url: null,
                    view_count: 450,
                    likes: 120,
                    created_at: new Date().toISOString(),
                    isLocal: false
                },
                {
                    id: 'art_gen_p5',
                    title: 'Generative Art: Flow Field',
                    description: '使用 Scratch 模拟 p5.js 的流场艺术效果。',
                    author: 'CreativeCoder',
                    type: 'scratch',
                    difficulty: 'advanced',
                    competition: '创意编程',
                    tags: ['艺术', '数学', '生成艺术'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/654321_480x360.png',
                    project_url: null,
                    view_count: 890,
                    likes: 340,
                    created_at: new Date().toISOString(),
                    isLocal: false,
                    isFeatured: true
                },
                {
                    id: 'python_intro_sim',
                    title: 'Python Syntax Simulator',
                    description: '在 Scratch 中体验 Python 语法！Print("Hello World")。',
                    author: 'PyFan',
                    type: 'scratch',
                    difficulty: 'beginner',
                    competition: null,
                    tags: ['Python', '模拟', '教学'],
                    thumbnail_url: 'https://cdn2.scratch.mit.edu/get_image/project/987654_480x360.png',
                    project_url: null,
                    view_count: 150,
                    likes: 45,
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
