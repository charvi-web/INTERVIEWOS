import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Brain, Code2, Trophy } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  
  // isLogin — true: login form, false: signup form
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    // e.preventDefault — page refresh rokta hai
    setLoading(true)

    try {
      const url = isLogin 
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/signup'

      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData

      const { data } = await axios.post(url, payload)
      // axios.post — POST request bhejo
      // data — response ka data

      // Token save karo localStorage mein
      localStorage.setItem('accessToken', data.data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      toast.success(isLogin ? 'Welcome back! 🎉' : 'Account created! 🚀')
      navigate('/dashboard')

    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Features list — left side pe dikhega
  const features = [
    { icon: Brain, text: 'AI-Powered Interviews' },
    { icon: Code2, text: 'Live Coding Environment' },
    { icon: Trophy, text: 'FAANG-Level Questions' },
  ]

  return (
    <div className="min-h-screen flex">
      
      {/* Left Side — Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-col justify-center px-16 w-1/2"
        style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(168,85,247,0.1) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}>
            <Zap size={24} className="text-white" />
          </div>
          <span className="text-3xl font-bold" style={{
            background: 'linear-gradient(to right, #0ea5e9, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            InterviewOS
          </span>
        </div>

        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
          Ace Your Next
          <br />
          <span style={{
            background: 'linear-gradient(to right, #0ea5e9, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            FAANG Interview
          </span>
        </h1>

        <p className="text-white/50 text-lg mb-12">
          Practice with AI interviewer, get real-time feedback, and land your dream job.
        </p>

        {/* Features */}
        <div className="flex flex-col gap-4">
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
                <Icon size={18} style={{ color: '#0ea5e9' }} />
              </div>
              <span className="text-white/70">{text}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-12">
          {[
            { value: '10K+', label: 'Interviews' },
            { value: '95%', label: 'Success Rate' },
            { value: '500+', label: 'Questions' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>
                {stat.value}
              </p>
              <p className="text-white/40 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Form Card */}
          <div className="rounded-2xl p-8" style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back 👋' : 'Create account 🚀'}
            </h2>
            <p className="text-white/40 mb-8">
              {isLogin ? 'Sign in to continue your journey' : 'Start your interview preparation'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Name field — only signup */}
              {!isLogin && (
                <div>
                  <label className="text-white/60 text-sm mb-2 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Charvi Singh"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="charvi@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input-field"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-white mt-2"
                style={{
                  background: loading 
                    ? 'rgba(14,165,233,0.5)' 
                    : 'linear-gradient(to right, #0ea5e9, #0284c7)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </motion.button>
            </form>

            {/* Toggle Login/Signup */}
            <p className="text-center text-white/40 mt-6 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold hover:underline"
                style={{ color: '#0ea5e9' }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login