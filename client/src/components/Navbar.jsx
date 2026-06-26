import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Brain, 
  BarChart3, 
  FileText,
  LogOut,
  Zap
} from 'lucide-react'
// lucide-react — beautiful icon library

const Navbar = () => {
  const location = useLocation()
  // useLocation — current URL path milti hai
  // active link highlight karne ke liye

  const navigate = useNavigate()
  // useNavigate — programmatically navigate karo

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    // token delete karo
    navigate('/login')
    // login page pe bhejo
  }

  // Navigation links
  const links = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/resume', icon: FileText, label: 'Resume' },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      // upar se slide down animation
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      style={{
        background: 'rgba(13, 13, 20, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl" style={{
            background: 'linear-gradient(to right, #0ea5e9, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            InterviewOS
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl
                transition-all duration-300 text-sm font-medium
                ${location.pathname === path
                  ? 'text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
                }
              `}
              style={location.pathname === path ? {
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#0ea5e9'
              } : {}}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl
            text-white/50 hover:text-red-400 hover:bg-red-400/10
            transition-all duration-300 text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </motion.nav>
  )
}

export default Navbar