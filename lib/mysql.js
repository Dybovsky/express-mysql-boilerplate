const mysql = require('mysql');
const Postgrator = require('postgrator')
const path = require('path');
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'my_db',
  port: 3306
});
exports.pool = pool;

const query = (sql) => new Promise((res, rej) => {
  pool.query(sql, (err, results) => {
    if (err) {
      rej(err);
    } else {
      res(results);
    }
  })
})
exports.query = query;

const postgrator = new Postgrator({
  migrationDirectory: path.resolve(__dirname, '../migrations'),
  driver: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  database: 'my_db',
  username: 'root',
  password: 'root',
  schemaTable: 'migrations',
});

exports.migrate = function () {
  return postgrator.migrate();
};