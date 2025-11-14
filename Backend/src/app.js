// packages
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import dotenv from 'dotenv';
import responseTime from 'response-time';
app.use(responseTime());

//files

// // Import routes
// import routes from './routes/index.js';

// // Import middlewares
// import { errorHandler } from './middlewares/error.middleware.js';
// import { notFound } from './middlewares/notFound.middleware.js';
// import { rateLimiter } from './middlewares/rateLimiter.middleware.js';

// // Import logger
// import logger from './utils/logger.js';


// Load env variables
dotenv.config();

const app = express();

// Trust proxy (important for rate limiting behind nginx/load balancer)
app.set('trust proxy', 1);

// Security middlewares 
app.use(helmet({
    crossOriginResourcePolicy: {policy:'cross-origin'}
}));

// check response time
app.use(responseTime());

// CORS configuration

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));


// Body parsers
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended: true, limit: '10mb'}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// // Static files (if you want to serve admin panel assets)
// app.use('/public', express.static(path.join(process.cwd(), 'public')));



// Logging morgen
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// // Rate limiting (global)
// app.use('/api/', rateLimiter);

// check server Health check endpoint f
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message : 'Server is Running',
        timestamp: new Date().toISOString()
    });
});


// API routes
app.use('/api', routes);

// Handle 404
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

export default app;

