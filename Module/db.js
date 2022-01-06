const mysql = require('mysql2/promise');

const db_info = {
    host: process.env.MYSQL_HOST_IP,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    connectionLimit: 100,
    database: process.env.MYSQL_DATABASE
};

module.exports = {
    pool: mysql.createPool(db_info),
    info: db_info
};