const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    // Load local url
    await page.goto('http://localhost:3000/psyche_x_system/frontend/camp_report.html?id=faba425e-3060-4c12-a7f4-8a7c2a792d4f', { waitUntil: 'networkidle0' });
    
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    // Enable download
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: __dirname,
    });
    
    // Click button
    await page.click('#downloadPdfBtn');
    
    // Wait for file
    console.log("Clicked! Waiting for file...");
    await new Promise(r => setTimeout(r, 6000));
    
    await browser.close();
    console.log("Done");
})();
