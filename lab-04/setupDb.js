const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("users.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);

  const users = [
    { username: "alice_smith", name: "Alice Smith", password: "Alice@1234" },
    { username: "bob_jones", name: "Bob Jones", password: "Bob#5678" },
    { username: "carol_white", name: "Carol White", password: "Carol@9012" },
    { username: "david_brown", name: "David Brown", password: "David#3456" },
    { username: "eve_taylor", name: "Eve Taylor", password: "Eve@7890" },
    { username: "frank_moore", name: "Frank Moore", password: "Frank#2345" },
    { username: "grace_lee", name: "Grace Lee", password: "Grace@6789" },
    { username: "henry_clark", name: "Henry Clark", password: "Henry#0123" },
    { username: "iris_hall", name: "Iris Hall", password: "Iris@4567" },
    { username: "jack_young", name: "Jack Young", password: "Jack#8901" },
  ];

  const saltRounds = 10;

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO user (username, name, password) VALUES (?, ?, ?)"
  );

  let inserted = 0;
  for (const u of users) {
    const hashedPassword = bcrypt.hashSync(u.password, saltRounds);
    stmt.run(u.username, u.name, hashedPassword);
    inserted++;
  }

  stmt.finalize();

  console.log(`Database setup complete. ${inserted} users processed.`);
  db.close();
});
