import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import problemRoutes from './src/routes/problems.js';
import solverRoutes from './src/routes/solvers.js';
import cors from 'cors';

const allowedOrigins = [
  'https://momigvare.ge',
  'https://www.momigvare.ge',
  'https://momigvare-client.onrender.com',
];

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/problems', problemRoutes);
app.use('/api/solvers', solverRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 