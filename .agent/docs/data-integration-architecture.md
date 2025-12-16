# 📊 课程学习进度与用户中心数据关联架构

## 🎯 核心数据流

```
课程学习 (course.html)
    ↓
学习数据生成
    ↓
数据同步层
    ↓
用户中心 (profile.html)
    ↓
多维度数据可视化
```

---

## 📋 数据结构设计

### **1. 学习进度数据**

```javascript
// 课程学习数据结构
const learningData = {
    userId: 'user_123',
    courseId: 102,
    courseTitle: '天文学第一模块：宇宙的起源与演化',
    
    // 课程进度
    progress: {
        totalLessons: 8,
        completedLessons: 5,
        completionRate: 62.5,  // 百分比
        currentLesson: 6,
        lastAccessTime: '2025-12-16T20:00:00Z'
    },
    
    // 每节课详情
    lessons: [
        {
            id: 1,
            title: '第一课：宇宙的尺度',
            type: 'video',
            completed: true,
            completedAt: '2025-12-15T10:30:00Z',
            duration: 680,  // 秒
            watchTime: 680,  // 实际观看时长
            score: null,  // 非测验课程
            notes: '宇宙尺度的概念...',  // 笔记内容
            noteWordCount: 150
        },
        {
            id: 8,
            title: '第八课：[考核] 结业考试',
            type: 'quiz',
            completed: true,
            completedAt: '2025-12-16T15:00:00Z',
            score: 85,  // 测验分数
            totalQuestions: 10,
            correctAnswers: 8.5,
            attempts: 1
        }
    ],
    
    // 学习统计
    stats: {
        totalStudyTime: 3600,  // 总学习时长（秒）
        totalNoteWords: 1200,  // 总笔记字数
        averageScore: 85,  // 平均测验分数
        consecutiveDays: 7,  // 连续学习天数
        aiQuestionsAsked: 15  // AI助教提问次数
    }
};
```

---

## 🔗 数据关联映射

### **课程数据 → 用户中心图表**

| 课程数据 | 用户中心图表 | 关联逻辑 |
|---------|------------|---------|
| `completionRate` | **C1: 学习进度水球图** | 直接映射完成率 |
| `totalStudyTime` | **C2: 技能树雷达图** | 转换为技能点数 |
| `lessons[].score` | **C3: 成绩趋势折线图** | 按时间序列展示 |
| `consecutiveDays` | **C4: 学习时长柱状图** | 每日学习时长统计 |
| `lessons[].type` | **C5: 课程类型饼图** | 统计各类型课程占比 |
| `stats.averageScore` | **C6: 能力六边形** | 映射到对应学科能力 |
| `lessons[].completedAt` | **C7: 学习热力图** | 生成日历热力数据 |
| `aiQuestionsAsked` | **C8: AI互动统计** | 显示AI使用频率 |
| `noteWordCount` | **C9: 笔记统计** | 笔记产出量化 |
| `course.module` | **C10: 模块进度环图** | 多模块完成情况 |

---

## 🎨 具体实现逻辑

### **C1: 学习进度水球图**

```javascript
// 数据源
const progressData = {
    value: learningData.progress.completionRate / 100,  // 0.625
    name: learningData.courseTitle
};

// ECharts 配置
{
    series: [{
        type: 'liquidFill',
        data: [progressData.value],
        label: {
            formatter: `${(progressData.value * 100).toFixed(1)}%\n${progressData.name}`
        }
    }]
}
```

---

### **C2: 技能树雷达图**

```javascript
// 数据转换逻辑
const skillMapping = {
    '天文学': {
        courses: ['宇宙的起源与演化', '恒星演化'],
        weight: 1.0
    },
    '物理学': {
        courses: ['力学基础', '电磁学'],
        weight: 0.8
    },
    // ... 其他学科
};

// 计算技能点
function calculateSkillPoints(learningData) {
    const skills = {};
    
    learningData.lessons.forEach(lesson => {
        const subject = getSubjectFromCourse(learningData.courseTitle);
        const points = lesson.completed ? 
            (lesson.score || 100) * skillMapping[subject].weight : 0;
        
        skills[subject] = (skills[subject] || 0) + points;
    });
    
    return skills;
}

// ECharts 数据
{
    radar: {
        indicator: [
            { name: '天文学', max: 1000 },
            { name: '物理学', max: 1000 },
            // ...
        ]
    },
    series: [{
        type: 'radar',
        data: [{
            value: Object.values(calculateSkillPoints(learningData))
        }]
    }]
}
```

---

### **C3: 成绩趋势折线图**

