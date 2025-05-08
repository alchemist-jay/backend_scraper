import { launchBrowser, createPage } from '../services/puppeteerConfig.js';

class DevpostScraper {
    async scrapeHackathons(maxScrolls = 3) {
        let browser;
        try {
            browser = await launchBrowser();
            const page = await createPage(browser);

            await page.goto('https://devpost.com/hackathons', { waitUntil: 'networkidle2' });

            // Scroll to load more
            for (let i = 0; i < maxScrolls; i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });
                await page.waitForTimeout(2000);
            }

            const events = await page.evaluate(() => {
                const tiles = document.querySelectorAll('a.tile-anchor');
                const scraped = Array.from(tiles).map(tile => {
                    const titleElement = tile.querySelector('h3');
                    const imageElement = tile.querySelector('.hackathon-thumbnail');
                    const daysLeftElement = tile.querySelector('.status-label.open');

                    return {
                        title: titleElement ? titleElement.innerText.trim() : 'No title',
                        link: tile.href,
                        image: imageElement ? 'https:' + imageElement.getAttribute('src') : 'No image',
                        daysLeft: daysLeftElement ? daysLeftElement.innerText.trim() : 'No days left info'
                    };
                });

                return Array.from(new Map(scraped.map(e => [e.link, e])).values());
            });

            return events;
        } catch (error) {
            console.error("Devpost scraping error:", error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }
}

export default new DevpostScraper();