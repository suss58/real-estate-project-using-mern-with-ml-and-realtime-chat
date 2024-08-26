
// import express from "express";
// import mongoose from "mongoose";
// import "dotenv/config";
// import userRouter from "./routes/user.route.js";
// import auth from "./routes/auth.route.js";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import postRouter from "./routes/post.route.js";
// import messageRouter from "./routes/message.route.js";
// import conversationRoute from "./routes/conversation.route.js";
// import notificatonRoute from "./routes/notification.route.js";

// import path from "path";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// const expressServer = http.createServer(app);


// //Handling CORS origin
// if (process.env.NODE_ENV === "local") {
//   app.use(
//     cors({
//       origin: "http://localhost:5173",
//       credentials: true,
//     })
//   );
// } else {
//   app.use(
//     cors({
//       origin:"*",
//       credentials: true,
//       methods:["GET","POST","PUT","PATCH","DELETE"]
//     })
//   );
// }

// const PORT = process.env.PORT || 3000;

// // Connect to the database
// main().catch((err) => console.log(err));
// async function main() {
//   await mongoose.connect(process.env.MONGO);
//   console.log("Database connected");
// }

// // Starting the server
// expressServer.listen(PORT, () => {
//   console.log(`Server running at port ${PORT}`);
// });

// // Routes
// app.use("/api/users", userRouter);
// app.use("/api/auth", auth);
// app.use("/api/posts", postRouter);
// app.use("/api/message", messageRouter);
// app.use("/api/conversation", conversationRoute);
// app.use("/api/notification", notificatonRoute);







// //----------------------------Handling Socket.io ------------------------------//

// //Handling CORS origin
// export const io = new Server(expressServer, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//     ],
//     credentials: true,
//   },
// });






// io.on("connection", (socket) => {
//   // console.log(`socket connected with ${socket.id}`);

//   //=======Messaging Feature Here ======//
//   socket.on("join_room", (chatId) => {
//     socket.join(chatId);
//   });

//   socket.on("send_message", (data) => {
//     socket.to(data.chatId).emit("receive_message", data);
//     socket.broadcast.emit(`${data.to}`, data);
//   });

//   socket.on("disconnect", (data) => {
//     console.log(`user disconnected successfully ${socket.id}`);
//   });
// });




// export default ()=>expressServer;





import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import userRouter from "./routes/user.route.js";
import auth from "./routes/auth.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import postRouter from "./routes/post.route.js";
import messageRouter from "./routes/message.route.js";
import conversationRoute from "./routes/conversation.route.js";
import notificatonRoute from "./routes/notification.route.js";
import winston from 'winston';


import path from "path";
import http from "http";
import { Server } from "socket.io";
import { exec } from 'child_process';


const app = express();
app.use(express.json());
app.use(cookieParser());

const expressServer = http.createServer(app);


//Handling CORS origin
if (process.env.NODE_ENV === "local") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin:"*",
      credentials: true,
      methods:["GET","POST","PUT","PATCH","DELETE"]
    })
  );
}

const PORT = process.env.PORT || 3000;

// Connect to the database
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(process.env.MONGO);
  console.log("Database connected");
}

// Starting the server
expressServer.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/auth", auth);
app.use("/api/posts", postRouter);
app.use("/api/message", messageRouter);
app.use("/api/conversation", conversationRoute);
app.use("/api/notification", notificatonRoute);



// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
  ),
  transports: [
      new winston.transports.File({ filename: 'application.log' }),
      new winston.transports.Console()
  ]
});

// Prediction route
app.post('/api/predict', (req, res) => {
  const data = req.body;

  // Log incoming data
  console.log('Received data for prediction');
  logger.info('Received data for prediction:', { data });

  if (!data) {
      logger.error('No data provided');
      return res.status(400).json({ error: 'No data provided' });
  }

  const dataString = JSON.stringify(data);

  exec(`python3 /home/sushil/Downloads/GharKhoji123/api/utils/predict.py '${dataString}'`, (error, stdout, stderr) => {
      if (error) {
          logger.error(`exec error: ${error.message}`);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (stderr) {
          logger.error(`stderr: ${stderr}`);
          return res.status(500).json({ error: 'Error processing data' });
      }

      const prediction = parseFloat(stdout.trim());
      logger.info('Prediction result:', { prediction });
      res.json({ prediction });
      console.log('succesfull',prediction);
  });
});






//----------------------------Handling Socket.io ------------------------------//

//Handling CORS origin
export const io = new Server(expressServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://property-sell.vercel.app",
      "https://property-sell-gjz462ec1-emoncr.vercel.app/",
    ],
    credentials: true,
  },
});






io.on("connection", (socket) => {
  console.log(`socket connected with ${socket.id}`);

  //=======Messaging Feature Here ======//
  socket.on("join_room", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (data) => {
    socket.to(data.chatId).emit("receive_message", data);
    socket.broadcast.emit(`${data.to}`, data);
  });

  socket.on("disconnect", (data) => {
    console.log(`user disconnected successfully ${socket.id}`);
  });
});




export default ()=>expressServer;







