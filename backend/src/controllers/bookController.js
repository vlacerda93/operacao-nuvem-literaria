const bookService = require('../services/bookService');

class BookController {
  async index(req, res) {
    try {
      const books = await bookService.getAllBooks();
      return res.status(200).json(books);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        error: error.message || 'Erro interno ao listar livros.',
      });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const book = await bookService.getBookById(Number(id));
      return res.status(200).json(book);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        error: error.message || 'Erro interno ao buscar livro.',
      });
    }
  }

  async store(req, res) {
    try {
      const newBook = await bookService.createBook(req.body);
      return res.status(201).json(newBook);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        error: error.message || 'Erro interno ao criar livro.',
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedBook = await bookService.updateBook(Number(id), req.body);
      return res.status(200).json(updatedBook);
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        error: error.message || 'Erro interno ao atualizar livro.',
      });
    }
  }

  async destroy(req, res) {
    try {
      const { id } = req.params;
      await bookService.deleteBook(Number(id));
      return res.status(204).send();
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        error: error.message || 'Erro interno ao remover livro.',
      });
    }
  }
}

module.exports = new BookController();

