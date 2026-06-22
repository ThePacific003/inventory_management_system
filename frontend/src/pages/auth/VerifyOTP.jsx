import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
// import  useAuth  from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import authStore from "../../store/authStore.jsx"

export default function VerifyOTP() {
  const navigate = useNavigate()
  const location = useLocation()
  // const { setUser } = useAuth()

  const email = location.state?.email || ''
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(600) // 10 min
  const inputs = useRef([])
  const {verifyOTP}=authStore()
  // countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleDigitChange = (index, value) => {
    // only digits
    const val = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = val
    setDigits(next)
    // auto-advance
    if (val && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length !== 6) {
      toast.error('Please enter all 6 digits')
      return
    }
    setLoading(true)
    try {
      // const res = await api.post('/auth/verify', { otp })
      // setUser(res.data.user)
      await verifyOTP({otp})
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      // clear fields on error
      setDigits(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 shadow-2xl">

          {/* Icon */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Verify your email</h1>
            <p className="text-white/40 text-sm">
              We sent a 6-digit code to{' '}
              {email && <span className="text-white/60 font-medium">{email}</span>}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP inputs */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-4">
                Enter code
              </label>
              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`
                      w-12 h-14 text-center text-xl font-bold text-white rounded-xl border transition-all
                      bg-white/5 focus:outline-none
                      ${d ? 'border-indigo-500/60 bg-indigo-500/10' : 'border-white/10'}
                      focus:border-indigo-500/80 focus:bg-indigo-500/10
                    `}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/30">Code expires in</span>
              <span className={`font-mono font-medium ${timer < 60 ? 'text-red-400' : 'text-white/60'}`}>
                {formatTime(timer)}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || timer === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : 'Verify email'}
            </button>
          </form>

          {/* Expired message */}
          {timer === 0 && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">
                OTP expired.{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="underline hover:text-red-300 transition-colors"
                >
                  Register again
                </button>
              </p>
            </div>
          )}

          <p className="text-center text-white/20 text-xs mt-6">
            Didn't receive it? Check your spam folder
          </p>
        </div>
      </div>
    </div>
  )
}
