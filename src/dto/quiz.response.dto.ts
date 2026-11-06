import type { QuestionTable, QuizTable } from './quiz.table.dto.js';

/**
 * Response DTOs: the shapes the API RETURNS to clients.
 */

/** Standard envelope for every API response. */
export interface ApiResponseDto<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface QuizResponseDto {
  id: number;
  title: string;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponseDto {
  id: number;
  quizId: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  points: number;
  // Note: correctOption is intentionally NOT returned,
  // so clients cannot see the answer before submitting.
}

export function toQuizResponseDto(row: QuizTable): QuizResponseDto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    isPublished: row.is_published === 1,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export function toQuestionResponseDto(row: QuestionTable): QuestionResponseDto {
  return {
    id: row.id,
    quizId: row.quiz_id,
    questionText: row.question_text,
    options: {
      A: row.option_a,
      B: row.option_b,
      C: row.option_c,
      D: row.option_d,
    },
    points: row.points,
  };
}

export function ok<T>(data: T, message?: string): ApiResponseDto<T> {
  return { success: true, message, data };
}
