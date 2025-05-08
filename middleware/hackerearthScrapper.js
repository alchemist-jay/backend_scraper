import { launchBrowser, createPage } from '../services/puppeteerConfig.js';

class HackerEarthScraper {
    static async getRelevantEvents() {
        let browser;
        try {
            console.log("Starting HackerEarth scraping...");
            browser = await launchBrowser();
            const page = await createPage(browser);

            console.log("Opening HackerEarth Challenges Page...");
            await page.goto("https://www.hackerearth.com/challenges/", {
                waitUntil: "networkidle2",
                timeout: 60000,
            });

            console.log("Scrolling down to load challenges...");
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 500;
                    const timer = setInterval(() => {
                        window.scrollBy(0, distance);
                        totalHeight += distance;

                        if (totalHeight >= document.body.scrollHeight || totalHeight > 10000) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 300);
                });
            });

            console.log("Waiting for content to load...");
            try {
                await page.waitForSelector(".challenge-card-modern", { timeout: 10000 });
            } catch (error) {
                console.warn("Timeout waiting for challenge cards, proceeding anyway...");
            }

            console.log("Extracting events...");
            const events = await page.evaluate(() => {
                const cards = document.querySelectorAll(".challenge-card-modern");
                console.log(`Found ${cards.length} challenge cards`);

                return Array.from(cards)
                    .map((card) => {
                        try {
                            const title = card.querySelector(".challenge-name span")?.innerText?.trim() || "No Title";
                            const type = card.querySelector(".challenge-type")?.innerText?.trim() || "No Type";
                            const link = card.querySelector("a.challenge-card-link")?.href || "No Link";

                            let imageUrl = "";
                            const imageElement = card.querySelector(".event-image");
                            if (imageElement) {
                                const bgStyle = imageElement.style.backgroundImage;
                                imageUrl = bgStyle.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || "";
                            }

                            const getCountdownValue = (selector) => {
                                const elements = card.querySelectorAll(`${selector} div.large.weight-600.dark`);
                                return elements.length ? Number.parseInt([...elements].map((el) => el.innerText).join("")) : 0;
                            };

                            const days = getCountdownValue("#days");
                            const hours = getCountdownValue("#hours");

                            const eventDate = new Date();
                            eventDate.setDate(eventDate.getDate() + days);
                            eventDate.setHours(eventDate.getHours() + hours);

                            const formattedDate = eventDate.toISOString().split("T")[0];

                            return {
                                title,
                                type,
                                link,
                                image: imageUrl,
                                exactDate: formattedDate,
                                source: "HackerEarth",
                            };
                        } catch (error) {
                            console.error("Error processing card:", error);
                            return null;
                        }
                    })
                    .filter((event) => event && event.title !== "No Title" && event.link !== "No Link");
            });

            console.log(`Successfully scraped ${events.length} events from HackerEarth`);
            return events;
        } catch (error) {
            console.error("HackerEarth scraping error:", error);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    }
}

export default HackerEarthScraper;