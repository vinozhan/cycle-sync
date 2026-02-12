import env from './env.js';

const allowedOrigins = env.corsOrigin.split(',').map((o) => o.trim());

const corsOptions = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
