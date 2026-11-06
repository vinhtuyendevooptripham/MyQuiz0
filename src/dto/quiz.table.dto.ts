/**
 * Database table structures.
 * These interfaces describe rows exactly as they are stored in MySQL
 * (see src/database/schema.sql). They are used by the DAO layer only;
 * API code should use the request/response DTOs instead.
 */

export interface QuizTable {
  id: number;
  title: string;
  description: string | null;
  /** MySQL TINYINT(1): 0 = draft, 1 = published */
  is_published: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionTable {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  points: number;
  created_at: Date;
}
