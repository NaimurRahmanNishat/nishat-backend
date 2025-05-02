const express = require("express");
const { userStats, adminStats } = require("./stats.controller");

const router = express.Router();

// user stats
router.get("/user-stats/:email", userStats);

// admin stats
router.get("/admin-stats", adminStats);

module.exports = router;