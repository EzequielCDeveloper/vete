const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { validate, validateId } = require('../helpers/validate');
const { createAppointmentSchema, updateAppointmentSchema } = require('../helpers/schemas');
const appointmentController = require('../controllers/appointmentController');

const router = Router();

router.get('/', auth, appointmentController.getAll);
router.get('/:id', auth, appointmentController.getById);
router.post('/', auth, validate(createAppointmentSchema), appointmentController.create);
router.put('/:id', auth, validateId('id'), validate(updateAppointmentSchema), appointmentController.update);
router.patch('/:id/cancel', auth, validateId('id'), appointmentController.cancel);
router.patch('/:id/complete', auth, validateId('id'), appointmentController.complete);

module.exports = router;
