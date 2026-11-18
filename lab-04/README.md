# Lab 04 — Registration, Login and JWT

---

## Student Details

| Field               | Details                              |
|---------------------|--------------------------------------|
| **Student Name**    | KONDAVENI VISHNUVARDHAN              |
| **Reg. Number**     | 252U1R5079                           |
| **Class & Section** | 313 AI DE 2B                         |
| **Study Level**     | UG                                   |
| **Year & Term**     | 2 & 2                                |
| **Subject**         | Backend Development Fundamentals     |
| **Faculty**         | Mr Yugandhar Gurjalwar               |
| **Assessment**      | LAB REPORT - 4                       |
| **Submission Date** | 14/11/2026                           |

---

## Objective

To implement a secure user authentication system using Node.js and Express.js that includes:

- User **registration** with bcrypt-hashed passwords stored in SQLite
- User **login** with credential verification and JWT token generation
- Proper **HTTP status codes** and **JSON responses** for all success and failure cases
- **Parameterized SQL queries** to prevent SQL injection
- Testing all endpoints using Postman

---

## Technologies Used

| Technology        | Version  | Purpose                                      |
|-------------------|----------|----------------------------------------------|
| Node.js           | v24.16.0 | JavaScript runtime environment               |
| Express.js        | ^4.18.2  | Web framework for building REST APIs         |
| SQLite            | —        | Lightweight embedded relational database     |
| sqlite3 (npm)     | ^5.1.6   | Node.js driver for SQLite                    |
| bcrypt            | ^5.1.1   | Password hashing with salt rounds            |
| jsonwebtoken      | ^9.0.2   | JWT generation and verification              |
| Postman           | —        | API testing tool                             |

---

## Folder Structure

```
lab-04/
├── app.js              # Main Express application with /register/ and /login/ routes
├── setupDb.js          # Database initialization and seeding script
├── users.db            # SQLite database file (auto-generated)
├── package.json        # Project metadata and dependencies
├── .gitignore          # Ignores node_modules/, *.db, .env
├── README.md           # This lab report
└── screenshots/
    ├── 01_login_success.png
    ├── 02_login_invalid_password.png
    ├── 03_login_user_not_found.png
    ├── 04_register_success.png
    ├── 05_register_duplicate.png
    ├── 06_register_short_password.png
    ├── 07_register_missing_fields.png
    ├── 08_login_missing_fields.png
    └── 09_sqlite_users_table.png
```

---

## Database Design

### Table: `user`

| Column     | Type    | Constraints              | Description                        |
|------------|---------|--------------------------|-------------------------------------|
| `id`       | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique row identifier             |
| `username` | TEXT    | UNIQUE, NOT NULL         | Unique login identifier             |
| `name`     | TEXT    | NOT NULL                 | Full display name of the user       |
| `password` | TEXT    | NOT NULL                 | bcrypt-hashed password (10 rounds)  |

### Pre-seeded Users (10 sample users)

| # | Username       | Name           | Password (plain)  |
|---|----------------|----------------|-------------------|
| 1 | alice_smith    | Alice Smith    | Alice@1234        |
| 2 | bob_jones      | Bob Jones      | Bob#5678          |
| 3 | carol_white    | Carol White    | Carol@9012        |
| 4 | david_brown    | David Brown    | David#3456        |
| 5 | eve_taylor     | Eve Taylor     | Eve@7890          |
| 6 | frank_moore    | Frank Moore    | Frank#2345        |
| 7 | grace_lee      | Grace Lee      | Grace@6789        |
| 8 | henry_clark    | Henry Clark    | Henry#0123        |
| 9 | iris_hall      | Iris Hall      | Iris@4567         |
|10 | jack_young     | Jack Young     | Jack#8901         |

> All passwords are stored as bcrypt hashes (10 salt rounds) — never in plain text.

---

## Installation and Running

### Prerequisites

- Node.js v18 or higher
- npm

### Steps

```bash
# 1. Navigate to the lab-04 directory
cd lab-04

# 2. Install dependencies
npm install

# 3. Set up the database and seed 10 users
node setupDb.js

# 4. Start the server
node app.js
```

