
const {createPool}= require('mysql2');
const { error } = require('console');
const pool=createPool({
    host:'localhost',
    user:'root',
    password:'waleed1086',
    database:'mesd',
    connectionLimit:100
})
pool.query(' select * from users;',(err,res,field)=>{
    if (err) {
            console.log('error',err);
    } else {
        return console.log('result ',res);
    }
})
