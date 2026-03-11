require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connect to database
connectDB();

const authRoutes = require("./routes/authRoutes");
const auditRoutes = require("./routes/auditRoutes");
const chatRoutes = require("./routes/chatRoutes");
const keywordRoutes = require("./routes/keywordRoutes"); // MUST IMPORT IT

const app = express();

app.use(cors());
app.use(express.json());

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/keywords", keywordRoutes); // MUST MOUNT IT

app.get("/", (req, res) => {
  res.send("RankPilot API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});