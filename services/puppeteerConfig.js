import puppeteer from 'puppeteer';

export const launchBrowser = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new', // Updated for Puppeteer 24.x
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920x1080',
                '--disable-web-security', // Added for better compatibility
                '--disable-features=IsolateOrigins,site-per-process' // Added for better compatibility
            ],
            ignoreHTTPSErrors: true, // Added for better compatibility
            timeout: 30000 // Added timeout for browser launch
        });
        return browser;
    } catch (error) {
        console.error('Failed to launch browser:', error);
        throw new Error(`Browser launch failed: ${error.message}`);
    }
};

export const createPage = async (browser) => {
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Added additional page configurations for better stability
        await page.setDefaultNavigationTimeout(30000);
        await page.setDefaultTimeout(30000);

        return page;
    } catch (error) {
        console.error('Failed to create page:', error);
        throw new Error(`Page creation failed: ${error.message}`);
    }
};