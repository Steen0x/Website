import { Star } from 'lucide-react'

const reviews = [
  {
    name: 'The Honk',
    avatar: 'https://cdn.discordapp.com/avatars/991588391806312490/4066c19c6ba38ab9d2be19fa18fef308.webp',
    rating: 5,
    text: "TradeNet has genuinely changed how I approach the markets. The indicator is incredibly clean — no repaint, no lag. I was skeptical at first but the back-tested stats held up in live trading. The community is also surprisingly active and the analysis is top-tier. Easily the best investment I've made in my trading career.",
  },
  {
    name: 'Wavy',
    avatar: 'https://cdn.discordapp.com/avatars/910650884298526832/edf92af622194c2f2dd941c244d5aa61.webp',
    rating: 5,
    text: 'I joined because a friend recommended it and I was blown away. The education alone is worth 10x the price. The live streams break down exactly why trades are being taken, not just what to do. I actually understand my setups now instead of just blindly following signals. If you want to actually learn to trade, this is it.',
  },
  {
    name: 'TheReelNick',
    avatar: 'https://cdn.discordapp.com/avatars/233687145808658432/7e850f11c46c86ccdea540397fdf8636.webp',
    rating: 5,
    text: "Been in multiple trading communities and TradeNet is in a different league. The indicator actually works, the signals come with full rationale, and the team is responsive 24/7. I've recouped the cost of the lifetime membership multiple times over. The smart money integration is next level — catches moves I would have completely missed.",
  },
  {
    name: 'Soh',
    avatar: 'https://cdn.discordapp.com/avatars/995492266154147880/45c114fa00a16b19ce6e93734b039819.webp',
    rating: 5,
    text: 'Genuinely surprised by the quality here. The Fusion indicator gives clean entries — I use it on 15m BTC and ETH and the confluence signals are something else. Martin and Constantine are constantly improving the tool and sharing updates. The lifetime deal was an absolute steal. Can\'t recommend this enough.',
  },
  {
    name: 'TTRiple',
    avatar: 'https://cdn.discordapp.com/avatars/945421014182027284/bd474440675fe9940507365459075739.webp',
    rating: 5,
    text: "What sets TradeNet apart is the education. They don't just hand you setups — they explain WHY. After 2 months I'm making my own calls confidently. The community is also incredibly welcoming, no toxic behavior, just traders helping traders. The 24/7 support team actually replies fast too which is rare.",
  },
  {
    name: 'tea',
    avatar: 'https://cdn.discordapp.com/avatars/779110330227621920/a_125fd39cc5fbbccdb299578153e68c1b.webp',
    rating: 5,
    text: "I was losing money consistently before TradeNet. The handguide alone restructured my entire approach to risk management. Add in the indicator and the live trade breakdowns and it's a completely different experience. Six months in and I'm consistently profitable for the first time. This community actually delivers what it promises.",
  },
]

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="text-[#c9a84c] fill-[#c9a84c]" />
      ))}
    </div>
  )
}

export default function WrittenReviewsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((r) => (
        <div key={r.name} className="bento-card p-6 flex flex-col gap-4">
          <Stars count={r.rating} />
          <p className="text-sm text-[#A1A1AA] leading-[1.7] flex-1">"{r.text}"</p>
          <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
            <img
              src={r.avatar}
              alt={r.name}
              className="w-8 h-8 rounded-full object-cover border border-white/[0.08]"
            />
            <div>
              <p className="text-sm font-semibold text-[#FAFAFA]">{r.name}</p>
              <p className="text-xs text-[#71717A]">TradeNet Member</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
