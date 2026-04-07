import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ScrollIndicator from '@/components/common/ScrollIndicator'

const stats = [
  { value: '1K+',  label: 'Members'          },
  { value: '96%',  label: 'Positive Feedback' },
  { value: '24/7', label: 'Support'           },
  { value: '4',    label: 'Exchanges'         },
]

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function HeroSection() {
  const navigate = useNavigate()

  function scrollToPricing() {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative min-h-screen flex flex-col bg-black overflow-hidden"
      style={{ isolation: 'isolate' }}
    >
      {/* ── Spline 3D — iframe embed, full-section background ── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      >
        <iframe
          src="https://my.spline.design/boxeshover-yHbiGykrETBxjS5SEJcWWpWc/"
          width="100%"
          height="100%"
          title="Spline 3D Scene"
          style={{ display: 'block', width: '100%', height: '100%', border: 'none' }}
        />
      </div>

      {/* ── Gradient overlays — pointer-events-none ── */}
      {/* Left fade for text legibility on desktop */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 35%, rgba(0,0,0,0.2) 55%, transparent 70%)',
        }}
      />
      {/* Mobile — full vignette */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          zIndex: 1,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.70)',
        }}
      />
      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent"
        style={{ zIndex: 1, pointerEvents: 'none' }}
      />

      {/* ── Content — left column, pointer-events-none wrapper ── */}
      <div
        className="relative flex flex-col flex-1 justify-center pt-24 pb-20"
        style={{ zIndex: 2, pointerEvents: 'none' }}
      >
        <div className="section-container w-full">
          <div className="w-full md:max-w-[520px] lg:max-w-[540px] xl:max-w-[580px] space-y-7">

            {/* Eyebrow */}
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
              <span className="eyebrow">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                The same systems we trade with — and traders who know how to use them
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              className="space-y-1"
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="visible"
            >
              <h1 className="text-[clamp(40px,5.5vw,72px)] font-black leading-[1.01] tracking-[-0.04em] text-[#FAFAFA]">
                Most Traders Lose.
              </h1>
              <h1 className="text-[clamp(40px,5.5vw,72px)] font-black leading-[1.01] tracking-[-0.04em] gradient-text">
                We Built a System<br />That Doesn't.
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="text-[17px] text-[#A1A1AA] leading-[1.75] max-w-[440px]"
            >
              From institutional-grade education and the Fusion AI Indicator to our new
              Quantum Terminal — TradeNet hands you the exact tools top traders use to
              scale P&L.
            </motion.p>

            {/* CTAs — pointer-events-auto */}
            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3"
              style={{ pointerEvents: 'auto' }}
            >
              <button
                onClick={() => navigate('/terminal')}
                className="inline-flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold px-6 py-3 rounded-xl text-[15px] transition-colors"
              >
                Join Terminal Waitlist
                <ArrowRight size={16} />
              </button>
              <button
                onClick={scrollToPricing}
                className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[15px]"
              >
                See Plans
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              custom={4}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-4 gap-px bg-white/[0.07] rounded-2xl overflow-hidden border border-white/[0.07] max-w-[400px]"
            >
              {stats.map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 py-4 px-2 bg-black/80 backdrop-blur-sm"
                >
                  <span className="text-xl font-black tracking-tight gradient-text">{value}</span>
                  <span className="text-[10px] text-[#71717A] text-center leading-tight">{label}</span>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="relative flex justify-center pb-6"
        style={{ zIndex: 2, pointerEvents: 'auto' }}
      >
        <ScrollIndicator />
      </div>
    </section>
  )
}
