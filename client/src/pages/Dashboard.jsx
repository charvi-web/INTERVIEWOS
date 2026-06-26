import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, Brain, Trophy, Clock, Target,
  Zap, ChevronRight, Star, TrendingUp
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import GlassCard from '../components/GlassCard'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  // showModal — Create Interview popup

  // User data localStorage se lo
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Axios instance — har request mein token automatically lagao
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      // Bearer token — har API call mein
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Parallel API calls — ek saath dono fetch karo
      const [statsRes, interviewsRes] = await Promise.all([
        api.get('/interviews/stats'),
        api.get('/interviews')
      ])
      setStats(statsRes.data.data)
      setInterviews(interviewsRes.data.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const [newInterview, setNewInterview] = useState({
    title: '',
    company: '',
    type: 'technical',
    difficulty: 'medium',
    role: 'sde'
  })

  const createInterview = async () => {
    try {
      const { data } = await api.post('/interviews', newInterview)
      toast.success('Interview created! 🎉')
      setShowModal(false)
      // Naya interview start karo
      const startRes = await api.post(`/ai/start/${data.data._id}`)
      navigate(`/interview/${data.data._id}`)
    } catch (error) {
      toast.error('Failed to create interview')
    }
  }

  // Stats cards data
  const statCards = stats ? [
    { 
      label: 'Total Interviews', 
      value: stats.totalInterviews, 
      icon: Brain,
      color: '#0ea5e9'
    },
    { 
      label: 'Completed', 
      value: stats.completedInterviews, 
      icon: Trophy,
      color: '#22c55e'
    },
    { 
      label: 'Avg Score', 
      value: `${stats.avgScore}/10`, 
      icon: Star,
      color: '#f59e0b'
    },
    { 
      label: 'Pending', 
      value: stats.pendingInterviews, 
      icon: Clock,
      color: '#a855f7'
    },
  ] : []

  const difficultyColor = {
    easy: '#22c55e',
    medium: '#f59e0b',
    hard: '#ef4444'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-white/10 border-t-sky-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span style={{
                background: 'linear-gradient(to right, #0ea5e9, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{user.name?.split(' ')[0]} 👋</span>
            </h1>
            <p className="text-white/40 mt-1">
              Ready to ace your next interview?
            </p>
          </div>

          {/* New Interview Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
            style={{
              background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            New Interview
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <GlassCard key={i} delay={i * 0.1}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <TrendingUp size={14} className="text-white/20" />
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-sm mt-1">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Recent Interviews */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Interviews</h2>
            <span className="text-white/30 text-sm">
              {interviews.length} total
            </span>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <Brain size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40">No interviews yet</p>
              <p className="text-white/20 text-sm mt-1">
                Create your first interview to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {interviews.map((interview, i) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/interview/${interview._id}`)}
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                  whileHover={{
                    background: 'rgba(255,255,255,0.07)',
                    borderColor: 'rgba(14,165,233,0.3)'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(14,165,233,0.15)' }}>
                      <Brain size={18} style={{ color: '#0ea5e9' }} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{interview.title}</p>
                      <p className="text-white/40 text-sm">
                        {interview.company} • {interview.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-medium"
                      style={{
                        background: `${difficultyColor[interview.difficulty]}20`,
                        color: difficultyColor[interview.difficulty]
                      }}>
                      {interview.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs"
                      style={{
                        background: interview.status === 'completed' 
                          ? 'rgba(34,197,94,0.15)' 
                          : 'rgba(245,158,11,0.15)',
                        color: interview.status === 'completed' 
                          ? '#22c55e' 
                          : '#f59e0b'
                      }}>
                      {interview.status}
                    </span>
                    {interview.score > 0 && (
                      <span className="text-white/60 text-sm">
                        {interview.score}/10
                      </span>
                    )}
                    <ChevronRight size={16} className="text-white/20" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Create Interview Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl p-8"
            style={{
              background: 'rgba(17,17,27,0.95)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <h3 className="text-xl font-bold text-white mb-6">
              New Interview 🚀
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Title</label>
                <input
                  className="input-field"
                  placeholder="Google SDE Interview"
                  value={newInterview.title}
                  onChange={(e) => setNewInterview({...newInterview, title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Company</label>
                <input
                  className="input-field"
                  placeholder="Google, Amazon, Meta..."
                  value={newInterview.company}
                  onChange={(e) => setNewInterview({...newInterview, company: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Type</label>
                  <select
                    className="input-field"
                    value={newInterview.type}
                    onChange={(e) => setNewInterview({...newInterview, type: e.target.value})}
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="coding">Coding</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/60 text-sm mb-2 block">Difficulty</label>
                  <select
                    className="input-field"
                    value={newInterview.difficulty}
                    onChange={(e) => setNewInterview({...newInterview, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Role</label>
                <select
                  className="input-field"
                  value={newInterview.role}
                  onChange={(e) => setNewInterview({...newInterview, role: e.target.value})}
                >
                  <option value="sde">SDE</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Fullstack</option>
                  <option value="devops">DevOps</option>
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-white/60 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createInterview}
                  className="flex-1 py-3 rounded-xl font-semibold text-white"
                  style={{
                    background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Start Interview 🚀
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard