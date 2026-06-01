import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import api from '../../api/axios'
import toast from 'react-hot-toast'
import EyeIcon from '../../components/EyeIcon'
import useAuth from '../../store/authStore'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const {resetPassword}=useAuth()

  const getPasswordStrength = (pw) => {
    if (!pw) return { label: '', color: '', width: '0%' }
    let score = 0
    if (pw.length >= 6) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[a-z]/.test(pw)) score++
    if (/\d/.test(pw)) score++
    if (/[@$!%*?&]/.test(pw)) score++
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (score <= 4) return { label: 'Fair', color: 'bg-yellow-500', width: '66%' }
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' }
  }

  const strength = getPasswordStrength(form.newPassword)
  const passwordsMatch = form.confirmPassword && form.newPassword === form.confirmPassword

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await resetPassword(form)
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
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

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[
              { label: 'Email', done: true },
              { label: 'Verify', done: true },
              { label: 'Reset', active: true },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-8 h-px bg-white/10" />}
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center
                    ${step.done ? 'bg-emerald-500/20 border border-emerald-500/40' : ''}
                    ${step.active ? 'bg-indigo-500' : ''}
                    ${!step.done && !step.active ? 'bg-white/10' : ''}
                  `}>
                    {step.done ? (
                      <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className={`text-xs font-bold ${step.active ? 'text-white' : 'text-white/30'}`}>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs ${step.active ? 'text-white/60' : step.done ? 'text-white/30' : 'text-white/20'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <div className="w-12 h-12 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
            <p className="text-white/40 text-sm">Create a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-white/20 focus:outline-none focus:border-indigo-500/60 transition-all"
                />
                <EyeIcon show={showNew} toggle={() => setShowNew(!showNew)} />
              </div>
              {form.newPassword && (
                <div className="mt-2">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
                  </div>
                  <p className="text-xs text-white/40 mt-1">{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-white/20 focus:outline-none transition-all
                    ${form.confirmPassword
                      ? passwordsMatch
                        ? 'border-emerald-500/60 bg-emerald-500/5'
                        : 'border-red-500/60 bg-red-500/5'
                      : 'border-white/10 focus:border-indigo-500/60'
                    }
                  `}
                />
                <EyeIcon show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
              </div>
              {form.confirmPassword && (
                <p className={`text-xs mt-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Resetting...
                </>
              ) : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
