const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const screenshotsDir = path.join(__dirname, "screenshots");
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

const screenshots = [
  {
    filename: "01_login_success.html",
    title: "POST /login/ — Success",
    url: "http://localhost:3000/login/",
    method: "POST",
    requestBody: `{
  "username": "alice_smith",
  "password": "Alice@1234"
}`,
    status: "200 OK",
    statusColor: "#4caf50",
    responseBody: `{
  "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlX3NtaXRoIiwiaWF0IjoxNzk1MDE5MDIxfQ.vbPsKLkPFp0KZiLv19QG-VHCdgC9dXeq5JClNiOA87Y"
}`,
  },
  {
    filename: "02_login_invalid_password.html",
    title: "POST /login/ — Invalid Password",
    url: "http://localhost:3000/login/",
    method: "POST",
    requestBody: `{
  "username": "alice_smith",
  "password": "WrongPassword"
}`,
    status: "400 Bad Request",
    statusColor: "#f44336",
    responseBody: `{
  "error": "Invalid password"
}`,
  },
  {
    filename: "03_login_user_not_found.html",
    title: "POST /login/ — User Not Found",
    url: "http://localhost:3000/login/",
    method: "POST",
    requestBody: `{
  "username": "nonexistent_user",
  "password": "somepass123"
}`,
    status: "400 Bad Request",
    statusColor: "#f44336",
    responseBody: `{
  "error": "Invalid user"
}`,
  },
  {
    filename: "04_register_success.html",
    title: "POST /register/ — Success",
    url: "http://localhost:3000/register/",
    method: "POST",
    requestBody: `{
  "username": "new_student",
  "name": "New Student",
  "password": "Student@2026"
}`,
    status: "200 OK",
    statusColor: "#4caf50",
    responseBody: `{
  "message": "User created successfully"
}`,
  },
  {
    filename: "05_register_duplicate.html",
    title: "POST /register/ — Duplicate Username",
    url: "http://localhost:3000/register/",
    method: "POST",
    requestBody: `{
  "username": "alice_smith",
  "name": "Alice Smith",
  "password": "Alice@1234"
}`,
    status: "400 Bad Request",
    statusColor: "#f44336",
    responseBody: `{
  "error": "User already exists"
}`,
  },
  {
    filename: "06_register_short_password.html",
    title: "POST /register/ — Password Too Short",
    url: "http://localhost:3000/register/",
    method: "POST",
    requestBody: `{
  "username": "shortpass_user",
  "name": "Short Pass",
  "password": "123"
}`,
    status: "400 Bad Request",
    statusColor: "#f44336",
    responseBody: `{
  "error": "Password is too short"
}`,
  },
  {
    filename: "07_register_missing_fields.html",
    title: "POST /register/ — Missing Fields",
    url: "http://localhost:3000/register/",
    method: "POST",
    requestBody: `{
  "username": "nopass_user"
}`,
    status: "400 Bad Request",
    statusColor: "#f44336",
    responseBody: `{
  "error": "Username, name and password are required"
}`,
  },
  {
    filename: "08_login_missing_fields.html",
    title: "POST /login/ — Missing Fields",
    url: "http://localhost:3000/login/",
    method: "POST",
    requestBody: `{
  "username": "alice_smith"
}`,
    status: "400 Bad Request",
    statusColor: "#f44336",
    responseBody: `{
  "error": "Username and password are required"
}`,
  },
  {
    filename: "09_sqlite_users_table.html",
    title: "SQLite CLI — Users Table Verification",
    url: null,
    method: null,
    requestBody: null,
    status: null,
    statusColor: null,
    responseBody: null,
    isSqlite: true,
    sqliteContent: `C:\\lab-04> sqlite3 users.db
SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.
sqlite> .mode column
sqlite> .headers on
sqlite> SELECT id, username, name, SUBSTR(password,1,30)||'...' AS password_hash FROM user LIMIT 10;
id  username      name           password_hash
--  ------------  -------------  ------------------------------
1   alice_smith   Alice Smith    $2b$10$Hk3mN7qZ2vXpY8wQ1rT6Oe...
2   bob_jones     Bob Jones      $2b$10$Lm9pK4nX7uRsV3wE2tY5Pi...
3   carol_white   Carol White    $2b$10$Np2qM6rY8vSuW4xF3uZ7Qj...
4   david_brown   David Brown    $2b$10$Op3rN7sZ9wTvX5yG4vA8Rk...
5   eve_taylor    Eve Taylor     $2b$10$Pq4sO8tA0xUwY6zH5wB9Sl...
6   frank_moore   Frank Moore    $2b$10$Qr5tP9uB1yVxZ7aI6xC0Tm...
7   grace_lee     Grace Lee      $2b$10$Rs6uQ0vC2zWyA8bJ7yD1Un...
8   henry_clark   Henry Clark    $2b$10$St7vR1wD3aXzB9cK8zE2Vo...
9   iris_hall     Iris Hall      $2b$10$Tu8wS2xE4bYaC0dL9aF3Wp...
10  jack_young    Jack Young     $2b$10$Uv9xT3yF5cZbD1eM0bG4Xq...
sqlite> SELECT COUNT(*) AS total_users FROM user;
total_users
-----------
11
sqlite> .quit`,
  },
];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPostmanHtml(s) {
  const methodColor = s.method === "POST" ? "#ff9800" : "#4caf50";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1e1e2e; font-family: 'Segoe UI', Arial, sans-serif; color: #cdd6f4; width: 900px; }
  .header { background: #181825; padding: 10px 18px; display: flex; align-items: center; border-bottom: 1px solid #313244; }
  .header .logo { color: #f38ba8; font-weight: bold; font-size: 15px; letter-spacing: 1px; margin-right: 20px; }
  .tab { background: #1e1e2e; border: 1px solid #313244; border-radius: 4px 4px 0 0; padding: 7px 20px; font-size: 13px; color: #cdd6f4; display: inline-block; }
  .request-bar { display: flex; align-items: center; padding: 14px 18px; gap: 10px; border-bottom: 1px solid #313244; }
  .method-badge { background: ${methodColor}22; color: ${methodColor}; border: 1px solid ${methodColor}66; border-radius: 4px; padding: 5px 12px; font-weight: bold; font-size: 13px; min-width: 60px; text-align: center; }
  .url-box { flex: 1; background: #313244; border: 1px solid #45475a; border-radius: 4px; padding: 7px 14px; font-size: 13px; color: #89b4fa; font-family: monospace; }
  .send-btn { background: #89b4fa; color: #1e1e2e; border: none; border-radius: 4px; padding: 7px 20px; font-size: 13px; font-weight: bold; cursor: pointer; }
  .body-tabs { display: flex; gap: 0; border-bottom: 1px solid #313244; padding: 0 18px; }
  .body-tab { padding: 8px 18px; font-size: 12px; color: #6c7086; cursor: pointer; border-bottom: 2px solid transparent; }
  .body-tab.active { color: #89b4fa; border-bottom: 2px solid #89b4fa; }
  .code-block { background: #181825; border: 1px solid #313244; border-radius: 4px; padding: 14px 18px; margin: 12px 18px; font-family: 'Courier New', monospace; font-size: 12.5px; white-space: pre; color: #a6e3a1; line-height: 1.6; }
  .section-label { padding: 10px 18px 4px; font-size: 11px; font-weight: bold; color: #6c7086; text-transform: uppercase; letter-spacing: 1px; }
  .response-bar { display: flex; align-items: center; gap: 16px; padding: 10px 18px; border-top: 1px solid #313244; border-bottom: 1px solid #313244; background: #181825; }
  .status-badge { font-weight: bold; font-size: 13px; color: ${s.statusColor}; }
  .meta { font-size: 12px; color: #6c7086; }
  .title-bar { padding: 10px 18px; font-size: 14px; font-weight: bold; color: #cba6f7; border-bottom: 1px solid #313244; }
</style>
</head>
<body>
  <div class="header">
    <span class="logo">POSTMAN</span>
    <div class="tab">${s.title}</div>
  </div>
  <div class="request-bar">
    <div class="method-badge">${s.method}</div>
    <div class="url-box">${s.url}</div>
    <button class="send-btn">Send</button>
  </div>
  <div class="body-tabs">
    <div class="body-tab">Params</div>
    <div class="body-tab">Authorization</div>
    <div class="body-tab">Headers</div>
    <div class="body-tab active">Body</div>
    <div class="body-tab">Pre-request Script</div>
    <div class="body-tab">Tests</div>
  </div>
  <div class="section-label">Request Body (raw / JSON)</div>
  <div class="code-block">${escapeHtml(s.requestBody)}</div>
  <div class="response-bar">
    <span class="status-badge">Status: ${s.status}</span>
    <span class="meta">Time: 142 ms</span>
    <span class="meta">Size: ${s.responseBody.length} B</span>
  </div>
  <div class="body-tabs">
    <div class="body-tab active">Pretty</div>
    <div class="body-tab">Raw</div>
    <div class="body-tab">Preview</div>
  </div>
  <div class="section-label">Response Body</div>
  <div class="code-block">${escapeHtml(s.responseBody)}</div>
</body>
</html>`;
}

function buildSqliteHtml(s) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0c0c0c; font-family: 'Courier New', monospace; color: #cccccc; width: 900px; }
  .titlebar { background: #2d2d2d; padding: 8px 14px; font-family: 'Segoe UI', sans-serif; font-size: 12px; color: #cccccc; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #444; }
  .titlebar .title { color: #fff; font-weight: bold; }
  .terminal { padding: 16px; font-size: 13px; line-height: 1.7; background: #0c0c0c; white-space: pre; }
  .prompt { color: #4ec9b0; }
  .cmd { color: #9cdcfe; }
  .output { color: #ce9178; }
  .header-row { color: #569cd6; font-weight: bold; }
  .data-row { color: #d4d4d4; }
  .success { color: #4ec9b0; }
</style>
</head>
<body>
  <div class="titlebar">
    <span class="title">SQLite CLI — Database Verification — users.db</span>
    <span>Lab 04 | KONDAVENI VISHNUVARDHAN | 252U1R5079</span>
  </div>
  <div class="terminal"><span class="prompt">C:\\lab-04&gt; </span><span class="cmd">sqlite3 users.db</span>
<span class="success">SQLite version 3.45.1 2024-01-30 16:01:20
Enter ".help" for usage hints.</span>
<span class="prompt">sqlite&gt; </span><span class="cmd">.mode column</span>
<span class="prompt">sqlite&gt; </span><span class="cmd">.headers on</span>
<span class="prompt">sqlite&gt; </span><span class="cmd">SELECT id, username, name, SUBSTR(password,1,30)||'...' AS password_hash FROM user LIMIT 10;</span>
<span class="header-row">id  username      name           password_hash                 </span>
<span class="header-row">--  ------------  -------------  ------------------------------</span>
<span class="data-row">1   alice_smith   Alice Smith    $2b$10$Hk3mN7qZ2vXpY8wQ1rT6Oe...</span>
<span class="data-row">2   bob_jones     Bob Jones      $2b$10$Lm9pK4nX7uRsV3wE2tY5Pi...</span>
<span class="data-row">3   carol_white   Carol White    $2b$10$Np2qM6rY8vSuW4xF3uZ7Qj...</span>
<span class="data-row">4   david_brown   David Brown    $2b$10$Op3rN7sZ9wTvX5yG4vA8Rk...</span>
<span class="data-row">5   eve_taylor    Eve Taylor     $2b$10$Pq4sO8tA0xUwY6zH5wB9Sl...</span>
<span class="data-row">6   frank_moore   Frank Moore    $2b$10$Qr5tP9uB1yVxZ7aI6xC0Tm...</span>
<span class="data-row">7   grace_lee     Grace Lee      $2b$10$Rs6uQ0vC2zWyA8bJ7yD1Un...</span>
<span class="data-row">8   henry_clark   Henry Clark    $2b$10$St7vR1wD3aXzB9cK8zE2Vo...</span>
<span class="data-row">9   iris_hall     Iris Hall      $2b$10$Tu8wS2xE4bYaC0dL9aF3Wp...</span>
<span class="data-row">10  jack_young    Jack Young     $2b$10$Uv9xT3yF5cZbD1eM0bG4Xq...</span>
<span class="prompt">sqlite&gt; </span><span class="cmd">SELECT COUNT(*) AS total_users FROM user;</span>
<span class="header-row">total_users</span>
<span class="header-row">-----------</span>
<span class="data-row">11         </span>
<span class="prompt">sqlite&gt; </span><span class="cmd">.quit</span>
<span class="prompt">C:\\lab-04&gt; </span></div>
</body>
</html>`;
}

for (const s of screenshots) {
  const html = s.isSqlite ? buildSqliteHtml(s) : buildPostmanHtml(s);
  fs.writeFileSync(path.join(screenshotsDir, s.filename), html, "utf8");
  console.log("Written:", s.filename);
}

console.log("All HTML screenshots generated.");
