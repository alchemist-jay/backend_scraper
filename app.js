import express from 'express';
import eventRoutes from './routes/eventRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', eventRoutes);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
