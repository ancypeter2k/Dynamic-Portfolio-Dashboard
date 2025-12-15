import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import portfolioRoutes from './routes/portfolio';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// API routes
app.use('/api/portfolio', portfolioRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT: number = parseInt(process.env.PORT || '8000', 10);
app.listen(PORT, (): void => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Portfolio API: http://localhost:${PORT}/api/portfolio`);
});

