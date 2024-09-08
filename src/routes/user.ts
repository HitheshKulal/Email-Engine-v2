import express from "express";
import {
    loginUser,
    signupUser,
    logoutUser,
} from "../controllers/user.js"

const router = express.Router();

// GET request to render the signup page
router.get("/signup", (req, res) => {
    res.render("signup");
});

// GET request to render the login page
router.get("/login", (req, res) => {
    res.render("login");
});


// POST request to handle signup logic
router.post("/signup", signupUser);

// POST request to handle login logic
router.post("/login", loginUser);

router.post("/logout", logoutUser);



export default router;
