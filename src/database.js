const mysql = require('promise-mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mauricio',
    database: 'inventoryDB'
});

function getConnection() {
    return connection;
}

module.exports = { getConnection };