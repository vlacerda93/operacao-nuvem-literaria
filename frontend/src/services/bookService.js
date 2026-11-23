import axios from 'axios';

function resolveApiBaseUrl() {
  const runtimeUrl =
    typeof window !== 'undefined' ? window.__ENV__?.VITE_API_URL : '';
  const rawUrl = (
    runtimeUrl ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3001/api'
  ).trim();
  const cleaned = rawUrl.replace(/\/+$/, '');
  return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

export const bookService = {
  async getAll() {
    const response = await api.get('/books');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  async create(bookData) {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  async update(id, bookData) {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },

  async remove(id) {
    await api.delete(`/books/${id}`);
  },
};

