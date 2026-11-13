import { useRef } from 'react';
import { useBooking } from '../lib/bookingContext';
import { ScrollTrigger, scrollToTarget, useGSAP } from '../lib/motion';

const navLinks = [
  { href: '#servizi', label: 'Servizi' },
  { href: '#lookbook', label: 'Lookbook' },
  { href: '#promozioni', label: 'Promozioni' },
  { href: '#contatti', label: 'Contatti' },
];

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const { goToBooking } = useBooking();

  useGSAP(() => {
    const nav = navRef.current;
    if (!nav) return;
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const scrolled = self.scroll() > window.innerHeight * 0.6;
        nav.classList.toggle('is-solid', scrolled);
        nav.classList.toggle('is-hidden', scrolled && self.direction === 1 && !nav.contains(document.activeElement));
      },
    });
  });

  return (
    <header ref={navRef} className="nav">
      <nav className="nav__bar wrap" aria-label="Principale">
        <a
          className="nav__mark"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            scrollToTarget('#top');
          }}
        >
          Aura
        </a>
        <div className="nav__links">
          {navLinks.map((link) => (
            <a
              key={link.href}
              className="nav__link"
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                scrollToTarget(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
          <button type="button" className="button" onClick={() => goToBooking()}>
            Prenota
          </button>
        </div>
      </nav>
    </header>
  );
}
