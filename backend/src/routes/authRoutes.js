const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const { validate } = require('../helpers/validate');
const { changeOwnPasswordSchema } = require('../helpers/schemas');

const router = Router();

// Rate limiter: 10 intentos por ventana de 15 minutos por IP (REQ-02)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intente de nuevo en 15 minutos.' },
});

router.post('/login', loginLimiter, authController.login);

// ─── Password change (own) ──────────────────────────────────
// Authenticated users can change their own password.
router.put('/password', auth, validate(changeOwnPasswordSchema), userController.changeOwnPassword);

module.exports = router;
