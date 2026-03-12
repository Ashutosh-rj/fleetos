import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { authApi } from '../../api/services'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1=email, 2=otp, 3=newpass
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const form1 = useForm()
  const form2 = useForm()
  const form3 = useForm()

  const sendOtp = async ({ email: e }) => {
    setLoading(true)
    try {
      await authApi.sendOtp({ email: e })
      setEmail(e)
      toast.success('OTP sent to your email')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const verifyOtp = async ({ otp }) => {
    setLoading(true)
    try {
      await authApi.verifyOtp({ email, otp })
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const resetPass = async ({ otp, newPassword }) => {
    setLoading(true)
    try {
      await authApi.resetPassword({ email, otp, newPassword })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    } finally { setLoading(false) }
  }

  const stepLabel = ['Send OTP', 'Verify OTP', 'New Password']

  return (
    <div className="min-h-screen bg-fleet-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-fleet-amber flex items-center justify-center">
            <Truck size={14} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-700 text-white">Fleet<span className="text-fleet-amber">OS</span></span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-600 border transition-all ${
                s < step  ? 'bg-fleet-emerald border-fleet-emerald text-black' :
                s === step? 'bg-fleet-amber border-fleet-amber text-black' :
                            'bg-transparent border-fleet-border text-fleet-subtle'}`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`flex-1 h-px transition-all ${s < step ? 'bg-fleet-emerald' : 'bg-fleet-border'}`} />}
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-700 text-white mb-1">Reset Password</h1>
          <p className="text-fleet-subtle text-sm">{stepLabel[step - 1]}</p>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(sendOtp)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">Email address</label>
              <input {...form1.register('email', { required: true, pattern: /\S+@\S+\.\S+/ })}
                type="email" placeholder="your@email.com"
                className={`input-fleet ${form1.formState.errors.email ? 'error' : ''}`} />
            </div>
            <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-3 text-sm">
              {loading ? 'Sending…' : <span className="flex items-center gap-2">Send OTP <ArrowRight size={14} /></span>}
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={form2.handleSubmit(verifyOtp)} className="space-y-4">
            <p className="text-xs text-fleet-subtle">OTP sent to <span className="text-fleet-amber font-mono">{email}</span></p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">6-digit OTP</label>
              <input {...form2.register('otp', { required: true })}
                placeholder="000000" maxLength={6}
                className="input-fleet font-mono text-center text-xl tracking-widest" />
            </div>
            <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-3 text-sm">
              {loading ? 'Verifying…' : <span className="flex items-center gap-2">Verify <ArrowRight size={14} /></span>}
            </button>
            <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full justify-center py-2.5 text-sm">
              <ArrowLeft size={14} /> Back
            </button>
          </form>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <form onSubmit={form3.handleSubmit(resetPass)} className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-fleet-emerald/10 border border-fleet-emerald/20 mb-2">
              <ShieldCheck size={14} className="text-fleet-emerald" />
              <span className="text-xs text-fleet-emerald">OTP verified successfully</span>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">OTP (re-enter)</label>
              <input {...form3.register('otp', { required: true })} placeholder="000000"
                className="input-fleet font-mono" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">New Password</label>
              <input {...form3.register('newPassword', { required: true, minLength: 8 })}
                type="password" placeholder="Min 8 characters"
                className={`input-fleet ${form3.formState.errors.newPassword ? 'error' : ''}`} />
            </div>
            <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-3 text-sm">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="text-center text-fleet-subtle text-xs mt-6">
          <Link to="/login" className="text-fleet-amber hover:text-yellow-300 font-medium flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
