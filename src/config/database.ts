import mysql from 'mysql2/promise';

/**
 * MySQL connection pool.
 * Values come from environment variables loaded with dotenv (see src/main.ts).
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'quiz0',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function testDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
