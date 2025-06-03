const API_URL = import.meta.env.VITE_API_URL+'/api';

export const api = {
  // Problems
  getProblems: async () => {
    const response = await fetch(`${API_URL}/problems`);
    if (!response.ok) throw new Error('Failed to fetch problems');
    return response.json();
  },

  createProblem: async (problem) => {
    const response = await fetch(`${API_URL}/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problem)
    });
    if (!response.ok) throw new Error('Failed to create problem');
    return response.json();
  },

  addProblemComment: async (problemId, comment) => {
    const response = await fetch(`${API_URL}/problems/${problemId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  },

  // Solvers
  getSolvers: async () => {
    const response = await fetch(`${API_URL}/solvers`);
    if (!response.ok) throw new Error('Failed to fetch solvers');
    return response.json();
  },

  createSolver: async (solver) => {
    const response = await fetch(`${API_URL}/solvers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solver)
    });
    if (!response.ok) throw new Error('Failed to create solver');
    return response.json();
  },

  addSolverComment: async (solverId, comment) => {
    const response = await fetch(`${API_URL}/solvers/${solverId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
  }
}; 