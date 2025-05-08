import HackerEarthService from '../services/hackerEarthService.js';
import TownscriptScraper from '../middleware/townscriptScraper.js'
import MeetupScraper from '../middleware/meetupScrapper.js'
import UnstopScraper from '../middleware/unstopScraper.js'
import DevpostScraper from '../middleware/devpostScraper.js'
const fetchWithTimeout = (promise, name, timeout = 90000) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${name} timed out`)), timeout)
        ),
    ]).catch((err) => {
        console.error(`❌ ${name} fetch failed:`, err.message);
        return [];
    });
};

export const fetchAndCombineAllEvents = async (city, suggestedTopics) => {
    try {
        console.log("🔍 Fetching events for city:", city, "topics:", suggestedTopics)

        let townscriptEvents = []
        try {
            townscriptEvents = await fetchWithTimeout(
                TownscriptScraper.scrapeEvents(city, suggestedTopics),
                "Townscript"
            )
            console.log(`✅ Fetched ${townscriptEvents.length} Townscript events`)
        } catch (error) {
            console.error("❌ Error fetching Townscript events:", error)
        }

        const allMeetupEvents = [];
        for (const topic of suggestedTopics) {
            try {
                const topicEvents = await fetchWithTimeout(
                    MeetupScraper.scrapeEvents(city, topic),
                    `Meetup (${topic})`
                );
                allMeetupEvents.push(...topicEvents);
            } catch (err) {
                console.warn(`⚠️ Error scraping topic "${topic}": ${err.message}`);
            }
        }

        // Deduplicate by link
        const meetupEvents = Array.from(
            new Map(allMeetupEvents.map(e => [e.link, e])).values()
        );

        let hackerEarthEvents = []
        try {
            hackerEarthEvents = await fetchWithTimeout(
                HackerEarthService.getRelevantEvents(city, suggestedTopics),
                "HackerEarth"
            )
            console.log(`✅ Fetched ${hackerEarthEvents.length} HackerEarth events`)
        } catch (error) {
            console.error("❌ Error fetching HackerEarth events:", error)
        }

        let unstopCompetitions = []
        try {
            const unstopResult = await fetchWithTimeout(UnstopScraper.scrapeCompetitions(), "Unstop")
            unstopCompetitions = unstopResult.success ? unstopResult.data : []
            console.log(`✅ Fetched ${unstopCompetitions.length} Unstop competitions`)
        } catch (error) {
            console.error("❌ Error fetching Unstop competitions:", error)
        }

        let devpostHackathons = []
        try {
            devpostHackathons = await fetchWithTimeout(DevpostScraper.scrapeHackathons(3), "Devpost")
            console.log(`✅ Fetched ${devpostHackathons.length} Devpost hackathons`)
        } catch (error) {
            console.error("❌ Error fetching Devpost hackathons:", error)
        }

        const allEvents = [
            ...townscriptEvents.map((e) => ({ ...e, source: "Townscript" })),
            ...meetupEvents.map((e) => ({ ...e, source: "Meetup" })),
            ...hackerEarthEvents.map((e) => ({ ...e, source: "HackerEarth" })),
            ...unstopCompetitions.map((e) => ({ ...e, source: "Unstop" })),
            ...devpostHackathons.map((e) => ({ ...e, source: "Devpost" })),
        ]

        console.log(`📦 Total events collected: ${allEvents.length}`)

        if (allEvents.length === 0) {
            console.warn(`⚠️ No events found. Returning empty list...`)
            return {
                success: true,
                data: [],
                message: "No events found for given inputs",
            }
        }

        return { success: true, data: allEvents }
    } catch (error) {
        console.error("❌ Error fetching all events:", error)
        return { success: false, message: "Error fetching events: " + error.message }
    }
}
