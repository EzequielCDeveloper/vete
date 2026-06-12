// ─── Route Aggregator ─────────────────────────────────────────
const { Router } = require('express');

const authRoutes = require('./authRoutes');
const patientRoutes = require('./patientRoutes');
const procedureRoutes = require('./procedureRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const medicalRecordRoutes = require('./medicalRecordRoutes');
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/procedures', procedureRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
