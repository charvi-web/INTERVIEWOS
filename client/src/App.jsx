import { Routes, Route, Navigate } from 'react-router-dom'
// Routes — sab routes ka container
// Route — ek specific URL pe ek component dikhao
// Navigate — redirect karo

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import InterviewRoom from './pages/InterviewRoom.jsx'
import Analytics from './pages/Analytics.jsx'
import Navbar from './components/Navbar.jsx'

// Auth check karo — token hai toh logged in
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken')
  // localStorage — browser mein data save karo
  // Token save kiya tha login ke time
  
  if (!token) {
    return <Navigate to="/login" replace />
    // Token nahi hai — login page pe bhejo
  }
  return children
  // Token hai — component dikhao
}

function App() {
  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0d0d14 0%, #11111b 50%, #0d0d14 100%)'
    }}>
      <Routes>
        {/* Public route — koi bhi dekh sakta hai */}
        <Route path="/login" element={<Login />} />
        
        {/* Private routes — sirf logged in user */}
        <Route path="/" element={
          <PrivateRoute>
            <Navbar />
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Navbar />
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/interview/:id" element={
          <PrivateRoute>
            {/* Interview room mein Navbar nahi — full screen */}
            <InterviewRoom />
          </PrivateRoute>
        } />

        <Route path="/analytics" element={
          <PrivateRoute>
            <Navbar />
            <Analytics />
          </PrivateRoute>
        } />

        {/* Koi bhi unknown URL — dashboard pe bhejo */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App