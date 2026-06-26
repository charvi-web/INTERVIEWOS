import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// BrowserRouter — URL routing enable karta hai
// Bina iske /dashboard /login etc kaam nahi karte

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// QueryClient — API calls cache karta hai
// Baar baar same API call nahi hoti — performance better

import { Toaster } from 'react-hot-toast'
// Toaster — beautiful notifications
// "Interview Created!" "Login Successful!" etc

import './index.css'
import App from './App.jsx'

// QueryClient banao — default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,           // fail hone pe 1 baar retry karo
      staleTime: 5 * 60 * 1000, // 5 min tak data fresh maano
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode — development mein extra warnings deta hai */}
    <BrowserRouter>
      {/* QueryClientProvider — poori app mein react-query available */}
      <QueryClientProvider client={queryClient}>
        <App />
        {/* Toaster — kahi se bhi toast.success() call kar sako */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 17, 27, 0.9)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#0ea5e9',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)