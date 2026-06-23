
const express = require("express");

const cors = require("cors");

const app = express();

const {userRouter} =require("./routes/user.js");

const {notificationRouter} =require("./routes/notification.js");

const {ticketRouter} =require("./routes/ticket.js");


app.use(express.json());


app.use(cors());


// routes

app.use("/api",userRouter);

app.use("/api",ticketRouter);

app.use("/api",notificationRouter);


app.get(
"/",(req,res)=>{res.send("API Running");}
);


app.listen(
3000,()=>{console.log("Server running on port 3000");}
);
