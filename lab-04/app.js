const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database("users.db");
const JWT_SECRET = "my_jwt_secret_key_lab04";

app.post("/register/", (req, res) => {
  const { username, name, password } = req.body;

  if (!username || !name || !password) {
    return res.status(400).json({ error: "Username, name and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password is too short" });
  }

  db.get("SELECT * FROM user WHERE username = ?", [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (row) {
      return res.status(400).json({ error: "User already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    db.run(
      "INSERT INTO user (username, name, password) VALUES (?, ?, ?)",
      [username, name, hashedPassword],
      function (err) {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json({ message: "User created successfully" });
      }
    );
  });
});

app.post("/login/", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  db.get("SELECT * FROM user WHERE username = ?", [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const payload = { username: user.username };
    const jwtToken = jwt.sign(payload, JWT_SECRET);

    res.status(200).json({ jwtToken });
  });
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
