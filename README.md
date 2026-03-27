# Sito Web Parrucchieri 💇‍♂️💇‍♀️

Questo progetto è un sito web completo e moderno per un salone di parrucchieri. Include un'interfaccia utente dinamica, un sistema di prenotazione appuntamenti e un assistente virtuale basato sull'Intelligenza Artificiale (Google Gemini).

## 🚀 Tecnologie Utilizzate

Il progetto è costruito con uno stack moderno e performante:

* **Frontend:**
  * [React 19](https://react.dev/) - Libreria per l'interfaccia utente
  * [Vite](https://vitejs.dev/) - Build tool veloce e moderno
  * [Tailwind CSS 4](https://tailwindcss.com/) - Framework CSS utility-first per il design
  * [Framer Motion](https://motion.dev/) - Animazioni fluide e interazioni utente
  * [Lucide React](https://lucide.dev/) - Set di icone pulite e coerenti

* **Backend & Servizi:**
  * [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) - Server web backend
  * [SQLite (better-sqlite3)](https://github.com/WiseLibs/better-sqlite3) - Database locale leggero per salvare gli appuntamenti
  * [Nodemailer](https://nodemailer.com/) - Invio di email (es. conferme appuntamento)
  * [Google Gemini API](https://ai.google.dev/) - Integrazione dell'Intelligenza Artificiale per l'assistente virtuale del salone

## 🛠️ Come Installare e Avviare il Progetto Localmente

Segui questi passaggi per esplorare o modificare il sito web sul tuo computer.

### Prerequisiti
* Assicurati di avere **[Node.js](https://nodejs.org/)** installato sul tuo sistema.

### 1. Clona o Scarica la Repository
Apri il terminale, spostati nella cartella desiderata e scarica i file (oppure estrai l'archivio del progetto).

### 2. Installa le Dipendenze
Entra nella directory del progetto ed esegui il seguente comando per installare tutti i pacchetti necessari (React, Express, Tailwind, ecc.):
```bash
npm install
```

### 3. Configura le Variabili d'Ambiente
Per far funzionare l'Intelligenza Artificiale (Gemini) e il database, è necessario impostare le variabili d'ambiente.

1. Rinomina il file `.env.example` in `.env.local` (oppure `.env`).
2. Apri il file e inserisci la tua chiave API di Google Gemini:
   ```env
   GEMINI_API_KEY=la_tua_chiave_api_qui
   ```
*(Puoi ottenere una chiave API gratuitamente su [Google AI Studio](https://aistudio.google.com/)).*

### 4. Avvia il Server di Sviluppo
Una volta installate le dipendenze e configurato l'ambiente, avvia il progetto:
```bash
npm run dev
```

Il comando farà partire sia il server frontend (Vite) che il server backend (Express tramite `tsx` per eseguire TypeScript). Il terminale ti indicherà a quale indirizzo `localhost` collegarti (di solito `http://localhost:5173`).

---

## 📁 Struttura Principale del Progetto

* `src/` - Contiene tutto il codice frontend React (componenti, stili, logica).
* `public/` - File statici e immagini.
* `server.ts` - Il file principale del server backend Node.js/Express.
* `appointments.db` - Il database locale SQLite dove vengono memorizzate le prenotazioni.
* `package.json` - Configurazione del progetto e lista delle dipendenze.
* `vite.config.ts` - Configurazione di Vite.

## 🤝 Sviluppo Futuro
Questo template è pronto per essere esteso:
- Aggiunta di un pannello admin per gestire comodamente gli appuntamenti.
- Integrazione con servizi di pagamento per caparre.
- Personalizzazione dei testi e dei servizi offerti nel file principale di rendering.
