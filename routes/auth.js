const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const validateRegisterInput = require('../validation/registerValidation');
const jwt = require('jsonwebtoken');
const requiresAuth = require('../middleware/permissions')

router.post("/register", async (req, res) => {

    try{
        //Check for errors
        const {errors, isValid} = validateRegisterInput(req.body);
        if(!isValid) {
            return res.status(400).json({error: errors});
        }

        //Check for existing user
        const existingEmail = await User.findOne({email: new RegExp("^" + req.body.email + "$", "i")});
        if(existingEmail) {
            return res.status(400).json({error: "There is already a user with that email"})
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        //Create new user
        const newUser = new User({
            email: req.body.email,
            password: hashedPassword,
            name: req.body.name,
        });

        //save and return user
        const savedUser = await newUser.save();

        const payload = {userId: savedUser._id};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })
        res.cookie("access-token", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        const userToReturn = {...savedUser._doc};
        delete userToReturn.password;

        return res.json(userToReturn);
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

router.post("/login", async (req, res) => {
    try {
        //check for user
        const user = await User.findOne({
            email: new RegExp("^" + req.body.email + "$", "i")
        })

        //check if email exists in db
        if(!user) {
            return res.status(400).json({error: "No user with that email exists"});
        }
        
        //check if passwords match
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if(!passwordMatch) {
            return res.status(400).json({error: "Incorrect password"});
        }


        const payload = {userId: user._id};
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })
        res.cookie("access-token", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });

        const userToReturn = {...user._doc}
        delete userToReturn.password;

        return res.json({
            token: token,
            user: userToReturn
        });

    } catch (err) {
        console.log(err);
        return res.status(500).send(err.message);
    } 

});

router.get('/current',requiresAuth, (req, res) => {
    if(!req.user){
        return res.status(401).send("Unauthorized");
    }
    return res.json(req.user);
})

router.put('/logout', requiresAuth, async (req, res) => {
    try{
        res.clearCookie("access-token");
        return res.json({success: true});
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;