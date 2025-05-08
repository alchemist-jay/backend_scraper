import { launchBrowser, createPage } from '../services/puppeteerConfig.js';

class UnstopScraper {
    async scrapeCompetitions() {
        let browser;
        try {
            browser = await launchBrowser();
            const page = await createPage(browser);

            console.log("Opening Unstop Competitions Page...");
            await page.goto("https://unstop.com/competitions", { waitUntil: "networkidle2" });

            console.log("Scrolling to load more competitions...");
            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => window.scrollBy(0, window.innerHeight));
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log("Extracting competition details...");
            const competitions = await page.evaluate(() => {
                return Array.from(document.querySelectorAll(".single_profile")).map(card => {
                    const title = card.querySelector(".opp-title h2")?.innerText.trim() || "No Title";
                    const imageUrl = card.querySelector(".user_img img")?.src || "";
                    const id = card.id;
                    const link = id ? `https://unstop.com/competitions/${id}` : "#";

                    const daysLeftElement = card.querySelector(".seperate_box");
                    let daysLeft = "Unknown";

                    if (daysLeftElement) {
                        const text = daysLeftElement.childNodes[1]?.textContent.trim();
                        daysLeft = parseInt(text.match(/\d+/)?.[0], 10) || "Unknown";
                    }

                    let exactDate = "Unknown";
                    if (!isNaN(daysLeft)) {
                        const eventDate = new Date();
                        eventDate.setDate(eventDate.getDate() + daysLeft);
                        exactDate = eventDate.toISOString().split("T")[0];
                    }

                    return {
                        title,
                        imageUrl,
                        exactDate,
                        link,
                        type: "competition"
                    };
                }).filter(event => event.title !== "No Title" && event.link !== "#");
            });

            return competitions;
        } catch (error) {
            console.error("Scraping error:", error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }
}

export default new UnstopScraper();