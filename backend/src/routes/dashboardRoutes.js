const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const dashboardController = require('../controllers/dashboardController');

const router = Router();

router.get('/stats', auth, dashboardController.stats);

module.exports = router;
