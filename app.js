import express from "express";
import dotenv from "dotenv";
import user from "./routers/user.js";
import category from "./routers/category.js";
import groups from "./routers/groups.js";
import events from "./routers/events.js";
import email from "./data/sendEmail.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World v1.8.5");
});

app.use(user);
app.use(category);
app.use(groups);
app.use(events);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});