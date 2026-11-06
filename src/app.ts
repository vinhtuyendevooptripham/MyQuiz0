import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { quizController } from './controllers/quiz.controller.js';
import { BusinessError } from './dao/business-error.js';
import quizRoutes from './routes/quiz.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, data: 'ok' });
});

// View (MVC): home page rendered as HTML
app.get('/', quizController.home);

// API routes
app.use('/api', quizRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler: BusinessError carries its own HTTP status.
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof BusinessError) {
    res
      .status(error.status)
      .json({ success: false, message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
