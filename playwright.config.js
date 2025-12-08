// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright 测试配置
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './tests',

    // 测试超时时间 (30秒)
    timeout: 30 * 1000,

    // 每个测试的断言超时
    expect: {
        timeout: 5000
    },

    // 失败时重试次数
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,

    // 并行执行的 worker 数量
    workers: process.env.CI ? 1 : undefined,

    // 测试报告
    reporter: [
        ['html', { outputFolder: 'test-results/html' }],
        ['list']
    ],

    // 所有测试的共享配置
    use: {
        // 基础 URL
        baseURL: process.env.BASE_URL || 'http://localhost:3000',

        // 收集失败时的追踪信息
        trace: 'on-first-retry',

        // 截图
        screenshot: 'only-on-failure',

        // 视频
        video: 'retain-on-failure',

        // 浏览器上下文选项
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
    },

    // 配置多个浏览器项目
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // 移动端测试
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    // 本地开发服务器配置 (可选)
    // webServer: {
    //   command: 'npm run dev',
    //   url: 'http://localhost:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
