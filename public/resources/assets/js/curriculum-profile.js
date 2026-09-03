(function () {
    'use strict';

    const COLORS = {
        cyan: '#00f0ff', purple: '#8b5cf6', green: '#10b981', yellow: '#fbbf24',
        red: '#ef4444', blue: '#3b82f6', text: '#94a3b8', grid: 'rgba(255,255,255,.08)'
    };
    const STATUS_WEIGHT = { 'not-started': 0, learning: 30, practice: 60, review: 80, verified: 100 };
    const STATUS_LABEL = { 'not-started': '未开始', learning: '学习中', practice: '实践中', review: '待验收', verified: '已验收' };
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const STAGES = [
        { key: 'exploration', label: '雏鹰·兴趣启蒙', hint: '趣味项目、工具意识、观察提问与表达', terms: ['雏鹰', '兴趣', '启蒙', 'exploration', 'year-1', 'year-2'] },
        { key: 'engineering', label: '飞鹰·工程技能', hint: '机械结构、电子测量、编程控制', terms: ['飞鹰', '工程技能', 'engineering', 'mechanical', 'electronic', 'software', 'year-3', 'year-4'] },
        { key: 'innovation', label: '雄鹰·项目创新', hint: '项目定义、迭代优化、答辩与竞赛', terms: ['雄鹰', '项目创新', 'innovation', 'project', 'competition'] }
    ];
    const TRACKS = [
        { key: 'mechanical', label: '机械结构', terms: ['机械', '结构', '制造', 'mechanical', 'craft'] },
        { key: 'electronic', label: '电子测量', terms: ['电子', '电路', '测量', 'esp32', 'electronic'] },
        { key: 'software', label: '编程控制', terms: ['编程', '程序', '软件', '控制', 'python', 'scratch', 'software', 'code'] }
    ];
    const COMPETENCIES = [
        { key: 'observe', label: '观察与提问', terms: ['观察', '提问', '探究', '启蒙', 'observe', 'question'] },
        { key: 'hands', label: '工具与动手', terms: ['工具', '动手', '搭建', '制作', '实践', 'practice', 'build'] },
        { key: 'structure', label: '结构与制造', terms: ['机械', '结构', '制造', 'mechanical'] },
        { key: 'electronics', label: '电子与测量', terms: ['电子', '电路', '测量', 'esp32', 'electronic'] },
        { key: 'coding', label: '编程与控制', terms: ['编程', '程序', '软件', '控制', 'python', 'scratch', 'software'] },
        { key: 'innovation', label: '创新表达与协作', terms: ['创新', '设计', '表达', '答辩', '协作', '竞赛', 'project', 'innovation'] }
    ];

    let model = null;
    let loadPromise = null;

    function textOf(value) {
        if (value == null) return '';
        if (typeof value === 'string') return value.toLowerCase();
        try { return JSON.stringify(value).toLowerCase(); } catch (_) { return ''; }
    }

    function lessonText(lesson) {
        const module = lesson.module || {};
        return [lesson.title, lesson.goal, lesson.kind, lesson.evidence_requirement, lesson.tasks,
            module.title, module.track, module.phase, module.metadata].map(textOf).join(' ');
    }

    function includesAny(value, terms) {
        const haystack = textOf(value);
        return terms.some(term => haystack.includes(term.toLowerCase()));
    }

    function scoreForLessons(lessons) {
        if (!lessons.length) return null;
        const total = lessons.reduce((sum, lesson) => sum + (STATUS_WEIGHT[lesson.progress?.status] || 0), 0);
        return Math.round(total / lessons.length);
    }

    function byTerms(lessons, terms) {
        return lessons.filter(lesson => includesAny(lessonText(lesson), terms));
    }

    function evidenceCategory(evidence, progressById, lessonById) {
        const progress = progressById.get(evidence.progress_id);
        const lesson = progress ? lessonById.get(progress.lesson_id) : null;
        const source = [evidence.evidence_type, evidence.metadata, lesson?.title, lesson?.kind, lesson?.evidence_requirement].map(textOf).join(' ');
        if (includesAny(source, ['答辩', '路演', 'presentation', 'defense'])) return '答辩';
        if (includesAny(source, ['竞赛', '比赛', 'competition', 'contest'])) return '竞赛';
        if (includesAny(source, ['日志', '记录', 'log', 'journal'])) return '工程日志';
        return '作品';
    }

    async function query(client, table, select, filter) {
        let request = client.from(table).select(select);
        if (filter) request = filter(request);
        const result = await request;
        if (result.error) throw new Error(`${table}: ${result.error.message}`);
        return result.data || [];
    }

    async function loadRealModel() {
        const manager = window.SubscriptionManager;
        const user = manager?.user;
        const client = manager?.client;
        if (!user || !client) return { state: 'guest', user: null };

        const members = await query(client, 'learning_program_members', '*', q => q.eq('auth_user_id', user.id).eq('status', 'ACTIVE'));
        if (!members.length) return { state: 'unassigned', user, members: [] };

        const programIds = [...new Set(members.map(item => item.program_id))];
        const memberIds = members.map(item => item.id);
        const programs = await query(client, 'learning_programs', '*', q => q.in('id', programIds));
        const modules = await query(client, 'learning_modules', '*', q => q.in('program_id', programIds).order('sequence'));
        const moduleIds = modules.map(item => item.id);
        const chapters = moduleIds.length ? await query(client, 'learning_chapters', '*', q => q.in('module_id', moduleIds).order('sequence')) : [];
        const chapterIds = chapters.map(item => item.id);
        const lessonsRaw = chapterIds.length ? await query(client, 'learning_lessons', '*', q => q.in('chapter_id', chapterIds).order('sequence')) : [];
        const progress = await query(client, 'learning_lesson_progress', '*', q => q.in('member_id', memberIds).order('updated_at', { ascending: false }));
        const progressIds = progress.map(item => item.id);
        const evidence = progressIds.length ? await query(client, 'learning_evidence', '*', q => q.in('progress_id', progressIds).order('created_at', { ascending: false })) : [];
        let credentials = [];
        try { credentials = await query(client, 'learning_credential_records', '*', q => q.in('member_id', memberIds).order('updated_at', { ascending: false })); } catch (error) { console.warn(error.message); }

        const moduleById = new Map(modules.map(item => [item.id, item]));
        const chapterById = new Map(chapters.map(item => [item.id, item]));
        const progressByLesson = new Map(progress.map(item => [item.lesson_id, item]));
        const lessons = lessonsRaw.map(item => {
            const chapter = chapterById.get(item.chapter_id);
            return { ...item, chapter, module: chapter ? moduleById.get(chapter.module_id) : null, progress: progressByLesson.get(item.id) || null };
        });
        const progressById = new Map(progress.map(item => [item.id, item]));
        const lessonById = new Map(lessons.map(item => [item.id, item]));
        const stages = STAGES.map(item => {
            const matched = byTerms(lessons, item.terms);
            return { ...item, lessons: matched, score: scoreForLessons(matched) };
        });
        const tracks = TRACKS.map(item => {
            const matched = byTerms(lessons, item.terms);
            return { ...item, lessons: matched, score: scoreForLessons(matched) };
        });
        const competencies = COMPETENCIES.map(item => {
            let matched = byTerms(lessons, item.terms);
            if (!matched.length && item.key === 'hands') matched = lessons.filter(x => ['practice', 'project'].includes(x.kind));
            if (!matched.length && item.key === 'innovation') matched = lessons.filter(x => ['project', 'assessment'].includes(x.kind));
            return { ...item, lessons: matched, score: scoreForLessons(matched) };
        });
        const evidenceCategories = ['作品', '工程日志', '答辩', '竞赛'].map(category => ({
            name: category,
            value: evidence.filter(item => evidenceCategory(item, progressById, lessonById) === category).length
        }));
        const nextLesson = lessons.find(item => !item.progress || item.progress.status !== 'verified') || null;
        return { state: 'ready', user, members, programs, modules, lessons, progress, evidence, credentials, stages, tracks, competencies, evidenceCategories, nextLesson };
    }

    function panel(title, index, source, span, accent, subtitle) {
        return `<article class="curriculum-panel curriculum-card ${span || ''}" data-source="${escapeHtml(source)}" data-accent="${accent || 'cyan'}">
            <header class="curriculum-panel-header">
                <div><h3 class="curriculum-panel-title">${title}</h3><p class="curriculum-panel-subtitle">${subtitle || source}</p></div>
                <span class="curriculum-panel-index">${String(index).padStart(2, '0')}</span>
            </header>
            <div id="c${index}" class="chart-box"></div>
        </article>`;
    }

    function section(kicker, title, note, content) {
        return `<section class="curriculum-section">
            <header class="curriculum-section-heading">
                <div><span class="curriculum-section-kicker">${kicker}</span><h2 class="curriculum-section-title">${title}</h2></div>
                <p class="curriculum-section-note">${note}</p>
            </header>
            <div class="curriculum-grid">${content}</div>
        </section>`;
    }

    function installGrid() {
        const container = document.querySelector('#view-overview .data-track-container');
        if (!container) return;
        container.innerHTML = `<div class="curriculum-dashboard">
            <section id="curriculumHero" class="growth-hero-panel"></section>
            <div class="curriculum-dashboard-body">
                ${section('01 / PATH', '培养路径', '先看学生位于哪个培养阶段，再看三条工程技能主线是否均衡推进。',
                    panel('三阶段培养进度', 1, '课程模块、课次状态与导师验收', 'span-7', 'cyan', '雏鹰启蒙 · 飞鹰技能 · 雄鹰创新') +
                    panel('三条工程技能主线', 3, '机械、电子与编程课程课次', 'span-5', 'green', '机械结构 · 电子测量 · 编程控制'))}
                ${section('02 / EVIDENCE', '能力与证据', '能力不是自评，也不是活跃度；每一分都必须能回到课程任务或导师验收。',
                    panel('科技特长生六维能力', 2, '课程任务完成与导师验收', 'span-7', 'purple', '六维能力证据覆盖') +
                    panel('成果证据验收', 6, '作品证据与导师审核', 'span-5', 'green', '已通过 · 待审核 · 需修改'))}
                ${section('03 / EXECUTION', '课程执行', '把“学了多少”转换为“现在应该做什么”，让学生和家长都能快速理解。',
                    panel('课程模块掌握', 5, '已分配课程模块与课次进度', 'span-7', 'purple', '按课程模块聚合真实进度') +
                    panel('课次状态分布', 4, 'learning_lesson_progress', 'span-5', 'cyan', '未开始 · 学习中 · 实践中 · 待验收 · 已验收') +
                    panel('当前任务与下一步', 8, '首个尚未验收的课次', 'span-12', 'amber', '基于课程顺序生成，不使用推荐算法猜测'))}
                ${section('04 / SKILL TREE', '专项技能链', '飞鹰阶段按机械、电子、编程三条主线组织，缺少对应课程时明确提示。',
                    panel('机械结构技能链', 9, '机械结构课程模块', 'span-4 compact', 'cyan', '结构 · 传动 · 制造') +
                    panel('电子测量技能链', 10, '电子电路课程模块', 'span-4 compact', 'amber', '电路 · 传感 · 测量') +
                    panel('编程控制技能链', 11, '软件与机器控制课程模块', 'span-4 compact', 'green', '程序 · 算法 · 控制'))}
                ${section('05 / RECORD', '成长轨迹与成果', '用连续的课次记录和可验收成果形成成长档案，为阶段评价与升学材料提供依据。',
                    panel('近期真实学习轨迹', 7, '课次进度更新时间', 'span-7', 'cyan', '近 14 天课程状态变化') +
                    panel('作品 · 日志 · 答辩 · 竞赛', 12, '成果证据分类', 'span-5', 'purple', '真实提交与验收记录'))}
            </div>
        </div>`;
        container.querySelectorAll('.curriculum-card').forEach(item => {
            item.addEventListener('click', () => window.openInsightModal?.(
                item.querySelector('.curriculum-panel-title')?.textContent || '课程成长数据',
                `数据来源：${item.dataset.source}。只使用当前账户的真实课程记录；没有记录时不补模拟分数。`
            ));
        });
    }

    function chart(id) {
        const el = document.getElementById(id);
        if (!el || !window.echarts) return null;
        const old = window.echarts.getInstanceByDom(el);
        if (old) old.dispose();
        return window.echarts.init(el);
    }

    function empty(id, message, action) {
        const el = document.getElementById(id);
        if (!el) return;
        const old = window.echarts?.getInstanceByDom(el);
        if (old) old.dispose();
        el.innerHTML = `<div class="growth-empty"><div class="growth-empty-mark" aria-hidden="true"></div><strong>${message}</strong>${action ? `<span>${action}</span>` : ''}</div>`;
    }

    function baseAxes() {
        return {
            grid: { left: 95, right: 25, top: 20, bottom: 30 },
            xAxis: { type: 'value', max: 100, axisLabel: { color: COLORS.text, formatter: '{value}%' }, splitLine: { lineStyle: { color: COLORS.grid } } },
            yAxis: { type: 'category', axisLabel: { color: '#dbeafe', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false } }
        };
    }

    function renderBar(id, items, color) {
        const valid = items.filter(item => item.score !== null);
        if (!valid.length) return empty(id, '暂无对应课程', '课程模块完成分类后将在这里显示');
        const instance = chart(id);
        const axes = baseAxes();
        instance.setOption({ ...axes, tooltip: { trigger: 'axis', formatter: p => `${p[0].name}<br>课程进度 ${p[0].value}%` }, yAxis: { ...axes.yAxis, data: valid.map(x => x.label) }, series: [{ type: 'bar', data: valid.map(x => x.score), barWidth: 14, showBackground: true, backgroundStyle: { color: 'rgba(255,255,255,.05)' }, itemStyle: { color, borderRadius: 8 }, label: { show: true, position: 'right', color: '#fff', formatter: '{c}%' } }] });
    }

    function latestRecordDate(data) {
        const dates = [...(data.progress || []), ...(data.evidence || [])]
            .map(item => item.updated_at || item.created_at)
            .filter(Boolean)
            .map(value => new Date(value))
            .filter(date => !Number.isNaN(date.getTime()))
            .sort((a, b) => b - a);
        return dates[0] || null;
    }

    function activeStage(data) {
        const available = data.stages.filter(stage => stage.lessons.length);
        const inProgress = available.find(stage => stage.score !== null && stage.score < 100);
        return inProgress || available[available.length - 1] || null;
    }

    function renderHero(data) {
        const hero = document.getElementById('curriculumHero');
        if (!hero) return;
        const ready = data.state === 'ready';
        const stage = ready ? activeStage(data) : null;
        const programName = ready ? (data.programs[0]?.title || data.programs[0]?.name || '科技特长生培养计划') : '科技特长生成长驾驶舱';
        const verified = ready ? data.lessons.filter(item => item.progress?.status === 'verified').length : 0;
        const accepted = ready ? data.evidence.filter(item => item.review_status === 'ACCEPTED').length : 0;
        const overall = ready ? scoreForLessons(data.lessons) : null;
        const updated = ready ? latestRecordDate(data) : null;
        const title = ready ? `${escapeHtml(programName)} · ${escapeHtml(stage?.label || '培养起点')}` : '从每一节真实课程，看到孩子能力如何长出来';
        const description = ready
            ? '这份成长档案把课程完成、工程实践、成果提交与导师验收连接为同一条证据链。所有进度都能回到具体课次，不使用浏览量或 AI 对话数据推测能力。'
            : '登录后查看课程阶段、六维能力、工程技能链、成果证据与下一步任务。没有真实课程记录时，系统不会生成任何模拟成绩。';
        hero.innerHTML = `<div class="growth-hero-copy">
                <span class="growth-eyebrow">GROWTH OS / REAL LEARNING EVIDENCE</span>
                <h1 class="growth-hero-title">${title}</h1>
                <p class="growth-hero-description">${description}</p>
                <div class="growth-metrics">
                    <div class="growth-metric"><span class="growth-metric-value">${ready ? data.programs.length : '—'}</span><span class="growth-metric-label">已绑定培养计划</span></div>
                    <div class="growth-metric"><span class="growth-metric-value">${ready ? `${verified}/${data.lessons.length}` : '—'}</span><span class="growth-metric-label">已验收课次</span></div>
                    <div class="growth-metric"><span class="growth-metric-value">${ready ? accepted : '—'}</span><span class="growth-metric-label">已通过成果</span></div>
                    <div class="growth-metric"><span class="growth-metric-value">${overall === null ? '—' : `${overall}%`}</span><span class="growth-metric-label">课程执行进度</span></div>
                </div>
            </div>
            <aside class="growth-proof-panel">
                <div>
                    <div class="growth-proof-status">${ready ? '真实记录已连接' : '等待身份与课程数据'}</div>
                    <h2 class="growth-proof-title">成长数据可信说明</h2>
                    <p class="growth-proof-copy">页面只呈现培养计划、课次状态、成果证据和导师验收。任何能力结论都可以追溯到对应学习记录。</p>
                </div>
                <div class="growth-proof-list">
                    <div class="growth-proof-item"><span>课程与课次</span><span>${ready ? `${data.lessons.length} 条` : '登录后读取'}</span></div>
                    <div class="growth-proof-item"><span>成果与验收</span><span>${ready ? `${data.evidence.length} 条` : '登录后读取'}</span></div>
                    <div class="growth-proof-item"><span>最近同步</span><span>${updated ? updated.toLocaleDateString('zh-CN') : '暂无记录'}</span></div>
                </div>
            </aside>`;
    }

    function renderNonReady(data) {
        const body = document.querySelector('.curriculum-dashboard-body');
        if (!body) return;
        const guest = data.state === 'guest';
        const error = data.state === 'error';
        const title = guest ? '登录后建立孩子的真实成长证据链' : error ? '真实学习数据暂时无法读取' : '账号已经登录，尚未绑定培养计划';
        const copy = guest
            ? '系统会从课程计划开始，持续记录课次进度、工程实践、作品提交与导师验收，最终形成可用于家校沟通和阶段评价的成长报告。'
            : error ? '页面不会用缓存或随机数据替代真实记录。请稍后重新加载，或检查课程数据服务状态。'
                : '请由教研老师将学员加入对应的学习项目。绑定完成后，本页会自动出现阶段、能力、技能树与成果档案。';
        const action = guest
            ? '<button class="growth-primary-action" onclick="window.SubscriptionManager?.showAuthModal?.()">登录 / 注册，查看成长档案</button>'
            : error ? '<button class="growth-primary-action" onclick="window.refreshCurriculumProfile?.()">重新读取真实数据</button>'
                : '<button class="growth-primary-action" onclick="window.location.href=\'/curriculum\'">查看课程培养体系</button>';
        body.innerHTML = `<div class="growth-entry-grid">
            <section class="growth-entry-panel">
                <span class="growth-eyebrow">EVIDENCE FIRST / 证据优先</span>
                <h2>${title}</h2>
                <p>${copy}</p>
                <div class="growth-flow">
                    <div class="growth-flow-step"><b>课程计划</b><span>绑定培养阶段与课程模块</span></div>
                    <div class="growth-flow-step"><b>课次任务</b><span>记录学习、实践与待验收状态</span></div>
                    <div class="growth-flow-step"><b>成果证据</b><span>沉淀作品、日志、答辩与竞赛</span></div>
                    <div class="growth-flow-step"><b>导师验收</b><span>通过、待审核或提出修改</span></div>
                    <div class="growth-flow-step"><b>成长报告</b><span>形成可追溯的阶段性结论</span></div>
                </div>
                ${action}
            </section>
            <aside class="growth-framework-panel">
                <span class="growth-eyebrow">TRAINING MAP</span>
                <h3 class="growth-framework-title">三阶段培养框架</h3>
                <div class="growth-stage-list">${STAGES.map((stage, index) => `<div class="growth-stage-item"><b>0${index + 1} · ${stage.label}</b><span>${stage.hint}</span></div>`).join('')}</div>
            </aside>
        </div>`;
    }

    function renderOverview(data) {
        installGrid();
        renderHero(data);
        if (data.state !== 'ready') {
            renderNonReady(data);
            return;
        }
        renderBar('c1', data.stages, COLORS.cyan);

        const competencyValid = data.competencies.filter(item => item.score !== null);
        if (competencyValid.length) {
            chart('c2').setOption({ tooltip: {}, radar: { indicator: competencyValid.map(x => ({ name: x.label, max: 100 })), axisName: { color: '#dbeafe', fontSize: 10 }, splitLine: { lineStyle: { color: COLORS.grid } }, splitArea: { areaStyle: { color: ['transparent', 'rgba(139,92,246,.04)'] } } }, series: [{ type: 'radar', data: [{ value: competencyValid.map(x => x.score), name: '证据进度' }], areaStyle: { color: 'rgba(139,92,246,.25)' }, lineStyle: { color: COLORS.purple }, itemStyle: { color: COLORS.purple } }] });
        } else empty('c2', '尚未形成能力证据', '完成课程任务并提交成果后生成');
        renderBar('c3', data.tracks, COLORS.green);

        const statusData = Object.keys(STATUS_LABEL).map(key => ({ name: STATUS_LABEL[key], value: data.lessons.filter(x => (x.progress?.status || 'not-started') === key).length })).filter(x => x.value);
        chart('c4').setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0, textStyle: { color: COLORS.text } }, series: [{ type: 'pie', radius: ['38%', '68%'], data: statusData, label: { color: '#dbeafe', formatter: '{b}\n{c}课' }, itemStyle: { borderColor: '#07111f', borderWidth: 2 }, color: ['#334155', COLORS.blue, COLORS.yellow, COLORS.purple, COLORS.green] }] });

        const moduleItems = data.modules.map(module => {
            const lessons = data.lessons.filter(x => x.module?.id === module.id);
            return { label: module.title, score: scoreForLessons(lessons) };
        }).filter(x => x.score !== null).slice(0, 8);
        renderBar('c5', moduleItems, COLORS.purple);

        const reviews = ['ACCEPTED', 'PENDING', 'REVISION'].map(key => ({ name: { ACCEPTED: '已通过', PENDING: '待审核', REVISION: '需修改' }[key], value: data.evidence.filter(x => x.review_status === key).length })).filter(x => x.value);
        if (reviews.length) chart('c6').setOption({ tooltip: { trigger: 'item' }, legend: { bottom: 0, textStyle: { color: COLORS.text } }, series: [{ type: 'pie', radius: ['38%', '68%'], data: reviews, label: { color: '#dbeafe', formatter: '{b}\n{c}项' }, color: [COLORS.green, COLORS.yellow, COLORS.red] }] });
        else empty('c6', '暂无成果证据', '提交作品、日志或答辩材料后显示');

        const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (13 - i)); return d; });
        const timeline = days.map(day => data.progress.filter(item => { const t = new Date(item.updated_at); return t >= day && t < new Date(day.getTime() + 86400000); }).length);
        if (timeline.some(Boolean)) chart('c7').setOption({ grid: { left: 35, right: 15, top: 20, bottom: 35 }, xAxis: { type: 'category', data: days.map(x => `${x.getMonth() + 1}/${x.getDate()}`), axisLabel: { color: COLORS.text }, axisLine: { lineStyle: { color: COLORS.grid } } }, yAxis: { type: 'value', minInterval: 1, axisLabel: { color: COLORS.text }, splitLine: { lineStyle: { color: COLORS.grid } } }, series: [{ type: 'line', data: timeline, smooth: true, symbolSize: 7, lineStyle: { color: COLORS.cyan }, itemStyle: { color: COLORS.cyan }, areaStyle: { color: 'rgba(0,240,255,.12)' } }] });
        else empty('c7', '近14天暂无课次进度变化', '仅统计真实课次记录');

        const next = data.nextLesson;
        const c8 = document.getElementById('c8');
        c8.innerHTML = next ? `<div class="growth-next-card"><div><span class="growth-next-label">NEXT ACTION / 下一步行动</span><h3 class="growth-next-title">${escapeHtml(next.title)}</h3><p class="growth-next-meta">${escapeHtml(next.module?.title || '课程模块')} · ${STATUS_LABEL[next.progress?.status || 'not-started']}</p></div><div class="growth-next-goal">${escapeHtml(next.goal || next.evidence_requirement || '按课程任务完成学习并提交可验收成果。')}</div></div>` : `<div class="growth-empty"><div class="growth-empty-mark" aria-hidden="true"></div><strong style="color:${COLORS.green}">当前已分配课次全部验收完成</strong><span>可由教研老师安排下一阶段课程或项目挑战。</span></div>`;

        renderBar('c9', data.modules.filter(x => includesAny([x.track, x.title, x.metadata].map(textOf).join(' '), TRACKS[0].terms)).map(module => ({ label: module.title, score: scoreForLessons(data.lessons.filter(x => x.module?.id === module.id)) })), COLORS.cyan);
        renderBar('c10', data.modules.filter(x => includesAny([x.track, x.title, x.metadata].map(textOf).join(' '), TRACKS[1].terms)).map(module => ({ label: module.title, score: scoreForLessons(data.lessons.filter(x => x.module?.id === module.id)) })), COLORS.yellow);
        renderBar('c11', data.modules.filter(x => includesAny([x.track, x.title, x.metadata].map(textOf).join(' '), TRACKS[2].terms)).map(module => ({ label: module.title, score: scoreForLessons(data.lessons.filter(x => x.module?.id === module.id)) })), COLORS.green);
        if (data.evidenceCategories.some(x => x.value)) chart('c12').setOption({ grid: { left: 70, right: 25, top: 20, bottom: 25 }, xAxis: { type: 'value', minInterval: 1, axisLabel: { color: COLORS.text }, splitLine: { lineStyle: { color: COLORS.grid } } }, yAxis: { type: 'category', data: data.evidenceCategories.map(x => x.name), axisLabel: { color: '#dbeafe' } }, series: [{ type: 'bar', data: data.evidenceCategories.map(x => x.value), itemStyle: { color: COLORS.purple, borderRadius: 8 }, label: { show: true, position: 'right', color: '#fff', formatter: '{c}项' } }] });
        else empty('c12', '暂无成果档案', '成果分类来自真实提交与验收记录');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
    }

    function renderSecondaryViews(data) {
        const badges = document.getElementById('view-badges');
        const arena = document.getElementById('view-arena');
        const calendar = document.getElementById('view-calendar');
        const stateMessage = data.state === 'guest' ? '请先登录查看真实数据' : data.state === 'unassigned' ? '当前账户尚未绑定课程计划' : '真实数据暂时无法读取';
        const subviewHeader = (kicker, title, copy) => `<header class="profile-subview-header"><div><span class="growth-eyebrow">${kicker}</span><h2>${title}</h2></div><p>${copy}</p></header>`;
        if (badges) {
            let body = `<div class="growth-entry-panel"><h2>${stateMessage}</h2><p>能力分析必须建立在已分配课程、课次状态、成果证据和导师验收之上；没有记录时不生成模拟能力值。</p></div>`;
            if (data.state === 'ready') {
                const progressById = new Map(data.progress.map(item => [item.id, item]));
                body = `<div class="competency-evidence-grid">${data.competencies.map(item => {
                    const lessonIds = new Set(item.lessons.map(lesson => lesson.id));
                    const verified = item.lessons.filter(lesson => lesson.progress?.status === 'verified').length;
                    const evidence = data.evidence.filter(record => lessonIds.has(progressById.get(record.progress_id)?.lesson_id));
                    const accepted = evidence.filter(record => record.review_status === 'ACCEPTED').length;
                    return `<article class="competency-evidence-card"><div class="competency-card-top"><span class="competency-card-name">${item.label}</span><strong class="competency-card-score">${item.score === null ? '—' : `${item.score}%`}</strong></div><div class="competency-meter"><span style="width:${item.score || 0}%"></span></div><div class="competency-card-facts"><div class="competency-card-fact"><b>${item.lessons.length}</b>关联课次</div><div class="competency-card-fact"><b>${verified}</b>导师已验收</div><div class="competency-card-fact"><b>${evidence.length}</b>成果证据</div><div class="competency-card-fact"><b>${accepted}</b>证据已通过</div></div></article>`;
                }).join('')}</div>`;
            }
            badges.innerHTML = `<div class="profile-subview">${subviewHeader('COMPETENCY / 学情证据', '能力与学情分析', '能力进度只来自课程任务完成和导师验收，并同时展示关联课次与成果证据数量，避免一个孤立分数掩盖真实情况。')}${body}</div>`;
        }
        if (calendar) {
            const rows = data.state === 'ready' ? data.progress.slice(0, 30).map(item => { const lesson = data.lessons.find(x => x.id === item.lesson_id); return `<article class="profile-timeline-item"><span class="profile-timeline-date">${new Date(item.updated_at).toLocaleDateString('zh-CN')}</span><div><strong>${escapeHtml(lesson?.title || '课程课次')}</strong><div class="profile-timeline-module">${escapeHtml(lesson?.module?.title || '课程模块')}</div></div><span class="profile-timeline-status ${item.status === 'verified' ? 'verified' : ''}">${STATUS_LABEL[item.status] || escapeHtml(item.status)}</span></article>`; }).join('') : '';
            calendar.innerHTML = `<div class="profile-subview">${subviewHeader('TIMELINE / 课次记录', '真实学习轨迹', '按课次进度更新时间排列，只记录课程学习、工程实践和导师验收，不混入页面浏览行为。')}<div class="growth-record-table-wrap" style="padding:24px">${rows ? `<div class="profile-timeline">${rows}</div>` : `<div class="growth-empty"><div class="growth-empty-mark"></div><strong>${data.state === 'ready' ? '暂无课次进度记录' : stateMessage}</strong><span>产生真实课次记录后将在这里按时间顺序展示。</span></div>`}</div></div>`;
        }
        if (arena) {
            const statusLabel = { ACCEPTED: '已通过', PENDING: '待审核', REVISION: '需修改', ISSUED: '已颁发', ACTIVE: '有效' };
            const evidenceRows = data.state === 'ready' ? data.evidence.map(item => `<tr><td>${escapeHtml(item.evidence_type || '成果')}</td><td>${escapeHtml(item.metadata?.title || item.storage_path || '已提交成果')}</td><td><span class="growth-status-chip ${String(item.review_status || '').toLowerCase()}">${escapeHtml(statusLabel[item.review_status] || item.review_status || '已提交')}</span></td><td>${new Date(item.created_at).toLocaleDateString('zh-CN')}</td></tr>`).join('') : '';
            const credentialRows = data.state === 'ready' ? data.credentials.map(item => `<tr><td>阶段认证</td><td>${escapeHtml(item.credential_key)}</td><td><span class="growth-status-chip ${String(item.status || '').toLowerCase()}">${escapeHtml(statusLabel[item.status] || item.status)}</span></td><td>${item.updated_at ? new Date(item.updated_at).toLocaleDateString('zh-CN') : '-'}</td></tr>`).join('') : '';
            const emptyRow = `<tr><td colspan="4">${data.state === 'ready' ? '暂无成果与认证记录' : stateMessage}</td></tr>`;
            arena.innerHTML = `<div class="profile-subview">${subviewHeader('PORTFOLIO / 成果档案', '成果与认证', '作品、工程日志、答辩、竞赛和阶段认证均来自真实提交与验收记录，不设置虚拟全球排名。')}<div class="growth-record-table-wrap"><table class="growth-record-table"><thead><tr><th>类型</th><th>成果 / 认证</th><th>验收状态</th><th>记录日期</th></tr></thead><tbody>${evidenceRows}${credentialRows}${(!evidenceRows && !credentialRows) ? emptyRow : ''}</tbody></table></div></div>`;
        }
    }

    window.switchTab = function (tabId) {
        if (tabId !== 'overview' && !window.SubscriptionManager?.user) {
            window.SubscriptionManager?.showAuthModal?.();
            return;
        }
        window.currentTab = tabId;
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.toggle('active', el.id === `nav-${tabId}`));
        document.querySelectorAll('.tab-view').forEach(el => { el.style.display = 'none'; });
        const view = document.getElementById(`view-${tabId}`);
        if (view) view.style.display = tabId === 'overview' ? 'flex' : 'block';
        if (model) renderSecondaryViews(model);
    };

    window.renderCurriculumProfile = async function () {
        if (loadPromise) return loadPromise;
        installGrid();
        renderHero({ state: 'loading' });
        for (let i = 1; i <= 12; i++) empty(`c${i}`, '正在读取真实课程数据', '课程、课次、成果与导师验收');
        loadPromise = loadRealModel().then(data => {
            model = data;
            window.__curriculumProfileModel = data;
            renderOverview(data);
            renderSecondaryViews(data);
            return data;
        }).catch(error => {
            console.error('Curriculum profile load failed:', error);
            model = { state: 'error', error: error.message };
            renderOverview(model);
            renderSecondaryViews(model);
            return model;
        }).finally(() => { loadPromise = null; });
        return loadPromise;
    };

    window.refreshCurriculumProfile = function () {
        model = null;
        loadPromise = null;
        return window.renderCurriculumProfile();
    };

    window.exportUserReport = async function () {
        const btn = document.getElementById('exportReportBtn');
        const original = btn?.innerHTML;
        if (btn) btn.innerHTML = '<span class="nav-icon">⏳</span> 正在汇总课程证据...';
        const data = await window.renderCurriculumProfile();
        if (data.state === 'guest') {
            if (btn) btn.innerHTML = original;
            window.SubscriptionManager?.showAuthModal?.();
            return;
        }
        document.getElementById('reportPreviewModal').style.display = 'flex';
        const user = data.user || {};
        const name = data.members?.[0]?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || '学员';
        const date = new Date();
        document.getElementById('pdfUserName').textContent = name;
        document.getElementById('pdfDate').textContent = date.toLocaleDateString('zh-CN');
        document.getElementById('pdfSeq').textContent = `FC-${date.toISOString().slice(0, 10).replaceAll('-', '')}-${String(user.id || 'UNASSIGNED').slice(0, 8).toUpperCase()}`;

        if (data.state !== 'ready') {
            ['pdfChart1', 'pdfChart2', 'pdfChart3'].forEach(id => empty(id, '暂无可用于评价的真实记录', '本报告不生成模拟分数'));
            document.getElementById('pdfVerdict').innerHTML = '<p><strong>当前账户尚未绑定课程计划。</strong></p><p>因此本报告不生成培养阶段、能力或技能分数。请由教研老师完成学员与课程项目绑定，并在课次学习、成果提交和导师验收后重新生成。</p>';
        } else {
            renderBar('pdfChart1', data.stages, '#111827');
            const valid = data.competencies.filter(x => x.score !== null);
            if (valid.length) chart('pdfChart2').setOption({ animation: false, radar: { indicator: valid.map(x => ({ name: x.label, max: 100 })), axisName: { color: '#111', fontSize: 9 } }, series: [{ type: 'radar', data: [{ value: valid.map(x => x.score) }], areaStyle: { color: 'rgba(15,23,42,.2)' }, lineStyle: { color: '#111827' }, itemStyle: { color: '#111827' } }] });
            else empty('pdfChart2', '暂无能力证据');
            const categories = data.evidenceCategories.filter(x => x.value);
            if (categories.length) chart('pdfChart3').setOption({ animation: false, legend: { bottom: 0, textStyle: { color: '#333' } }, series: [{ type: 'pie', radius: ['38%', '68%'], data: categories, label: { color: '#111', formatter: '{b}\n{c}项' }, color: ['#0f172a', '#334155', '#64748b', '#94a3b8'] }] });
            else empty('pdfChart3', '暂无成果证据');
            const verified = data.progress.filter(x => x.status === 'verified').length;
            const accepted = data.evidence.filter(x => x.review_status === 'ACCEPTED').length;
            const revision = data.evidence.filter(x => x.review_status === 'REVISION').length;
            const next = data.nextLesson;
            document.getElementById('pdfVerdict').innerHTML = `<p>当前共分配 <strong>${data.lessons.length}</strong> 个课次，其中 <strong>${verified}</strong> 个已完成导师验收；已提交 <strong>${data.evidence.length}</strong> 项成果证据，<strong>${accepted}</strong> 项已通过，<strong>${revision}</strong> 项需要修改。</p>${next ? `<p><strong>下一步：</strong>进入“${escapeHtml(next.module?.title || '当前课程')}”模块，完成课次“${escapeHtml(next.title)}”，并按要求提交可验收成果。</p>` : '<p><strong>下一步：</strong>当前已分配课次均已验收，可由教研老师安排下一阶段课程或项目挑战。</p>'}<p style="color:#666">说明：以上结论只描述系统中的课程与证据状态，不根据浏览量、点击量或 AI 对话长度推断能力。</p>`;
        }
        if (btn) btn.innerHTML = original;
    };

    const originalDownload = window.downloadPdfReport;
    window.downloadPdfReport = async function () {
        if (typeof window.html2pdf === 'undefined') return originalDownload?.();
        const name = document.getElementById('pdfUserName')?.textContent || '学员';
        return window.html2pdf().set({ margin: 0, filename: `科技特长生成长报告_${name}_${new Date().toISOString().slice(0, 10)}.pdf`, image: { type: 'jpeg', quality: .98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }).from(document.getElementById('pdfPrintArea')).save();
    };

    window.addEventListener('subscription_updated', () => { model = null; loadPromise = null; window.renderCurriculumProfile(); });
    function resetProfileScrollPosition() {
        window.scrollTo(0, 0);
        const overview = document.getElementById('view-overview');
        const sidebar = document.getElementById('sidebar');
        if (overview) overview.scrollTop = 0;
        if (sidebar) sidebar.scrollTop = 0;
    }
    window.addEventListener('load', () => {
        resetProfileScrollPosition();
        window.setTimeout(resetProfileScrollPosition, 250);
        window.setTimeout(resetProfileScrollPosition, 900);
    }, { once: true });
})();
