import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database.js';
import type { CreateQuestionRequestDto } from '../dto/quiz.request.dto.js';
import type { QuestionTable } from '../dto/quiz.table.dto.js';
import { BusinessError } from './business-error.js';
import { quizDao } from './quiz.dao.js';

type QuestionRow = QuestionTable & RowDataPacket;

const VALID_OPTIONS = ['A', 'B', 'C', 'D'] as const;

/**
 * Question DAO.
 * Repository work (all SQL for the `questions` table) and the business
 * rules for questions live here.
 */
class QuestionDao {
  async findByQuizId(quizId: number): Promise<QuestionTable[]> {
    const [rows] = await pool.query<QuestionRow[]>(
      `SELECT id, quiz_id, question_text, option_a, option_b, option_c,
              option_d, correct_option, points, created_at
         FROM questions
         WHERE quiz_id = ?
         ORDER BY id ASC`,
      [quizId],
    );
    return rows;
  }

  async create(
    quizId: number,
    dto: CreateQuestionRequestDto,
  ): Promise<QuestionTable> {
    // Business rule: the parent quiz must exist.
    const quiz = await quizDao.findById(quizId);
    if (!quiz) throw new BusinessError('Quiz not found', 404);

    // Business rules: a well-formed question.
    if (!dto.questionText?.trim()) {
      throw new BusinessError('Question text is required');
    }
    if (!VALID_OPTIONS.includes(dto.correctOption)) {
      throw new BusinessError("correctOption must be one of 'A', 'B', 'C', 'D'");
    }
    const points = dto.points ?? 1;
    if (!Number.isInteger(points) || points < 1) {
      throw new BusinessError('Points must be a positive integer');
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO questions
         (quiz_id, question_text, option_a, option_b, option_c, option_d,
          correct_option, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quizId,
        dto.questionText.trim(),
        dto.optionA,
        dto.optionB,
        dto.optionC,
        dto.optionD,
        dto.correctOption,
        points,
      ],
    );

    const [rows] = await pool.query<QuestionRow[]>(
      'SELECT * FROM questions WHERE id = ?',
      [result.insertId],
    );
    return rows[0];
  }

  async delete(quizId: number, questionId: number): Promise<void> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM questions WHERE id = ? AND quiz_id = ?',
      [questionId, quizId],
    );
    if (result.affectedRows === 0) {
      throw new BusinessError('Question not found', 404);
    }
  }
}

export const questionDao = new QuestionDao();
