import 'dotenv/config';
import app from './app.js';
import { testDatabaseConnection } from './config/database.js';

const PORT = Number(process.env.PORT ?? 3000);

async function start(): Promise<void> {
  try {
    await testDatabaseConnection();
    console.log('MySQL connection OK');
  } catch (error) {
    console.error(
      'Cannot connect to MySQL. Check your .env values and that the schema in src/database/schema.sql has been applied.',
    );
    console.error(error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Quiz0 server is running at http://localhost:${PORT}`);
  });
}

void start();
