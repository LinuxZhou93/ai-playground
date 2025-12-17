/**
 * 智慧教育平台 PDF 代理服务
 * 功能：自动登录、获取教材PDF、代理下载
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// 启用CORS
app.use(cors());
app.use(express.json());

// ========== 配置 ==========
const SMARTEDU_CONFIG = {
    baseUrl: 'https://basic.smartedu.cn',
    loginUrl: 'https://s-file-1.ykt.cbern.com.cn/zxx',
    apiUrl: 'https://s-file-1.ykt.cbern.com.cn/zxx/ndrv2/resources/tch_material',

    // 用户凭证（从用户处获取）
    credentials: {
        username: process.env.SMARTEDU_USERNAME || '',
        password: process.env.SMARTEDU_PASSWORD || ''
    }
};

// ========== Token 管理 ==========
let accessToken = null;
let tokenExpiry = null;

/**
 * 获取或刷新 Access Token
 */
async function getAccessToken() {
    // 如果token还有效，直接返回
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        console.log('正在获取新的 Access Token...');

        // 方法1：通过localStorage模拟（需要真实登录）
        // 方法2：使用API登录（如果平台提供）
        // 方法3：使用Puppeteer自动化登录

        // 这里使用简化版：从环境变量读取预设token
        accessToken = process.env.SMARTEDU_TOKEN || '';
        tokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7天有效期

        if (!accessToken) {
            throw new Error('未配置 Access Token，请设置环境变量 SMARTEDU_TOKEN');
        }

        return accessToken;
    } catch (error) {
        console.error('获取Token失败:', error.message);
        throw error;
    }
}

/**
 * 获取教材列表
 */
app.get('/api/textbooks', async (req, res) => {
    try {
        const { grade, subject, publisher } = req.query;

        // 调用智慧教育平台API
        const response = await axios.get(`${SMARTEDU_CONFIG.apiUrl}/list`, {
            params: {
                grade,
                subject,
                publisher
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('获取教材列表失败:', error.message);
        res.status(500).json({ error: '获取教材列表失败' });
    }
});

/**
 * 获取教材PDF信息
 */
app.get('/api/textbook/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const token = await getAccessToken();

        // 获取教材详情
        const response = await axios.get(`${SMARTEDU_CONFIG.apiUrl}/detail/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const pdfUrl = response.data?.pdf_url || response.data?.ti_items?.[0]?.lv_url;

        res.json({
            success: true,
            pdfUrl: pdfUrl,
            title: response.data.title,
            pages: response.data.page_count
        });
    } catch (error) {
        console.error('获取PDF信息失败:', error.message);
        res.status(500).json({ error: '获取PDF信息失败' });
    }
});

/**
 * 代理PDF流
 */
app.get('/api/pdf/proxy', async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: '缺少PDF URL参数' });
        }

        const token = await getAccessToken();

        // 代理请求PDF
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        // 设置响应头
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // 流式传输
        response.data.pipe(res);
    } catch (error) {
        console.error('代理PDF失败:', error.message);
        res.status(500).json({ error: '代理PDF失败' });
    }
});

/**
 * 设置Token（用于前端配置）
 */
app.post('/api/set-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: '缺少token参数' });
    }

    accessToken = token;
    tokenExpiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

    res.json({ success: true, message: 'Token已设置' });
});

/**
 * 健康检查
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        hasToken: !!accessToken,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
    });
});

// ========== 启动服务 ==========
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`📚 智慧教育平台代理服务运行在 http://localhost:${PORT}`);
    console.log(`💡 使用前请设置环境变量 SMARTEDU_TOKEN`);
    console.log(`🔧 或通过 POST /api/set-token 设置Token`);
});

module.exports = app;
