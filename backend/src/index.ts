import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware';
import { setupSwagger } from './lib/swagger';

import authRoutes from './routes/authRoutes';
import specialityRoutes from './routes/specialityRoutes';
import domainRoutes from './routes/domainRoutes';
import workerRoutes from './routes/workerRoutes';
import institutionRoutes from './routes/institutionRoutes';
import missionRoutes from './routes/missionRoutes';
import applicationRoutes from './routes/applicationRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reviewRoutes from './routes/reviewRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Raw body for stripe webhook
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Server is running',
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString()
        }
    });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});