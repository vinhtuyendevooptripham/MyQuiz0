# MyQuiz0

this is provide quiz for Test.

## Quiz0

A Node.js + TypeScript project, built with the **MVC** pattern on **Express**,
using **MySQL** as the database.

- `type: "module"` (ES Modules) in `package.json`
- All development code is TypeScript (`.ts`), compiled with `tsc`
- Configuration from environment variables with **dotenv**

## Project structure

```text
src/
├── main.ts                  Entry point: loads dotenv, checks MySQL, starts the server
├── app.ts                   Express app: middleware, routes, error handler
├── config/
│   └── database.ts          MySQL connection pool (mysql2)
├── dto/                     DTO layer
│   ├── quiz.request.dto.ts  Data the API receives (create / update / query)
│   ├── quiz.response.dto.ts Data the API returns (incl. the ApiResponse envelope)
│   └── quiz.table.dto.ts    Database table structures (quizzes, questions rows)
├── dao/                     DAO layer: repository (SQL) + business code
│   ├── quiz.dao.ts          Quizzes: queries + rules (unique title, publish needs >= 1 question)
│   ├── question.dao.ts      Questions: queries + rules (valid correct option, points > 0)
│   └── business-error.ts    Error type that carries an HTTP status
├── controllers/
│   └── quiz.controller.ts   Controller layer: HTTP in/out, no SQL here
├── routes/
│   └── quiz.routes.ts       Route definitions under /api
├── views/
│   └── quiz.view.ts         View layer: renders the home page HTML
└── database/
    └── schema.sql           MySQL schema: database quiz0, tables quizzes + questions
```

In MVC terms: **Model** = DTO (table structures) + DAO, **View** = `views/` +
response DTOs, **Controller** = `controllers/`.

## Setup

1. Create the database and tables in MySQL:

   ```sql
   -- run the file src/database/schema.sql in MySQL
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your MySQL user/password.

3. Install and run:

   ```bash
   npm install
   npm run dev      # development (tsx, auto-reload)
   npm run build    # compile TypeScript to dist/
   npm start        # run the compiled build
   ```

Server default: http://localhost:3000

## API

| Method | Endpoint                              | Description              |
| ------ | ------------------------------------- | ------------------------ |
| GET    | /                                     | Home page (HTML view)    |
| GET    | /health                               | Health check             |
| GET    | /api/quizzes?page=1&limit=20          | List quizzes             |
| GET    | /api/quizzes?published=true           | List published quizzes   |
| GET    | /api/quizzes/:id                      | Quiz detail              |
| POST   | /api/quizzes                          | Create quiz              |
| PUT    | /api/quizzes/:id                      | Update quiz              |
| DELETE | /api/quizzes/:id                      | Delete quiz              |
| POST   | /api/quizzes/:id/publish              | Publish quiz             |
| GET    | /api/quizzes/:id/questions            | List questions of a quiz |
| POST   | /api/quizzes/:id/questions            | Add a question           |
| DELETE | /api/quizzes/:id/questions/:questionId | Delete a question       |

Every API response uses the same envelope:

```json
{ "success": true, "message": "Quiz created", "data": { "...": "..." } }
```

Question responses never include the correct answer.
