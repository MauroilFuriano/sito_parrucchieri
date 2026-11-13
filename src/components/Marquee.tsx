import { useRef } from 'react';
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from '../lib/motion';

const rows = [
  ['Taglio', 'Colore', 'Balayage', 'Piega', 'Barba'],
  ['Senza ammoniaca', 'Panno caldo', 'Consulenza', 'Sposa', 'Rituel uomo'],
];

export function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const loops = gsap.utils.toArray<HTMLElement>('.marquee__row').map((row, index) =>
          gsap.fromTo(
            row,
            { xPercent: index % 2 ? -50 : 0 },
            { xPercent: index % 2 ? 0 : -50, ease: 'none', duration: 38, repeat: -1 },
          ),
        );
        let resetSpeed: gsap.core.Tween | undefined;
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => loops.forEach((loop) => (self.isActive ? loop.play() : loop.pause())),
          onUpdate: (self) => {
            const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(self.getVelocity()) / 400);
            loops.forEach((loop) => loop.timeScale(boost * (self.direction === -1 ? -1 : 1)));
            resetSpeed?.kill();
            resetSpeed = gsap.to({}, {
              duration: 0.4,
              onComplete: () => loops.forEach((loop) => gsap.to(loop, { timeScale: self.direction === -1 ? -1 : 1, duration: 0.8 })),
            });
          },
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="marquee" aria-hidden="true">
      {rows.map((words, index) => (
        <div key={index} className="marquee__row">
          {[...words, ...words].map((word, wordIndex) => (
            <span key={`${word}-${wordIndex}`} className="marquee__item">
              {word}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
