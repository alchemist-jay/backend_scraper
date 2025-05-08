import puppeteer from 'puppeteer';

export const launchBrowser = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1280x720', // Reduced window size
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-extensions', // Disable extensions
                '--disable-component-extensions-with-background-pages', // Disable background pages
                '--disable-default-apps', // Disable default apps
                '--mute-audio', // Mute audio
                '--no-first-run', // Skip first run
                '--no-default-browser-check', // Skip default browser check
                '--disable-background-networking', // Disable background networking
                '--disable-background-timer-throttling', // Disable background timer throttling
                '--disable-backgrounding-occluded-windows', // Disable backgrounding of occluded windows
                '--disable-breakpad', // Disable crash reporting
                '--disable-client-side-phishing-detection', // Disable client-side phishing detection
                '--disable-hang-monitor', // Disable hang monitor
                '--disable-ipc-flooding-protection', // Disable IPC flooding protection
                '--disable-popup-blocking', // Disable popup blocking
                '--disable-prompt-on-repost', // Disable prompt on repost
                '--disable-renderer-backgrounding', // Disable renderer backgrounding
                '--disable-sync', // Disable sync
                '--force-color-profile=srgb', // Force color profile
                '--metrics-recording-only', // Only record metrics
                '--no-experiments', // Disable experiments
                '--safebrowsing-disable-auto-update', // Disable safebrowsing auto-update
                '--password-store=basic', // Use basic password store
                '--use-mock-keychain', // Use mock keychain
                '--single-process', // Run in single process mode
                '--js-flags="--max-old-space-size=256"' // Limit JavaScript heap size
            ],
            ignoreHTTPSErrors: true,
            timeout: 30000
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
        await page.setViewport({ width: 1280, height: 720 }); // Reduced viewport size
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setDefaultNavigationTimeout(30000);
        await page.setDefaultTimeout(30000);

        // Enable request interception to block unnecessary resources
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'image' || resourceType === 'stylesheet' || resourceType === 'font' || resourceType === 'media') {
                request.abort();
            } else {
                request.continue();
            }
        });

        return page;
    } catch (error) {
        console.error('Failed to create page:', error);
        throw new Error(`Page creation failed: ${error.message}`);
    }
};