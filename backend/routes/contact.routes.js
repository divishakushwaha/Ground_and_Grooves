const router = require('express').Router();
router.post('/', require('../controllers/contact.controller').create);
module.exports = router;
