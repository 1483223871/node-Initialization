const mysql = require('mysql')
const pool = mysql.createPool({
  host: '******',
  user: 'root',
  password: '123456',
  database: '****',
  port: '3306',
  timezone: "08:00"
})
pool.getConnection(function (err, connection) {
  if (err) {
    console.log('数据库建立连接失败');
  } else {
    console.log('数据库建立连接成功');
  }
});
let query = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err)
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
          connection.release()
        })
      }
    })
  })
}

module.exports = query