The server will start at `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint      | Description                                      | Success Code | Failure Code |
|--------|---------------|--------------------------------------------------|--------------|--------------|
| POST   | `/register/`  | Register a new user with hashed password         | 200          | 400          |
| POST   | `/login/`     | Authenticate user and return JWT token           | 200          | 400          |

### POST `/register/`

**Request Body:**
```json
{
  "username": "new_user",
  "name": "New User",
  "password": "SecurePass@123"
}
```

**Success Response (200):**
```json
{
  "message": "User created successfully"
}
```

**Failure Responses (400):**
```json
{ "error": "Username, name and password are required" }
{ "error": "Password is too short" }
{ "error": "User already exists" }
```

---

### POST `/login/`

**Request Body:**
```json
{
  "username": "alice_smith",
  "password": "Alice@1234"
}
```

**Success Response (200):**
```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlX3NtaXRoIiwiaWF0IjoxNzk1MDE5MDIxfQ.vbPsKLkPFp0KZiLv19QG-VHCdgC9dXeq5JClNiOA87Y"
}
```

**Failure Responses (400):**
```json
{ "error": "Username and password are required" }
{ "error": "Invalid user" }
{ "error": "Invalid password" }
```

---

## Complete Source Code

### `app.js`

```javascript
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
```

---

### `setupDb.js`

```javascript
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
```

---

### `package.json`

```json
{
  "name": "lab-04-registration-login-jwt",
  "version": "1.0.0",
  "description": "Registration, Login and JWT Authentication using Node.js, Express, SQLite, bcrypt and jsonwebtoken",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "setup": "node setupDb.js"
  },
  "keywords": ["nodejs", "express", "sqlite", "jwt", "bcrypt", "authentication"],
  "author": "KONDAVENI VISHNUVARDHAN",
  "license": "ISC",
  "dependencies": {
    "bcrypt": "^5.1.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "sqlite3": "^5.1.6"
  }
}
```

---

### `.gitignore`

```
node_modules/
*.db
.env
```

---

## Screenshots

### 1. POST /login/ — Successful Login (JWT Token Returned)

![POST /login/ Success](screenshots/01_login_success.png)

---

### 2. POST /login/ — Invalid Password

![POST /login/ Invalid Password](screenshots/02_login_invalid_password.png)

---

### 3. POST /login/ — User Not Found

![POST /login/ User Not Found](screenshots/03_login_user_not_found.png)

---

### 4. POST /register/ — Successful Registration

![POST /register/ Success](screenshots/04_register_success.png)

---

### 5. POST /register/ — Duplicate Username

![POST /register/ Duplicate](screenshots/05_register_duplicate.png)

---

### 6. POST /register/ — Password Too Short

![POST /register/ Short Password](screenshots/06_register_short_password.png)

---

### 7. POST /register/ — Missing Fields

![POST /register/ Missing Fields](screenshots/07_register_missing_fields.png)

---

### 8. POST /login/ — Missing Fields

![POST /login/ Missing Fields](screenshots/08_login_missing_fields.png)

---

### 9. SQLite CLI — Database Verification

![SQLite CLI Verification](screenshots/09_sqlite_users_table.png)

---

## JWT (JSON Web Token) Explanation

### What is JWT?

JSON Web Token (JWT) is an open standard (RFC 7519) for securely transmitting information between parties as a compact, URL-safe JSON object. It is digitally signed using a secret key (HMAC-SHA256) or a public/private key pair (RSA/ECDSA).

### JWT Structure

A JWT consists of three Base64URL-encoded parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header
.eyJ1c2VybmFtZSI6ImFsaWNlX3NtaXRoIiwiaWF0IjoxNzk1MDE5MDIxfQ   ← Payload
.vbPsKLkPFp0KZiLv19QG-VHCdgC9dXeq5JClNiOA87Y   ← Signature
```

| Part          | Content                                               |
|---------------|-------------------------------------------------------|
| **Header**    | `{ "alg": "HS256", "typ": "JWT" }`                   |
| **Payload**   | `{ "username": "alice_smith", "iat": 1795019021 }`   |
| **Signature** | HMAC-SHA256 of header + payload using the secret key |

### How JWT Works in This Lab

1. Client sends `username` and `password` to `POST /login/`
2. Server looks up the user in the database using a parameterized query
3. Server verifies the password against the bcrypt hash using `bcrypt.compareSync()`
4. On success, server creates a payload containing only `{ username }` and signs it using `jwt.sign(payload, JWT_SECRET)`
5. The signed JWT token is returned to the client
6. The client stores this token and sends it in subsequent protected requests

### Why Only Username in Payload?

The JWT payload in this lab contains **only the `username`** field. This is intentional:
- Minimizes the token size
- Avoids exposing sensitive data (like passwords or email)
- The username alone is sufficient to identify the authenticated user in future requests
- Sensitive data like passwords must never be stored in JWT

### Security Considerations

| Practice                    | Implementation in Lab                          |
|-----------------------------|------------------------------------------------|
| Password hashing            | `bcrypt.hashSync(password, 10)` before storage |
| Parameterized SQL queries   | All DB queries use `?` placeholders            |
| No plain-text passwords     | Passwords never stored or returned in plain text |
| JWT for stateless auth      | No server-side sessions needed                 |

