import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authApi } from '../../api/services'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setAuth(res.token, {
        userId: res.userId, uuid: res.uuid,
        fullName: res.fullName, email: res.email,
        role: res.role, profileImageUrl: res.profileImageUrl,
      })
      navigate('/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-fleet-bg flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col w-[45%] bg-fleet-surface border-r border-fleet-border relative overflow-hidden p-12">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute h-px bg-gradient-to-r from-transparent via-fleet-amber/20 to-transparent w-full"
              style={{ top: `${20 + i * 22}%`, animationDelay: `${i * 0.7}s`, animation: 'shimmer 4s infinite' }} />
          ))}
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fleet-amber flex items-center justify-center">
            <Truck size={18} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-800 text-white">
            Fleet<span className="text-fleet-amber">OS</span>
          </span>
        </div>

        <div className="relative mt-auto">
          <h2 className="font-display text-4xl font-800 text-white leading-tight mb-4">
            Manage your fleet<br />with precision.
          </h2>
          <p className="text-fleet-subtle leading-relaxed max-w-xs">
            Real-time vehicle tracking, trip management, and analytics built for operations teams.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['Vehicle Tracking', 'Trip Analytics', 'Driver Management', 'PDF Reports', 'QR Integration'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full border border-fleet-border text-fleet-subtle text-xs font-mono">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-fleet-amber flex items-center justify-center">
              <Truck size={14} className="text-black" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-700 text-white">Fleet<span className="text-fleet-amber">OS</span></span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-700 text-white mb-1">Sign in</h1>
            <p className="text-fleet-subtle text-sm">Access your fleet management dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">Email</label>
              <input
                {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                type="email"
                placeholder="admin@fleetos.io"
                className={`input-fleet ${errors.email ? 'error' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-fleet-rose mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-fleet-subtle block mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-fleet pr-10 ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fleet-subtle hover:text-fleet-text transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-fleet-rose mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-fleet-amber hover:text-yellow-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="btn-amber w-full justify-center py-3 mt-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Authenticating…
                </span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight size={14} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-fleet-subtle text-xs mt-6">
            No account?{' '}
            <Link to="/register" className="text-fleet-amber hover:text-yellow-300 transition-colors font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
