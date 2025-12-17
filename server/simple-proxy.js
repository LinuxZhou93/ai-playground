/**
 * 简化版教材代理 - 使用公开资源
 * 无需登录，直接提供教材链接
 */

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ========== 教材资源库 ==========
// 使用公开的教材资源（示例数据，实际需要补充真实链接）
const TEXTBOOK_DATABASE = {
    '语文一年级上册': {
        name: '语文一年级上册',
        pdfUrl: 'https://basic.smartedu.cn/syncClassroom/download?contentType=assets_document&contentId=xxx',
        previewUrl: 'https://r1-ndr.ykt.cbern.com.cn/edu_product/65/document/xxx.pdf',
        publisher: '人教版',
        grade: '小学',
        subject: '语文'
    },
    // 更多教材...
};

// ========== API路由 ==========

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mode: 'direct',
        message: '使用公开资源，无需登录'
    });
});

/**
 * 搜索教材
 */
app.post('/api/textbook/search', (req, res) => {
    const { name, grade, subject, publisher } = req.body;

    console.log(`📚 搜索教材: ${name}`);

    // 从数据库查找
    const textbook = TEXTBOOK_DATABASE[name];

    if (textbook) {
        console.log(`✅ 找到教材: ${name}`);
        res.json({
            success: true,
            pdfUrl: textbook.pdfUrl,
            previewUrl: textbook.previewUrl,
            title: textbook.name
        });
    } else {
        console.log(`⚠️  教材未找到: ${name}`);
        // 返回通用的智慧教育平台链接
        res.json({
            success: true,
            pdfUrl: generateSmartEduUrl(name, grade, subject),
            title: name,
            message: '使用智慧教育平台通用链接'
        });
    }
});

/**
 * PDF代理下载
 */
app.get('/api/pdf/download', (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: '缺少URL参数' });
    }

    // 提示：实际部署时这里应该代理真实的PDF内容
    // 现在我们重定向到智慧教育平台或提供说明
    res.json({
        message: '教材下载',
        originalUrl: url,
        instructions: [
            '1. 访问国家智慧教育平台: https://basic.smartedu.cn/tchMaterial',
            '2. 搜索对应教材',
            '3. 在线阅读或下载PDF',
            '4. 或访问电子课本网: https://www.dzkbw.com/'
        ]
    });
});

/**
 * 生成智慧教育平台URL
 */
function generateSmartEduUrl(name, grade, subject) {
    const baseUrl = 'https://basic.smartedu.cn/tchMaterial';
    const keyword = encodeURIComponent(name);
    return `${baseUrl}/detail?contentType=assets_document&keyword=${keyword}`;
}

/**
 * 教材列表API
 */
app.get('/api/textbooks/list', (req, res) => {
    res.json({
        success: true,
        count: Object.keys(TEXTBOOK_DATABASE).length,
        textbooks: Object.values(TEXTBOOK_DATABASE),
        message: '更多教材请访问官方网站'
    });
});

// ========== 启动服务 ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`📚 智慧教材代理服务运行在 http://localhost:${PORT}`);
    console.log(`📖 模式: 直接资源访问（无需Puppeteer）`);
    console.log(`✅ 已加载 ${Object.keys(TEXTBOOK_DATABASE).length} 本教材`);
    console.log(`\n💡 提示：`);
    console.log(`   - 部分教材提供直接链接`);
    console.log(`   - 其他教材会引导至官方网站`);
    console.log(`   - 完全免登录使用\n`);
});

module.exports = app;
