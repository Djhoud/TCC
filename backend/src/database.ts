// src/database.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2802',
  database: process.env.DB_NAME || 'goplanningdb',
  port: parseInt(process.env.DB_PORT || '3306', 10), // Valor padrão 3306
  waitForConnections: true,   
  connectionLimit: 10,
  queueLimit: 0,
});

export { pool as db };
// Você pode usar o pool para fazer consultas em qualquer parte do seu backend