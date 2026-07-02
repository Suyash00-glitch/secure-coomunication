require("dotenv").config();
const mysql =require("mysql2/promise");
const pool =
mysql.createPool({
host:
process.env.DB_HOST,
port:
Number(
process.env.DB_PORT
),
user:
process.env.DB_USER,
password:
process.env.DB_PASSWORD,
database:
process.env.DB_NAME,
waitForConnections:true,
connectionLimit:10,
queueLimit:0
});


(async()=>{
try{
const conn =await pool.getConnection();
console.log("Connected to DB:",process.env.DB_HOST);
conn.release();
}
catch(err){
console.log("DB ERROR:",err.message);
}
})();

module.exports=pool;
