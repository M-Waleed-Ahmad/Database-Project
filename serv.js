
const sql= require('mssql/msnodesqlv8');
const { error } = require('console');

const config={
    server: 'NOX',
    database: "mesd",
    driver:"msnodesqlv8",
    options:{
        trustedConnection:true
    }

}
sql.connect(config,function(err){
    if (err) {
        console.log('error ',err);
    }
    else
        console.log('COnnections successful ');

    var reqs=new sql.Request();
    reqs.query('SELECT * FROM Users',(err,res)=>{
        if (err) {
            console.log('error',err);
        } else {
            console.log('result',res);
            
        }
    })
})