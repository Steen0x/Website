import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import WistiaEmbed from '@/components/common/WistiaEmbed'
import WrittenReviewsSection from '@/components/pages/casestudies/WrittenReviewsSection'

const videos = [
  { title: "Josh's Review", id: 'h6z2yvol74' },
  { title: "Soh's Review", id: 'ibqav3z6qq' },
]

export default function CaseStudiesPage() {
  const reviewRef = useRef(null)
  const reviewInView = useInView(reviewRef, { once: true, margin: '-60px' })

  return (
    <main className="bg-black pt-24 min-h-screen">
      {/* Header */}
      <section className="py-16 border-b border-white/[0.04]">
        <div className="section-container">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-[#71717A] hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="eyebrow mb-4 block w-fit">Member Results</span>
            <h1 className="text-[clamp(32px,4.5vw,56px)] font-black tracking-[-0.03em] leading-[1.06]">
              Real Members,{' '}
              <span className="gradient-text">Real Results</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Video testimonials */}
      <section className="py-16 border-b border-white/[0.04]">
        <div className="section-container">
          <h2 className="text-xl font-bold text-[#FAFAFA] mb-8">Video Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((v, i) => (
              <motion.div
                key={v.id}
                className="bento-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="p-4 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-[#A1A1AA]">{v.title}</p>
                </div>
                <div className="p-4">
                  <WistiaEmbed id={v.id} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Written reviews */}
      <section className="py-16" ref={reviewRef}>
        <div className="section-container">
          <motion.h2
            className="text-xl font-bold text-[#FAFAFA] mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={reviewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            Member Reviews
          </motion.h2>
          <WrittenReviewsSection />
        </div>
      </section>
    </main>
  )
}
