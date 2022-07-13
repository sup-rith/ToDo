const express = require('express');
const router = express.Router();
const ToDo = require('../models/ToDo');
const requiresAuth = require('../middleware/permissions');
const validateToDoInput = require('../validation/toDoValidation');

router.get("/test", (req, res) => {
    res.send("working todo's getroute")
});

router.post("/new", requiresAuth,  async (req, res) => {

    //Check for errors
    const {errors, isValid} = validateToDoInput(req.body);
    if(!isValid) {
        return res.status(400).json({error: errors});
    }

    try {
        const newToDo = new ToDo({
            user: req.user._id,
            content: req.body.content,
            complete: false
        });

        await newToDo.save();
        return res.json(newToDo);


    } catch (err) {
        console.log(err);
        return res.status(500).send(err.message);
    }
});

router.get("/current", requiresAuth, async (req, res) => {
    try{
        const completeToDos = await ToDo.find({
            user: req.user._id,
            complete: true
        }).sort({completedAt: -1});

        const incompleteToDos = await ToDo.find({
            user: req.user._id,
            complete: false
        }).sort({createdAt: -1});

        return res.json({incomplete: incompleteToDos, complete: completeToDos});


    } catch (err) {
        console.log(err);
        return res.status(500).send(err.message);
    }
});

module.exports = router;