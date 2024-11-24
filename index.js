import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from "socket.io";
import bodyParser from 'body-parser';
import http from "http";
import userRouter from './routers/user_router.js';
// import adminRouter from './routers/admin.route.js';
import organizationRouter from './routers/organization.route.js';
import courseRouter from './routers/course.route.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;
const server = http.createServer(app);
const MONGO_URI = process.env.MONGO_URI;
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend's URL in production
    methods: ["GET", "POST"],
  },
});

export { io };

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.use('/api/auth', userRouter);
app.use('/api/organization', organizationRouter);
app.use('/api/course', courseRouter);

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

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
