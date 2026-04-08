import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Shield, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const tierLabels = {
  free:         'Free',
  pro_monthly:  'Pro — Monthly',
  pro_annual:   'Pro — Annual',
  founding:     'Founding Member',
}

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [loading, user, navigate])

  if (loading || !user) {
    return (
      <main className="bg-black min-h-screen pt-24 flex items-center justify-center">
        <p className="text-[#71717A] text-sm">Loading...</p>
      </main>
    )
  }

  const tier = profile?.subscription_tier || 'free'
  const tierLabel = tierLabels[tier] || 'Waitlist'
  const isActive = tier !== 'free'

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <main className="bg-black min-h-screen pt-24">
      <div className="section-container py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto space-y-6"
        >
          <h1 className="text-3xl font-black text-[#FAFAFA]">Account</h1>

          {/* Profile card */}
          <div className="bento-card p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 flex items-center justify-center">
                <User size={20} className="text-[#c9a84c]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#FAFAFA]">{user.email}</p>
                <p className="text-xs text-[#71717A]">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t border-white/[0.05] pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-[#71717A]" />
                <span className="text-sm text-[#A1A1AA]">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={14} className="text-[#71717A]" />
                <span className="text-sm text-[#A1A1AA]">
                  Subscription:{' '}
                  <span className={isActive ? 'text-[#c9a84c] font-semibold' : 'text-[#71717A]'}>
                    {tierLabel}
                  </span>
                </span>
              </div>
            </div>

            {!isActive && (
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(201,168,76,0.04)',
                  border: '1px solid rgba(201,168,76,0.12)',
                }}
              >
                <p className="text-sm text-[#A1A1AA]">
                  You're on the free tier.{' '}
                  <Link
                    to="/#pricing"
                    className="text-[#c9a84c] hover:text-[#f0c040] font-semibold transition-colors"
                  >
                    Upgrade to Pro →
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-[#71717A] hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </motion.div>
      </div>
    </main>
  )
}
