const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController.js");
const matchController = require("../controllers/matchController.js");

router.get("/", tournamentController.getAll);
router.get("/:id", tournamentController.getById);
router.post("/", tournamentController.create);
router.put("/:id", tournamentController.update);
router.delete("/:id", tournamentController.delete);

// Matches & Standings Routes
router.get("/:id/matches", matchController.getMatchesByTournament);
router.post("/:id/schedule", matchController.generateSchedule);
router.post("/:id/finalize", matchController.finalizeStandings);
router.put("/matches/:matchId", matchController.updateMatchScore);
router.post("/matches/:matchId/winner", matchController.selectPlayoffWinner);
router.put("/teams/:teamId/standings", matchController.updateTeamPoints);

module.exports = router;
