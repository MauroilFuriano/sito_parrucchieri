import { useRef } from 'react';
import { gsap, MOTION_OK, SplitText, useGSAP } from '../lib/motion';

const facts = [
  { value: '0%', label: 'ammoniaca nel colore' },
  { value: '9–19', label: 'dal martedì al sabato' },
  { value: 'Uomo e donna', label: 'un solo salone, due listini' },
];

export function Manifesto() {
  const rootRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (!textRef.current) return;
        const split = SplitText.create(textRef.current, { type: 'words', aria: 'auto' });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: { trigger: textRef.current, start: 'top 78%', end: 'bottom 45%', scrub: true },
          },
        );
        gsap.from('.fact', {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: '.manifesto__facts', start: 'top 85%', once: true },
        });
        return () => split.revert();
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="section wrap" aria-labelledby="manifesto-title">
      <div className="manifesto">
        <h2 id="manifesto-title" className="manifesto__label">
          Il salone
        </h2>
        <p ref={textRef} className="manifesto__text">
          Un salone unisex a Roma dove ci si siede, si parla e si decide insieme. Taglio, colore, balayage e barba con panno caldo, con il
          tempo che serve e il prezzo detto prima di iniziare.
        </p>
        <div className="manifesto__facts">
          {facts.map((fact) => (
            <div key={fact.label} className="fact">
              <p className="fact__value">{fact.value}</p>
              <p className="fact__label">{fact.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
