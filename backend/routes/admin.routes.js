const router = require('express').Router();
const c = require('../controllers/admin.controller');
router.use(c.auth);
router.get('/summary', c.summary);
router.post('/orders/:id/status', c.setOrderStatus);
router.post('/reservations/:id/status', c.setReservationStatus);
module.exports = router;
