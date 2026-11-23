import { useState, useEffect, useMemo } from 'react';
import { bookService } from './services/bookService';
import './App.css';

const initialForm = {
  title: '',
  author: '',
  published_year: '',
  isbn: '',
};

const COVER_PALETTES = [
  ['#6366f1', '#4338ca'],
  ['#ec4899', '#be185d'],
  ['#14b8a6', '#0f766e'],
  ['#f59e0b', '#b45309'],
  ['#8b5cf6', '#6d28d9'],
  ['#0ea5e9', '#0369a1'],
];

function getCoverStyle(title = '') {
  const sum = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [from, to] = COVER_PALETTES[sum % COVER_PALETTES.length];
  return {
    background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
  };
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await bookService.getAll();
      setBooks(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Servidor backend indisponível no momento. Verifique se a API (porta 3001) e o PostgreSQL estão ativos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return books;
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(query) ||
        b.author?.toLowerCase().includes(query) ||
        String(b.isbn || '').toLowerCase().includes(query) ||
        String(b.published_year || '').includes(query)
    );
  }, [books, searchTerm]);

  const uniqueAuthorsCount = useMemo(() => {
    const authors = new Set(
      books.map((b) => b.author?.trim().toLowerCase()).filter(Boolean)
    );
    return authors.size;
  }, [books]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      title: formData.title,
      author: formData.author,
      published_year: formData.published_year ? Number(formData.published_year) : null,
      isbn: formData.isbn || null,
    };

    try {
      if (editingId) {
        const updated = await bookService.update(editingId, payload);
        setBooks((prev) => prev.map((book) => (book.id === editingId ? updated : book)));
        setEditingId(null);
      } else {
        const created = await bookService.create(payload);
        setBooks((prev) => [created, ...prev]);
      }
      setFormData(initialForm);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível salvar o livro.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      published_year: book.published_year || '',
      isbn: book.isbn || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await bookService.remove(id);
      setBooks((prev) => prev.filter((book) => book.id !== id));
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao excluir o livro.');
    }
  };

  return (
    <div className="app-shell">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <div>
              <span className="brand-badge">Catálogo Digital</span>
              <h1>BiblioTech</h1>
            </div>
          </div>

          <div className="stats-bar">
            <div className="stat-pill">
              <span className="stat-label">Total de Obras</span>
              <strong className="stat-value">{books.length}</strong>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Autores</span>
              <strong className="stat-value">{uniqueAuthorsCount}</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="banner-error" role="alert">
            <div className="banner-error-content">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            <button type="button" className="btn-retry" onClick={fetchBooks}>
              Tentar novamente
            </button>
          </div>
        )}

        <div className="workspace-grid">
          <aside className="form-panel">
            <div className="panel-card">
              <div className="panel-header">
                <span className="panel-tag">
                  {editingId ? 'Modo de Edição' : 'Cadastro'}
                </span>
                <h2>{editingId ? 'Editar Livro' : 'Adicionar Novo Livro'}</h2>
                <p>Preencha as informações abaixo para atualizar o acervo.</p>
              </div>

              <form onSubmit={handleSubmit} className="book-form">
                <div className="field">
                  <label htmlFor="title">
                    Título da Obra <span className="req">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Ex: Arquitetura Limpa"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="author">
                    Autor(a) <span className="req">*</span>
                  </label>
                  <input
                    id="author"
                    name="author"
                    type="text"
                    placeholder="Ex: Robert C. Martin"
                    value={formData.author}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="published_year">Ano</label>
                    <input
                      id="published_year"
                      name="published_year"
                      type="number"
                      placeholder="2017"
                      value={formData.published_year}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="isbn">ISBN</label>
                    <input
                      id="isbn"
                      name="isbn"
                      type="text"
                      placeholder="978-8550804606"
                      value={formData.isbn}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Salvando...'
                      : editingId
                      ? 'Salvar Alterações'
                      : 'Cadastrar Livro'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={handleCancelEdit}
                    >
                      Cancelar Edição
                    </button>
                  )}
                </div>
              </form>
            </div>
          </aside>

          <section className="catalog-panel">
            <div className="catalog-toolbar">
              <div className="catalog-title">
                <h2>Acervo Cadastrado</h2>
                <span className="count-badge">{filteredBooks.length} livros</span>
              </div>

              <div className="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por título, autor, ano ou ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => setSearchTerm('')}
                    title="Limpar busca"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="skeleton-grid">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="skeleton-card" />
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-card">
                <div className="empty-illustration">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3>
                  {searchTerm
                    ? 'Nenhum resultado encontrado'
                    : 'Seu catálogo ainda está vazio'}
                </h3>
                <p>
                  {searchTerm
                    ? `Não encontramos livros correspondentes a "${searchTerm}".`
                    : 'Utilize o formulário ao lado para adicionar o primeiro livro à coleção.'}
                </p>
              </div>
            ) : (
              <div className="book-grid">
                {filteredBooks.map((book) => (
                  <article
                    key={book.id}
                    className={`book-card ${editingId === book.id ? 'is-editing' : ''}`}
                  >
                    <div className="book-cover" style={getCoverStyle(book.title)}>
                      <span className="cover-letter">
                        {(book.title || 'L').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="book-body">
                      <div className="book-main">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-author">por {book.author}</p>
                      </div>

                      <div className="book-badges">
                        {book.published_year && (
                          <span className="meta-chip">
                            Ano: <strong>{book.published_year}</strong>
                          </span>
                        )}
                        {book.isbn && (
                          <span className="meta-chip">
                            ISBN: <strong>{book.isbn}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="book-card-actions">
                      <button
                        type="button"
                        className="action-btn edit"
                        onClick={() => handleEdit(book)}
                        title="Editar livro"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleDelete(book.id)}
                        title="Excluir livro"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
