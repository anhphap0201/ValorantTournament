const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/reset-password/request", authController.requestReset);
router.post("/reset-password/reset", authController.resetPassword);

module.exports = router;
