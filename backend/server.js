require('dotenv').config();

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const app = require('./src/app');
const pool = require('./src/config/db');
const { startReminderCron } = require('./src/utils/cron');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    startReminderCron();
  } catch (err) {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  }
};

start();