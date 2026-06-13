const { Router } = require('express');
const { auth } = require('../middlewares/auth');
const { validate } = require('../helpers/validate');
const { medicalRecordSchema, standaloneMedicalRecordSchema } = require('../helpers/schemas');
const medicalRecordController = require('../controllers/medicalRecordController');

const router = Router();

router.get('/', auth, medicalRecordController.getAll);
router.get('/patient/:patientId', auth, medicalRecordController.getByPatient);
router.get('/:patientId/citas', auth, medicalRecordController.getCitasByPatient);
router.post('/', auth, validate(medicalRecordSchema), medicalRecordController.create);
router.post('/standalone', auth, validate(standaloneMedicalRecordSchema), medicalRecordController.createStandalone);
router.get('/archived/all', auth, medicalRecordController.getArchived);
router.patch('/:id/archive', auth, medicalRecordController.archive);
router.patch('/:id/unarchive', auth, medicalRecordController.unarchive);

module.exports = router;
