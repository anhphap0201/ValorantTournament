const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");

router.get("/", userController.getAll);
router.post("/", userController.create);
router.delete("/:id", userController.delete);
router.put("/:id/role", userController.updateRole);

module.exports = router;
