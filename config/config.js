require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'food_recipe_db',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'food_recipe_db',
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    },
    production: {
        use_env_variable: 'DB_URL',
        dialect: 'mysql',
        logging: false
    }
};