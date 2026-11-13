import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { answerChat, parseChatRequest } from './api/_chat.js';

// Local server only: on Vercel the site is static and the chat runs as the function in api/chat.ts.
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--prod');

const app = express();
app.use(express.json({ limit: '20kb' }));

app.post('/api/chat', async (req, res) => {
  const chatRequest = parseChatRequest(req.body);
  if (!chatRequest) return res.status(400).json({ error: 'bad-request' });
  try {
    res.json(await answerChat(chatRequest));
  } catch (err) {
    console.error('Errore chat Gemini:', err instanceof Error ? err.message : err);
    res.status(502).json({ error: 'ai-unavailable' });
  }
});

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

  if (isProduction) {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir, { index: false, maxAge: '7d' }));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      try {
        let html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server su http://localhost:${PORT} (${isProduction ? 'produzione' : 'sviluppo'})`);
  });
  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`La porta ${PORT} è già occupata: probabilmente il sito è già acceso in un altro terminale. Chiudilo oppure avvia con un'altra porta (es. $env:PORT=3005; npm run dev).`);
      process.exit(1);
    }
    throw err;
  });
}

startServer().catch((err) => {
  console.error('Errore avvio server:', err);
  process.exit(1);
});
