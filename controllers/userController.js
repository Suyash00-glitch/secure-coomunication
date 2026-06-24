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
    console.log(err);
    res.status(500).json({ error: err.message });
}
}

async function signin(req,res){
    const {username,password}=req.body;
    
    try{
      const [rows]=  await pool.query(
            "select * from users where username=?",[username]
        );
    if(rows.length==0){
       return res.status(401).json({message:"user not found"});
    }
    const user=rows[0];

    const matched=await bcrypt.compare(password,user.password);
    if(matched){
        const token=jwt.sign({
            user_id:user.user_id,
            role:user.role
        },jwt_secret);
        res.status(200).json({message:"user signed in",token:token});
    }
    else{

        return res.status(401).json({message:"not found password mismatch"});
    }
    }catch(err){
        res.status(500).json({message:err.message});
    }


}

module.exports={signup,signin};
