import { motion } from 'framer-motion'
import { Linkedin, Mail } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55 } }),
}

const team = [
  {
    name: 'Martin Shurtleff',
    role: 'CEO & Founder',
    bio: 'With over 6 years in the trading space and a background in Computer Science and Quantitative Trading, Martin built TradeNet from the ground up with a singular mission: to give independent traders access to the same institutional-grade tools and education that professional desks use every day.',
    linkedin: 'https://www.linkedin.com/in/martinshurtleff/',
    email: 'martin@tradenet.org',
    initials: 'MS',
    color: '#6366F1',
  },
  {
    name: 'Constantine Beseris',
    role: 'COO & Chief Technical Analyst',
    bio: 'With five years immersed in the charts, Constantine brings deep technical expertise to TradeNet. Specializing in smart-money concepts and multi-timeframe analysis, he leads the team\'s market research and signal generation — and is the analytical force behind many of the community\'s highest-probability setups.',
    linkedin: 'https://www.linkedin.com/in/constantine-beseris-b624a0291/',
    email: 'constantine@tradenet.org',
    initials: 'CB',
    color: '#06B6D4',
  },
  {
    name: 'Evan Wawrzaszek',
    role: 'Chief Administrator & Technical Analyst',
    bio: 'After profitably trading since 2021, Evan brings a practitioner\'s perspective to TradeNet. As Chief Administrator and Technical Analyst, he keeps operations running smoothly and contributes to the ongoing development of TradeNet\'s trading strategies and member experience.',
    linkedin: null,
    email: null,
    initials: 'EW',
    color: '#10B981',
  },
]

const pillars = [
  {
    title: 'Who We Are',
    body: 'We are a collective of veteran traders, quantitative analysts, and engineers who have spent years in the markets. We\'ve felt the frustration of poor tools, vague signals, and communities that take your money without delivering real value. TradeNet is the answer we built for ourselves — and opened to everyone.',
  },
  {
    title: 'What We Do',
    body: 'We build proprietary indicators and systematic frameworks that give traders a genuine statistical edge. Our tools are built on real backtested data, not theory. Combined with in-depth education and live trading access, we give members the complete package.',
  },
  {
    title: 'Why We Do It',
    body: 'The trading industry is saturated with noise, fake gurus, and overhyped systems. We exist to cut through all of that and empower traders with confidence, clarity, and tools that actually work. Our members\' results are our measure of success.',
  },
]

export default function AboutPage() {
  return (
    <main className="bg-black pt-24 min-h-screen">
      {/* Header */}
      <section className="py-20 border-b border-white/[0.04] relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #6366F1, transparent)', filter: 'blur(60px)' }}
        />
        <div className="section-container relative text-center max-w-2xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="eyebrow mb-5 inline-block">About Us</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="text-[clamp(32px,4.5vw,56px)] font-black tracking-[-0.03em] leading-[1.06] mb-5"
          >
            Meet the Minds Behind<br />
            <span className="gradient-text">the Market Edge</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="text-[17px] text-[#A1A1AA] leading-[1.75]"
          >
            We're a collective of seasoned traders, quants, and engineers dedicated to one thing: building systems that win.
          </motion.p>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                className="bento-card p-7 flex flex-col gap-5"
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-[#09090B]"
                  style={{ background: member.color }}
                >
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FAFAFA]">{member.name}</h3>
                  <p className="text-sm font-medium text-[#6366F1] mt-0.5">{member.role}</p>
                </div>
                <p className="text-sm text-[#A1A1AA] leading-[1.75] flex-1">{member.bio}</p>
                <div className="flex gap-3 pt-3 border-t border-white/[0.05]">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#06B6D4] transition-colors"
                    >
                      <Linkedin size={13} /> LinkedIn
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#6366F1] transition-colors"
                    >
                      <Mail size={13} /> Email
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                className="bento-card p-7 space-y-3"
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
              >
                <h3 className="text-lg font-bold text-[#FAFAFA]">{p.title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-[1.75]">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="py-20 border-t border-white/[0.04] text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(99,102,241,0.04), transparent)' }}
        />
        <div className="section-container relative">
          <h2 className="text-[clamp(24px,3.5vw,40px)] font-black tracking-[-0.025em] text-[#FAFAFA]">
            Built on a Foundation of{' '}
            <span className="gradient-text">Real Results</span>
          </h2>
        </div>
      </section>
    </main>
  )
}
