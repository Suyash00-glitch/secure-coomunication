const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { jwt_secret } = require("./config.js");

const app = express();

const server = http.createServer(app);

// Three-port dev architecture: Admin (5173), Internal (5174), External
// (5175) are three separate Vite origins that all connect to this same
// shared Socket.IO server. Only the CORS allowlist changes here — JWT
// handshake auth, rooms, and all event names/emits/listeners below are
// untouched.
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175"
        ],
        methods: ["GET", "POST", "PATCH"]
    }
});

app.use(cors());
app.use(express.json());

app.set("io", io);


const jwt = require("jsonwebtoken");

io.on("connection", (socket) => {

    try {

        const token = socket.handshake.auth.token;

        const decoded = jwt.verify(
            token,
            jwt_secret
        );

        socket.join(`department-${decoded.department_id}`);
        console.log(socket.rooms);


        socket.on("join-ticket", (ticketId) => {
    socket.join(`ticket-${ticketId}`);
    console.log(`Socket joined ticket-${ticketId}`);
});


console.log(
    `User ${decoded.user_id} joined room department-${decoded.department_id}`
);

    }

    catch(err) {
    console.log(err);
}

});





const {userRouter} =require("./routes/user.js");
const {notificationRouter} =require("./routes/notification.js");
const {ticketRouter} =require("./routes/ticket.js");
const {departmentRouter} =require("./routes/department.js");
const {dashboardRouter} = require("./routes/dashboard.js");
const {activityRouter} = require("./routes/activity.js");




// routes

// NOTE: the previous public `app.use("/uploads", express.static(...))`
// route has been removed. It served every uploaded file with no
// authentication or authorization check at all. All ticket/notification
// attachment access now goes through the authenticated, authorization-checked
// download endpoints instead:
//   GET /api/tickets/:ticketId/attachments/:attachmentId/download
//   GET /api/notifications/:notificationId/attachments/:attachmentId/download
// Nothing else in the project referenced the /uploads URL directly (grep
// confirmed only backend/middlewares/upload.js, which writes files to that
// folder — it doesn't serve them).

app.use("/api",userRouter);
app.use("/api",ticketRouter);
app.use("/api",notificationRouter);
app.use("/api",departmentRouter);
app.use("/api",dashboardRouter);
app.use("/api",activityRouter);

app.get("/",(req,res)=>{res.send("API Running");});


server.listen(3000, () => {
    console.log("Server running on port 3000");
});
