import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  return (
    <>
      <main className="min-h-[80vh] bg-black flex items-center justify-center px-6 py-24">
        <motion.div
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center mx-auto mb-6">
            <Mail size={22} className="text-[#6366F1]" />
          </div>
          <span className="eyebrow mb-5 inline-block">Contact</span>
          <h1 className="text-[clamp(32px,5vw,52px)] font-black tracking-[-0.03em] leading-[1.08] mb-5">
            <span className="gradient-text">Get in Touch</span>
          </h1>
          <p className="text-[16px] text-[#A1A1AA] leading-[1.75] mb-8">
            Have a question, feedback, or partnership inquiry? We'd love to hear from you. Reach out directly and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:martin@tradenet.org?subject=Inquiry%20from%20TradeNet%20Website"
            className="btn-gold inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[15px]"
          >
            <Mail size={16} />
            Contact Us at martin@tradenet.org
          </a>
        </motion.div>
      </main>
      <Footer />
    </>
  )
}
