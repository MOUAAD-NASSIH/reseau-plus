import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middleware/errorMiddleware';

import authRoutes from './routes/authRoutes';
import specialityRoutes from './routes/specialityRoutes';
import domainRoutes from './routes/domainRoutes';
import workerRoutes from './routes/workerRoutes';
import institutionRoutes from './routes/institutionRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/institutions", institutionRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.send('Server is running');
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});