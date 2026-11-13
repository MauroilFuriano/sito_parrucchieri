import { useRef } from 'react';
import { gsap, MOTION_OK, revealWords, useGSAP } from '../lib/motion';

const looks = [
  { src: '/donna_3.png', alt: 'Balayage biondo miele su capelli lunghi', caption: 'Balayage', wide: false },
  { src: '/uomo_3.png', alt: 'Taglio sfumato corto durante la rifinitura a forbice', caption: 'Taglio sfumato', wide: true },
  { src: '/donna_1.png', alt: 'Onde morbide castane con riflessi caldi', caption: 'Piega mossa', wide: false },
  { src: '/uomo_2.png', alt: 'Barba modellata e taglio corto con riga laterale', caption: 'Barba con panno caldo', wide: true },
  { src: '/donna_2.png', alt: 'Caschetto mosso durante la piega', caption: 'Taglio e piega', wide: false },
  { src: '/uomo_1.png', alt: "Taglio uomo con ciuffo pettinato all'indietro", caption: 'Taglio classico', wide: true },
];

export function Lookbook() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, wide: '(min-width: 861px)' }, (context) => {
        const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        const split = titleRef.current ? revealWords(titleRef.current) : null;
        if (!wide || !trackRef.current) return () => split?.revert();

        const track = trackRef.current;
        const distance = () => track.scrollWidth - window.innerWidth;
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>('.look').forEach((look) => {
          gsap.fromTo(
            look.querySelector('img'),
            { xPercent: 6 },
            {
              xPercent: -6,
              ease: 'none',
              scrollTrigger: { trigger: look, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
            },
          );
          gsap.from(look, {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: look, containerAnimation: slide, start: 'left 92%', toggleActions: 'play none none reverse' },
          });
        });
        return () => split?.revert();
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} id="lookbook" className="lookbook" aria-labelledby="lookbook-title">
      <div ref={trackRef} className="lookbook__track">
        <div className="lookbook__intro">
          <h2 id="lookbook-title" ref={titleRef} className="section-title">
            Il <em>lookbook</em>
          </h2>
          <p>Tagli, colori e barbe usciti dalle nostre poltrone. Scorri per sfogliarli.</p>
        </div>
        {looks.map((look) => (
          <figure key={look.src} className={look.wide ? 'look look--wide' : 'look'}>
            <img src={look.src} alt={look.alt} width={640} height={640} loading="lazy" decoding="async" />
            <figcaption>{look.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
