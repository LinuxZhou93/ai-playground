/**
 * 智慧教育平台 Puppeteer 自动化代理
 * 解决访问限制、反爬虫问题
 */

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const app = express();

app.use(cors());
app.use(express.json());

// ========== 配置 ==========
const CONFIG = {
    username: process.env.SMARTEDU_USERNAME || '',
    password: process.env.SMARTEDU_PASSWORD || '',
    headless: process.env.HEADLESS !== 'false', // 可设为false查看浏览器
};

let browser = null;
let page = null;
let isLoggedIn = false;

// ========== 初始化浏览器 ==========
async function initBrowser() {
    if (browser) return browser;

    console.log('🚀 正在启动浏览器...');

    browser = await puppeteer.launch({
        headless: CONFIG.headless,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled', // 隐藏自动化特征
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    });

    page = await browser.newPage();

    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 });

    // 注入脚本隐藏webdriver特征
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        window.navigator.chrome = { runtime: {} };
    });

    console.log('✅ 浏览器初始化完成');
    return browser;
}

// ========== 自动登录 ==========
async function login() {
    if (isLoggedIn) return true;

    try {
        console.log('🔐 开始自动登录...');

        await initBrowser();

        // 访问登录页
        await page.goto('https://basic.smartedu.cn/tchMaterial', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // 等待登录表单加载
        await page.waitForSelector('input[type="text"]', { timeout: 10000 });

        // 输入用户名密码
        await page.type('input[type="text"]', CONFIG.username, { delay: 100 });
        await page.type('input[type="password"]', CONFIG.password, { delay: 100 });

        // 点击登录按钮
        await page.click('button[type="submit"]');

        // 等待登录成功（URL改变或特定元素出现）
        await page.waitForNavigation({ timeout: 15000 }).catch(() => { });

        // 验证是否登录成功
        const cookies = await page.cookies();
        isLoggedIn = cookies.some(c => c.name.includes('ND_UC_AUTH'));

        if (isLoggedIn) {
            console.log('✅ 登录成功！');
            return true;
        } else {
            throw new Error('登录失败：未找到认证Cookie');
        }

    } catch (error) {
        console.error('❌ 登录失败:', error.message);
        return false;
    }
}

// ========== 获取教材PDF ==========
async function getTextbookPDF(bookInfo) {
    try {
        await login();

        if (!page) throw new Error('浏览器未初始化');

        // 构建教材搜索URL（实际URL需要根据平台调整）
        const searchUrl = `https://basic.smartedu.cn/tchMaterial/search?keyword=${encodeURIComponent(bookInfo.name)}`;

        console.log(`📚 正在搜索教材: ${bookInfo.name}`);

        await page.goto(searchUrl, { waitUntil: 'networkidle2' });

        // 等待搜索结果
        await page.waitForSelector('.textbook-item', { timeout: 10000 }).catch(() => { });

        // 点击第一个教材
        const textbookExists = await page.$('.textbook-item a');
        if (textbookExists) {
            await page.click('.textbook-item a');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        }

        // 获取PDF下载链接
        const pdfUrl = await page.evaluate(() => {
            // 从页面中提取PDF URL（需要根据实际页面结构调整）
            const pdfLink = document.querySelector('a[href*=".pdf"]') ||
                document.querySelector('[data-pdf-url]');
            return pdfLink ? pdfLink.href || pdfLink.getAttribute('data-pdf-url') : null;
        });

        if (!pdfUrl) {
            throw new Error('未找到PDF下载链接');
        }

        console.log(`✅ 找到PDF: ${pdfUrl}`);
        return pdfUrl;

    } catch (error) {
        console.error('获取PDF失败:', error.message);
        throw error;
    }
}

// ========== API路由 ==========

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        browser: browser ? 'running' : 'stopped',
        isLoggedIn: isLoggedIn
    });
});

/**
 * 手动登录（如果自动登录失败）
 */
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username) CONFIG.username = username;
        if (password) CONFIG.password = password;

        const success = await login();

        res.json({
            success,
            message: success ? '登录成功' : '登录失败，请检查用户名密码'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取教材信息
 */
app.post('/api/textbook/search', async (req, res) => {
    try {
        const bookInfo = req.body;
        const pdfUrl = await getTextbookPDF(bookInfo);

        res.json({
            success: true,
            pdfUrl: pdfUrl,
            title: bookInfo.name
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * 代理下载PDF（通过浏览器下载，携带Cookie）
 */
app.get('/api/pdf/download', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: '缺少URL参数' });
        }

        await login();

        // 使用Puppeteer下载PDF
        const pdfBuffer = await page.goto(url, { waitUntil: 'networkidle2' })
            .then(() => page.pdf({ format: 'A4' }));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=textbook.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 截图（调试用）
 */
app.get('/api/screenshot', async (req, res) => {
    try {
        await initBrowser();
        const screenshot = await page.screenshot({ fullPage: true });
        res.setHeader('Content-Type', 'image/png');
        res.send(screenshot);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== 清理 ==========
process.on('SIGINT', async () => {
    console.log('\n🛑 正在关闭浏览器...');
    if (browser) {
        await browser.close();
    }
    process.exit(0);
});

// ========== 启动 ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    console.log(`📚 Puppeteer代理服务运行在 http://localhost:${PORT}`);
    console.log(`🔧 配置用户名: ${CONFIG.username || '未设置'}`);
    console.log(`🌐 Headless模式: ${CONFIG.headless}`);
    console.log(`\n💡 使用方法：`);
    console.log(`   设置环境变量: SMARTEDU_USERNAME=你的用户名 SMARTEDU_PASSWORD=你的密码`);
    console.log(`   或通过API: POST /api/login {"username":"xxx","password":"xxx"}\n`);
});

module.exports = app;
