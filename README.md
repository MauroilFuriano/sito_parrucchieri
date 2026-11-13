# Aura Style Studio — sito demo per un salone di parrucchieri

Sito dimostrativo di un salone unisex: hero cinematografica con video guidato dallo scroll, listino, lookbook, promozioni, prenotazione con orari liberi, area riservata e chat con Gemini.

> È una **demo**: prenotazioni e area riservata funzionano nel browser di chi visita il sito (`localStorage`). La password dell'area riservata è `admin123` ed è indicata nel pannello.

## Tecnologie

- **React 19 + Vite 6**, stili in `src/index.css` (Tailwind CSS 4 per il reset di base)
- **GSAP 3** (ScrollTrigger, SplitText, `@gsap/react`) e **Lenis** per animazioni e scroll fluido
- **Gemini** (`@google/genai`) per la chat, tramite la funzione Vercel `api/chat.ts`

## Avvio in locale

```bash
npm install
cp .env.example .env   # inserisci GEMINI_API_KEY per provare la chat con l'AI
npm run dev            # http://localhost:3001
```

Senza chiave la chat funziona lo stesso con risposte preimpostate.

## Pubblicazione su Vercel

Vercel compila il sito (`npm run build`) e pubblica la funzione `api/chat.ts`. In **Settings → Environment Variables** imposta:

- `GEMINI_API_KEY` (tipo Secret)
- `GEMINI_MODEL` (facoltativo, predefinito `gemini-3.5-flash-lite`)

## Struttura

- `src/components/` — sezioni della pagina, chat e area riservata
- `src/data/salon.ts` — servizi, prezzi, orari e promozioni (unica fonte dei contenuti)
- `src/lib/` — prenotazione demo, scroll fluido e animazioni
- `api/` — funzione della chat con Gemini
- `public/` — immagini e video della hero
