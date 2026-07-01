
const pool = require("../db.js");


async function createDepartment(req,res){

try{

const {department_name,secure_area_flag,status}=req.body;


await pool.query(

`
insert into departments

(department_name , secure_area_flag , status ) values (?,?,?)`,[department_name,secure_area_flag,status]);

res.json({message:"department created"});

}

catch(err){

res.status(500).json({message:err.message});

}

}



async function getDepartments(req,res){

try{

const [rows] = await pool.query(`select * from departments order by department_name `);

res.json(rows);
}

catch(err){

res.status(500).json({message:err.message});

}

}


async function getActiveDepartments(req, res) {

  const [rows] = await pool.query(`
    SELECT department_id, department_name
    FROM departments
    WHERE LOWER(status) = 'active'
    ORDER BY department_name
  `);

  res.json(rows);

}




module.exports={

createDepartment,

getDepartments , getActiveDepartments

};
