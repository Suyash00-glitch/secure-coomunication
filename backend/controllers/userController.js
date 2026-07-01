const pool=require("../db.js");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const {jwt_secret}=require("../config.js");





async function signup(req,res) {
    const {username,password,role}=req.body;

    try{
        const hashed_password=await bcrypt.hash(password,10);
        await pool.query(
            "insert into users(username,password,role) values (?,?,?)",[username,hashed_password,role || "OUTSIDE"]
        );

        res.json({
            message:"signedup"
        });
    }
   catch(err){

          res.status(500).json({error:err.message});
   }    
}

async function signin(req,res){
    const {username,password}=req.body;
    
    try{
      const [rows]=  await pool.query(
            "select * from users where username=?",[username]
        );
    if(rows.length==0){
       return res.status(401).json({message:"Incorrect Credentials"});
    }
    const user=rows[0];

    const matched=await bcrypt.compare(password,user.password);
    if(matched){
        const token=jwt.sign({
            user_id:user.user_id,
             role: user.role.toLowerCase(),
            department_id: user.department_id
        },jwt_secret);
        res.status(200).json({message:"user signed in",token:token});
    }
    else{

        return res.status(401).json({message:"Incorrect Credentials"});
    }
    }catch(err){
        res.status(500).json({message:err.message});
    }


}



async function getUsers(req,res){

try{

const [rows] =await pool.query(

`

select

user_id,

username,

role,

department_id,

is_active

from users 
`);


res.json(rows);

}

catch(err){res.status(500).json({message:"server error"});

}

}


async function updateUser(req,res){

try{

const id =req.params.id;


const updatedBy =req.user.user_id;


await pool.query(

`
update users

set

username=?,

role=?,

department_id=?,

is_active=?,

updated_by=?

where

user_id=?

`,[req.body.username,req.body.role,req.body.department_id,req.body.is_active,updatedBy,id]);


res.json({message:"user updated"});

}

catch(err){

res.status(500).json({message:"server error"});

}

}




async function deactivateUser(req,res){

try{

await pool.query(

`

update users

set

is_active=false,

updated_by=?

where

user_id=?

`,[req.user.user_id,req.params.id]);


res.json({message:"user deactivated"});

}

catch(err){

res.status(500).json({message:"server error"});

}

}




async function createUser(req,res){

try{

const {username,password,role,department_id}=req.body;


const created_by =req.user.user_id;


await pool.query(
`
insert into users(

username,

role,

department_id,

created_by

)

values(?,?,?,?)`,[username,role,department_id,created_by]);


res.json({message:"user created"});

}

catch(err){

res.status(500).json({message:"server error"});

}

}


async function activateUser(req,res){

try{

await pool.query(

`
UPDATE users
SET
is_active = true,
updated_by = ?
WHERE user_id = ?
`,

[req.user.user_id, req.params.id]

);

res.json({message:"user activated"});

}

catch(err){

 console.log(err);
    res.status(500).json({message:err.message});

}

}



async function getProfile(req,res){

try{

const userId=req.user.user_id;

const [[user]]=await pool.query(

`
SELECT

u.user_id,
u.username,
u.name,
u.role,
u.department_id,
d.department_name

FROM users u

LEFT JOIN departments d
ON u.department_id = d.department_id

WHERE u.user_id = ?
`,

[userId]

);

if(!user){

return res.status(404).json({
message:"User not found"
});

}

const [[stats]]=await pool.query(

`
SELECT

(
SELECT COUNT(*)
FROM notification_master
WHERE department_id = ?
) notifications,

(
SELECT COUNT(*)
FROM tickets
WHERE assigned_department = ?
) tickets,

(
SELECT COUNT(*)
FROM tickets t
JOIN status_master sm
ON t.status_id = sm.status_id
WHERE
t.assigned_department = ?
AND LOWER(sm.status_name) <> 'closed'
) pending

`,

[
user.department_id,
user.department_id,
user.department_id
]

);

res.json({

...user,

stats

});

}

catch(err){

console.log(err);

res.status(500).json({
message: err.message
});

}
}




module.exports={signup,signin,getUsers,updateUser,deactivateUser,
    createUser,activateUser,getProfile};
