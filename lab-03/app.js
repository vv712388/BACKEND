const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "books.db");
let db = null;

const initializeDBAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("Server Running at http://localhost:3000/");
  });
};

initializeDBAndServer();

app.get("/books/", async (request, response) => {
  const {
    search_q = "",
    order_by = "id",
    order = "ASC",
    limit = 10,
    offset = 0,
    min_price = 0,
    max_price = 100000,
  } = request.query;

  const allowedColumns = ["id", "title", "author", "price", "pages"];
  const safeOrderBy = allowedColumns.includes(order_by) ? order_by : "id";
  const safeOrder = order.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const query = `
    SELECT * FROM book
    WHERE title LIKE ? AND price BETWEEN ? AND ?
    ORDER BY ${safeOrderBy} ${safeOrder}
    LIMIT ? OFFSET ?
  `;

  const books = await db.all(query, [
    `%${search_q}%`,
    parseInt(min_price),
    parseInt(max_price),
    parseInt(limit),
    parseInt(offset),
  ]);

  response.status(200).json(books);
});

app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const query = `SELECT * FROM book WHERE id = ?`;
  const book = await db.get(query, [bookId]);

  if (book === undefined) {
    response.status(404).json({ message: "Book Not Found" });
  } else {
    response.status(200).json(book);
  }
});

app.post("/books/", async (request, response) => {
  const { title, author, price, pages } = request.body;

  if (!title || title.trim() === "") {
    return response
      .status(400)
      .json({ message: "Bad Request: title is required" });
  }

  if (!author || author.trim() === "") {
    return response
      .status(400)
      .json({ message: "Bad Request: author is required" });
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return response
      .status(400)
      .json({ message: "Bad Request: price must be a valid non-negative number" });
  }

  const safePages = pages !== undefined ? parseInt(pages) : 0;

  const query = `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)`;
  const result = await db.run(query, [
    title.trim(),
    author.trim(),
    parseInt(price),
    safePages,
  ]);

  response
    .status(201)
    .json({ bookId: result.lastID, message: "Book Added Successfully" });
});

app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const { title, author, price, pages } = request.body;

  const existing = await db.get(`SELECT * FROM book WHERE id = ?`, [bookId]);
  if (existing === undefined) {
    return response.status(404).json({ message: "Book Not Found" });
  }

  if (!title || title.trim() === "") {
    return response
      .status(400)
      .json({ message: "Bad Request: title is required" });
  }

  if (!author || author.trim() === "") {
    return response
      .status(400)
      .json({ message: "Bad Request: author is required" });
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return response
      .status(400)
      .json({ message: "Bad Request: price must be a valid non-negative number" });
  }

  const safePages = pages !== undefined ? parseInt(pages) : existing.pages;

  const query = `UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?`;
  await db.run(query, [title.trim(), author.trim(), parseInt(price), safePages, bookId]);

  response.status(200).json({ message: "Book Updated Successfully" });
});

app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;

  const existing = await db.get(`SELECT * FROM book WHERE id = ?`, [bookId]);
  if (existing === undefined) {
    return response.status(404).json({ message: "Book Not Found" });
  }

  await db.run(`DELETE FROM book WHERE id = ?`, [bookId]);
  response.status(200).json({ message: "Book Deleted Successfully" });
});
