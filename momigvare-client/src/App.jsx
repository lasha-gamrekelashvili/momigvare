import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import DetailView from './components/DetailView'
import { api } from './services/api'
import './App.css'
import momigvareLogo from './assets/momigvare-icon.png'

function formatTimeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  if (diffInSeconds < 60) return 'ახლახანს'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} წთ-ის წინ`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} საათის წინ`
  return `${Math.floor(diffInSeconds / 86400)} დღის წინ`
}

function Home() {
  const [activeTab, setActiveTab] = useState('problems')
  const navigate = useNavigate()
  
  // State for problems and solvers
  const [problems, setProblems] = useState([])
  const [solvers, setSolvers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [problemInput, setProblemInput] = useState('')
  const [problemBudget, setProblemBudget] = useState('')
  const [problemDescription, setProblemDescription] = useState('')
  const [problemContact, setProblemContact] = useState('')

  const [solverInput, setSolverInput] = useState('')
  const [solverBudget, setSolverBudget] = useState('')
  const [solverDescription, setSolverDescription] = useState('')
  const [solverContact, setSolverContact] = useState('')

  // Comment state
  const [newComment, setNewComment] = useState('')

  const [showAdditionalFields, setShowAdditionalFields] = useState(false)
  const [tempProblem, setTempProblem] = useState(null)
  const [tempSolver, setTempSolver] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [problemsData, solversData] = await Promise.all([
          api.getProblems(),
          api.getSolvers()
        ])
        setProblems(problemsData)
        setSolvers(solversData)
        setError(null)
      } catch (err) {
        setError('Failed to fetch data')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Handlers
  const handleInitialSubmit = (e, type) => {
    e.preventDefault()
    if (type === 'problem') {
      if (!problemInput.trim() || !problemBudget) return
      setTempProblem({
        title: problemInput,
        budget: problemBudget
      })
      setShowAdditionalFields(true)
    } else {
      if (!solverInput.trim() || !solverBudget) return
      setTempSolver({
        title: solverInput,
        price: solverBudget
      })
      setShowAdditionalFields(true)
    }
  }

  const handleProblemSubmit = async (e) => {
    e.preventDefault()
    if (!tempProblem) return
    
    try {
      const newProblem = {
        title: tempProblem.title,
        budget: tempProblem.budget,
        description: problemDescription,
        contact: problemContact
      }
      
      const savedProblem = await api.createProblem(newProblem)
      setProblems([savedProblem, ...problems])
      setProblemInput('')
      setProblemBudget('')
      setProblemDescription('')
      setProblemContact('')
      setShowAdditionalFields(false)
      setTempProblem(null)
    } catch (err) {
      console.error('Error creating problem:', err)
      setError('Failed to create problem')
    }
  }

  const handleSolverSubmit = async (e) => {
    e.preventDefault()
    if (!tempSolver) return
    
    try {
      const newSolver = {
        title: tempSolver.title,
        price: tempSolver.price,
        description: solverDescription,
        contact: solverContact
      }
      
      const savedSolver = await api.createSolver(newSolver)
      setSolvers([savedSolver, ...solvers])
      setSolverInput('')
      setSolverBudget('')
      setSolverDescription('')
      setSolverContact('')
      setShowAdditionalFields(false)
      setTempSolver(null)
    } catch (err) {
      console.error('Error creating solver:', err)
      setError('Failed to create solver')
    }
  }


  const handleItemClick = (type, id) => {
    navigate(`/${type}/${id}`)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <img src={momigvareLogo} alt="Momigvare" className="app-logo" />
        <nav className="nav-tabs">
          <button 
            className={`tab-button ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('problems')
              setShowAdditionalFields(false)
              setTempProblem(null)
            }}
          >
            მოსაგვარებელი
          </button>
          <button 
            className={`tab-button ${activeTab === 'solvers' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('solvers')
              setShowAdditionalFields(false)
              setTempSolver(null)
            }}
          >
            მომგვარებლები
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'problems' ? (
          <div className="problem-form">
            {!showAdditionalFields ? (
              <form className="submission-form" onSubmit={(e) => handleInitialSubmit(e, 'problem')}>
                <div className="form-group">
                  <label htmlFor="problem">რა მოვაგვაროთ?</label>
                  <input 
                    type="text"
                    id="problem"
                    placeholder="პრობლემის სათაური..."
                    className="problem-input"
                    value={problemInput}
                    onChange={e => setProblemInput(e.target.value)}
                    required
                    onInvalid={(e) => {
                      e.target.setCustomValidity('გთხოვთ შეავსოთ ველი')
                    }}
                    onInput={(e) => {
                      e.target.setCustomValidity('')
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="budget">რამდენს გადაიხდით?</label>
                  <input 
                    type="number" 
                    id="budget"
                    placeholder="ბიუჯეტი (₾)..."
                    className="budget-input"
                    value={problemBudget}
                    onChange={e => setProblemBudget(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  მომიგვარე
                </button>
              </form>
            ) : (
              <form className="submission-form" onSubmit={handleProblemSubmit}>
                <div className="additional-details">
                  <div className="form-group">
                    <label htmlFor="problemDescription">დეტალური აღწერა</label>
                    <textarea 
                      id="problemDescription"
                      placeholder="დეტალური აღწერა..."
                      className="problem-input"
                      value={problemDescription}
                      onChange={e => setProblemDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="problemContact">საკონტაქტო</label>
                    <input 
                      type="text"
                      id="problemContact"
                      placeholder="საკონტაქტო ინფორმაცია..."
                      className="budget-input"
                      value={problemContact}
                      onChange={e => setProblemContact(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-button">
                      გამოქვეყნება
                    </button>
                    <button
                      type="button"
                      className="details-button"
                      onClick={() => {
                        setShowAdditionalFields(false)
                        setTempProblem(null)
                      }}
                    >
                      გაუქმება
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="list-section">
              {problems.length === 0 ? (
                <p>ჯერ მოსაგვარებელი არაფერია.</p>
              ) : (
                <ul className="item-list">
                  {problems.map((p) => (
                    <li 
                      key={p._id} 
                      className="item-card"
                      onClick={() => handleItemClick('problem', p._id)}
                    >
                      <div className="item-meta-row improved">
                        <span className="item-meta-item">
                          <span className="item-meta-icon">
                            <svg width="15" height="15" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4"/></svg>
                          </span> Anonymous user
                        </span>
                        <span className="item-meta-separator">•</span>
                        <span className="item-meta-item">
                          <span className="item-meta-icon">
                            <svg width="15" height="15" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          </span> {formatTimeAgo(p.createdAt)}
                        </span>
                        <span className="item-meta-separator">•</span>
                        <span className="item-meta-item">
                          {p.comments && p.comments.length ? p.comments.length : 0} კომენტარი
                        </span>
                      </div>
                      <div className="item-title-divider" />
                      <div className="item-header-row centered">
                        <span className="item-title">{p.title}</span>
                        <span className="item-meta-separator">•</span>
                        <span className="item-budget">₾{p.budget}</span>
                      </div>
                      {p.description && (
                        <div className="item-preview">
                          {p.description.substring(0, 100)}
                          {p.description.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="problem-form">
            {!showAdditionalFields ? (
              <form className="submission-form" onSubmit={(e) => handleInitialSubmit(e, 'solver')}>
                <div className="form-group">
                  <label htmlFor="solver">რას მოაგვარებთ?</label>
                  <input 
                    type="text"
                    id="solver"
                    placeholder="მომსახურების სახელი..."
                    className="problem-input"
                    value={solverInput}
                    onChange={e => setSolverInput(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="solverBudget">ფასი (₾)</label>
                  <input 
                    type="number" 
                    id="solverBudget"
                    placeholder="ფასი (₾)..."
                    className="budget-input"
                    value={solverBudget}
                    onChange={e => setSolverBudget(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  მოვაგვარებ
                </button>
              </form>
            ) : (
              <form className="submission-form" onSubmit={handleSolverSubmit}>
                <div className="additional-details">
                  <div className="form-group">
                    <label htmlFor="solverDescription">დეტალური აღწერა</label>
                    <textarea 
                      id="solverDescription"
                      placeholder="დეტალური აღწერა..."
                      className="problem-input"
                      value={solverDescription}
                      onChange={e => setSolverDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="solverContact">საკონტაქტო ინფორმაცია</label>
                    <input 
                      type="text"
                      id="solverContact"
                      placeholder="საკონტაქტო ინფორმაცია..."
                      className="budget-input"
                      value={solverContact}
                      onChange={e => setSolverContact(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-button">
                      გამოქვეყნება
                    </button>
                    <button
                      type="button"
                      className="details-button"
                      onClick={() => {
                        setShowAdditionalFields(false)
                        setTempSolver(null)
                      }}
                    >
                      გაუქმება
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="list-section">
              {solvers.length === 0 ? (
                <p>ჯერ-ჯერობით მომგვარებლები არ არიან.</p>
              ) : (
                <ul className="item-list">
                  {solvers.map((s) => (
                    <li 
                      key={s._id} 
                      className="item-card"
                      onClick={() => handleItemClick('solver', s._id)}
                    >
                      <div className="item-meta-row improved">
                        <span className="item-meta-item">
                          <span className="item-meta-icon">
                            <svg width="15" height="15" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4"/></svg>
                          </span> Anonymous user
                        </span>
                        <span className="item-meta-separator">•</span>
                        <span className="item-meta-item">
                          <span className="item-meta-icon">
                            <svg width="15" height="15" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          </span> {formatTimeAgo(s.createdAt)}
                        </span>
                        <span className="item-meta-separator">•</span>
                        <span className="item-meta-item">
                          {s.comments && s.comments.length ? s.comments.length : 0} კომენტარი
                        </span>
                      </div>
                      <div className="item-title-divider" />
                      <div className="item-header-row centered">
                        <span className="item-title">{s.title}</span>
                        <span className="item-meta-separator">•</span>
                        <span className="item-budget">₾{s.price}</span>
                      </div>
                      {s.description && (
                        <div className="item-preview">
                          {s.description.substring(0, 100)}
                          {s.description.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:type/:id" element={<DetailView />} />
      </Routes>
    </Router>
  )
}

export default App
