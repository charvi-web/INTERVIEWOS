import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react'

const CameraBox = ({ onStreamReady }) => {
  const videoRef = useRef(null)
  // useRef — DOM element directly access karo
  // Video element ke liye zaroori

  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [stream, setStream] = useState(null)
  // stream — camera/mic ka MediaStream object

  useEffect(() => {
    startCamera()
    return () => stopCamera()
    // cleanup — component unmount pe camera band karo
  }, [])

  const startCamera = async () => {
    try {
      // Browser se camera + mic permission maango
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // front camera
        },
        audio: true
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // video element mein stream set karo
      }

      if (onStreamReady) onStreamReady(mediaStream)
      // parent component ko stream do — recording ke liye

    } catch (error) {
      console.error('Camera access denied:', error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      // har track (video/audio) band karo
    }
  }

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      // track disable karo — camera off
      setIsCameraOn(!isCameraOn)
    }
  }

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsMicOn(!isMicOn)
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
      
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        muted      // apni awaaz nahi sunni
        playsInline
        className="w-full h-64 object-cover"
        style={{ transform: 'scaleX(-1)' }}
        // mirror effect — selfie camera jaisa
      />

      {/* Camera off overlay */}
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)' }}>
          <CameraOff size={48} className="text-white/30" />
        </div>
      )}

      {/* Face detection indicator */}
      <motion.div
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full text-xs"
        style={{ background: 'rgba(0,0,0,0.5)', color: '#22c55e' }}
      >
        <div className="w-2 h-2 rounded-full bg-green-500" />
        Face Detected
      </motion.div>

      {/* Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
        <button
          onClick={toggleCamera}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isCameraOn 
              ? 'rgba(255,255,255,0.2)' 
              : 'rgba(239, 68, 68, 0.8)'
          }}
        >
          {isCameraOn 
            ? <Camera size={16} className="text-white" /> 
            : <CameraOff size={16} className="text-white" />}
        </button>

        <button
          onClick={toggleMic}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isMicOn 
              ? 'rgba(255,255,255,0.2)' 
              : 'rgba(239, 68, 68, 0.8)'
          }}
        >
          {isMicOn 
            ? <Mic size={16} className="text-white" /> 
            : <MicOff size={16} className="text-white" />}
        </button>
      </div>
    </div>
  )
}

export default CameraBox