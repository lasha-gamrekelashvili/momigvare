import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './DetailView.css'

function DetailView() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const items = type === 'problem' 
          ? await api.getProblems()
          : await api.getSolvers()
        const foundItem = items.find(item => item._id === id)
        if (foundItem) {
          setItem(foundItem)
        } else {
          setError('Item not found')
        }
      } catch (err) {
        setError('Failed to fetch item')
        console.error('Error fetching item:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [type, id])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const comment = {
        text: newComment
      }

      const updatedItem = type === 'problem'
        ? await api.addProblemComment(id, comment)
        : await api.addSolverComment(id, comment)

      setItem(updatedItem)
      setNewComment('')
    } catch (err) {
      console.error('Error adding comment:', err)
      setError('Failed to add comment')
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'ახლახან'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} წთ-ის წინ`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} საათის წინ`
    return `${Math.floor(diffInSeconds / 86400)} დღის წინ`
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!item) return null

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        დაბრუნება {type === 'problem' ? 'პრობლემებზე' : 'მომსახურებაზე'}
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-title-row">
            <h1 className="detail-title">{item.title}</h1>
            <div className="detail-price">₾{type === 'problem' ? item.budget : item.price}</div>
          </div>
          <div className="detail-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              გამოქვეყნდა {formatTimeAgo(item.createdAt)}
            </span>
            {item.comments.length > 0 && (
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                {item.comments.length} {item.comments.length === 1 ? 'კომენტარი' : 'კომენტარი'}
              </span>
            )}
          </div>
        </div>

        {item.description && (
          <div className="detail-section detail-description-section">
            <span className="detail-section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle', marginRight: '0.4em'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span className="detail-section-text">{item.description}</span>
            </span>
          </div>
        )}

        {item.contact && (
          <div className="detail-section detail-contact-section">
            <span className="detail-section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" style={{width: '1.1em', height: '1.1em', verticalAlign: 'middle', marginRight: '0.4em'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="detail-section-text">{item.contact}</span>
            </span>
          </div>
        )}

        <div className="detail-comments">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </h2>

          <div className="comments-list">
            {item.comments.map(comment => (
              <div key={comment._id} className="comment">
                <p>{comment.text}</p>
                <div className="comment-meta">
                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          <form className="comment-form" onSubmit={handleCommentSubmit} style={{alignItems: 'center'}}>
            <textarea
              className="comment-input"
              placeholder="დაამატეთ კომენტარი..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              style={{minHeight: '36px', fontSize: '0.95rem', padding: '0.5rem'}}
            />
            <button type="submit" className="comment-emoji-submit" style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 0.5rem'}} title="გამოქვეყნება">📨</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DetailView 