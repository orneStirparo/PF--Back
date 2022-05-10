import express from "express";
import dotenv from "dotenv";
import user from "./routers/users.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Proyecto final");
});

app.use('/user', user);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});