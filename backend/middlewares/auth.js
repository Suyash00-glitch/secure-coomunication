const {jwt_secret}=require("../config.js");
const jwt=require("jsonwebtoken");


function auth(req,res,next) {
    const authHeader  = req.headers.authorization;

    if(!authHeader){
        return res.status(401).json({msg:"No token provided"});

    }

    const token = authHeader.split(" ")[1];

    if(!token){
        return res.status(401).json({msg:"No token provided"});
    }
    try{
        const data=jwt.verify(token,jwt_secret);
        req.user=data;
        next();
    }catch(err){
        return res.status(401).json({msg:"invalid token"});
    }
} 



function adminOnly(req,res,next){

if(req.user.role !=="admin"){

return res.status(403).json({msg:"admin only"});

}

next();

}


function internalOnly(req, res, next) {
    
    if (req.user.role !== "secure") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
}



module.exports = {
    auth , adminOnly , internalOnly
};