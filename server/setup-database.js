const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // Create connection without database first
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    console.log('Setting up IskedyulKo database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await new Promise((resolve, reject) => {
          connection.query(statement, (error, results) => {
            if (error) {
              console.error('Error executing statement:', statement.substring(0, 50) + '...');
              console.error(error);
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    connection.end();
  }
}

setupDatabase();
