import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

// Load env variables
dotenv.config();

import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { sendError } from './utils/response';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Customize this in production to match your Next.js domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Performance Middlewares
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: [],
  },
});
app.use('/api/', limiter);

// Serve Static Uploads if local (optional fallback, Cloudinary is preferred)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation UI
try {
  const swaggerDocument = require('../swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('Swagger documentation config load error:', error);
}

// REST API versioned endpoints
app.use('/api/v1', routes);

// Base route ping handler
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CU Grab Eats REST API service is healthy',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// Catch-all route handler for 404s
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    errors: [],
  });
});

// Centralized error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` CU Grab Eats Express API Running...     `);
  console.log(` Port: ${PORT}                          `);
  console.log(` Environment: ${process.env.NODE_ENV}  `);
  console.log(` Swagger Docs: http://localhost:${PORT}/api-docs `);
  console.log(`=========================================`);
});

export default app;
