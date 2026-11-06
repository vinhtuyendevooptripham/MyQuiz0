import type { NextFunction, Request, Response } from 'express';
import { BusinessError } from '../dao/business-error.js';
import { questionDao } from '../dao/question.dao.js';
import { quizDao } from '../dao/quiz.dao.js';
import type {
  CreateQuestionRequestDto,
  CreateQuizRequestDto,
  UpdateQuizRequestDto,
} from '../dto/quiz.request.dto.js';
import {
  ok,
  toQuestionResponseDto,
  toQuizResponseDto,
} from '../dto/quiz.response.dto.js';
import { renderHomePage } from '../views/quiz.view.js';

/**
 * Controller layer (MVC): reads HTTP input, calls the DAO,
 * shapes the output with the response DTOs / views.
 * No SQL and no business rules here.
 */

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new BusinessError('Invalid id');
  }
  return id;
}

export const quizController = {
  /** GET / - home page (View) */
  async home(req: Request, res: Response, next: NextFunction) {
    try {
      const quizzes = await quizDao.findAll({ onlyPublished: true, limit: 20 });
      res.send(renderHomePage(quizzes.map(toQuizResponseDto)));
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/quizzes */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const quizzes = await quizDao.findAll({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        onlyPublished: req.query.published === 'true',
      });
      res.json(ok(quizzes.map(toQuizResponseDto)));
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/quizzes/:id */
  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await quizDao.findById(parseId(req.params.id));
      if (!quiz) throw new BusinessError('Quiz not found', 404);
      res.json(ok(toQuizResponseDto(quiz)));
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/quizzes */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as CreateQuizRequestDto;
      const quiz = await quizDao.create(body);
      res.status(201).json(ok(toQuizResponseDto(quiz), 'Quiz created'));
    } catch (error) {
      next(error);
    }
  },

  /** PUT /api/quizzes/:id */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as UpdateQuizRequestDto;
      const quiz = await quizDao.update(parseId(req.params.id), body);
      res.json(ok(toQuizResponseDto(quiz), 'Quiz updated'));
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /api/quizzes/:id */
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await quizDao.delete(parseId(req.params.id));
      res.json(ok(null, 'Quiz deleted'));
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/quizzes/:id/publish */
  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const quiz = await quizDao.publish(parseId(req.params.id));
      res.json(ok(toQuizResponseDto(quiz), 'Quiz published'));
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/quizzes/:id/questions */
  async listQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const quizId = parseId(req.params.id);
      const quiz = await quizDao.findById(quizId);
      if (!quiz) throw new BusinessError('Quiz not found', 404);
      const questions = await questionDao.findByQuizId(quizId);
      res.json(ok(questions.map(toQuestionResponseDto)));
    } catch (error) {
      next(error);
    }
  },

  /** POST /api/quizzes/:id/questions */
  async addQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as CreateQuestionRequestDto;
      const question = await questionDao.create(parseId(req.params.id), body);
      res
        .status(201)
        .json(ok(toQuestionResponseDto(question), 'Question created'));
    } catch (error) {
      next(error);
    }
  },

  /** DELETE /api/quizzes/:id/questions/:questionId */
  async deleteQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      await questionDao.delete(
        parseId(req.params.id),
        parseId(req.params.questionId),
      );
      res.json(ok(null, 'Question deleted'));
    } catch (error) {
      next(error);
    }
  },
};
