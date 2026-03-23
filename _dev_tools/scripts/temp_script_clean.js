        // ===== AI Assistant Logic =====


        const { createApp, ref, computed, onMounted, onUnmounted, watch } = Vue;

        createApp({
            setup() {
                onMounted(() => {
                    if (typeof THREE !== 'undefined') init3DScene();
                });

                // Initialize Supabase if available
                // Note: Supabase Client is handled by assets/js/supabase-client.js
                // We rely on window.SupabaseClient for logic.

                // If Supabase is missing, we just use local mode.
                const user = Vue.ref(null);

                const loading = ref(true);
                const projects = ref([]);
                const filter = ref('all');
                const currentLang = ref(localStorage.getItem('ide_lang') || 'zh');
                const selectedProject = ref(null);
                const selectedPath = ref(null);

                const openProjectDetail = (project) => {
                    selectedProject.value = project;
                };

                const selectPath = (path) => {
                    selectedPath.value = path;
                    // Reset filter tab to 'all' when selecting a path to avoid confusion
                    filter.value = 'all';
                    fetchProjects();
                    // Scroll to projects grid
                    setTimeout(() => {
                        const grid = document.querySelector('.grid-cols-1');
                        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                };

                const playProject = (project, mode = 'play') => {
                    if (project.type === 'scratch-jr') {
                        // Scratch Jr doesn't support direct linking yet without complex setup, just go to page
                        window.location.href = 'ide-jr.html';
                    } else {
                        let targetUrl = 'ide-scratch.html';
                        const params = new URLSearchParams();

                        // Handle External/Hosted Project
                        if (project.project_url) {
                            params.append('project_url', project.project_url);
                        }
                        // Handle Local Project (if we support loading by ID later)
                        // params.append('project_id', project.id);

                        if (mode === 'remix') {
                            params.append('remix', 'true');
                            params.append('original_title', project.title);
                        }

                        // Construct final URL
                        const queryString = params.toString();
                        if (queryString) {
                            targetUrl += `?${queryString}`;
                        }

                        window.location.href = targetUrl;
                    }
                };

                const searchQuery = ref('');
                const sortBy = ref('latest'); // latest, popular, views, random

                // Toggle Like Function
                const toggleLike = async (project) => {
                    try {
                        // Try Supabase first
                        if (window.SupabaseProjects && window.SupabaseClient) {
                            const currentUser = await window.SupabaseClient.getCurrentUser();
                            if (!currentUser) {
                                alert('请先登录才能点赞');
                                return;
                            }

                            const result = await window.SupabaseProjects.toggleLike(project.id);

                            // Update local state
                            project.isLiked = result.liked;
                            project.likes += result.liked ? 1 : -1;
                            project.like_count = project.likes; // Keep both for compatibility
                        } else {
                            // Fallback to localStorage
                            project.isLiked = !project.isLiked;
                            project.likes += project.isLiked ? 1 : -1;

                            // Update in storage
                            if (window.ProjectStorage && typeof ProjectStorage.updateProject === 'function') {
                                ProjectStorage.updateProject(project);
                            }
                        }
                    } catch (error) {
                        console.error('Error toggling like:', error);
                        alert('点赞失败，请稍后重试');
                    }
                };

                const fetchProjects = async () => {
                    loading.value = true;
                    try {
                        // Try Supabase first
                        if (window.SupabaseProjects && window.SupabaseClient) {
                            const currentUser = await window.SupabaseClient.getCurrentUser();

                            // Determine competition filter
                            let competitionFilter = null;
                            if (selectedPath.value === 'competition') {
                                // For competition path, we'll filter in post-processing
                                // since we need OR logic (CSP-J OR VEX)
                            }

                            const options = {
                                filter: filter.value,
                                difficulty: selectedPath.value === 'beginner' ? 'beginner' : null,
                                search: searchQuery.value,
                                sortBy: sortBy.value,
                                userId: currentUser?.id
                            };

                            let fetchedProjects = await window.SupabaseProjects.getProjects(options);

                            // Post-process filters
                            if (selectedPath.value === 'competition') {
                                fetchedProjects = fetchedProjects.filter(p =>
                                    p.competition === 'CSP-J' || p.competition === 'VEX' || p.competition === 'NOIP'
                                );
                            } else if (selectedPath.value === 'creative') {
                                fetchedProjects = fetchedProjects.filter(p =>
                                    (p.tags && (p.tags.includes('艺术') || p.tags.includes('音乐'))) ||
                                    p.type === 'scratch-jr'
                                );
                            }

                            projects.value = fetchedProjects;
                        } else {
                            // Fallback to localStorage (offline mode)
                            console.log('Using localStorage fallback');

                            // Ensure seeds exist if empty
                            if (window.ProjectStorage && typeof ProjectStorage.seedDemoData === 'function') {
                                ProjectStorage.seedDemoData();
                            }

                            // Get All
                            let allProjects = [];
                            if (window.ProjectStorage) {
                                allProjects = ProjectStorage.getAllProjects();
                            } else {
                                allProjects = JSON.parse(localStorage.getItem('scratch_community_projects') || '[]');
                            }

                            // Filter Logic (Tab)
                            let filtered = [];
                            if (filter.value === 'my') {
                                filtered = allProjects.filter(p => p.isLocal === true);
                            } else if (filter.value === 'featured') {
                                filtered = allProjects.filter(p => p.project_url);
                            } else {
                                filtered = allProjects;
                            }

                            // Path Logic
                            if (selectedPath.value) {
                                if (selectedPath.value === 'beginner') {
                                    filtered = filtered.filter(p => p.difficulty === 'beginner');
                                } else if (selectedPath.value === 'competition') {
                                    filtered = filtered.filter(p => p.competition === 'CSP-J' || p.competition === 'VEX');
                                } else if (selectedPath.value === 'creative') {
                                    filtered = filtered.filter(p => (p.tags && (p.tags.includes('艺术') || p.tags.includes('音乐'))) || p.type === 'scratch-jr');
                                }
                            }

                            // Search Logic
                            if (searchQuery.value.trim()) {
                                const q = searchQuery.value.toLowerCase();
                                filtered = filtered.filter(p =>
                                    p.title.toLowerCase().includes(q) ||
                                    (p.description && p.description.toLowerCase().includes(q)) ||
                                    (p.author && p.author.toLowerCase().includes(q))
                                );
                            }

                            // Sort Logic
                            switch (sortBy.value) {
                                case 'popular':
                                    filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
                                    break;
                                case 'views':
                                    filtered.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
                                    break;
                                case 'random':
                                    filtered.sort(() => Math.random() - 0.5);
                                    break;
                                case 'latest':
                                default:
                                    break;
                            }

                            projects.value = filtered;
                        }

                    } catch (e) {
                        console.error("Error fetching projects:", e);
                        // On error, try localStorage fallback
                        if (window.ProjectStorage) {
                            projects.value = ProjectStorage.getAllProjects();
                        } else {
                            projects.value = [];
                        }
                    } finally {
                        loading.value = false;
                    }
                };

                const loginWithGithub = async () => {
                    try {
                        if (window.SupabaseClient) {
                            await window.SupabaseClient.signInWithGitHub();
                            // Redirect will happen automatically
                        } else {
                            alert("Supabase not configured. Please check database/README.md for setup instructions.");
                        }
                    } catch (error) {
                        console.error('Login error:', error);
                        alert('登录失败，请稍后重试');
                    }
                };

                watch([filter, searchQuery, sortBy], () => {
                    fetchProjects();
                });

                onMounted(async () => {
                    // Check User Session via Centralized Client
                    if (window.SupabaseClient) {
                        const currentUser = await window.SupabaseClient.getCurrentUser();
                        if (currentUser) {
                            user.value = currentUser;
                        }
                    }

                    fetchProjects();

                    // Initialize language
                    setTimeout(() => setLanguage(currentLang.value), 100);
                });

                // Language switching
                // currentLang is already declared above
                // Translations now loaded from assets/js/translations.js

                const setLanguage = (lang) => {
                    currentLang.value = lang;
                    localStorage.setItem('coding_lang', lang);

                    // Update all elements with data-i18n
                    document.querySelectorAll('[data-i18n]').forEach(el => {
                        const key = el.getAttribute('data-i18n');
                        if (translations[lang][key]) {
                            el.textContent = translations[lang][key];
                        }
                    });
                };

                const toggleLanguage = () => {
                    setLanguage(currentLang.value === 'zh' ? 'en' : 'zh');
                };

                // --- Carousel Logic ---
                const currentSlide = ref(0);
                const featuredProjects = computed(() => {
                    // Filter projects: Use featured ones, or top liked, or specific URLs
                    // Fallback to first 5
                    let list = projects.value.filter(p => p.isFeatured || (p.likes && p.likes > 3) || p.project_url);
                    if (list.length === 0 && projects.value.length > 0) {
                        list = projects.value.slice(0, 3);
                    }
                    return list.slice(0, 5);
                });

                let slideInterval;
                const nextSlide = () => {
                    if (featuredProjects.value.length === 0) return;
                    currentSlide.value = (currentSlide.value + 1) % featuredProjects.value.length;
                };
                const prevSlide = () => {
                    if (featuredProjects.value.length === 0) return;
                    currentSlide.value = (currentSlide.value - 1 + featuredProjects.value.length) % featuredProjects.value.length;
                };
                const setSlide = (index) => {
                    currentSlide.value = index;
                    // Reset timer on manual interaction
                    if (slideInterval) {
                        clearInterval(slideInterval);
                        slideInterval = setInterval(nextSlide, 5000);
                    }
                };

                onMounted(() => {
                    slideInterval = setInterval(nextSlide, 5000);
                });
                onUnmounted(() => {
                    if (slideInterval) clearInterval(slideInterval);
                });

                // --- AI Assistant Logic (Vue Integrated) ---
                const aiState = Vue.reactive({
                    isOpen: false,
                    isVisible: false,
                    isTyping: false,
                    input: '',
                    messages: [
                        {
                            isUser: false,
                            text: "你好!我是你的 AI 编程助手。我可以帮你:<br><br>💡 解答 Scratch 编程问题<br>🎯 推荐适合你的学习项目<br>🐛 诊断代码 Bug<br>🏆 提供竞赛备考建议"
                        }
                    ]
                });

                const scrollChat = () => {
                    setTimeout(() => {
                        const div = document.getElementById('ai-chat-scroller');
                        if (div) div.scrollTop = div.scrollHeight;
                    }, 50);
                };

                const toggleAI = () => {
                    if (!aiState.isOpen) {
                        aiState.isOpen = true;
                        setTimeout(() => aiState.isVisible = true, 10);

                        // Intelligent Greeting
                        if (selectedProject.value && aiState.messages.length <= 1) {
                            aiState.messages.push({
                                isUser: false,
                                text: `你好！我看你正在浏览 <b>${selectedProject.value.title}</b>。有什么我可以帮你的吗？`
                            });
                        }
                        scrollChat();
                    } else {
                        aiState.isVisible = false;
                        setTimeout(() => aiState.isOpen = false, 300);
                    }
                };

                const askAI = (question) => {
                    if (!aiState.isOpen) toggleAI();
                    handleMessage(question);
                };

                const sendAIMessage = () => {
                    const text = aiState.input.trim();
                    if (!text) return;
                    handleMessage(text);
                    aiState.input = '';
                };

                const handleMessage = (text) => {
                    // Add User Message
                    aiState.messages.push({ isUser: true, text });
                    scrollChat();

                    // Simulate Response
                    aiState.isTyping = true;
                    scrollChat();

                    setTimeout(() => {
                        aiState.isTyping = false;
                        let response = "这个问题很有趣！作为一个 AI 编程助手，我建议你可以尝试分解问题，一步步解决。";

                        // Context Aware
                        if (selectedProject.value) {
                            const p = selectedProject.value;
                            if (text.includes('这个项目') || text.includes('复刻')) {
                                response = `关于 <b>${p.title}</b>: <br>这是一个适合 <b>${p.difficulty}</b> 的项目。<br>核心知识点包含: ${p.tags ? p.tags.join(', ') : '基础编程'}。<br>你可以点击'查看源码'来学习其逻辑！`;
                            }
                        }

                        const q = text.toLowerCase();
                        if (q.includes('重力')) {
                            response = "在 Scratch 中实现<b>重力</b>：<br>1. 建立变量 [速度Y]<br>2. 循环中将 [速度Y] -1<br>3. Y 坐标增加 [速度Y]<br>4. 碰到地面时，[速度Y] 设为 0。";
                        } else if (q.includes('csp') || q.includes('竞赛')) {
                            response = "备战 <b>CSP-J/S</b> 重点：<br>1. 模拟算法<br>2. 排序与枚举<br>3. 栈与队列等基础结构。";
                        } else if (q.includes('vex') || q.includes('机器人')) {
                            response = "VEX 机器人核心是 <b>PID 控制</b>。<br>利用传感器反馈，实时调整电机输出，实现精确走直线或转弯。";
                        }

                        aiState.messages.push({ isUser: false, text: response });
                        scrollChat();
                    }, 1500);
                };

                // Bind to window for backup access
                window.askAI = askAI;
                window.sendAIMessage = sendAIMessage;

                // Also bind the top-right button manually if needed, or rely on existing onclick
                // Ideally we use checking onMounted to bind events if not using Vue @click


                return {
                    user,
                    loading,
                    projects,
                    filter,
                    searchQuery,
                    sortBy,
                    loginWithGithub,
                    currentLang,
                    toggleLanguage,
                    playProject,
                    toggleLike,
                    selectedProject,
                    openProjectDetail,
                    selectedPath,
                    selectPath,
                    // Carousel
                    featuredProjects,
                    currentSlide,
                    nextSlide,
                    prevSlide,
                    setSlide,
                    aiState,
                    toggleAI,
                    askAI,
                    sendAIMessage
                };
            }
        }).mount('#app');



        // Initialize Supabase (keeping inline for auth config injection if needed, or move later)