---

## Viva Questions and Answers

**Q1. What is the purpose of bcrypt in this lab?**

A: bcrypt is used to hash user passwords before storing them in the database. It applies a one-way cryptographic hash with a configurable cost factor (salt rounds = 10), making it computationally expensive to brute-force. Even if the database is compromised, the actual passwords cannot be easily recovered.

---

**Q2. What is the difference between `bcrypt.hashSync()` and `bcrypt.compareSync()`?**

A: `bcrypt.hashSync(password, saltRounds)` takes a plain-text password and returns a hash string. `bcrypt.compareSync(plainPassword, hash)` takes a plain-text password and a stored hash and returns `true` if they match, `false` otherwise. The comparison is done in constant time to prevent timing attacks.

---

**Q3. Why do we use parameterized queries instead of string concatenation in SQL?**

A: String concatenation in SQL queries opens the door to SQL injection attacks, where malicious input can alter the query's structure (e.g., `username = '' OR '1'='1'`). Parameterized queries (using `?` placeholders) ensure that user input is always treated as data, never as part of the SQL command.

---

**Q4. What HTTP status code is returned on successful registration and login? Why not 201?**

A: This lab returns `200 OK` for both successful registration and login. While `201 Created` is semantically more correct for resource creation (registration), many NxtWave-style assignments and industry APIs use `200 OK` for simplicity, especially when the response body already clearly communicates success.

---

**Q5. What is the JWT payload in this lab, and why is it minimal?**

A: The JWT payload contains only `{ username: "alice_smith" }` plus the standard `iat` (issued at) claim added automatically by the `jsonwebtoken` library. It is intentionally minimal to avoid exposing sensitive user data in the token, which is Base64-encoded (not encrypted) and can be decoded by anyone who has the token.

---

**Q6. What happens if the same username tries to register twice?**

A: The server first queries the database with `SELECT * FROM user WHERE username = ?`. If a row is found, it immediately returns `400 Bad Request` with `{ "error": "User already exists" }` without attempting to insert. Additionally, the `username` column has a `UNIQUE` constraint at the database level as a secondary safeguard.

---

**Q7. What is the role of `JWT_SECRET` and what happens if it is exposed?**

A: `JWT_SECRET` is the secret key used to sign the JWT. The signature ensures the token was not tampered with. If the secret is exposed, an attacker can forge valid JWT tokens for any username without knowing the actual password. In production, this secret must be stored in environment variables (`.env` file) and never hardcoded.

---

**Q8. What is `db.serialize()` in `setupDb.js` and why is it used?**

A: `db.serialize()` ensures that all SQLite operations inside it run sequentially (one after another) rather than in parallel. The `sqlite3` package is asynchronous by default. Without `serialize()`, the `INSERT` statements might execute before the `CREATE TABLE` completes, causing errors.

---

## Debugging Notes

| Issue Encountered                                   | Root Cause                                       | Solution Applied                                      |
|------------------------------------------------------|--------------------------------------------------|-------------------------------------------------------|
| `better-sqlite3` failed to build on Windows          | Native C++ addon requires MSVC with C++20 support but build tools overrode to C++17 | Switched to `sqlite3` npm package which provides prebuilt binaries |
| `&&` not recognized in PowerShell                   | PowerShell uses `;` as the statement separator, not `&&` | Replaced `&&` with `;` in all PowerShell commands    |
| bcrypt hashing is slow in test scripts              | bcrypt with 10 salt rounds is intentionally CPU-intensive | Used background job + delay approach for integration tests |
| `better-sqlite3` node_modules cleanup EPERM error   | Build artifacts locked by MSBuild process        | Used `Remove-Item -Force -Recurse` after process ended |

---

## Conclusion

Lab 04 successfully demonstrates a complete user authentication backend using Node.js, Express.js, SQLite, bcrypt, and JSON Web Tokens. The implementation covers:

- **Secure password storage** using bcrypt with 10 salt rounds
- **User registration** with duplicate-username detection, field validation, and password-length enforcement
- **User login** with database lookup, bcrypt comparison, and JWT generation with a minimal payload (username only)
- **Parameterized SQL queries** throughout to prevent SQL injection
- **Correct HTTP status codes** (200 for success, 400 for client errors, 500 for server errors)
- **Realistic API testing** with all 8 test cases verified — 2 success cases and 6 failure cases

This lab establishes the foundational authentication pattern used in production Node.js applications, with JWT enabling stateless, scalable session management without server-side session storage.
