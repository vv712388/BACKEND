const http = require("http");
const { execSync } = require("child_process");

function request(method, path, body) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on("error", (e) => resolve({ status: 0, body: e.message }));
    req.write(data);
    req.end();
  });
}

async function runTests() {
  await new Promise((r) => setTimeout(r, 2000));

  const tests = [
    {
      label: "1. POST /login/ - Success (alice_smith)",
      method: "POST",
      path: "/login/",
      body: { username: "alice_smith", password: "Alice@1234" },
    },
    {
      label: "2. POST /login/ - Invalid password",
      method: "POST",
      path: "/login/",
      body: { username: "alice_smith", password: "WrongPassword" },
    },
    {
      label: "3. POST /login/ - User not found",
      method: "POST",
      path: "/login/",
      body: { username: "nonexistent_user", password: "somepass" },
    },
    {
      label: "4. POST /register/ - New user success",
      method: "POST",
      path: "/register/",
      body: { username: "new_student", name: "New Student", password: "Student@2026" },
    },
    {
      label: "5. POST /register/ - Duplicate username",
      method: "POST",
      path: "/register/",
      body: { username: "new_student", name: "New Student", password: "Student@2026" },
    },
    {
      label: "6. POST /register/ - Password too short",
      method: "POST",
      path: "/register/",
      body: { username: "shortpass_user", name: "Short Pass", password: "123" },
    },
    {
      label: "7. POST /register/ - Missing fields",
      method: "POST",
      path: "/register/",
      body: { username: "nopass_user" },
    },
    {
      label: "8. POST /login/ - Missing fields",
      method: "POST",
      path: "/login/",
      body: { username: "alice_smith" },
    },
  ];

  const results = [];
  for (const t of tests) {
    const res = await request(t.method, t.path, t.body);
    results.push({ label: t.label, status: res.status, body: res.body });
    console.log(`\n${t.label}`);
    console.log(`  Status: ${res.status}`);
    console.log(`  Body:   ${res.body}`);
  }

  console.log("\n=== TEST SUMMARY ===");
  for (const r of results) {
    console.log(`${r.status} | ${r.label}`);
  }

  process.exit(0);
}

runTests();
