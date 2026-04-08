import { CheckCircle2 } from 'lucide-react'

export default function FeatureList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-[15px] text-[#A1A1AA]">
          <CheckCircle2 size={17} className="text-[#c9a84c] flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}
