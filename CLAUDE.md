# Aura Style Studio — sito salone parrucchieri unisex

**È una DEMO per potenziali clienti**, pubblicata su Vercel come sito statico (repo GitHub MauroilFuriano/sito_parrucchieri). Prenotazioni e area admin funzionano nel browser del visitatore (`localStorage`, chiave `appointments`), password admin demo `admin123` mostrata nel pannello. Su Vercel `server.ts` non gira: non introdurre dipendenze dalle API `/api/*` senza deciderlo con l'utente.

Sito vetrina + prenotazione appuntamenti per un salone unisex (Roma). Frontend React, backend Express con SQLite.

## Stack
- Frontend: React 19 + Vite 6 + Tailwind CSS 4 (`@tailwindcss/vite`, quasi solo CSS proprio in `src/index.css`) + **GSAP 3** (ScrollTrigger, SplitText, `@gsap/react` useGSAP) + **Lenis** (unico motore di scroll fluido).
- Server locale: `server.ts` (Express) — serve Vite in sviluppo e `dist/` con `--prod`, più `/api/chat`. Su Vercel non gira: il sito è statico + funzione `api/chat.ts`.
- Avvio: `npm run dev` (tsx server.ts, porta 3001). Build: `npm run build`.

## File principali
- `index.html` — shell minima, monta React su `#root`.
- `src/App.tsx` — composizione della pagina.
- `src/components/*` — una sezione per file (Hero, Manifesto, Services, Lookbook, Promotions, Marquee, Booking, Footer) più Nav, Chat, AdminPanel, WeekPicker (calendario a settimane), ArrowIcon.
- `src/lib/demoStore.ts` — archivio demo in `localStorage` (prenotazioni, cancellazione, password admin demo).
- `src/lib/*` — logica di prenotazione, contesto condiviso della prenotazione, hook media query, `motion.ts` (registrazione plugin GSAP, Lenis collegato a ScrollTrigger, `scrollToTarget`, `revealWords`).
- `src/data/salon.ts` — contenuti (servizi, prezzi, orari, promozioni): unica fonte, usata anche dal chatbot.
- `src/index.css` — token di design (direzione "cinematico scuro": nero caldo #0e0c0b, testo #f2ede6, accento cognac #c7814a, luce #e9c88a; font Instrument Serif + Inter Tight). Direzione: tesi "entrare nel salone la sera, con la luce degli specchi ad arco"; hero video bloccata con titolo che si scompone → manifesto → servizi con foto che segue il mouse → lookbook orizzontale → promozioni impilate → marquee → prenotazione → footer "Aura". Three.js escluso.
- `api/chat.ts`, `api/_chat.ts` — funzione Vercel della chat con Gemini (dati salone + orari liberi nel prompt, risposta JSON strutturata).
- `server.ts` — server locale (sviluppo e anteprima produzione) con la sola route `/api/chat`.
- `public/` — immagini; hero: `hero_entrata_1920.jpg`, `hero_entrata_1080.jpg`, `hero_entrata_scrub.mp4` (video ricodificato per lo scrubbing, vedi findings.md). Originali in `.originali/`.

## Regole
- Contenuti e prezzi solo in `src/data/salon.ts`.
- Area admin nella demo: password `admin123` lato client (dati solo nel browser di chi visita). Per un sito reale servirà un database (es. Neon/Supabase) e un'autenticazione vera.
- Chat: risponde con Gemini tramite la funzione Vercel `api/chat.ts` (logica in `api/_chat.ts`, condivisa con `server.ts` per lo sviluppo locale). Variabili su Vercel: `GEMINI_API_KEY` (Secret) e opzionale `GEMINI_MODEL` (predefinito `gemini-3.5-flash-lite`). Se Gemini non risponde, la chat usa le risposte preimpostate in `Chat.tsx`. La chiave non deve mai finire nel codice del browser (niente `define` in vite.config.ts).
- Niente recensioni, numeri o clienti inventati sulla pagina.
- Mai animare con due timeline diverse la stessa proprietà dello stesso elemento (es. intro + scroll): usare elementi diversi (chars vs masks di SplitText) o fromTo espliciti.
- Animazioni: GSAP dentro `useGSAP` con `scope` e `gsap.matchMedia()` (MOTION_OK/REDUCED da `lib/motion.ts`); con prefers-reduced-motion niente Lenis, pin o scrub. CSS solo per hover/focus. Un solo motore di scroll (Lenis).
- Non usare la skill design-taste-frontend per questo sito: le sue regole (niente sfumature, ombre, corsivi, effetti) vanno contro lo stile motion graphics richiesto.
- Memoria di progetto in `task_plan.md`, `findings.md`, `progress.md`.
