import { useRef } from 'react';
import { salon } from '../data/salon';
import { useBooking } from '../lib/bookingContext';
import { gsap, MOTION_OK, REDUCED, SplitText, useGSAP } from '../lib/motion';
import { useMedia } from '../lib/useMedia';
import { ArrowIcon } from './ArrowIcon';

interface HeroProps {
  posterSrc: string;
  posterSmallSrc: string;
  videoSrc: string;
}

const ALT_TEXT = 'Interno di un salone: specchi ad arco illuminati, poltrone in pelle color cognac e una finestra ad arco su Roma';

export function Hero({ posterSrc, posterSmallSrc, videoSrc }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { goToBooking } = useBooking();
  const isWide = useMedia('(min-width: 861px)');
  const prefersReduced = useMedia(REDUCED);
  const playsVideo = isWide && !prefersReduced;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: MOTION_OK, wide: '(min-width: 861px)' },
        (context) => {
          const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
          if (!motion || !titleRef.current) return;

          const split = SplitText.create(titleRef.current, { type: 'chars', mask: 'chars', aria: 'auto' });
          const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
          intro
            .from('.hero__media', { scale: 1.18, duration: 2.2, ease: 'power3.out' }, 0)
            .from(split.chars, { yPercent: 115, duration: 1.1, stagger: 0.025 }, 0.05)
            .from('.hero__footer > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.45);

          if (!wide) return;

          const video = videoRef.current;
          const travel = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: '+=220%',
              pin: true,
              scrub: 0.6,
              onUpdate: (self) => {
                if (video?.duration) video.currentTime = self.progress * (video.duration - 0.05);
              },
            },
          });
          travel
            .to(split.masks, { yPercent: -60, opacity: 0, stagger: { each: 0.02, from: 'center' }, ease: 'power2.in', duration: 0.45 }, 0)
            .to('.hero__footer', { y: -40, opacity: 0, ease: 'power2.in', duration: 0.3 }, 0)
            .to('.hero__scroll', { opacity: 0, duration: 0.15 }, 0)
            .to('.hero__scrim', { opacity: 0.35, ease: 'none', duration: 0.7 }, 0.1)
            .to('.hero__outro', { opacity: 1, y: 0, ease: 'expo.out', duration: 0.35 }, 0.65);

          return () => split.revert();
        },
      );
    },
    { scope: rootRef, dependencies: [playsVideo], revertOnUpdate: true },
  );

  return (
    <section ref={rootRef} className="hero" aria-labelledby="hero-title">
      <div className="hero__media">
        <img
          src={posterSrc}
          srcSet={`${posterSmallSrc} 1080w, ${posterSrc} 1920w`}
          sizes="100vw"
          alt={ALT_TEXT}
          width={1920}
          height={1072}
          fetchPriority="high"
        />
        {playsVideo && <video ref={videoRef} src={videoSrc} poster={posterSrc} muted playsInline preload="auto" aria-hidden="true" />}
      </div>
      <div className="hero__scrim" />

      <div className="hero__content">
        <h1 id="hero-title" ref={titleRef} className="hero__title">
          {salon.name}
        </h1>
        <div className="hero__footer">
          <p className="hero__lead">Salone unisex a Roma. Taglio, colore e barba, su appuntamento dal martedì al sabato.</p>
          <div className="hero__actions">
            <button type="button" className="button" onClick={() => goToBooking()}>
              Prenota un orario
              <ArrowIcon />
            </button>
            <a className="text-link" href="#servizi">
              Servizi e prezzi
            </a>
          </div>
        </div>
      </div>

      <p className="hero__outro" aria-hidden="true">
        Benvenuto da Aura.
      </p>

      <div className="hero__scroll" aria-hidden="true">
        <span className="hero__scroll-line" />
        Scorri per entrare
      </div>
    </section>
  );
}
