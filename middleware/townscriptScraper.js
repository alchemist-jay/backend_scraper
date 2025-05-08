import puppeteer from 'puppeteer-core';
import chromium from 'chrome-aws-lambda';

const MAX_RETRIES = 2;
const TIMEOUT = 90000;

class TownscriptScraper {
    async scrapeCategoryEvents(city, suggestedTopics) {
        let browser;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                browser = await puppeteer.launch({
                    headless: chromium.headless,
                    executablePath: await chromium.executablePath(),
                    args: chromium.args,
                    defaultViewport: chromium.defaultViewport,
                });

                const page = await browser.newPage();

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

                await page.close();
                await browser.close();
                return events;
            } catch (error) {
                console.warn(`⚠️ [Attempt ${attempt}] Error scraping "${suggestedTopics}":`, error.message);
                if (browser) await browser.close();
                if (attempt === MAX_RETRIES) return []; // Return empty array after final attempt
            }
        }
    }

    async scrapeEvents(city, suggestedTopics) {
        if (!Array.isArray(suggestedTopics)) {
            console.error("❌ Invalid suggestedTopics input. Expected an array, got:", suggestedTopics);
            return [];
        }

        const results = await Promise.allSettled(
            suggestedTopics.map((suggestedTopics) => this.scrapeCategoryEvents(city, suggestedTopics))
        );

        const allEvents = results
            .filter(r => r.status === "fulfilled")
            .flatMap(r => r.value);

        const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.link, e])).values());
        return uniqueEvents;
    }
}

export default new TownscriptScraper();
