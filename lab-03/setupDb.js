const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "books.db");

const db = new sqlite3.Database(dbPath);

const books = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 350, pages: 180 },
  { title: "To Kill a Mockingbird", author: "Harper Lee", price: 400, pages: 281 },
  { title: "1984", author: "George Orwell", price: 300, pages: 328 },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", price: 250, pages: 234 },
  { title: "Pride and Prejudice", author: "Jane Austen", price: 200, pages: 432 },
  { title: "The Hobbit", author: "J.R.R. Tolkien", price: 500, pages: 310 },
  { title: "Brave New World", author: "Aldous Huxley", price: 280, pages: 288 },
  { title: "The Alchemist", author: "Paulo Coelho", price: 320, pages: 197 },
  { title: "Fahrenheit 451", author: "Ray Bradbury", price: 270, pages: 194 },
  { title: "The Lord of the Rings", author: "J.R.R. Tolkien", price: 750, pages: 1178 }
];

db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS book`);

  db.run(`CREATE TABLE book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
  )`);

  const stmt = db.prepare(
    `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)`
  );

  for (const b of books) {
    stmt.run(b.title, b.author, b.price, b.pages);
  }

  stmt.finalize();

  console.log("Database seeded with 10 books successfully.");
});

db.close();
