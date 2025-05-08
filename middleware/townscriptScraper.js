import { launchBrowser, createPage } from '../services/puppeteerConfig.js';

const MAX_RETRIES = 2;
const TIMEOUT = 90000;

class TownscriptScraper {
    async scrapeCategoryEvents(city, suggestedTopics) {
        let browser;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                browser = await launchBrowser();
                const page = await createPage(browser);

                const url = `https://www.townscript.com/search?place=${encodeURIComponent(city)}&q=${encodeURIComponent(suggestedTopics)}`;
                await page.goto(url, { waitUntil: "networkidle2", timeout: TIMEOUT });

                await page.waitForSelector(".ls-card", { timeout: 5000 });

                const events = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll(".ls-card")).map(el => {
                        const titleElement = el.querySelector(".event-name span");
                        const imageElement = el.querySelector(".image-container img");
                        const dateElement = el.querySelector(".date span");
                        const urlElement = el.querySelector("a");

                        return {
                            title: titleElement ? titleElement.innerText.trim() : "No title",
                            image: imageElement ? imageElement.src : "No image",
                            endDate: dateElement ? dateElement.innerText.trim() : "No date",
                            link: urlElement ? "https://www.townscript.com" + urlElement.getAttribute("href") : "No link"
                        };
                    });
                });

                return events;
            } catch (error) {
                console.warn(`⚠️ [Attempt ${attempt}] Error scraping "${suggestedTopics}":`, error.message);
                if (attempt === MAX_RETRIES) return [];
            } finally {
                if (browser) await browser.close();
            }
        }
    }

    async scrapeEvents(city, suggestedTopics) {
        if (!Array.isArray(suggestedTopics)) {
            console.error("❌ Invalid suggestedTopics input. Expected an array, got:", suggestedTopics);
            return [];
        }

        try {
            const results = await Promise.allSettled(
                suggestedTopics.map((topic) => this.scrapeCategoryEvents(city, topic))
            );

            const allEvents = results
                .filter(r => r.status === "fulfilled")
                .flatMap(r => r.value);

            return Array.from(new Map(allEvents.map(e => [e.link, e])).values());
        } catch (error) {
            console.error("❌ Error in scrapeEvents:", error);
            return [];
        }
    }
}

export default new TownscriptScraper();