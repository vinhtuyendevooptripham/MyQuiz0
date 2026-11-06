import { Router } from 'express';
import { quizController } from '../controllers/quiz.controller.js';

const router = Router();

router.get('/quizzes', quizController.list);
router.get('/quizzes/:id', quizController.detail);
router.post('/quizzes', quizController.create);
router.put('/quizzes/:id', quizController.update);
router.delete('/quizzes/:id', quizController.remove);
router.post('/quizzes/:id/publish', quizController.publish);

router.get('/quizzes/:id/questions', quizController.listQuestions);
router.post('/quizzes/:id/questions', quizController.addQuestion);
router.delete(
  '/quizzes/:id/questions/:questionId',
  quizController.deleteQuestion,
);

export default router;
