import express from "express";
import dotenv from "dotenv";
import user from "./routers/users.js";
import group from "./routers/groups.js"
import event from "./routers/events.js"
import category from "./routers/categories.js"
// import { use } from "express/lib/application";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Proyecto final");
});

app.use('/user', user);
app.use('/group', group);
app.use('/event', event);
app.use('/category', category);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});