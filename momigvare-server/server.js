import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import problemRoutes from './src/routes/problems.js';
import solverRoutes from './src/routes/solvers.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/problems', problemRoutes);
app.use('/api/solvers', solverRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 