# Diario

## 2026-11-13 (notte, prezzi)
- Prezzi del listino sfalsati: la colonna `auto` condivideva la larghezza con il link nascosto "Prenota …" di lunghezza variabile. Ora colonna `minmax(9rem, max-content)`, prezzo e link allineati a destra (su mobile restano a sinistra sotto il nome). Misurati: bordi identici su tutti gli 8 prezzi a 1920, 1440 e 390 px.

## 2026-11-13 (notte, fix hero e calendario)
- Titolo hero tagliato dopo lo scroll: la timeline di scroll registrava come partenza lo stato nascosto dell'intro sulle stesse lettere. Ora l'intro anima `split.chars`, lo scroll anima `split.masks` (elementi diversi); l'indicatore "Scorri" entra con animazione CSS.
- Calendario: nuovo `src/components/WeekPicker.tsx` (8 settimane, mar–sab, frecce prec/succ, giorni passati disattivati, prima data disponibile selezionata al cambio settimana). Helper in `lib/booking.ts`: `bookingWeek`, `weekIndexOf`, `dayFromIso`, `firstBookableIso`; `firstBookableDate` ora salta anche domenica/lunedì. La chat passa a Gemini gli orari dei prossimi 10 giorni di apertura.
- Verificato in Chrome a 1440 e 390: titolo integro dopo scroll e ritorno, navigazione 8 settimane, prenotazione in settimana 3 visibile in admin, nessun errore JS.

