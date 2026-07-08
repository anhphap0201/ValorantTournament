const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); // Enable CORS so frontend can communicate with endpoints
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import routes
const playerRoutes = require("./routes/playerRoutes.js");
const tournamentRoutes = require("./routes/tournamentRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");

function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();
}
app.use(logger);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Mount CRUD routes
app.use("/api/players", playerRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


app.listen(3000, () => {
  console.log("Server started on port 3000");
});