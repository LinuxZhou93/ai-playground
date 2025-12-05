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
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
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

        // Add to beginning of list
        projects.unshift(newProject);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

        return newProject;
    },

    /**
     * Get user's projects
     * @param {String} currentUserId - (Optional) filter by specific user ID if we had auth
     */
    getMyProjects: () => {
        // Implementation for "My Projects" filter
        // For now, since we have no real auth, we could filter by a stored "my_user_id" or just return all for demo
        // Or better: filter by projects created on this device (we can mark isLocal=true)
        const projects = ProjectStorage.getAllProjects();
        return projects.filter(p => p.isLocal === true);
    },

    /**
     * Get featured/seed projects (Static data combined with storage)
     */
    getCommunityProjects: () => {
        const localProjects = ProjectStorage.getAllProjects();
        // Here we could combine with static featured projects if we wanted
        return localProjects;
    },

    /**
     * Seed initial data if empty
     */
    seedDemoData: () => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            const demoProjects = [
                {
                    id: 'seed_1',
                    title: '跳舞的小猫 (Demo)',
                    description: '这是一个内置的示例项目。点击绿旗开始！',
                    author: 'ScratchTeam',
                    type: 'scratch',
                    thumbnail_url: 'https://cdn.pixabay.com/photo/2017/01/31/15/33/scratch-2025124_1280.png', // Placeholder
                    view_count: 120,
                    likes: 45,
                    created_at: new Date().toISOString(),
                    isLocal: false
                }
            ];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(demoProjects));
        }
    }
};

// Initialize
ProjectStorage.seedDemoData();

// Expose globally
window.ProjectStorage = ProjectStorage;
