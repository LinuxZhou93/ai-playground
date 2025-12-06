/**
 * Supabase Projects API Module
 * Handles all project-related database operations
 */

const SupabaseProjects = (function () {
    'use strict';

    // Get Supabase client from global
    const getClient = () => {
        if (!window.SupabaseClient || !window.SupabaseClient.client) {
            throw new Error('Supabase client not initialized');
        }
        return window.SupabaseClient.client;
    };

    // ============================================
    // Project CRUD Operations
    // ============================================

    /**
     * Get projects with filters
     * @param {Object} options - Filter options
     * @returns {Promise<Array>} Projects array
     */
    async function getProjects(options = {}) {
        const {
            filter = 'all', // 'all', 'my', 'featured'
            type = null, // 'scratch', 'scratch-jr', 'vex'
            difficulty = null,
            competition = null,
            tags = null,
            search = '',
            sortBy = 'latest', // 'latest', 'popular', 'views'
            limit = 50,
            offset = 0,
            userId = null
        } = options;

        try {
            const supabase = getClient();
            let query = supabase
                .from('projects')
                .select(`
                    *,
                    profiles:author_id (username, avatar_url),
                    project_likes (user_id)
                `);

            // Filter logic
            if (filter === 'my' && userId) {
                query = query.eq('author_id', userId);
            } else if (filter === 'featured') {
                query = query.eq('is_featured', true);
            } else {
                // For 'all', only show published projects
                query = query.eq('is_published', true);
            }

            // Type filter
            if (type) {
                query = query.eq('type', type);
            }

            // Difficulty filter
            if (difficulty) {
                query = query.eq('difficulty', difficulty);
            }

            // Competition filter
            if (competition) {
                query = query.eq('competition', competition);
            }

            // Tags filter
            if (tags && tags.length > 0) {
                query = query.contains('tags', tags);
            }

            // Search
            if (search) {
                query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
            }

            // Sorting
            switch (sortBy) {
                case 'popular':
                    query = query.order('like_count', { ascending: false });
                    break;
                case 'views':
                    query = query.order('view_count', { ascending: false });
                    break;
                case 'latest':
                default:
                    query = query.order('created_at', { ascending: false });
                    break;
            }

            // Pagination
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) throw error;

            // Process data to add isLiked flag
            const currentUser = await window.SupabaseClient.getCurrentUser();
            const processedData = data.map(project => ({
                ...project,
                author: project.profiles?.username || project.author_name,
                avatar_url: project.profiles?.avatar_url,
                isLiked: currentUser ? project.project_likes.some(like => like.user_id === currentUser.id) : false,
                likes: project.like_count || 0,
                views: project.view_count || 0
            }));

            return processedData;

        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    }

    /**
     * Get single project by ID
     */
    async function getProjectById(projectId) {
        try {
            const supabase = getClient();
            const { data, error } = await supabase
                .from('projects')
                .select(`
                    *,
                    profiles:author_id (username, avatar_url, bio),
                    project_likes (user_id)
                `)
                .eq('id', projectId)
                .single();

            if (error) throw error;

            // Increment view count (fire and forget)
            incrementViewCount(projectId).catch(console.error);

            const currentUser = await window.SupabaseClient.getCurrentUser();
            return {
                ...data,
                author: data.profiles?.username || data.author_name,
                avatar_url: data.profiles?.avatar_url,
                author_bio: data.profiles?.bio,
                isLiked: currentUser ? data.project_likes.some(like => like.user_id === currentUser.id) : false,
                likes: data.like_count || 0,
                views: data.view_count || 0
            };

        } catch (error) {
            console.error('Error fetching project:', error);
            throw error;
        }
    }

    /**
     * Create new project
     */
    async function createProject(projectData) {
        try {
            const supabase = getClient();
            const user = await window.SupabaseClient.getCurrentUser();

            if (!user) {
                throw new Error('User must be logged in to create projects');
            }

            const { data, error } = await supabase
                .from('projects')
                .insert([{
                    ...projectData,
                    author_id: user.id,
                    author_name: user.user_metadata?.user_name || user.email.split('@')[0]
                }])
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    /**
     * Update project
     */
    async function updateProject(projectId, updates) {
        try {
            const supabase = getClient();
            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', projectId)
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    }

    /**
     * Delete project
     */
    async function deleteProject(projectId) {
        try {
            const supabase = getClient();
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;
            return true;

        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    /**
     * Publish/Unpublish project
     */
    async function togglePublish(projectId, isPublished) {
        return updateProject(projectId, { is_published: isPublished });
    }

    // ============================================
    // Like Operations
    // ============================================

    /**
     * Toggle like on a project
     */
    async function toggleLike(projectId) {
        try {
            const supabase = getClient();
            const user = await window.SupabaseClient.getCurrentUser();

            if (!user) {
                throw new Error('User must be logged in to like projects');
            }

            // Check if already liked
            const { data: existingLike } = await supabase
                .from('project_likes')
                .select('*')
                .eq('user_id', user.id)
                .eq('project_id', projectId)
                .single();

            if (existingLike) {
                // Unlike
                const { error } = await supabase
                    .from('project_likes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('project_id', projectId);

                if (error) throw error;
                return { liked: false };
            } else {
                // Like
                const { error } = await supabase
                    .from('project_likes')
                    .insert([{
                        user_id: user.id,
                        project_id: projectId
                    }]);

                if (error) throw error;
                return { liked: true };
            }

        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    }

    // ============================================
    // Comment Operations
    // ============================================

    /**
     * Get comments for a project
     */
    async function getComments(projectId) {
        try {
            const supabase = getClient();
            const { data, error } = await supabase
                .from('project_comments')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    /**
     * Add comment to project
     */
    async function addComment(projectId, content) {
        try {
            const supabase = getClient();
            const user = await window.SupabaseClient.getCurrentUser();

            if (!user) {
                throw new Error('User must be logged in to comment');
            }

            const { data, error } = await supabase
                .from('project_comments')
                .insert([{
                    project_id: projectId,
                    user_id: user.id,
                    user_name: user.user_metadata?.user_name || user.email.split('@')[0],
                    user_avatar: user.user_metadata?.avatar_url,
                    content: content
                }])
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }

    /**
     * Delete comment
     */
    async function deleteComment(commentId) {
        try {
            const supabase = getClient();
            const { error } = await supabase
                .from('project_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
            return true;

        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }

    // ============================================
    // Statistics
    // ============================================

    /**
     * Increment view count
     */
    async function incrementViewCount(projectId) {
        try {
            const supabase = getClient();
            const { error } = await supabase.rpc('increment_view_count', {
                project_uuid: projectId
            });

            if (error) throw error;
            return true;

        } catch (error) {
            console.error('Error incrementing view count:', error);
            // Don't throw - view count is not critical
            return false;
        }
    }

    /**
     * Get user statistics
     */
    async function getUserStats(userId) {
        try {
            const supabase = getClient();

            // Get project count
            const { count: projectCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('author_id', userId);

            // Get total likes
            const { data: projects } = await supabase
                .from('projects')
                .select('like_count')
                .eq('author_id', userId);

            const totalLikes = projects?.reduce((sum, p) => sum + (p.like_count || 0), 0) || 0;

            // Get total views
            const { data: viewData } = await supabase
                .from('projects')
                .select('view_count')
                .eq('author_id', userId);

            const totalViews = viewData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

            return {
                projectCount: projectCount || 0,
                totalLikes,
                totalViews
            };

        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }

    // ============================================
    // Public API
    // ============================================

    return {
        // Projects
        getProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,
        togglePublish,

        // Likes
        toggleLike,

        // Comments
        getComments,
        addComment,
        deleteComment,

        // Statistics
        incrementViewCount,
        getUserStats
    };

})();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.SupabaseProjects = SupabaseProjects;
}
