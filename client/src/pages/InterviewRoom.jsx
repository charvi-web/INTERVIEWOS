import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Camera, CameraOff,
  Send, Clock, ChevronRight, X,
  Brain, CheckCircle, AlertCircle
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import AIAvatar from '../components/AIAvatar'
import CameraBox from '../components/CameraBox'

const InterviewRoom = () => {
  const { id } = useParams()
  // useParams — URL se :id nikalo
  // /interview/6a37e5c6... → id = "6a37e5c6..."

  const navigate = useNavigate()

  // Questions aur answers
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  // currentIndex — abhi konsa question chal raha hai

  const [transcript, setTranscript] = useState('')
  // transcript — user ka spoken answer — text mein

  const [isListening, setIsListening] = useState(false)
  // isListening — mic on hai aur sun raha hai

  const [isAISpeaking, setIsAISpeaking] = useState(false)
  // isAISpeaking — AI question bol raha hai

  const [isEvaluating, setIsEvaluating] = useState(false)
  // isEvaluating — AI answer check kar raha hai

  const [evaluation, setEvaluation] = useState(null)
  // evaluation — AI ka feedback current question pe

  const [answers, setAnswers] = useState([])
  // answers — saare submitted answers

  const [timer, setTimer] = useState(0)
  // timer — kitne seconds ho gaye current question pe

  const [interviewDone, setInterviewDone] = useState(false)
  const [finalResult, setFinalResult] = useState(null)

  const recognitionRef = useRef(null)
  // useRef — Speech Recognition object store karo
  // re-render pe reset nahi hota

  const timerRef = useRef(null)

  // Axios instance with token
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  })

  useEffect(() => {
    fetchQuestions()
    setupSpeechRecognition()
    return () => {
      // cleanup
      if (recognitionRef.current) recognitionRef.current.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Timer — har second update karo
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentIndex])
  // currentIndex change hone pe timer reset

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get(`/ai/questions/${id}`)
      setQuestions(data.data)
      // pehla question AI se bolwao
      setTimeout(() => speakQuestion(data.data[0]?.text), 1000)
    } catch (error) {
      toast.error('Failed to load questions')
    }
  }

  // Speech Recognition setup
  const setupSpeechRecognition = () => {
    // Web Speech API — browser built-in
    // Koi extra library nahi chahiye
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    // continuous — ek baar mein poora answer suno — band mat karo

    recognition.interimResults = true
    // interimResults — type hote hue dikhao — real time

    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      // har word ke saath update karo
      const text = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
      setTranscript(text)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }

  // Text to Speech — AI question bolega
  const speakQuestion = (text) => {
    if (!text) return

    setIsAISpeaking(true)

    // Web Speech Synthesis API — browser built-in
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9    // speed
    utterance.pitch = 1     // pitch
    utterance.volume = 1    // volume

    // Female voice prefer karo
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v =>
      v.name.includes('Female') || v.name.includes('Samantha')
    )
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.onend = () => {
      setIsAISpeaking(false)
      // AI done speaking — mic start karo
      startListening()
    }

    window.speechSynthesis.speak(utterance)
  }

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
      setIsListening(true)
      setTranscript('')
      setTimer(0)
      toast('🎤 Listening... speak your answer', { duration: 2000 })
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      toast.error('Please speak your answer first!')
      return
    }

    stopListening()
    setIsEvaluating(true)

    try {
      const { data } = await api.post('/ai/answer', {
        questionId: questions[currentIndex]._id,
        transcript,
        timeTaken: timer,
        sessionId: id
      })

      setEvaluation(data.data.evaluation)
      // evaluation dikhao — score + feedback

      setAnswers(prev => [...prev, {
        question: questions[currentIndex].text,
        transcript,
        ...data.data.evaluation
      }])

      // Score bolwao AI se
      const feedbackText = `You scored ${data.data.evaluation.score} out of 10. ${data.data.evaluation.feedback}`
      speakFeedback(feedbackText)

    } catch (error) {
      toast.error('Failed to evaluate answer')
    } finally {
      setIsEvaluating(false)
    }
  }

  const speakFeedback = (text) => {
    setIsAISpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.onend = () => setIsAISpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const nextQuestion = () => {
    setEvaluation(null)
    setTranscript('')

    if (currentIndex + 1 >= questions.length) {
      // Saare questions ho gaye — complete karo
      completeInterview()
      return
    }

    const next = currentIndex + 1
    setCurrentIndex(next)
    setTimer(0)
    // Agli question AI se bolwao
    setTimeout(() => speakQuestion(questions[next].text), 500)
  }

  const completeInterview = async () => {
    try {
      toast.loading('Generating final report...')
      const { data } = await api.post(`/ai/complete/${id}`)
      setFinalResult(data.data.overallFeedback)
      setInterviewDone(true)
      toast.dismiss()
      toast.success('Interview completed! 🎉')
    } catch (error) {
      toast.error('Failed to complete interview')
    }
  }

  // Timer format — seconds → MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Interview Complete Screen
  if (interviewDone && finalResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center px-6"
      >
        <div className="max-w-2xl w-full">
          <div className="rounded-2xl p-8 text-center mb-6" style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #a855f7)' }}
            >
              <Trophy size={40} className="text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Interview Complete! 🎉
            </h2>

            <p className="text-white/40 mb-8">{finalResult.summary}</p>

            {/* Overall Score */}
            <div className="text-6xl font-bold mb-2" style={{
              background: 'linear-gradient(to right, #0ea5e9, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {finalResult.overallScore}/10
            </div>

            <p className="text-lg font-semibold mb-8" style={{
              color: finalResult.recommendation === 'Strong Hire' ? '#22c55e'
                : finalResult.recommendation === 'Hire' ? '#0ea5e9'
                : '#ef4444'
            }}>
              {finalResult.recommendation}
            </p>

            {/* Strengths */}
            <div className="text-left mb-6">
              <h3 className="text-white font-semibold mb-3">
                ✅ Strengths
              </h3>
              {finalResult.strengths?.map((s, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} style={{ color: '#22c55e' }} />
                  <span className="text-white/60 text-sm">{s}</span>
                </div>
              ))}
            </div>

            {/* Improvements */}
            <div className="text-left mb-6">
              <h3 className="text-white font-semibold mb-3">
                📈 Areas to Improve
              </h3>
              {finalResult.improvements?.map((imp, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} style={{ color: '#f59e0b' }} />
                  <span className="text-white/60 text-sm">{imp}</span>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="text-left mb-8">
              <h3 className="text-white font-semibold mb-3">
                🎯 Next Steps
              </h3>
              {finalResult.nextSteps?.map((step, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <ChevronRight size={14} style={{ color: '#0ea5e9' }} />
                  <span className="text-white/60 text-sm">{step}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl font-semibold text-white"
              style={{
                background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(135deg, #0d0d14 0%, #11111b 100%)'
    }}>

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4" style={{
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white/60 text-sm">Live Interview</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{
          background: 'rgba(255,255,255,0.05)'
        }}>
          <Clock size={14} style={{ color: '#0ea5e9' }} />
          <span className="text-white font-mono font-semibold">
            {formatTime(timer)}
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-sm">
            {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6">

        {/* Left — AI + Question */}
        <div className="flex-1 flex flex-col gap-6">

          {/* AI Avatar */}
          <div className="rounded-2xl p-8 flex flex-col items-center" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <AIAvatar
              isSpeaking={isAISpeaking}
              isThinking={isEvaluating}
            />
          </div>

          {/* Current Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-6"
              style={{
                background: 'rgba(14,165,233,0.05)',
                border: '1px solid rgba(14,165,233,0.15)'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} style={{ color: '#0ea5e9' }} />
                <span className="text-sm font-medium" style={{ color: '#0ea5e9' }}>
                  Question {currentIndex + 1}
                </span>
              </div>
              <p className="text-white text-lg leading-relaxed">
                {questions[currentIndex]?.text || 'Loading question...'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Transcript */}
          <div className="rounded-2xl p-6 flex-1" style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${isListening
              ? 'rgba(14,165,233,0.3)'
              : 'rgba(255,255,255,0.07)'}`
          }}>
            <div className="flex items-center gap-2 mb-3">
              <Mic size={14} style={{
                color: isListening ? '#0ea5e9' : 'rgba(255,255,255,0.3)'
              }} />
              <span className="text-sm" style={{
                color: isListening ? '#0ea5e9' : 'rgba(255,255,255,0.3)'
              }}>
                {isListening ? 'Listening...' : 'Your Answer'}
              </span>
            </div>
            <p className="text-white/70 leading-relaxed">
              {transcript || (
                <span className="text-white/20">
                  Your answer will appear here as you speak...
                </span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!evaluation ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isAISpeaking || isEvaluating}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all"
                  style={{
                    background: isListening
                      ? 'rgba(239,68,68,0.8)'
                      : 'rgba(14,165,233,0.2)',
                    border: `1px solid ${isListening
                      ? 'rgba(239,68,68,0.5)'
                      : 'rgba(14,165,233,0.3)'}`,
                    cursor: (isAISpeaking || isEvaluating) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isListening
                    ? <><MicOff size={18} /> Stop Recording</>
                    : <><Mic size={18} /> Start Recording</>
                  }
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submitAnswer}
                  disabled={!transcript || isEvaluating}
                  className="flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-white"
                  style={{
                    background: (!transcript || isEvaluating)
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(to right, #0ea5e9, #0284c7)',
                    border: 'none',
                    cursor: (!transcript || isEvaluating) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isEvaluating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <><Send size={18} /> Submit</>
                  )}
                </motion.button>
              </>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={nextQuestion}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(to right, #22c55e, #16a34a)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {currentIndex + 1 >= questions.length
                  ? '🎉 Complete Interview'
                  : <>Next Question <ChevronRight size={18} /></>
                }
              </motion.button>
            )}
          </div>
        </div>

        {/* Right — Camera + Evaluation */}
        <div className="w-80 flex flex-col gap-4">

          {/* Camera */}
          <CameraBox />

          {/* Progress Bar */}
          <div className="rounded-xl p-4" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)'
          }}>
            <div className="flex justify-between text-sm text-white/40 mb-2">
              <span>Progress</span>
              <span>{currentIndex + 1}/{questions.length}</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`
                }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(to right, #0ea5e9, #a855f7)' }}
              />
            </div>
          </div>

          {/* Evaluation Result */}
          <AnimatePresence>
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">AI Feedback</span>
                  <span className="text-2xl font-bold" style={{
                    color: evaluation.score >= 7 ? '#22c55e'
                      : evaluation.score >= 5 ? '#f59e0b'
                      : '#ef4444'
                  }}>
                    {evaluation.score}/10
                  </span>
                </div>

                <p className="text-white/60 text-sm mb-4 leading-relaxed">
                  {evaluation.feedback}
                </p>

                {evaluation.strengths?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-white/30 mb-2">STRENGTHS</p>
                    {evaluation.strengths.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <CheckCircle size={12} style={{ color: '#22c55e' }} />
                        <span className="text-white/50 text-xs">{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                {evaluation.improvements?.length > 0 && (
                  <div>
                    <p className="text-xs text-white/30 mb-2">IMPROVE</p>
                    {evaluation.improvements.map((imp, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <AlertCircle size={12} style={{ color: '#f59e0b' }} />
                        <span className="text-white/50 text-xs">{imp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default InterviewRoom