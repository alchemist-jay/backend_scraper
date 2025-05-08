import express from 'express';
import { fetchAndCombineAllEvents } from '../controllers/eventController.js';

const router = express.Router();

router.post('/all', async (req, res) => {
    const { city, suggestedTopics } = req.body

    console.log("📥 Received request for all events with:", { city, suggestedTopics })

    if (!city || !suggestedTopics || !Array.isArray(suggestedTopics)) {
        return res.status(400).json({ success: false, message: 'Missing or invalid city or suggestedTopics' })
    }

    const result = await fetchAndCombineAllEvents(city, suggestedTopics)

    if (!result.success) {
        console.error("❌ Error in fetchAndCombineAllEvents:", result.message)
        return res.status(500).json(result)
    }

    console.log(`✅ Successfully returning ${result.data.length} events`)
    res.status(200).json(result)
})


export default router;
