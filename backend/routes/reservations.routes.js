const router = require('express').Router();
const c = require('../controllers/reservations.controller');
router.post('/', c.create);
router.post('/:id/cancel', c.cancel);
module.exports = router;
