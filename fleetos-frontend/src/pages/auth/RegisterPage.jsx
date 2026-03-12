import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { authApi } from '../../api/services'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authApi.register(data)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fleet-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-fleet-amber flex items-center justify-center">
            <Truck size={14} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-700 text-white">Fleet<span className="text-fleet-amber">OS</span></span>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-700 text-white mb-1">Create account</h1>
          <p className="text-fleet-subtle text-sm">Join your fleet management team.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">Full Name</label>
            <input {...register('fullName', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              placeholder="John Driver" className={`input-fleet ${errors.fullName ? 'error' : ''}`} />
            {errors.fullName && <p className="text-xs text-fleet-rose mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">Email</label>
            <input {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              type="email" placeholder="you@company.com" className={`input-fleet ${errors.email ? 'error' : ''}`} />
            {errors.email && <p className="text-xs text-fleet-rose mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">Phone (optional)</label>
            <input {...register('phone')} placeholder="+1 555 000 0000" className="input-fleet" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">Password</label>
            <div className="relative">
              <input {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                type={showPass ? 'text' : 'password'} placeholder="••••••••"
                className={`input-fleet pr-10 ${errors.password ? 'error' : ''}`} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fleet-subtle hover:text-fleet-text">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-fleet-rose mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="btn-amber w-full justify-center py-3 text-sm disabled:opacity-60">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              <span className="flex items-center gap-2">Create Account <ArrowRight size={14} /></span>
            )}
          </button>
        </form>

        <p className="text-center text-fleet-subtle text-xs mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-fleet-amber hover:text-yellow-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