```javascript
// 提取测验成绩
const quizLessons = learningData.lessons.filter(l => l.type === 'quiz');

const chartData = {
    xAxis: quizLessons.map(l => l.title),
    yAxis: quizLessons.map(l => l.score),
    dates: quizLessons.map(l => new Date(l.completedAt))
};

// ECharts 配置
{
    xAxis: {
        type: 'category',
        data: chartData.xAxis
    },
    yAxis: {
        type: 'value',
        max: 100
    },
    series: [{
        type: 'line',
        data: chartData.yAxis,
        smooth: true,
        areaStyle: {}
    }]
}
```

---

### **C7: 学习热力图（日历）**

```javascript
// 生成日历数据
function generateCalendarData(learningData) {
    const heatmapData = {};
    
    learningData.lessons.forEach(lesson => {
        if (lesson.completed) {
            const date = new Date(lesson.completedAt).toDateString();
            heatmapData[date] = (heatmapData[date] || 0) + 1;
        }
    });
    
    return Object.entries(heatmapData).map(([date, count]) => ({
        date,
        count,
        intensity: Math.min(count / 3, 1)  // 归一化强度
    }));
}

// 渲染到日历
calendarData.forEach(({ date, intensity }) => {
    const dayElement = document.querySelector(`[data-date="${date}"]`);
    dayElement.style.background = `rgba(0, 240, 255, ${intensity})`;
});
```

---

### **C16: 徽章墙**

```javascript
// 徽章解锁逻辑
const badgeRules = {
    'first_lesson': {
        name: '初学者',
        condition: (data) => data.progress.completedLessons >= 1
    },
    'module_master': {
        name: '模块大师',
        condition: (data) => data.progress.completionRate === 100
    },
    'perfect_score': {
        name: '满分学霸',
        condition: (data) => data.lessons.some(l => l.score === 100)
    },
    'note_taker': {
        name: '笔记达人',
        condition: (data) => data.stats.totalNoteWords >= 1000
    },
    'ai_explorer': {
        name: 'AI探索者',
        condition: (data) => data.stats.aiQuestionsAsked >= 10
    },
    'streak_7': {
        name: '七日坚持',
        condition: (data) => data.stats.consecutiveDays >= 7
    }
};

// 检查解锁
function checkBadges(learningData) {
    const unlockedBadges = [];
    
    Object.entries(badgeRules).forEach(([id, badge]) => {
        if (badge.condition(learningData)) {
            unlockedBadges.push({ id, ...badge });
        }
    });
    
    return unlockedBadges;
}
```

---

## 🔄 数据同步流程

### **1. 本地存储（localStorage）**

```javascript
// 保存学习进度
function saveLearningProgress(courseId, lessonId, data) {
    const key = `learning_${courseId}_${lessonId}`;
    localStorage.setItem(key, JSON.stringify({
        ...data,
        timestamp: Date.now()
    }));
    
    // 触发同步
    syncToProfile();
}

// 聚合所有课程数据
function aggregateLearningData() {
    const allData = {};
    
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('learning_')) {
            const data = JSON.parse(localStorage.getItem(key));
            const [, courseId, lessonId] = key.split('_');
            
            if (!allData[courseId]) {
                allData[courseId] = { lessons: [] };
            }
            allData[courseId].lessons.push(data);
        }
    });
    
    return allData;
}
```

---

### **2. 云端同步（Supabase）**

```javascript
// Supabase 表结构
CREATE TABLE learning_progress (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    course_id INTEGER,
    lesson_id INTEGER,
    completed BOOLEAN,
    completed_at TIMESTAMP,
    score INTEGER,
    watch_time INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

// 同步到云端
async function syncToCloud(learningData) {
    const { data, error } = await supabase
        .from('learning_progress')
        .upsert({
            user_id: getCurrentUserId(),
            course_id: learningData.courseId,
            lesson_id: learningData.lessonId,
            ...learningData
        }, {
            onConflict: 'user_id,course_id,lesson_id'
        });
    
    if (error) console.error('同步失败:', error);
}

// 从云端加载
async function loadFromCloud(userId) {
    const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
    
    return data;
}
```

---

### **3. 实时更新机制**

```javascript
// course.html 中
const markAsCompleted = async () => {
    // 1. 更新本地状态
    currentLesson.value.completed = true;
    
    // 2. 保存到 localStorage
    saveLearningProgress(course.value.id, currentLesson.value.id, {
        completed: true,
        completedAt: new Date().toISOString(),
        score: quizScore.value,
        watchTime: videoWatchTime.value,
        notes: currentNote.value
    });
    
    // 3. 同步到云端
    await syncToCloud({
        courseId: course.value.id,
        lessonId: currentLesson.value.id,
        completed: true,
        completedAt: new Date().toISOString(),
        score: quizScore.value
    });
    
    // 4. 触发徽章检查
    checkAndUnlockBadges();
    
    // 5. 更新用户中心数据
    updateProfileData();
};
```

