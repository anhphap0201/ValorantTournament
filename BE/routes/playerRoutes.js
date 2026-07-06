const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController.js");

router.get("/", playerController.getAll);
router.get("/:id", playerController.getById);
router.post("/", playerController.create);
router.put("/:id", playerController.update);
router.delete("/:id", playerController.delete);

// Route for 5-member team registration
router.post("/register-team", playerController.registerTeam);

module.exports = router;
