const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || 'sqlite';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || (dialect === 'postgres' ? 5432 : dialect === 'mysql' ? 3306 : undefined);
const username = process.env.DB_USER || (dialect === 'postgres' ? 'postgres' : dialect === 'mysql' ? 'root' : undefined);
const password = process.env.DB_PASS || '';
const database = process.env.DB_NAME || 'alertcart';

let sequelize;

if (process.env.DATABASE_URL) {
  // Connect using database connection string (standard for Render Postgres / Supabase)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necessary for cloud-hosted database certificates
      }
    }
  });
} else {
  const dialect = process.env.DB_DIALECT || 'sqlite';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || (dialect === 'postgres' ? 5432 : dialect === 'mysql' ? 3306 : undefined);
  const username = process.env.DB_USER || (dialect === 'postgres' ? 'postgres' : dialect === 'mysql' ? 'root' : undefined);
  const password = process.env.DB_PASS || '';
  const database = process.env.DB_NAME || 'alertcart';

  if (dialect === 'sqlite') {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '..', process.env.DB_STORAGE || 'database.sqlite'),
      logging: false,
    });
  } else {
    sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect,
      logging: false,
      dialectOptions: dialect === 'postgres' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : undefined
    });
  }
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ ${dialect.toUpperCase()} Connected successfully.`);
    // Sync models
    await sequelize.sync({ alter: true });
    console.log(`✅ Database tables synchronized.`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
