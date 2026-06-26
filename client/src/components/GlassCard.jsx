import { motion } from 'framer-motion'
// motion — framer motion ka component
// HTML elements ko animate karta hai

const GlassCard = ({ 
  children,      // andar ka content
  className = '', // extra CSS classes
  hover = true,   // hover animation on/off
  delay = 0,      // animation delay
  onClick        // click handler
}) => {
  return (
    <motion.div
      // initial — pehle kaisa dikhega
      initial={{ opacity: 0, y: 20 }}
      // animate — final state
      animate={{ opacity: 1, y: 0 }}
      // transition — animation speed
      transition={{ duration: 0.5, delay }}
      // whileHover — hover pe kya hoga
      whileHover={hover ? { 
        scale: 1.02, 
        borderColor: 'rgba(14, 165, 233, 0.3)' 
      } : {}}
      onClick={onClick}
      className={`
        rounded-2xl p-6 
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        // Glassmorphism effect —
        // frosted glass jaisa dikhta hai
        // modern UI mein bohot popular
      }}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard