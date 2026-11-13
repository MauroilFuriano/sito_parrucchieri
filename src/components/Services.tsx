import { useRef, type PointerEvent } from 'react';
import { formatPrice, serviceCategories, type SalonService } from '../data/salon';
import { useBooking } from '../lib/bookingContext';
import { gsap, MOTION_OK, revealWords, useGSAP } from '../lib/motion';

export function Services() {
  const rootRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorImageRef = useRef<HTMLImageElement>(null);
  const { goToBooking } = useBooking();

  const { contextSafe } = useGSAP(
    () => {
      gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        if (titleRef.current) {
          const split = revealWords(titleRef.current);
          gsap.from('.service', {
            y: 30,
            opacity: 0,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.06,
            scrollTrigger: { trigger: '.services__group', start: 'top 85%', once: true },
          });
          return () => split.revert();
        }
      });
    },
    { scope: rootRef },
  );

  const followPointer = contextSafe((event: PointerEvent) => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  });

  const showPreview = contextSafe((service: SalonService) => {
    const cursor = cursorRef.current;
    const image = cursorImageRef.current;
    if (!cursor || !image) return;
    image.src = service.photo;
    image.style.objectPosition = service.photoPosition;
    gsap.to(cursor, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'expo.out' });
  });

  const hidePreview = contextSafe(() => {
    if (cursorRef.current) gsap.to(cursorRef.current, { autoAlpha: 0, scale: 0.6, rotate: -6, duration: 0.35, ease: 'power2.in' });
  });

  return (
    <section ref={rootRef} id="servizi" className="section wrap" aria-labelledby="servizi-title">
      <div className="services__head">
        <h2 id="servizi-title" ref={titleRef} className="section-title">
          Servizi e <em>prezzi</em>
        </h2>
        <p className="services__note">
          Sono prezzi di partenza: lunghezza e spessore dei capelli possono cambiarli, e te lo diciamo prima di iniziare. Tocca un servizio
          per prenotarlo.
        </p>
      </div>

      <div onPointerMove={followPointer} onPointerLeave={hidePreview}>
        {serviceCategories.map((category) => (
          <div key={category.name} className="services__group">
            <h3 className="services__group-name">
              <span>{category.name}</span>
              <span>{category.services.length} servizi</span>
            </h3>
            <ul className="services__list">
              {category.services.map((service) => (
                <li key={service.name} className="service">
                  <button
                    type="button"
                    className="service__button"
                    onPointerEnter={() => showPreview(service)}
                    onFocus={() => showPreview(service)}
                    onBlur={hidePreview}
                    onClick={() => goToBooking({ service: service.id })}
                  >
                    <img
                      className="service__thumb"
                      src={service.photo}
                      alt=""
                      width={72}
                      height={92}
                      loading="lazy"
                      style={{ objectPosition: service.photoPosition }}
                    />
                    <span className="service__name">{service.name}</span>
                    <span className="service__price">{formatPrice(service.priceFrom)}</span>
                    <span className="service__desc">{service.description}</span>
                    <span className="service__book">Prenota {service.name.toLowerCase()}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div ref={cursorRef} className="services__cursor" aria-hidden="true">
        <img ref={cursorImageRef} src={serviceCategories[0].services[0].photo} alt="" />
      </div>
    </section>
  );
}
