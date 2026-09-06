import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import patientRoutes from './routes/patientRoutes.js';
import sunbirdRoutes from './routes/sunBirdRoutes.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/patients', patientRoutes);
app.use('/api/sunbird', sunbirdRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export default app;