const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[pageerror] ${err.message}`));
  page.on('requestfailed', request => {
    if (request.failure()) {
      console.log(`[failed] ${request.url()} - ${request.failure().errorText}`);
    }
  });
  
  try {
    console.log('Navigating to Futureclass...');
    await page.goto('https://ai.zhouxiaomai.com/classroom/B5fL5ZTWb-', { timeout: 15000, waitUntil: 'networkidle' });
    console.log('Navigated, waiting 3 seconds...');
    await page.waitForTimeout(3000);
  } catch(e) { console.log('Timeout/Error:', e.message); }
  
  await browser.close();
})();
