import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, Brain, Trophy, Target,
  Calendar, Star, Zap, ArrowUp
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import GlassCard from '../components/GlassCard'

// Custom Tooltip for charts — dark theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-xl text-sm" style={{
        background: 'rgba(17,17,27,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const Analytics = () => {
  const [stats, setStats] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, interviewsRes] = await Promise.all([
        api.get('/interviews/stats'),
        api.get('/interviews')
      ])
      setStats(statsRes.data.data)
      setInterviews(interviewsRes.data.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  // Chart colors
  const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b', '#ef4444']

  // Difficulty pie chart data
  const difficultyData = stats?.byDifficulty?.map(d => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.count
  })) || []

  // Type bar chart data
  const typeData = stats?.byType?.map(t => ({
    name: t._id.charAt(0).toUpperCase() + t._id.slice(1),
    count: t.count
  })) || []

  // Last 7 days line chart
  const activityData = stats?.last7Days?.map(d => ({
    date: d._id.slice(5), // "2026-06-21" → "06-21"
    interviews: d.count
  })) || []

  // Score distribution from interviews
  const scoreData = interviews
    .filter(i => i.score > 0)
    .map(i => ({
      name: i.title.slice(0, 15) + '...',
      score: i.score
    }))

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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">
            Analytics{' '}
            <span style={{
              background: 'linear-gradient(to right, #0ea5e9, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Dashboard 📊
            </span>
          </h1>
          <p className="text-white/40 mt-1">
            Track your interview performance and progress
          </p>
        </motion.div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Interviews',
              value: stats?.totalInterviews || 0,
              icon: Brain,
              color: '#0ea5e9',
              change: '+12%'
            },
            {
              label: 'Avg Score',
              value: `${stats?.avgScore || 0}/10`,
              icon: Star,
              color: '#f59e0b',
              change: '+5%'
            },
            {
              label: 'Best Score',
              value: `${stats?.maxScore || 0}/10`,
              icon: Trophy,
              color: '#22c55e',
              change: '+8%'
            },
            {
              label: 'Completed',
              value: stats?.completedInterviews || 0,
              icon: Target,
              color: '#a855f7',
              change: '+15%'
            },
          ].map((stat, i) => (
            <GlassCard key={i} delay={i * 0.1}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}>
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="flex items-center gap-1 text-xs"
                  style={{ color: '#22c55e' }}>
                  <ArrowUp size={12} />
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-white/40 text-sm mt-1">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">

          {/* Activity Line Chart */}
          <GlassCard delay={0.2}>
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={18} style={{ color: '#0ea5e9' }} />
              <h3 className="text-white font-semibold">Last 7 Days Activity</h3>
            </div>
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={activityData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="interviews"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ fill: '#0ea5e9', r: 4 }}
                    activeDot={{ r: 6, fill: '#0ea5e9' }}
                    name="Interviews"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-white/20">No activity data yet</p>
              </div>
            )}
          </GlassCard>

          {/* Difficulty Pie Chart */}
          <GlassCard delay={0.3}>
            <div className="flex items-center gap-2 mb-6">
              <Target size={18} style={{ color: '#a855f7' }} />
              <h3 className="text-white font-semibold">By Difficulty</h3>
            </div>
            {difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    // innerRadius — donut chart
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-white/20">No data yet</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Type Bar Chart */}
          <GlassCard delay={0.4}>
            <div className="flex items-center gap-2 mb-6">
              <Zap size={18} style={{ color: '#f59e0b' }} />
              <h3 className="text-white font-semibold">By Interview Type</h3>
            </div>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={typeData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Count"
                    radius={[6, 6, 0, 0]}
                    // radius — rounded top corners
                  >
                    {typeData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-white/20">No data yet</p>
              </div>
            )}
          </GlassCard>

          {/* Score History */}
          <GlassCard delay={0.5}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} style={{ color: '#22c55e' }} />
              <h3 className="text-white font-semibold">Score History</h3>
            </div>
            {scoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="rgba(255,255,255,0.2)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="score"
                    name="Score"
                    radius={[6, 6, 0, 0]}
                    fill="#22c55e"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-center">
                <div>
                  <TrendingUp size={32} className="text-white/20 mx-auto mb-2" />
                  <p className="text-white/20 text-sm">
                    Complete interviews to see score history
                  </p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default Analytics