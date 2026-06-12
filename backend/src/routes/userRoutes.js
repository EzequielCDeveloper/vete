const { Router } = require('express');
const { auth, isAdmin } = require('../middlewares/auth');
const { validate, validateId } = require('../helpers/validate');
const { createUserSchema, changeUserPasswordSchema } = require('../helpers/schemas');
const userController = require('../controllers/userController');

const router = Router();

router.get('/', auth, isAdmin, userController.getAll);
router.post('/', auth, isAdmin, validate(createUserSchema), userController.create);
router.delete('/:id', auth, isAdmin, validateId('id'), userController.delete);

// ─── Admin: reset any user's password ──────────────────────
router.put('/:id/password', auth, isAdmin, validateId('id'), validate(changeUserPasswordSchema), userController.changeUserPassword);

module.exports = router;
