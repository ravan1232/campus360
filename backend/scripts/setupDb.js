import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  console.log('🔄 Initializing Campus 360 MySQL Database...');
  
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to MySQL server.');
  } catch (err) {
    if (err.code === 'ER_ACCESS_DENIED_ERROR' && connectionConfig.password) {
      console.log('ℹ️ Password rejected; connecting with XAMPP default empty password...');
      connection = await mysql.createConnection({ ...connectionConfig, password: '' });
      console.log('✅ Connected to MySQL server (XAMPP default).');
    } else {
      throw err;
    }
  }

  try {

    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');

    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('📄 Executing schema.sql...');
      await connection.query(schemaSql);
      console.log('✅ Schema created successfully.');
    }

    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('📄 Executing seed.sql (Admin assignment only)...');
      await connection.query(seedSql);
      console.log('✅ Seed data initialized (Admin assigned).');
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    await connection.end();
    console.log('🎉 Campus 360 Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
