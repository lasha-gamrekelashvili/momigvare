import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import postsRoutes from './src/routes/posts.js';
import usersRoutes from './src/routes/users.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const allowedOrigins = [
  'https://momigvare.ge',
  'https://www.momigvare.ge',
  'https://momigvare-client.onrender.com',
  'http://localhost:5173',
];

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Momigvare API',
    version: '1.0.0',
    description: 'API documentation for Momigvare backend',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}); 