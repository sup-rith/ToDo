require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

//routes
const authRoute = require('./routes/auth');
const toDosRoute = require('./routes/todos');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/api", (req, res) => {
    res.send("Fullstack app course to-do list");
});


app.use("/api/auth", authRoute);
app.use("/api/todos", toDosRoute);


mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Connected to database");

    app.listen(process.env.PORT, () => {
        console.log("app running on port " + process.env.PORT);
    })
}).catch((err) => {
    console.log(err);
})