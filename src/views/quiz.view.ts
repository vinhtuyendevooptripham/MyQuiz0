import type { QuizResponseDto } from '../dto/quiz.response.dto.js';

/** View layer (MVC): turns data into HTML pages. */

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderHomePage(quizzes: QuizResponseDto[]): string {
  const items =
    quizzes.length === 0
      ? '<li>No published quizzes yet.</li>'
      : quizzes
          .map(
            (quiz) =>
              `<li><strong>${escapeHtml(quiz.title)}</strong>` +
              (quiz.description
                ? ` - ${escapeHtml(quiz.description)}`
                : '') +
              `</li>`,
          )
          .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Quiz0</title>
  </head>
  <body>
    <h1>Quiz0</h1>
    <h2>Published quizzes</h2>
    <ul>${items}</ul>
    <p>API: <code>GET /api/quizzes</code></p>
  </body>
</html>`;
}
