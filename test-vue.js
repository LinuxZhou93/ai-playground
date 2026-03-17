const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        page.on('console', msg => {
            const type = msg.type();
            if (type === 'error' || type === 'warning') {
                console.log(`[${type.toUpperCase()}] ${msg.text()}`);
            }
        });
        page.on('pageerror', error => console.log('[PAGE_ERROR]', error.message));
        await page.goto('file:///Users/zhoulin/Desktop/github/ai-playground/course-openclaw.html', { waitUntil: 'networkidle0' });
        
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
