import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import http from "http";
import { createServer } from "http";
import userRouter from './routers/user_router.js';
// import adminRouter from './routers/admin.route.js';
import organizationRouter from './routers/organization.route.js';
import courseRouter from './routers/course.route.js';
import { ChatMessageModel } from './models/chatmessage.schema.js';
import chatRouter from './routers/chatRoute.js'
import cookieParser from "cookie-parser";
import { ExpressPeerServer } from 'peer';



// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
 cors: {
 origin: "*",
 },
});

app.use(express.json());
const usersInRoom = {}; 




io.on("connection", (socket) => {
   console.log("User connected:", socket.id);
  
   // Join a specific room
   socket.on("joinRoom", (room) => {
   socket.join(room);
   console.log(`${socket.id} joined room: ${room}`);
  
   // Track users in the room
   if (!usersInRoom[room]) {
   usersInRoom[room] = new Set();
   }
   usersInRoom[room].add(socket.id);
  
   // Notify room of user count
   const userCount = usersInRoom[room].size;
   io.to(room).emit("userCount", userCount);
   socket.to(room).emit("notification",` A user has joined the room. Users: ${userCount}`);
   });
  
   // Handle leaving the room
   socket.on("disconnect", () => {
   for (const room of Object.keys(usersInRoom)) {
   if (usersInRoom[room].has(socket.id)) {
   usersInRoom[room].delete(socket.id);
   const userCount = usersInRoom[room].size;
  
   // Notify room of updated user count
   io.to(room).emit("userCount", userCount);
   console.log(`${socket.id} left room: ${room}, Users left: ${userCount}`);
   }
   }
   });
  
   // Handle incoming messages
   socket.on("message", ({ room, name, text }) => {
   console.log(`Message from ${name} in room ${room}: ${text}`);
   const newMessage = { name, text };
   io.to(room).emit("message", newMessage); // Emit the message to the room
   });
  });
  
  











// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.use('/api/auth', userRouter);
app.use('/api/organization', organizationRouter);
app.use('/api/course', courseRouter);
app.use('/api/chat', chatRouter);

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/vision")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});
export{io}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));