---

## 📊 用户中心数据加载

### **profile.html 初始化**

```javascript
// 页面加载时
async function initProfileData() {
    // 1. 从云端加载最新数据
    const cloudData = await loadFromCloud(currentUserId);
    
    // 2. 合并本地数据
    const localData = aggregateLearningData();
    const mergedData = mergeData(cloudData, localData);
    
    // 3. 计算统计数据
    const stats = calculateStats(mergedData);
    
    // 4. 更新所有图表
    updateChart1(stats.completionRate);  // 水球图
    updateChart2(stats.skillPoints);     // 技能树
    updateChart3(stats.scoresTrend);     // 成绩趋势
    updateChart7(stats.calendarData);    // 学习热力图
    updateChart16(stats.badges);         // 徽章墙
    
    // 5. 保存到全局状态
    window.profileData = mergedData;
}
```

---

## 🎯 关键指标计算

### **1. 完成率**

```javascript
function calculateCompletionRate(courseData) {
    const total = courseData.lessons.length;
    const completed = courseData.lessons.filter(l => l.completed).length;
    return (completed / total) * 100;
}
```

### **2. 学习时长**

```javascript
function calculateStudyTime(courseData) {
    return courseData.lessons.reduce((total, lesson) => {
        return total + (lesson.watchTime || 0);
    }, 0);
}
```

### **3. 平均分数**

```javascript
function calculateAverageScore(courseData) {
    const quizzes = courseData.lessons.filter(l => l.type === 'quiz' && l.score);
    if (quizzes.length === 0) return 0;
    
    const totalScore = quizzes.reduce((sum, q) => sum + q.score, 0);
    return totalScore / quizzes.length;
}
```

### **4. 连续学习天数**

```javascript
function calculateStreak(courseData) {
    const dates = courseData.lessons
        .filter(l => l.completed)
        .map(l => new Date(l.completedAt).toDateString())
        .sort();
    
    let streak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i]) - new Date(dates[i-1])) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
        } else if (diff > 1) {
            streak = 1;
        }
    }
    
    return maxStreak;
}
```

---

## 🔔 事件触发机制

### **课程完成事件**

```javascript
// course.html
window.addEventListener('lessonCompleted', (event) => {
    const { courseId, lessonId, data } = event.detail;
    
    // 发送消息到 profile.html（如果打开）
    if (window.opener) {
        window.opener.postMessage({
            type: 'LEARNING_UPDATE',
            data: { courseId, lessonId, ...data }
        }, '*');
    }
});

// profile.html
window.addEventListener('message', (event) => {
    if (event.data.type === 'LEARNING_UPDATE') {
        // 实时更新图表
        updateChartsWithNewData(event.data.data);
    }
});
```

---

## 📈 数据可视化更新

### **实时更新示例**

```javascript
// 当课程完成时
function onLessonCompleted(lessonData) {
    // 1. 更新水球图
    const newRate = calculateCompletionRate(getAllLessons());
    chart1.setOption({
        series: [{ data: [newRate / 100] }]
    });
    
    // 2. 更新成绩趋势
    if (lessonData.score) {
        const currentData = chart3.getOption().series[0].data;
        currentData.push(lessonData.score);
        chart3.setOption({
            series: [{ data: currentData }]
        });
    }
    
    // 3. 更新日历热力图
    const today = new Date().toDateString();
    updateCalendarDay(today, +1);
    
    // 4. 检查徽章解锁
    const newBadges = checkBadges(getAllData());
    if (newBadges.length > 0) {
        showBadgeUnlockAnimation(newBadges);
    }
}
```

---

## 🎉 总结

### **数据流向**

```
课程学习 → 本地存储 → 云端同步 → 用户中心 → 可视化展示
    ↓           ↓           ↓           ↓           ↓
完成课程    localStorage  Supabase   聚合计算    ECharts渲染
```

### **核心关联**

1. **进度关联**: 课程完成率 → 水球图
2. **成绩关联**: 测验分数 → 折线图 + 能力雷达
3. **时间关联**: 完成时间 → 日历热力图
4. **行为关联**: 学习行为 → 徽章解锁
5. **内容关联**: 笔记/AI提问 → 统计图表

### **下一步实现**

1. ✅ 创建统一的数据模型
2. ✅ 实现本地存储逻辑
3. ⏳ 集成 Supabase 云端同步
4. ⏳ 完善图表更新逻辑
5. ⏳ 添加实时通信机制

---

**文档版本**: v1.0  
**创建时间**: 2025-12-16  
**维护者**: AI Playground Team
