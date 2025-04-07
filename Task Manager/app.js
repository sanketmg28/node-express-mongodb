const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
require('dotenv').config();
const connectDB = require('./config/db');

//routes....
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
    res.redirect("/tasks");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

