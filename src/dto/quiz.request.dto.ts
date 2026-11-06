/**
 * Request DTOs: the shapes the API RECEIVES from clients.
 */

export interface CreateQuizRequestDto {
  title: string;
  description?: string;
  isPublished?: boolean;
}

export interface UpdateQuizRequestDto {
  title?: string;
  description?: string | null;
  isPublished?: boolean;
}

export interface QuizListQueryDto {
  page?: number;
  limit?: number;
  /** true = only published quizzes */
  onlyPublished?: boolean;
}

export interface CreateQuestionRequestDto {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  points?: number;
}
