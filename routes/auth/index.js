const express = require("express");
const router = express.Router();

const signinRoute = require("./signin");
const signupRoute = require("./signup");
const signoutRoute = require("./signout");
const tokenRoute = require("./tokens");

router.use(signinRoute);
router.use(signupRoute);
router.use(signoutRoute);
router.use(tokenRoute.router);

module.exports = router;
