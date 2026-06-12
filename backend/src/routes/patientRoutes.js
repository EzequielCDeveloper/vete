const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { validate } = require('../helpers/validate');
const { patientSchema } = require('../helpers/schemas');
const patientController = require('../controllers/patientController');

const router = Router();

router.get('/', auth, patientController.getAll);
router.get('/:id', auth, patientController.getById);
router.post('/', auth, validate(patientSchema), patientController.create);

module.exports = router;
