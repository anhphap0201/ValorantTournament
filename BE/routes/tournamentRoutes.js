const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController.js");

router.get("/", tournamentController.getAll);
router.get("/:id", tournamentController.getById);
router.post("/", tournamentController.create);
router.put("/:id", tournamentController.update);
router.delete("/:id", tournamentController.delete);

module.exports = router;
