const express = require("express");
const router = express.Router();

const getUserRoute = require("./getUser");

router.use(getUserRoute);

module.exports = router;
