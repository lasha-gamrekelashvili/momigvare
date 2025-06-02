import express from 'express';
import { Solver } from '../models/Solver.js';

const router = express.Router();

// Get all solvers
router.get('/', async (req, res) => {
  try {
    const solvers = await Solver.find().sort({ createdAt: -1 });
    res.json(solvers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new solver
router.post('/', async (req, res) => {
  try {
    const solver = new Solver(req.body);
    const savedSolver = await solver.save();
    res.status(201).json(savedSolver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a comment to a solver
router.post('/:id/comments', async (req, res) => {
  try {
    const solver = await Solver.findById(req.params.id);
    if (!solver) {
      return res.status(404).json({ message: 'Solver not found' });
    }
    solver.comments.push(req.body);
    const updatedSolver = await solver.save();
    res.json(updatedSolver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 