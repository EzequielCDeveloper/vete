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

// ─── Global Middlewares ───────────────────────────────────────
app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN
  || (process.env.NODE_ENV === 'development' ? '*' : false);
app.use(cors({ origin: corsOrigin }));

app.use(express.json({ limit: '1mb' }));

// ─── Routes ───────────────────────────────────────────────────
app.use('/api', routes);

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info({ port: PORT }, `VetCare API corriendo en http://localhost:${PORT}`);
});
