const express = require('express');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LendoMais Books API',
    endpoints: ['/health', '/api/books'],
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/books', bookRoutes);

module.exports = app;

