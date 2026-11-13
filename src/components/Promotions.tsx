import { useRef } from 'react';
import { promotions } from '../data/salon';
import { useBooking } from '../lib/bookingContext';
import { gsap, MOTION_OK, revealWords, useGSAP } from '../lib/motion';
import { ArrowIcon } from './ArrowIcon';

export function Promotions() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { goToBooking } = useBooking();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, wide: '(min-width: 861px)' }, (context) => {
        const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        const split = titleRef.current ? revealWords(titleRef.current) : null;
        const cards = gsap.utils.toArray<HTMLElement>('.promo');

        if (wide) {
          cards.slice(0, -1).forEach((card, index) => {
            gsap.to(card, {
              scale: 0.94 + index * 0.02,
              filter: 'brightness(0.6)',
              ease: 'none',
              scrollTrigger: { trigger: cards[index + 1], start: 'top 70%', end: 'top 200px', scrub: true },
            });
          });
        }

        cards.forEach((card) => {
          gsap.from(card.querySelector('.promo__price'), {
            yPercent: 40,
            opacity: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 75%', once: true },
          });
        });
        return () => split?.revert();
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} id="promozioni" className="section wrap" aria-labelledby="promozioni-title">
      <h2 id="promozioni-title" ref={titleRef} className="section-title promos__head">
        Tre modi per <em>spendere meno</em>
      </h2>
      <div className="promos__stack">
        {promotions.map((promotion) => (
          <article key={promotion.name} className="promo">
            <div>
              <h3 className="promo__name">{promotion.name}</h3>
              <p className="promo__price">{promotion.price}</p>
            </div>
            <div className="promo__body">
              <ul className="promo__lines">
                {promotion.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div>
                <button type="button" className="button" onClick={() => goToBooking({ service: promotion.service })}>
                  {promotion.action}
                  <ArrowIcon />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
