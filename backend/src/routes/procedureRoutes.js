const { Router } = require('express');
const { auth, requireRole } = require('../middlewares/auth');
const { validate, validateId } = require('../helpers/validate');
const { procedureSchema } = require('../helpers/schemas');
const procedureController = require('../controllers/procedureController');

const router = Router();

router.get('/', auth, procedureController.getAll);
router.get('/:id', auth, procedureController.getById);
router.post('/', auth, requireRole('administrador', 'veterinario'), validate(procedureSchema), procedureController.create);
router.put('/:id', auth, requireRole('administrador', 'veterinario'), validateId('id'), validate(procedureSchema), procedureController.update);

module.exports = router;
