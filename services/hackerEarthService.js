import axios from 'axios';
import axiosRetry from 'axios-retry';
import HackerEarthScraper from '../middleware/hackerearthScrapper.js';

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

class HackerEarthService {
    static async getRelevantEvents() {
        try {
            const response = await axios.get('https://www.hackerearth.com/api/events/upcoming/', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Referer': 'https://www.hackerearth.com/',
                    'Accept': 'application/json'
                }
            });
            const events = response.data || [];

            return events.map(event => ({
                id: event.id,
                title: event.title,
                description: event.description,
                startTime: event.start_time,
                endTime: event.end_time,
                url: event.url,
                thumbnail: event.thumbnail,
                type: event.type
            }));
        } catch (error) {
            if (error.response) {
                console.error('⚠️ API responded with error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('⚠️ No response received:', error.request);
            } else {
                console.error('⚠️ Request setup error:', error.message);
            }
            console.warn('Using Puppeteer fallback.');
            return await HackerEarthScraper.getRelevantEvents();
        }
    }
}

export default HackerEarthService;
