import HackerEarthService from '../services/hackerEarthService.js';
import TownscriptScraper from '../middleware/townscriptScraper.js';
import MeetupScraper from '../middleware/meetupScrapper.js';
import UnstopScraper from '../middleware/unstopScraper.js';
import DevpostScraper from '../middleware/devpostScraper.js';

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
        if (!city || !suggestedTopics) {
            throw new Error('City and suggestedTopics are required');
        }

        console.log("🔍 Fetching events for city:", city, "topics:", suggestedTopics);

        // Fetch events from all sources in parallel
        const [townscriptEvents, meetupEvents, hackerEarthEvents, unstopCompetitions, devpostHackathons] = await Promise.allSettled([
            fetchWithTimeout(TownscriptScraper.scrapeEvents(city, suggestedTopics), "Townscript"),
            fetchWithTimeout(Promise.all(suggestedTopics.map(topic =>
                MeetupScraper.scrapeEvents(city, topic)
            )).then(results => results.flat()), "Meetup"),
            fetchWithTimeout(HackerEarthService.getRelevantEvents(), "HackerEarth"),
            fetchWithTimeout(UnstopScraper.scrapeCompetitions(), "Unstop"),
            fetchWithTimeout(DevpostScraper.scrapeHackathons(3), "Devpost")
        ]);

        // Process results
        const allEvents = [
            ...(townscriptEvents.status === 'fulfilled' ? townscriptEvents.value.map(e => ({ ...e, source: "Townscript" })) : []),
            ...(meetupEvents.status === 'fulfilled' ? meetupEvents.value.map(e => ({ ...e, source: "Meetup" })) : []),
            ...(hackerEarthEvents.status === 'fulfilled' ? hackerEarthEvents.value.map(e => ({ ...e, source: "HackerEarth" })) : []),
            ...(unstopCompetitions.status === 'fulfilled' ? unstopCompetitions.value.map(e => ({ ...e, source: "Unstop" })) : []),
            ...(devpostHackathons.status === 'fulfilled' ? devpostHackathons.value.map(e => ({ ...e, source: "Devpost" })) : [])
        ];

        console.log(`📦 Total events collected: ${allEvents.length}`);

        if (allEvents.length === 0) {
            console.warn(`⚠️ No events found. Returning empty list...`);
            return {
                success: true,
                data: [],
                message: "No events found for given inputs"
            };
        }

        return {
            success: true,
            data: allEvents
        };
    } catch (error) {
        console.error("❌ Error fetching all events:", error);
        return {
            success: false,
            message: "Error fetching events: " + error.message
        };
    }
};