const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  securityMiddleware,
  permissionsPolicy,
} = require("./middlewares/security");

const { loginLimiter } = require("./middlewares/rateLimiter");

const { userRouter } = require("./routes/user");
const { notificationRouter } = require("./routes/notification");
const { ticketRouter } = require("./routes/ticket");
const { departmentRouter } = require("./routes/department");
const { dashboardRouter } = require("./routes/dashboard");
const { activityRouter } = require("./routes/activity");

const app = express();
const server = http.createServer(app);

/* =====================================================
   Security
===================================================== */

app.disable("x-powered-by");

app.use(securityMiddleware);
app.use(permissionsPolicy);

/* =====================================================
   CORS
===================================================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

/* =====================================================
   Login Rate Limiter
===================================================== */

app.use("/api/signin", loginLimiter);

/* =====================================================
   Cache-Control
===================================================== */

const noStore = (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );

  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  next();
};

app.use("/api/signin", noStore);
app.use("/api/profile", noStore);
app.use("/api/ticket", noStore);
app.use("/api/tickets", noStore);
app.use("/api/notification", noStore);
app.use("/api/notifications", noStore);
app.use("/api/activity", noStore);

/* =====================================================
   Socket.IO
===================================================== */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  try {
    const token = socket.handshake.auth.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.join(`department-${decoded.department_id}`);

    socket.on("join-ticket", (ticketId) => {
      socket.join(`ticket-${ticketId}`);
      console.log(`Socket joined ticket-${ticketId}`);
    });

    console.log(
      `User ${decoded.user_id} joined department-${decoded.department_id}`,
    );
  } catch (err) {
    console.error(err);
  }
});

/* =====================================================
   Routes
===================================================== */

app.use("/api", userRouter);
app.use("/api", ticketRouter);
app.use("/api", notificationRouter);
app.use("/api", departmentRouter);
app.use("/api", dashboardRouter);
app.use("/api", activityRouter);

/* =====================================================
   Health Check
===================================================== */

app.get("/", (req, res) => {
  res.send("API Running");
});

/* =====================================================
   Server
===================================================== */

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
