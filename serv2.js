const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'server',
  password : '123456',
  database : 'mesd'
});
 
connection.connect();

connection.query('SELECT * FROM Users', function (error, results, fields) {
  if (error) throw error;
  console.log('Result: ', results);
});
 
connection.end();