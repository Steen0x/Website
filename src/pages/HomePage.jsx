import HeroSection          from '@/components/pages/home/HeroSection'
import TerminalTeaserSection from '@/components/pages/home/TerminalTeaserSection'
import HandguideSection      from '@/components/pages/home/HandguideSection'
import FeaturesSection       from '@/components/pages/home/FeaturesSection'
import ReviewsTicker         from '@/components/pages/home/ReviewsTicker'
import PricingSection        from '@/components/pages/home/PricingSection'
import CtaSection            from '@/components/pages/home/CtaSection'

export default function HomePage() {
  return (
    <main className="bg-black">
      <HeroSection />
      <TerminalTeaserSection />
      <HandguideSection />
      <FeaturesSection />
      <ReviewsTicker />
      <PricingSection />
      <CtaSection />
    </main>
  )
}
