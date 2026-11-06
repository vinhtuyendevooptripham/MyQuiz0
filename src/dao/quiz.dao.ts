import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database.js';
import type {
  CreateQuizRequestDto,
  QuizListQueryDto,
  UpdateQuizRequestDto,
} from '../dto/quiz.request.dto.js';
import type { QuizTable } from '../dto/quiz.table.dto.js';
import { BusinessError } from './business-error.js';

type QuizRow = QuizTable & RowDataPacket;

/**
 * Quiz DAO.
 * Repository work (all SQL for the `quizzes` table) and the business
 * rules for quizzes live here. Controllers never write SQL.
 */
class QuizDao {
  async findAll(query: QuizListQueryDto): Promise<QuizTable[]> {
    // Business rule: pagination is always bounded.
    const page = Math.max(1, Math.floor(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(query.limit ?? 20)));
    const offset = (page - 1) * limit;

    const where = query.onlyPublished ? 'WHERE is_published = 1' : '';
    const [rows] = await pool.query<QuizRow[]>(
      `SELECT id, title, description, is_published, created_at, updated_at
         FROM quizzes
         ${where}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return rows;
  }

  async findById(id: number): Promise<QuizTable | null> {
    const [rows] = await pool.query<QuizRow[]>(
      `SELECT id, title, description, is_published, created_at, updated_at
         FROM quizzes
         WHERE id = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(dto: CreateQuizRequestDto): Promise<QuizTable> {
    const title = dto.title?.trim();
    if (!title) {
      throw new BusinessError('Quiz title is required');
    }
    await this.assertTitleIsUnique(title);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO quizzes (title, description, is_published)
       VALUES (?, ?, ?)`,
      [title, dto.description ?? null, dto.isPublished ? 1 : 0],
    );

    const created = await this.findById(result.insertId);
    if (!created) throw new BusinessError('Failed to create quiz', 500);
    return created;
  }

  async update(id: number, dto: UpdateQuizRequestDto): Promise<QuizTable> {
    const existing = await this.findById(id);
    if (!existing) throw new BusinessError('Quiz not found', 404);

    const title = dto.title?.trim() ?? existing.title;
    if (!title) throw new BusinessError('Quiz title cannot be empty');
    await this.assertTitleIsUnique(title, id);

    await pool.query(
      `UPDATE quizzes
          SET title = ?, description = ?, is_published = ?
        WHERE id = ?`,
      [
        title,
        dto.description !== undefined ? dto.description : existing.description,
        dto.isPublished !== undefined
          ? dto.isPublished
            ? 1
            : 0
          : existing.is_published,
        id,
      ],
    );

    const updated = await this.findById(id);
    if (!updated) throw new BusinessError('Quiz not found', 404);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) throw new BusinessError('Quiz not found', 404);
    // Questions are removed by the ON DELETE CASCADE foreign key.
    await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
  }

  /**
   * Business rule: a quiz can only be published
   * when it has at least 1 question.
   */
  async publish(id: number): Promise<QuizTable> {
    const existing = await this.findById(id);
    if (!existing) throw new BusinessError('Quiz not found', 404);

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM questions WHERE quiz_id = ?',
      [id],
    );
    if (Number(rows[0].total) < 1) {
      throw new BusinessError('Cannot publish a quiz with no questions');
    }

    return this.update(id, { isPublished: true });
  }

  private async assertTitleIsUnique(
    title: string,
    ignoreId?: number,
  ): Promise<void> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM quizzes WHERE title = ?',
      [title],
    );
    const duplicate = rows.some((row) => Number(row.id) !== ignoreId);
    if (duplicate) {
      throw new BusinessError('A quiz with this title already exists', 409);
    }
  }
}

export const quizDao = new QuizDao();
