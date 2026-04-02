const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    
    // Log console messages
    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    
    await page.goto('http://localhost:3000/psyche_x_system/frontend/camp_report.html?id=6885ad82-d3c8-472e-8395-568eb5121b61');
    await page.waitForLoadState('networkidle');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadPdfBtn');
    
    try {
        const download = await downloadPromise;
        const path = await download.path();
        console.log("SUCCESS DOWNLOADED FILENAME:", download.suggestedFilename());
        const { execSync } = require('child_process');
        console.log("MIME:", execSync(`file -b --mime-type "${path}"`).toString().trim());
    } catch(err) {
        console.error("FAILED TO DOWNLOAD:", err);
    }
    
    await browser.close();
})();
