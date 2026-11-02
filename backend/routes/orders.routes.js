const router = require('express').Router();
const c = require('../controllers/orders.controller');
router.post('/', c.create);
router.get('/:id', c.get);
module.exports = router;
