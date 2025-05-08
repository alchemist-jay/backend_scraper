import puppeteer from "puppeteer";

class UnstopScraper {
    async scrapeCompetitions() {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: puppeteer.executablePath(),
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        try {
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
                    if (!imageUrl.startsWith("https://d8it4huxumps7.cloudfront.net/uploads/images/")) {
                        console.warn("❌ Invalid Image URL:", imageUrl);
                    }
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
                    type = "competition";

                    return { title, imageUrl, exactDate, link, type };

                }).filter(event => event.title !== "No Title" && event.link !== "#");
            });

            await browser.close();
            return competitions;
        } catch (error) {
            console.error("Scraping error:", error);
            await browser.close();
            return [];
        }
    }
}

export default new UnstopScraper();