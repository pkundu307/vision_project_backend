import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.listen(5000, () => {
  console.log("listening on port ");
});
