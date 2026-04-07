import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
}

function Check({ text }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
      <CheckCircle2 size={14} className="text-[#6366F1]/70 flex-shrink-0 mt-0.5" />
      {text}
    </li>
  )
}

const plans = [
  {
    name:        'Free',
    price:       '$0',
    period:      'forever',
    description: 'Start your journey with the essentials.',
    href:        'https://whop.com/checkout/plan_vpZI2qjyG8yxs?d2c=true',
    cta:         'Join Now',
    featured:    false,
    features: [
      'Free Ultimate Trading Guide',
      'Frequent Education & Live Trading',
      'Community & Stream Access',
      'Free Strategies & Setups',
    ],
  },
  {
    name:        'Monthly',
    price:       '$79',
    period:      'per month',
    description: 'Full access. Cancel anytime.',
    href:        'https://whop.com/checkout/plan_l9cYRB40pLTTT/',
    cta:         'Get Access Now',
    featured:    true,
    badge:       'Most Popular',
    features: [
      'Fusion v2 Indicator Suite (Monthly)',
      'Frequent In-Depth Market Analysis',
      'Frequent Exclusive Livestreams',
      'All Trading Signals w/ Setups',
      '24/7 Support + Lifetime Updates',
    ],
  },
  {
    name:        'Lifetime',
    price:       '$999',
    period:      'one time',
    description: 'Pay once. Own it forever.',
    href:        'https://whop.com/checkout/plan_LTvSN41OCIQj0/',
    cta:         'Get Access Now',
    featured:    false,
    features: [
      'Fusion v2 Indicator Suite (Lifetime)',
      'Frequent In-Depth Market Analysis',
      'Frequent Exclusive Livestreams',
      'All Trading Signals w/ Setups',
      '24/7 Support + Lifetime Updates',
    ],
  },
]

export default function PricingSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="pricing" className="py-28 bg-black relative overflow-hidden" ref={ref}>
      {/* Subtle ambient gradient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-[0.04] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, #6366F1, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="section-container">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          variants={fadeUp}
          custom={0}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <span className="eyebrow mb-4">Pricing</span>
          <h2 className="text-[clamp(32px,4vw,48px)] font-black tracking-[-0.03em] text-[#FAFAFA] mt-4">
            Simple, transparent pricing
          </h2>
          <p className="text-[#A1A1AA] mt-4 text-[16px] max-w-md mx-auto">
            Start free. Upgrade when you're ready. No hidden fees.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              custom={i + 1}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="relative flex flex-col"
            >
              {plan.featured ? (
                /* Featured card — elevated with gradient border, no glow/pulse */
                <div className="gradient-border flex-1 flex flex-col scale-[1.02] origin-bottom">
                  <div className="flex flex-col flex-1 p-7 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-[#6366F1]">{plan.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#09090B] bg-[#6366F1] px-2.5 py-1 rounded-full">
                          {plan.badge}
                        </span>
                      </div>
                      <div className="flex items-end gap-2 mb-1">
                        <span className="text-[48px] font-black tracking-tight text-[#FAFAFA]">{plan.price}</span>
                        <span className="text-sm text-[#71717A] mb-3">{plan.period}</span>
                      </div>
                      <p className="text-sm text-[#A1A1AA]">{plan.description}</p>
                    </div>
                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                          <CheckCircle2 size={14} className="text-[#6366F1] flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={plan.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-center text-[14px] px-5 py-3 rounded-xl font-bold mt-auto"
                    >
                      {plan.cta}
                    </a>
                  </div>
                </div>
              ) : (
                /* Regular card */
                <div className="bento-card flex-1 flex flex-col p-7 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-[#71717A] mb-4">{plan.name}</p>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-[48px] font-black tracking-tight text-[#FAFAFA]">{plan.price}</span>
                      <span className="text-sm text-[#71717A] mb-3">{plan.period}</span>
                    </div>
                    <p className="text-sm text-[#A1A1AA]">{plan.description}</p>
                  </div>
                  <ul className="flex flex-col gap-2.5 flex-1">
                    {plan.features.map((f) => <Check key={f} text={f} />)}
                  </ul>
                  <a
                    href={plan.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-center text-[14px] px-5 py-3 rounded-xl font-semibold mt-auto block"
                  >
                    {plan.cta}
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
