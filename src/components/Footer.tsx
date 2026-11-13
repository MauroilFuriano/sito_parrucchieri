import { useRef } from 'react';
import { salon } from '../data/salon';
import { useBooking } from '../lib/bookingContext';
import { gsap, MOTION_OK, revealWords, scrollToTarget, SplitText, useGSAP } from '../lib/motion';
import { ArrowIcon } from './ArrowIcon';

interface FooterProps {
  onOpenAdmin: () => void;
}

const footerLinks = [
  { href: '#servizi', label: 'Servizi e prezzi' },
  { href: '#lookbook', label: 'Lookbook' },
  { href: '#promozioni', label: 'Promozioni' },
  { href: '#prenota', label: 'Prenota' },
];

export function Footer({ onOpenAdmin }: FooterProps) {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const markRef = useRef<HTMLParagraphElement>(null);
  const { goToBooking } = useBooking();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const title = titleRef.current ? revealWords(titleRef.current) : null;
        const mark = markRef.current ? SplitText.create(markRef.current, { type: 'chars', mask: 'chars' }) : null;
        if (mark) {
          gsap.from(mark.chars, {
            yPercent: 100,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: { trigger: markRef.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
          });
        }
        return () => {
          title?.revert();
          mark?.revert();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <footer ref={rootRef} id="contatti" className="footer" aria-labelledby="contatti-title">
      <div className="footer__cta">
        <h2 id="contatti-title" ref={titleRef} className="section-title">
          Ti aspettiamo <em>in salone</em>
        </h2>
        <button type="button" className="button" onClick={() => goToBooking()}>
          Prenota un orario
          <ArrowIcon />
        </button>
      </div>

      <div className="footer__grid">
        <div className="footer__col">
          <p className="footer__heading">Dove siamo</p>
          <address style={{ fontStyle: 'normal' }}>
            <p>{salon.address.street}</p>
            <p>{salon.address.city}</p>
          </address>
        </div>
        <div className="footer__col">
          <p className="footer__heading">Orari</p>
          <p>{salon.hoursLabel}</p>
          <p>{salon.closedLabel}</p>
        </div>
        <div className="footer__col">
          <p className="footer__heading">Contatti</p>
          <p>
            <a href={salon.phoneHref}>{salon.phone}</a>
          </p>
        </div>
        <nav className="footer__col" aria-label="Sezioni">
          <p className="footer__heading">Sezioni</p>
          <ul>
            {footerLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToTarget(link.href);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p ref={markRef} className="footer__mark" aria-hidden="true">
        Aura
      </p>

      <div className="footer__base">
        <p>© 2026 {salon.name}</p>
        <button type="button" className="footer__admin" onClick={onOpenAdmin}>
          Area riservata
        </button>
      </div>
    </footer>
  );
}
