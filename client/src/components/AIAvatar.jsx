import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

const AIAvatar = ({ isSpeaking = false, isThinking = false }) => {
  // isSpeaking — AI question bol raha hai
  // isThinking — AI answer evaluate kar raha hai

  return (
    <div className="flex flex-col items-center gap-4">
      
      {/* Avatar Circle */}
      <div className="relative">
        {/* Outer glow ring — speaking pe animate hota hai */}
        {isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(14, 165, 233, 0.3)' }}
          />
        )}

        {/* Main avatar */}
        <motion.div
          animate={isSpeaking ? {
            scale: [1, 1.05, 1],
            // speaking pe thoda pulse karo
          } : {}}
          transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
          className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
            boxShadow: isSpeaking 
              ? '0 0 40px rgba(14, 165, 233, 0.5)' 
              : '0 0 20px rgba(14, 165, 233, 0.2)'
          }}
        >
          <Brain size={40} className="text-white" />
        </motion.div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-white font-semibold">AI Interviewer</p>
        <motion.p
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-sm mt-1"
          style={{ color: '#0ea5e9' }}
        >
          {isThinking ? '🤔 Evaluating your answer...' 
           : isSpeaking ? '🎤 Speaking...' 
           : '👂 Listening...'}
        </motion.p>
      </div>

      {/* Sound waves — speaking pe dikhti hain */}
      {isSpeaking && (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                height: ['8px', '24px', '8px'],
                // wave effect
              }}
              transition={{ 
                duration: 0.5, 
                repeat: Infinity, 
                delay: i * 0.1 
              }}
              className="w-1 rounded-full"
              style={{ background: '#0ea5e9' }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default AIAvatar