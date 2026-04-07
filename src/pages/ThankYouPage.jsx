import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06), transparent)' }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6366F1]/30 to-transparent" />

      <motion.div
        className="relative text-center max-w-lg"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Check icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/25 flex items-center justify-center mx-auto mb-7">
          <CheckCircle2 size={28} className="text-[#6366F1]" />
        </div>

        <h1 className="text-[clamp(36px,5vw,56px)] font-black tracking-[-0.035em] leading-[1.04] mb-5">
          <span className="gradient-text">Welcome Aboard!</span>
        </h1>

        <div className="text-[16px] text-[#A1A1AA] leading-[1.8] mb-8 space-y-3 text-left bg-black border border-white/[0.06] rounded-2xl p-6">
          <p>Hey, it's Martin.</p>
          <p>
            I'm genuinely excited you made the decision to join TradeNet. What you now have access to is the exact system
            our team uses to find high-probability setups every single day.
          </p>
          <p>
            Take your time going through the education, set up your indicator, and jump into the community. We're here
            24/7 if you need anything at all.
          </p>
          <p className="text-[#FAFAFA] font-semibold">Let's make this count.</p>
          <p className="text-[#6366F1] font-bold">— The TradeNet Team</p>
        </div>

        <a
          href="https://whop.com/joined/tradenet-pro"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px]"
        >
          Go to Member's Area
          <ArrowRight size={16} />
        </a>
      </motion.div>
    </main>
  )
}
