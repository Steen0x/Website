import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const BASE = 'https://storage.googleapis.com/hostinger-horizons-assets-prod/3d810307-bbc4-4f21-91d6-f292df1a885d/'

const allImages = [
  '5b19d3cc57057985263becf18c9d7d27.png',
  '84db651a34eb5115a1f51ccb1fd93290.png',
  '65ef551c8129e2e64f3d4ac74c979205.png',
  '142e99181a91648d482ca2d937294ae5.png',
  'f086e919266de2c2d68b942a836b0d30.png',
  'f4fff7ce52fa9913bf33ce6cfe526f02.png',
  'b351ebd262d5d48fdd36f9daec61c844.png',
  '8127093ded1936a750c5a3087c81f2a2.png',
  'd6b005638d8151f915d5038dc0cf334d.png',
  'c9d968d06944ebdb4dcb5c1ed1b0ce5d.png',
  '3176c8830b07fc28aa65b8bd914f7f7a.png',
  '415ca47f4b45f463a6be7c49ec62f370.png',
  '4f463c623031707cac74cd618f54b38c.png',
  '06f7c9eec558c58c3ab21fa6073e0d13.png',
  'dd3313d448e99ed3bc4088ce99c22cee.png',
  '963414e09d03cbb9d9fc488eac9c3f89.png',
  '56c159c4351d73663a9dfdc2fc8d32fc.png',
  'd852f0f2e5f2a0d86097309bff9a4fb7.png',
  'be6d35d842ad223ac49d3e74bb14e5bd.png',
  '6322416bfbf27eda6357d91ab97f41d0.png',
  '5c148fc777d714e3891834dd6e8de672.png',
  '5430ba822e71ae98d43dd1401a5a5731.png',
  'bb1cf517f781b2da433ebfd2a3ec1d20.png',
  '372349fb4a15c01b5ed04cb823951b63.png',
].map((f) => BASE + f)

const row1 = allImages.slice(0, 12)
const row2 = allImages.slice(12)

function TickerRow({ images, reverse = false }) {
  const doubled = [...images, ...images]
  return (
    <div className="ticker-wrap">
      <div
        className={`flex gap-3 ${reverse ? 'animate-ticker-right' : 'animate-ticker-left'}`}
        style={{ width: 'max-content' }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-52 h-32 rounded-xl overflow-hidden border border-white/[0.06] bg-black"
          >
            <img
              src={src}
              alt="Community win"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReviewsTicker() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-black overflow-hidden" ref={ref}>
      <div className="section-container mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <span className="eyebrow mb-4 block w-fit">Community Wins</span>
            <h2 className="text-[clamp(28px,3.5vw,44px)] font-black tracking-[-0.03em] text-[#FAFAFA]">
              See our community wins
            </h2>
          </div>
          <p className="text-[15px] text-[#71717A] max-w-sm">
            Our members are consistently finding success. Here's a live look at their recent profits.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TickerRow images={row1} />
        <TickerRow images={row2} reverse />
      </motion.div>
    </section>
  )
}
