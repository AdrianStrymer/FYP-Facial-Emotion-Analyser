const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createUser, findUserByUsername } = require("./userModel");

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    return res.status(400).json({ error: "Username exists" });
  }

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }
  
  if (username.length < 3 || username.length > 15) {
    return res.status(400).json({ error: "Username must be 3-15 characters." });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  await createUser(username, password);
  res.json({ message: "User created" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required."})
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

module.exports = router;