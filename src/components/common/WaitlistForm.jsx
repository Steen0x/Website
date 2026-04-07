import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function WaitlistForm({ className = '' }) {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]       = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!isValid) {
      setError('Please enter a valid email address.')
      return
    }
    console.log('Waitlist signup:', email.trim())
    setSubmitted(true)
    setEmail('')
    setError('')
  }

  if (submitted) {
    return (
      <div className={className}>
        <div className="inline-flex items-center gap-2.5 text-sm text-[#A1A1AA] bg-black border border-white/[0.08] rounded-xl px-4 py-3">
          <CheckCircle2 size={15} className="text-[#22C55E] flex-shrink-0" />
          You're on the list. We'll be in touch soon.
        </div>
        <p className="text-xs text-[#3F3F46] mt-2.5">Currently in closed beta · Early access coming soon</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="your@email.com"
          className="flex-1 min-w-0 bg-black border border-white/[0.08] text-[#FAFAFA] placeholder-[#3F3F46] text-sm rounded-xl px-4 py-3 outline-none focus:border-[#06B6D4]/40 transition-colors"
        />
        <button
          type="submit"
          className="flex-shrink-0 flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
        >
          Join Waitlist
          <ArrowRight size={14} />
        </button>
      </form>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <p className="text-xs text-[#3F3F46] mt-2.5">Currently in closed beta · Early access coming soon</p>
    </div>
  )
}
