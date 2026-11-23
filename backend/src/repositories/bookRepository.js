const db = require('../config/database');

class BookRepository {
  async findAll() {
    const { rows } = await db.query(
      'SELECT id, title, author, published_year, isbn, created_at FROM books ORDER BY id DESC'
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await db.query(
      'SELECT id, title, author, published_year, isbn, created_at FROM books WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async create({ title, author, published_year, isbn }) {
    const { rows } = await db.query(
      `INSERT INTO books (title, author, published_year, isbn)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, author, published_year, isbn, created_at`,
      [title, author, published_year || null, isbn || null]
    );
    return rows[0];
  }

  async update(id, { title, author, published_year, isbn }) {
    const { rows } = await db.query(
      `UPDATE books
       SET title = $1, author = $2, published_year = $3, isbn = $4
       WHERE id = $5
       RETURNING id, title, author, published_year, isbn, created_at`,
      [title, author, published_year || null, isbn || null, id]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rowCount } = await db.query('DELETE FROM books WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = new BookRepository();

