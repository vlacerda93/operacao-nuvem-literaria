const bookRepository = require('../repositories/bookRepository');

class BookService {
  async getAllBooks() {
    return await bookRepository.findAll();
  }

  async getBookById(id) {
    const book = await bookRepository.findById(id);
    if (!book) {
      const error = new Error('Livro não encontrado.');
      error.statusCode = 404;
      throw error;
    }
    return book;
  }

  async createBook(data) {
    const { title, author, published_year, isbn } = data;

    if (!title || !title.trim() || !author || !author.trim()) {
      const error = new Error('Os campos "title" e "author" são obrigatórios.');
      error.statusCode = 400;
      throw error;
    }

    return await bookRepository.create({
      title: title.trim(),
      author: author.trim(),
      published_year: published_year ? Number(published_year) : null,
      isbn: isbn ? isbn.trim() : null,
    });
  }

  async updateBook(id, data) {
    const { title, author, published_year, isbn } = data;

    if (!title || !title.trim() || !author || !author.trim()) {
      const error = new Error('Os campos "title" e "author" são obrigatórios.');
      error.statusCode = 400;
      throw error;
    }

    const updated = await bookRepository.update(id, {
      title: title.trim(),
      author: author.trim(),
      published_year: published_year ? Number(published_year) : null,
      isbn: isbn ? isbn.trim() : null,
    });

    if (!updated) {
      const error = new Error('Livro não encontrado para atualização.');
      error.statusCode = 404;
      throw error;
    }

    return updated;
  }

  async deleteBook(id) {
    const deleted = await bookRepository.delete(id);
    if (!deleted) {
      const error = new Error('Livro não encontrado para exclusão.');
      error.statusCode = 404;
      throw error;
    }
    return true;
  }
}

module.exports = new BookService();

