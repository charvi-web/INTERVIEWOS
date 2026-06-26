import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Copy, Check, Terminal } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

// Supported languages
const LANGUAGES = [
  { id: 63, name: 'JavaScript', value: 'javascript' },
  { id: 71, name: 'Python', value: 'python' },
  { id: 54, name: 'C++', value: 'cpp' },
  { id: 62, name: 'Java', value: 'java' },
]

// Default code templates
const DEFAULT_CODE = {
  javascript: `// Write your solution here
function solution(nums) {
  // your code here
  return result;
}

console.log(solution([1, 2, 3]));`,

  python: `# Write your solution here
def solution(nums):
    # your code here
    return result

print(solution([1, 2, 3]))`,

  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    // your code here
    return 0;
}`,

  java: `public class Solution {
    public static void main(String[] args) {
        // your code here
    }
}`,
}

const CodeEditor = ({ problem = '' }) => {
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [code, setCode] = useState(DEFAULT_CODE.javascript)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(DEFAULT_CODE[lang.value])
    // language change pe default template
    setOutput('')
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Write some code first!')
      return
    }

    setIsRunning(true)
    setOutput('Running...')

    try {
      // Judge0 API — code run karta hai
      // Sabhi major languages support karta hai
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions',
        {
          source_code: btoa(code),
          // btoa — base64 encode karo
          language_id: language.id,
          stdin: btoa(''),
        },
        {
          headers: {
            'X-RapidAPI-Key': import.meta.env.VITE_JUDGE0_API_KEY || 'demo',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
        }
      )

      const token = response.data.token
      // token — submission ID — result fetch karne ke liye

      // Poll karo result ke liye — 2 sec baad
      setTimeout(async () => {
        try {
          const result = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            {
              headers: {
                'X-RapidAPI-Key': import.meta.env.VITE_JUDGE0_API_KEY || 'demo',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
              },
              params: { base64_encoded: 'true' },
            }
          )

          const data = result.data

          if (data.stdout) {
            setOutput(atob(data.stdout))
            // atob — base64 decode karo
          } else if (data.stderr) {
            setOutput(`Error:\n${atob(data.stderr)}`)
          } else if (data.compile_output) {
            setOutput(`Compile Error:\n${atob(data.compile_output)}`)
          } else {
            setOutput('No output')
          }
        } catch (err) {
          setOutput('Failed to get result')
        } finally {
          setIsRunning(false)
        }
      }, 2000)

    } catch (error) {
      // Judge0 API key nahi hai — mock output dikhao
      setOutput(`// Mock Output (Add VITE_JUDGE0_API_KEY for real execution)
> Code received: ${code.split('\n').length} lines
> Language: ${language.name}
> Status: Would execute successfully ✅`)
      setIsRunning(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const resetCode = () => {
    setCode(DEFAULT_CODE[language.value])
    setOutput('')
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      border: '1px solid rgba(255,255,255,0.1)',
      background: 'rgba(0,0,0,0.4)',
    }}>

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{
        background: 'rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.07)'
      }}>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: language.id === lang.id
                  ? 'rgba(14,165,233,0.2)'
                  : 'transparent',
                color: language.id === lang.id
                  ? '#0ea5e9'
                  : 'rgba(255,255,255,0.4)',
                border: language.id === lang.id
                  ? '1px solid rgba(14,165,233,0.3)'
                  : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: copied ? '#22c55e' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>

          <button
            onClick={resetCode}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} />
          </button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{
              background: isRunning
                ? 'rgba(34,197,94,0.3)'
                : 'linear-gradient(to right, #22c55e, #16a34a)',
              border: 'none',
              cursor: isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            {isRunning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Play size={14} />
            )}
            {isRunning ? 'Running...' : 'Run'}
          </motion.button>
        </div>
      </div>

      {/* Problem Statement */}
      {problem && (
        <div className="px-4 py-3" style={{
          background: 'rgba(14,165,233,0.05)',
          borderBottom: '1px solid rgba(14,165,233,0.1)'
        }}>
          <p className="text-white/60 text-sm leading-relaxed">{problem}</p>
        </div>
      )}

      {/* Code Area */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full p-4 text-sm resize-none outline-none font-mono"
        style={{
          background: 'transparent',
          color: '#e2e8f0',
          minHeight: '300px',
          // font-mono — monospace font — code ke liye
          lineHeight: '1.6',
          tabSize: 2,
        }}
        spellCheck={false}
        // spellCheck false — code mein spelling check mat karo
        onKeyDown={(e) => {
          // Tab key — spaces insert karo — tab change nahi hoga
          if (e.key === 'Tab') {
            e.preventDefault()
            const start = e.target.selectionStart
            const end = e.target.selectionEnd
            const newCode = code.substring(0, start) + '  ' + code.substring(end)
            setCode(newCode)
            // Cursor position set karo tab ke baad
            setTimeout(() => {
              e.target.selectionStart = start + 2
              e.target.selectionEnd = start + 2
            }, 0)
          }
        }}
      />

      {/* Output Terminal */}
      {output && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 px-4 py-2" style={{
            background: 'rgba(0,0,0,0.3)'
          }}>
            <Terminal size={12} style={{ color: '#22c55e' }} />
            <span className="text-xs" style={{ color: '#22c55e' }}>
              Output
            </span>
          </div>
          <pre className="px-4 py-3 text-sm font-mono overflow-auto"
            style={{
              color: output.includes('Error')
                ? '#ef4444'
                : '#22c55e',
              // Error — red, Success — green
              maxHeight: '150px',
              background: 'rgba(0,0,0,0.2)'
            }}
          >
            {output}
          </pre>
        </motion.div>
      )}
    </div>
  )
}

export default CodeEditor