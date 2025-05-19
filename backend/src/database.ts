import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: Number(process.env.DB_PORT), 
  password: process.env.DB_PASSWORD || '2802',
  database: process.env.DB_NAME || 'goplanningdb',
});

