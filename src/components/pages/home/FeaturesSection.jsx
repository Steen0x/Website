import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, CheckCircle2, Globe2, Headphones, TrendingUp } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

function FeatureCheck({ text }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
      <CheckCircle2 size={15} className="text-[#6366F1] flex-shrink-0 mt-0.5" />
      {text}
    </li>
  )
}

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const navigate = useNavigate()

  return (
    <section id="features" className="py-28 bg-black" ref={ref}>
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-14"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <span className="eyebrow mb-4 block w-fit">Why Choose TradeNet?</span>
          <h2 className="text-[clamp(32px,4vw,52px)] font-black tracking-[-0.03em] text-[#FAFAFA] max-w-xl leading-[1.08]">
            Everything serious traders need,<br />
            <span className="gradient-text">in one system.</span>
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 auto-rows-auto">

          {/* CARD 1 — Fusion AI — large */}
          <motion.div
            className="bento-card md:col-span-3 lg:col-span-4 p-7 flex flex-col gap-5 relative overflow-hidden"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {/* Accent gradient */}
            <div
              className="absolute top-0 right-0 w-64 h-64 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #6366F1, transparent 70%)', filter: 'blur(40px)' }}
            />
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/20 px-2.5 py-1 rounded-full mb-3">
                  Flagship
                </div>
                <h3 className="text-xl font-bold text-[#FAFAFA] leading-tight">Fusion AI-Driven Indicator</h3>
              </div>
              <button
                onClick={() => navigate('/indicator')}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-[#6366F1] hover:text-[#6366F1]/80 transition-colors group"
              >
                Learn more
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <p className="text-sm text-[#71717A] leading-relaxed max-w-md">
              Our proprietary TradingView indicator combines smart-money concepts with AI-driven confluence to deliver
              high-probability entries — not signals that look good in hindsight.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <FeatureCheck text="80% Back-Tested Winrate*" />
              <FeatureCheck text="Multi-Confluence Algorithm" />
              <FeatureCheck text="Smart-Money Integration" />
              <FeatureCheck text="Non-Repaint" />
              <FeatureCheck text="Intuitive UI" />
            </ul>
          </motion.div>

          {/* CARD 2 — Community — medium */}
          <motion.div
            className="bento-card md:col-span-3 lg:col-span-2 p-7 flex flex-col gap-4"
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users size={18} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-[#FAFAFA] leading-tight">Built Around a Real Community</h3>
            <ul className="flex flex-col gap-1.5">
              <FeatureCheck text="In-Depth Analysis" />
              <FeatureCheck text="Market Discussions" />
              <FeatureCheck text="Mentorship" />
              <FeatureCheck text="Q&A Sessions" />
              <FeatureCheck text="Full Member Support" />
            </ul>
          </motion.div>

          {/* CARD 3 — Education — spans wider */}
          <motion.div
            className="bento-card md:col-span-2 lg:col-span-4 p-7 flex flex-col gap-4 relative overflow-hidden"
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div
              className="absolute bottom-0 left-0 w-48 h-48 opacity-[0.06] pointer-events-none"
              style={{ background: 'radial-gradient(circle, #06B6D4, transparent 70%)', filter: 'blur(40px)' }}
            />
            <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-[#6366F1]" />
            </div>
            <h3 className="text-lg font-bold text-[#FAFAFA] leading-tight">
              We Don't Just Give Signals — We Teach You How to Trade
            </h3>
            <p className="text-sm text-[#71717A]">
              Build real skills, not dependency. Our education suite covers everything from fundamentals to advanced institutional strategies.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <FeatureCheck text="Live Trade Setups + Rationale" />
              <FeatureCheck text="Exclusive Education & Trading Streams" />
              <FeatureCheck text="Complete Education Suite" />
              <FeatureCheck text="Community of Profitable Traders" />
              <FeatureCheck text="Lessons From Top Analysts" />
            </ul>
          </motion.div>

          {/* CARD 4 — All Levels */}
          <motion.div
            className="bento-card md:col-span-1 lg:col-span-2 p-7 flex flex-col gap-3"
            variants={fadeUp}
            custom={4}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="text-3xl mb-1">📈</div>
            <h3 className="text-base font-bold text-[#FAFAFA]">For Traders of All Levels</h3>
            <p className="text-sm text-[#71717A]">
              Whether you're brand new or a seasoned pro, our structured approach meets you where you are and scales with your growth.
            </p>
          </motion.div>

          {/* CARD 5 — Global Markets */}
          <motion.div
            className="bento-card md:col-span-2 lg:col-span-2 p-7 flex flex-col gap-3"
            variants={fadeUp}
            custom={5}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-1">
              <Globe2 size={18} className="text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-[#FAFAFA]">Global Markets</h3>
            <p className="text-sm text-[#71717A]">
              Coverage across crypto, forex, and beyond. Trade the markets that move the most, with the tools to trade them well.
            </p>
          </motion.div>

          {/* CARD 6 — Expert Support */}
          <motion.div
            className="bento-card md:col-span-3 lg:col-span-2 p-7 flex flex-col gap-3"
            variants={fadeUp}
            custom={6}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-1">
              <Headphones size={18} className="text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-[#FAFAFA]">Expert Support</h3>
            <p className="text-sm text-[#71717A]">
              24/7 access to our team and community. Never feel lost in a trade again — help is always available.
            </p>
          </motion.div>

        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-xs text-[#71717A]/70 text-center">
          *Win-rate is based on historical backtesting. Past performance is not indicative of future results.
        </p>
      </div>
    </section>
  )
}

// Need the Users icon imported
function Users({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
