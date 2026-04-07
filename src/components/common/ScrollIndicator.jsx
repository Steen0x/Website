import { motion } from 'framer-motion'

export default function ScrollIndicator() {
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5 text-[#71717A]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
    >
      <span className="text-xs tracking-widest uppercase font-medium">Scroll</span>
      <motion.div
        className="w-px h-10 bg-gradient-to-b from-[#c9a84c]/60 to-transparent"
        animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
