import { useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { Booking } from './components/Booking';
import { Chat } from './components/Chat';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Lookbook } from './components/Lookbook';
import { Manifesto } from './components/Manifesto';
import { Marquee } from './components/Marquee';
import { Nav } from './components/Nav';
import { Promotions } from './components/Promotions';
import { Services } from './components/Services';
import { BookingProvider } from './lib/bookingContext';
import { useSmoothScroll } from './lib/motion';

const HERO_POSTER = '/hero_entrata_1920.jpg';
const HERO_POSTER_SMALL = '/hero_entrata_1080.jpg';
const HERO_VIDEO = '/hero_entrata_scrub.mp4';

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  useSmoothScroll();

  return (
    <BookingProvider>
      <div id="top">
        <Nav />
        <main>
          <Hero posterSrc={HERO_POSTER} posterSmallSrc={HERO_POSTER_SMALL} videoSrc={HERO_VIDEO} />
          <div id="after-hero" aria-hidden="true" />
          <Manifesto />
          <Services />
          <Lookbook />
          <Promotions />
          <Marquee />
          <Booking />
        </main>
        <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
      </div>
      <Chat />
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
    </BookingProvider>
  );
}
