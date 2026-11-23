const { Router } = require('express');
const bookController = require('../controllers/bookController');

const router = Router();

router.get('/', (req, res) => bookController.index(req, res));
router.get('/:id', (req, res) => bookController.show(req, res));
router.post('/', (req, res) => bookController.store(req, res));
router.put('/:id', (req, res) => bookController.update(req, res));
router.delete('/:id', (req, res) => bookController.destroy(req, res));

module.exports = router;

