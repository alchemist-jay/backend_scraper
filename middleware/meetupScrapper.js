import { launchBrowser, createPage } from '../services/puppeteerConfig.js';

class MeetupScraper {
    async scrapeEvents(city, suggestedTopics) {
        let browser;
        try {
            browser = await launchBrowser();
            const page = await createPage(browser);

            const url = `https://www.meetup.com/find/?location=in--${encodeURIComponent(city)}&source=EVENTS&keywords=${encodeURIComponent(suggestedTopics)}`;

            try {
                await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
                await page.waitForSelector(".flex.flex-1.flex-row-reverse", { timeout: 5000 });
            } catch (error) {
                console.warn(`⚠️ No events found for suggested topics: ${suggestedTopics} in ${city}`);
                return [];
            }

            const events = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".flex.flex-1.flex-row-reverse")).map(el => {
                    const titleElement = el.querySelector("h2");
                    const imageElement = el.querySelector("img");
                    const dateElement = el.querySelector("time");
                    const groupElement = el.querySelector("p span.s1uol3r6");
                    const attendeesElement = el.querySelector("div[aria-label*='attendees']");
                    const urlElement = el.querySelector("a");

                    return {
                        title: titleElement ? titleElement.innerText.trim() : "No title",
                        image: imageElement ? imageElement.src : "No image",
                        exactDate: dateElement ? dateElement.dateTime : "No date",
                        group: groupElement ? groupElement.innerText.trim() : "No group",
                        attendees: attendeesElement ? attendeesElement.innerText.trim() : "No attendees",
                        link: urlElement ? urlElement.href : "No link"
                    };
                });
            });

            return Array.from(new Map(events.map(e => [e.link, e])).values());
        } catch (error) {
            console.error(`❌ Meetup scraping error: ${error.message}`);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }
}

export default new MeetupScraper();