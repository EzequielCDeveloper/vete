// ─── VetCare — API REST ───────────────────────────────────────
// Express + JWT + MariaDB
// Entry point: initializes Express, global middlewares, and mounts routes.
// ───────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { PORT } = require('./config/env');
const logger = require('./helpers/logger');
const routes = require('./routes/index');

const app = express();

// Confiar en el proxy inverso (nginx) para obtener IP real
app.set('trust proxy', 1);

// ─── Global Middlewares ───────────────────────────────────────
app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN
  || (process.env.NODE_ENV === 'development' ? '*' : false);
app.use(cors({ origin: corsOrigin }));

app.use(express.json({ limit: '1mb' }));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api', routes);

// ─── Global Error Handler ─────────────────────────────────────
// Catch any error that escapes route handlers.
// Logs internally; never leaks stack traces to the client.
app.use((err, _req, res, _next) => {
  logger.error({ err }, '[Unhandled error]');
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info({ port: PORT }, `VetCare API corriendo en http://localhost:${PORT}`);
});
