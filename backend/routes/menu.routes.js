const router = require('express').Router();
router.get('/', require('../controllers/menu.controller').list);
module.exports = router;