## 2026-11-13 (notte, pulizia)
- Rimossi (git rm): `public/hero_image.png` (non usata), `metadata.json` (residuo AI Studio), `reel-coding.html` (finta schermata VS Code per reel, estranea al sito).
- `.taste-skill/` spostata in `Desktop/_da_eliminare_sito_parrucchieri/`; `.env` (solo ADMIN_PASSWORD, ormai inutile) nel Cestino. `public/gemini_generated_video_38a97a8c.mp4` (dell'utente, non usato) spostato in `.originali/`.
- `server.ts` ridotto a server locale + `/api/chat`: tolti SQLite, Nodemailer, area admin lato server. Disinstallati better-sqlite3, nodemailer, @types/nodemailer, lucide-react, autoprefixer. `.env.example` solo con GEMINI_API_KEY/GEMINI_MODEL. README riscritto.
- `appointments.db` ancora presente: bloccato dal `npm run dev` dell'utente; è in .gitignore e non serve più.
- Verificato dopo la pulizia: tsc, build, test end-to-end (prenotazione → admin → chat) senza errori.

## 2026-11-13 (notte, demo)
- Chiarito con l'utente: è una demo su Vercel statico. Il sito online (commit ed910de) funzionava tutto in localStorage. La v3 usava le API `/api/*` che su Vercel non esistono → riportata prenotazione/admin in modalità demo (`src/lib/demoStore.ts`, stessa chiave `appointments`, password `admin123` indicata nel pannello). Tolto il campo email e il riferimento alla conferma email.
- Verificato nel browser (Chrome headless): prenotazione → orario sparisce dai liberi → compare nell'area riservata; chat "Orari liberi domani" legge gli stessi dati; nessun errore JS.
- Controllata tutta la storia git: Gemini/AI Studio non è mai stato chiamato dal codice (solo README, dipendenza `@google/genai` e define in vite.config.ts).
- Chat collegata a Gemini: funzione Vercel `api/chat.ts` con modello `gemini-3.5-flash-lite` (scelto dalla pagina modelli ufficiale: Flash-Lite stabile consigliato per progetti nuovi; configurabile con GEMINI_MODEL). Prompt con listino, promozioni, orari e orari liberi inviati dal browser; risposta JSON (reply, bookService, openBooking). Fallback alle risposte preimpostate. Tolta da vite.config.ts la `define` che avrebbe messo la chiave nel bundle.
- Testato: 400 su richiesta vuota, 502 senza chiave, fallback in pagina ok, nessun errore JS. Risposta reale di Gemini non testabile in locale (chiave solo su Vercel).
- Niente commit/push ancora: in attesa di ok dell'utente.

## 2026-11-13 (notte) — v3 cinematica con GSAP
- L'utente ha giudicato il sito "vecchio, stile anni 2000". Causa principale: design-taste-frontend vieta proprio gli effetti dei siti motion graphics.
- Installate e controllate: skill ufficiali GSAP (greensock/gsap-skills: core, scrolltrigger, react, plugins, timeline, utils, performance, frameworks) e build-awwwards-quality-sites (MengTo/Skills). Aggiornato impeccable a v4.9.0 (ha aggiunto hook globali in ~/.claude/settings.json).
- Direzione scelta dall'utente: "Cinematico scuro". Rifatto tutto il frontend: hero video bloccata con titolo che si scompone (SplitText) e scrubbing del video; manifesto parola per parola; servizi con foto che segue il mouse; lookbook orizzontale bloccato con parallasse; promozioni a carte impilate; marquee reattivo alla velocità di scroll; prenotazione restilizzata; footer con "Aura" gigante.
- Dipendenze: +gsap 3.15, +@gsap/react, +lenis; −motion. Rimossi Rise.tsx e tutte le classi/tono della versione verde-oro (backup CSS nello scratchpad della sessione).
- Verifiche: build ok, tsc ok, nessun errore in console durante lo scroll, impeccable detect pulito, screenshot desktop 1440 e mobile 390 controllati (fix: chat nascosta nella hero, righe servizi mobile, promozioni che si scurivano troppo presto, intro prenotazione sticky).

## 2026-11-13 (sera, palette e polish)
- Video lasciato a 720p (anche Flow/Veo esce a 720p): scelta dell'utente.
- Palette cambiata (all'utente non piaceva l'arancio): redraw taste-skill → "Bottle green, gold" (#133621 / #f4d96c), scelta perché si lega a legno, cognac e luci dorate del salone. Rimappate tutte le combinazioni fondo/testo; nuove classi tono promo--gold/olive/deep, tile--green/gold/olive/deep; `.on-gold` per focus/caret sulle superfici oro.
- Polish (impeccable): pulsante chat compatto "Chat" su telefono; riepilogo prenotazione con maiuscola; dopo l'ultimo orario il calendario parte dal giorno dopo; messaggio "orari finiti" per oggi; scrollbar, caret e accent-color dalla palette.
- Gate: taste lint 0 FAIL; inspect 0 FAIL, 2 WARN (card-rows lookbook voluto; palette-cream = tinta chiara dell'oro su piccoli controlli, niente terracotta); impeccable detect: nessun problema.
- Di nuovo sparito un file da public/ (hero_entrata_1080.jpg), ricreato da .originali/.

## 2026-11-13 (sera)
- Video hero giudicato sgranato dall'utente: causa sorgente 720p. Proposte: zoom sull'immagine 2K (gratis), upscale AI, rigenerazione 1080p/4K (96/168 crediti), ripresa reale col telefono. In attesa di scelta.
- Trovati in `public/Claude outputs/` 4 pacchetti .plugin creati da Cowork: da spostare fuori da `public/` (verrebbero pubblicati).
- Video e immagine hero generati con Higgsfield da Claude Cowork (Nano Banana Pro 2K + Seedance 2.5 720p 6s). Originali in `.originali/` (ignorata da git).
- Video ricodificato per lo scrubbing (keyframe ogni 4 fotogrammi, 2,6 MB): `public/hero_entrata_scrub.mp4`; poster 1920/1080 jpg.
- Hero: immagine sempre sotto + video sopra (niente arco vuoto mentre il video carica); immagine centrata nell'arco all'inizio, video solo su desktop senza reduced-motion.
- Installata skill `higgsfield` (OSideMedia/higgsfield-ai-prompt-skill, controllata) in ~/.claude/skills/higgsfield.
- Gate taste-skill su build di produzione: 0 FAIL, 1 WARN (card-rows del lookbook, voluto).

## 2026-11-13 (pomeriggio)
- Rifatto il frontend in React 19 + Tailwind 4 + motion con la skill design-taste-frontend (direzione "one motif", seed 1708143762): motivo ad arco, palette arancio/nero, font Stack Sans.
- Nuovi file: src/data/salon.ts, src/lib/{booking.ts,bookingContext.tsx,useMedia.ts}, src/components/*. Rimosso src/main.js.
- Prenotazione ora collegata all'API reale (prima salvava in localStorage del visitatore); orari liberi live per i prossimi 6 giorni di apertura.
- server.ts: password admin da ADMIN_PASSWORD (.env), token casuali con scadenza 8h, validazioni (giorni chiusi, date passate, orari e servizi validi), email con brand corretto e nome escapato, modalità produzione (`npm run start`).
- Recensioni rimosse (non verificabili).
- Hero: arco che si apre a tutto schermo con lo scroll; pronta per video scrubbing (HERO_VIDEO in App.tsx), per ora immagine.
- Higgsfield: unlimited della prova non disponibile da Claude Code → video da generare da claude.ai.
- server.ts: messaggio chiaro se la porta è già occupata (EADDRINUSE) invece del crash; causa era un dev server lasciato acceso dalla sessione.

## 2026-11-13
- Installate skill: find-animation-opportunities (emilkowalski/skills), claude-automation-recommender (claude-code-setup ufficiale), 9 skill Strix ufficiali. Controllate: solo Markdown.
- Attivata prova Higgsfield Ultra 3 giorni (disdire entro 2026-11-16 ~16:14).
- Analisi del sito, decisione di rifare il frontend con design-taste-frontend. Creati file di memoria del progetto.
