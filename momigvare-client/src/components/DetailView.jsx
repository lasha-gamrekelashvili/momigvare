import { useState, useEffect, useRef } from 'react'
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
  const commentInputRef = useRef(null)
  const commentsListRef = useRef(null)

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
      if (commentInputRef.current) {
        commentInputRef.current.style.height = 'auto'
      }
      if (commentsListRef.current) {
        commentsListRef.current.scrollTop = 0
      }
    } catch (err) {
      console.error('Error adding comment:', err)
      setError('Failed to add comment')
    }
  }

  const handleCommentInput = (e) => {
    setNewComment(e.target.value)
    if (commentInputRef.current) {
      commentInputRef.current.style.height = 'auto'
      commentInputRef.current.style.height = commentInputRef.current.scrollHeight + 'px'
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

      <div className="detail-top-card">
        <div className="detail-title-row improved">
          <span className="detail-title improved">{item.title}</span>
          <span className="detail-meta-separator">•</span>
          <span className="detail-price">{type === 'problem' ? `₾${item.budget}` : `₾${item.price}`}</span>
        </div>
        <div className="detail-title-divider" />
        <div className="detail-meta-row improved">
          <span className="detail-meta-item">
            <span className="detail-meta-icon">
              <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4"/></svg>
            </span> Anonymous user
          </span>
          <span className="detail-meta-separator">•</span>
          <span className="detail-meta-item">
            <span className="detail-meta-icon">
              <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </span> {formatTimeAgo(item.createdAt)}
          </span>
          {item.contact && (
            <>
              <span className="detail-meta-separator">•</span>
              <span className="detail-meta-item">
                <span className="detail-meta-icon">
                  <svg width="16" height="16" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M2 6.5A2.5 2.5 0 014.5 4h15A2.5 2.5 0 0122 6.5v11a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 17.5v-11z"/><path d="M22 6.5L12 13 2 6.5"/></svg>
                </span> {item.contact}
              </span>
            </>
          )}
        </div>
        <div className="detail-message-box">
          {item.description}
        </div>
        <div className="comments-container">
          <div className="comments-list" ref={commentsListRef}>
            {[...item.comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(comment => (
              <div key={comment._id} className="comment improved">
                <div className="comment-meta improved">
                  <span className="comment-username">
                    <span className="detail-meta-icon">
                      <svg width="15" height="15" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4"/></svg>
                    </span> Anonymous user
                  </span>
                  <span className="detail-meta-separator">•</span>
                  <span className="comment-time">
                    <span className="detail-meta-icon">
                      <svg width="15" height="15" fill="none" stroke="#64748b" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </span> {formatTimeAgo(comment.createdAt)}
                  </span>
                </div>
                <div className="comment-text-bubble">
                  <div className="comment-text improved">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
          <form className="comment-form attached" onSubmit={handleCommentSubmit}>
            <textarea
              className="comment-input"
              placeholder="დაამატეთ კომენტარი..."
              value={newComment}
              onChange={handleCommentInput}
              ref={commentInputRef}
              rows={1}
            />
            <button type="submit" className="comment-submit" title="გამოქვეყნება">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DetailView 