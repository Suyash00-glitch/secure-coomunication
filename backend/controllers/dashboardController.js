const pool =require("../db.js");


async function getStats(req,res){

try{

const [users]=await pool.query(

`

select

count(*) total

from users

where is_active = TRUE

`

);


const [departments]=await pool.query(

`

select

count(*) total

from departments

`

);


const [tickets]=await pool.query(

`

select

count(*) total

from tickets

`

);


const [open]=await pool.query(

`

select

count(*) total

from tickets

where

status_id=1

`

);


const [closed]=await pool.query(

`

select

count(*) total

from tickets

where

status_id=2

`

);


const [ notifications] = await pool.query(

`

select count(*) total

from notifications

`

);


res.json({

totalUsers:users[0].total,

totalDepartments:departments[0].total,

totalTickets:tickets[0].total,

openTickets:open[0].total,

closedTickets:closed[0].total,

totalNotifications:notifications[0].total
});

}

catch(err){

res.status(500).json({message:"server error"});

}

}


module.exports={

getStats

};