# Piano — rifacimento sito Aura Style Studio

## Obiettivo
Rifare il frontend con un'identità distintiva e una hero "entrata nel salone" guidata dallo scroll, mantenendo contenuti, prenotazione e chatbot. Mettere in sicurezza l'area admin.

## Fasi
1. [x] Analisi del sito esistente (index.html statico + main.js vanilla, React installato ma inutilizzato).
2. [x] Direzione di design (skill design-taste-frontend: draw, idea, testi).
3. [x] Migrazione a React: sezioni, dati centralizzati, prenotazione via API, chatbot.
4. [x] Hero con video scrubbing allo scroll (placeholder finché non c'è il video Higgsfield).
5. [x] Sicurezza admin (password da env, token casuale lato server).
6. [x] Gate della skill (lint, inspect, critique) e motion layer.
7. [x] Video Higgsfield — generato da Claude Cowork (unlimited non disponibile in Claude Code); (prova gratuita Ultra attivata il 2026-11-13 ~16:14, disdire entro 2026-11-16 ~16:14).
8. [x] Passaggio finale con skill impeccable (polish).
9. [ ] Opzionale: `impeccable init`/`document` per PRODUCT.md e DESIGN.md.

## Decisioni
- **Rifare invece di correggere**: lo stack era incoerente (Tailwind da CDN, React vuoto) e l'estetica era il template "salone di lusso" generico (oro/crema/Playfair). L'utente ha lasciato libertà sull'identità visiva.
- **Recensioni rimosse**: le 6 recensioni presenti non risultano reali; la skill vieta prove inventate. Da reinserire con recensioni Google vere.
- **Backend invariato** salvo sicurezza admin e nome nell'email di conferma (era "PINK & BLUE Parrucchieri, Milano").
- **Hero con immagini generate**: il salone mostrato è un rendering AI, non il locale reale. Da sostituire con riprese vere del salone appena possibile (stessa procedura di ricodifica).
- **Palette verde bottiglia e oro** al posto dell'arancio (richiesta utente), presa dal redraw taste-skill e coerente con i materiali del salone.
- **v3 cinematica (2026-11-13 notte)**: abbandonata la direzione taste-skill (piatta) per GSAP + Lenis su scelta dell'utente; palette nero caldo/cognac. Three.js escluso: il video dà già profondità.
