import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const REDUCED = '(prefers-reduced-motion: reduce)';
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

let activeLenis: Lenis | null = null;

export function scrollToTarget(target: string | HTMLElement) {
  const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!element) return;
  if (activeLenis) activeLenis.scrollTo(element, { offset: -72, duration: 1.4 });
  else element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;

    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    activeLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      activeLenis = null;
    };
  }, []);
}

/** Reveals a heading word by word; the unsplit text stays the accessible name. */
export function revealWords(element: HTMLElement, trigger: Element = element) {
  const split = SplitText.create(element, { type: 'words', mask: 'words', aria: 'auto' });
  gsap.from(split.words, {
    yPercent: 110,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.06,
    scrollTrigger: { trigger, start: 'top 82%', once: true },
  });
  return split;
}
