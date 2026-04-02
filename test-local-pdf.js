const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('http://localhost:3000/psyche_x_system/frontend/camp_report.html?id=faba425e-3060-4c12-a7f4-8a7c2a792d4f', { waitUntil: 'load' });
    
    console.log("Page loaded. Triggering download.");
    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadPdfBtn');
    
    try {
        const download = await Promise.race([
            downloadPromise,
            new Promise((_, r) => setTimeout(() => r(new Error('Timeout')), 15000))
        ]);
        const path = await download.path();
        console.log("Downloaded:", download.suggestedFilename());
        
        const { execSync } = require('child_process');
        console.log("MIME:", execSync(`file -b --mime-type "${path}"`).toString().trim());
        console.log("Size:", fs.statSync(path).size);
    } catch (e) {
        console.error("Error:", e.message);
    }
    
    await browser.close();
})();
