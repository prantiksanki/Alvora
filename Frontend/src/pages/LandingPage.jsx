import { Link } from 'react-router-dom';
import PageTransition from '../components/animations/PageTransition';
import { PrismaHero } from '../components/ui/prisma-hero';
import { LogoCloud } from '../components/ui/logo-cloud';
import { ZoomParallax } from '../components/ui/zoom-parallax';
import { ScrollingFeatureShowcase } from '../components/ui/scrolling-feature-showcase';
import { TestimonialsSection } from '../components/ui/testimonials';
import HoverFooter from '../components/ui/hover-footer';

const PLATFORM_LOGOS = [
  { src: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',   alt: 'GitHub',      width: 32, height: 32 },
  { src: 'https://sta.codeforces.com/s/91837/images/codeforces-sponsored-by-ton.png',   alt: 'Codeforces',  width: 120 },
  { src: 'https://cdn.codechef.com/images/cc-logo.svg',                                 alt: 'CodeChef',    width: 32, height: 32 },
  { src: 'https://assets.leetcode.com/static_assets/public/icons/favicon-96x96.png',    alt: 'LeetCode',    width: 32, height: 32 },
  { src: 'https://img.atcoder.jp/assets/atcoder.png',                                   alt: 'AtCoder',     width: 100 },
  { src: 'https://media.geeksforgeeks.org/gfg-gg-logo.svg',                             alt: 'GeeksForGeeks', width: 32, height: 32 },
];

const PARALLAX_IMAGES = [
  {
    src: 'https://images.pexels.com/photos/45683/pexels-photo-45683.jpeg?auto=compress&cs=tinysrgb&w=1920&q=100',
    alt: 'Atmospheric landscape main',
  },
  {
    src: 'https://images.unsplash.com/photo-1675208986455-372dc9d0029a?w=1280&auto=format&fit=crop&q=90',
    alt: 'Fantasy landscape',
  },
  {
    src: 'https://images.unsplash.com/photo-1672651160188-bf5963360408?w=1280&auto=format&fit=crop&q=90',
    alt: 'Cinematic environment',
  },
  {
    src: 'https://images.pexels.com/photos/14448869/pexels-photo-14448869.jpeg',
    alt: 'Dramatic sky',
  },
  {
    src: 'https://cdnb.artstation.com/p/assets/images/images/007/809/423/large/martin-nebelong-screenshot022.jpg?1508670530',
    alt: 'Fantasy 3D scene',
  },
  {
    src: 'https://cdnb.artstation.com/p/assets/images/images/051/729/377/large/nikjas-adam-quiet-morning-ue-5-1-by-nikjas-adam.jpg?1658040887',
    alt: 'Quiet morning 3D render',
  },
  {
    src: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1280&auto=format&fit=crop&q=90',
    alt: 'Cinematic clouds sunset',
  },
];


export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0d0c09] text-[#E1E0CC]">
        {/* Hero */}
        <PrismaHero />

        {/* Zoom parallax gallery */}
        <ZoomParallax images={PARALLAX_IMAGES} />

        {/* Scrolling feature showcase */}
        <ScrollingFeatureShowcase />

        {/* Platform logos */}
        <section className="py-20 px-6 border-y border-[#E1E0CC]/8">
          <p className="text-center text-xs mb-10 uppercase tracking-[0.3em]" style={{ color: '#6b6960' }}>Connects with</p>
          <LogoCloud logos={PLATFORM_LOGOS} />
        </section>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Footer */}
        <HoverFooter />
      </div>
    </PageTransition>
  );
}
