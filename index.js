import express from "express";
import userRouter from "./routers/user_router.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});
app.use('/api/auth',userRouter);

app.listen(5000, () => {
  console.log("listening on port ");
});
