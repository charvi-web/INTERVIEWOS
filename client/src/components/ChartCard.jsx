import { motion } from 'framer-motion'

// ChartCard — reusable chart wrapper component
// Har chart ke liye same glassmorphism container
const ChartCard = ({
  title,      // chart ka title
  icon: Icon, // lucide icon
  color = '#0ea5e9', // icon color
  children,   // chart component andar jayega
  delay = 0,  // animation delay
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl p-6 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${color}20` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
          )}
          {title && (
            <h3 className="text-white font-semibold text-base">{title}</h3>
          )}
        </div>
      )}

      {/* Chart Content */}
      {children}
    </motion.div>
  )
}

export default ChartCard