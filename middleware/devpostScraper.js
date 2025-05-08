import puppeteer from 'puppeteer-core';


class DevpostScraper {
    async scrapeHackathons(maxScrolls = 3) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.goto('https://devpost.com/hackathons', { waitUntil: 'networkidle2' });

        // Scroll to load more
        for (let i = 0; i < maxScrolls; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await page.waitForTimeout(2000); // wait 2 seconds for new data
        }

        // Scrape events
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

            // Remove duplicates based on link
            return Array.from(new Map(scraped.map(e => [e.link, e])).values());
        });

        await browser.close();
        return events;
    }
}

export default new DevpostScraper();
