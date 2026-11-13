# Scoperte

## Sito originale (2026-11-13)
- `index.html` (676 righe) statico con Tailwind da CDN e `lucide@latest` non versionato; logica in `src/main.js` vanilla; `src/App.tsx` renderizzava un `<div>` vuoto.
- Admin: password `admin123` nel placeholder e controllata nel client; il server accettava il token fisso `fake-jwt-token` → chiunque poteva leggere/cancellare appuntamenti (nomi, telefoni, email).
- Email di conferma con brand sbagliato ("PINK & BLUE Parrucchieri", Milano).
- Indirizzo "Via della Moda 42, 00100 Roma" e telefono "06 12345678" sembrano segnaposto.
- Immagini in `public/` generate con AI, 640×640: troppo piccole per una hero a tutto schermo.
- Il form inviava i dati senza campo email ma il server la richiede (`!email` → 400): da verificare.

## Higgsfield (MCP)
- Piano free 10 crediti. Costi preventivati: Grok Video 1.5 4s 480p = 10; Seedance 2.5 5s 720p = 35.
- Prova Ultra 3 giorni attivata il 2026-11-13: Seedance 2.5 illimitato fino a 720p, max 30s.
- **Prenotazioni mai inviate al server**: `main.js` salvava gli appuntamenti in `localStorage` del visitatore; l'API `/api/appointments` non veniva chiamata. Il chatbot leggeva disponibilità sempre da `localStorage`.
- Il chatbot è a regole (parole chiave), non usa Gemini.
- In produzione `server.ts` non serve `dist/` (solo Vite in dev).
- **Le generazioni illimitate della prova NON funzionano da Claude Code** (errore: "unlimited generations are not available ... available in: Claude chat, Claude Cowork, ChatGPT"). Da Claude Code si pagano in crediti (10 disponibili; Nano Banana Pro 2K = 2 crediti).
- Riferimenti già caricati su Higgsfield: donna_3.png (media 436b6543-...), uomo_2.png (media dfd21a74-...).

## Rifacimento (2026-11-13)
- Gate taste-skill sulla build di produzione: 0 FAIL, 2 WARN (card-rows = blueprint lookbook; no-footage = video in attesa).
- Critica round 1: 7.6/10. Problema principale: hero 640px sgranata a tutto schermo.

## Video hero (2026-11-13)
- Il video di Seedance esce con un solo keyframe: lo scrubbing con `currentTime` scatta. Ricodifica: `ffmpeg -i in.mp4 -an -c:v libx264 -preset slow -crf 23 -g 4 -keyint_min 4 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart hero_entrata_scrub.mp4` (ffmpeg da `pip install --user imageio-ffmpeg`).
- Profilo di movimento misurato (differenza media tra fotogrammi 4–6,5, nessun picco): avanzamento regolare, niente tagli.
- Un file in `public/` (hero_entrata_1920.jpg) è sparito senza intervento della sessione, probabilmente per una sincronizzazione esterna (Cowork): ricontrollare `public/` dopo aver usato altri strumenti sulla cartella.
- Cowork scrive nella cartella del sito: il 2026-11-13 ha creato `public/Claude outputs/*.plugin` (4 pacchetti zip di skill di motion/video, ~19 MB). Tutto ciò che sta in `public/` finisce nella build pubblicata: questi file vanno spostati fuori da `public/`. Probabile causa anche della sparizione di `hero_entrata_1920.jpg`.
- Qualità video hero: il sorgente Seedance è 720p ~2,9 Mbit/s; a tutto schermo risulta sgranato (ingrandimento 2–4×). La ricodifica non peggiora (confronto al 100% identico). Seedance 2.5 1080p 6s = 96 crediti, 4K = 168 crediti (da Claude Code); la prova illimitata copre solo fino a 720p.

## v3 GSAP (2026-11-13)
- Le regole di design-taste-frontend (no gradienti, ombre, blur, corsivi d'accento, effetti) producono pagine piatte: inadatte a un sito motion graphics.
- Con Lenis attivo le ancore `#sezione` del browser non scorrono: usare `scrollToTarget()` da `lib/motion.ts`.
- Chrome headless con --window-size=1440,900 ha un viewport di 804px: tenerne conto negli screenshot automatici.

## Gemini (2026-11-13)
- Pagina modelli ufficiale (aistudio.google.com/docs/models): Flash-Lite stabili `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`; Flash `gemini-3.8-flash`, `gemini-3.6-flash`. `gemini-2.5-flash` deprecato (dal 1/12/2026 instradato a 3.5-flash-lite).
- Limiti free tier non pubblicati da Google (solo nella pagina rate-limit del progetto); report di terzi: Flash-Lite ~15 RPM / 500 RPD, Flash ~5 RPM / 20 RPD.
