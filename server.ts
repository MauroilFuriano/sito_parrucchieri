import express from 'express';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const db = new Database('appointments.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL
  )
`);

try {
  db.exec(`ALTER TABLE appointments ADD COLUMN email TEXT NOT NULL DEFAULT ''`);
} catch (e) {
  // Column already exists
}

let transporter: nodemailer.Transporter | null = null;
async function getTransporter() {
  if (transporter) return transporter;
  try {
    console.log('📧 Creating test email account...');
    const account = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
    console.log('✅ Test email account created successfully');
  } catch (err) {
    console.error('❌ Failed to create test account:', err);
  }
  return transporter;
}

const app = express();
app.use(express.json());

// API Routes

// Get available slots for a given date
app.get('/api/availability', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  // All possible slots (09:00 to 18:00)
  const allSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const stmt = db.prepare('SELECT time FROM appointments WHERE date = ?');
  const bookedAppointments = stmt.all(date) as { time: string }[];
  const bookedTimes = bookedAppointments.map(a => a.time);

  const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
  res.json({ availableSlots });
});

// Book an appointment
app.post('/api/appointments', async (req, res) => {
  const { name, email, phone, service, date, time } = req.body;
  if (!name || !email || !phone || !service || !date || !time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if slot is already booked
  const checkStmt = db.prepare('SELECT id FROM appointments WHERE date = ? AND time = ?');
  const existing = checkStmt.get(date, time);
  if (existing) {
    return res.status(400).json({ error: 'Slot already booked' });
  }

  const insertStmt = db.prepare('INSERT INTO appointments (name, email, phone, service, date, time) VALUES (?, ?, ?, ?, ?, ?)');
  const info = insertStmt.run(name, email, phone, service, date, time);

  // Send confirmation email
  try {
    const mailTransporter = await getTransporter();
    if (mailTransporter) {
      const serviceNames: Record<string, string> = {
        'piega_donna': 'Piega',
        'taglio_donna': 'Taglio',
        'colore_donna': 'Colore',
        'balayage_donna': 'Balayage',
        'taglio_uomo': 'Taglio Classico / Sfumato',
        'barba_uomo': 'Regolazione Barba',
        'rituel_uomo': 'Rituel Uomo',
        'consulenza': 'Consulenza d\'immagine'
      };
      const serviceName = serviceNames[service] || service;

      const mailInfo = await mailTransporter.sendMail({
        from: '"PINK & BLUE Parrucchieri" <noreply@pinkandblue.com>',
        to: email,
        subject: 'Conferma Prenotazione - PINK & BLUE Parrucchieri',
        text: `Ciao ${name},\n\nLa tua prenotazione per il servizio "${serviceName}" in data ${date} alle ore ${time} è stata confermata.\n\nTi aspettiamo in salone!\n\nPINK & BLUE Parrucchieri`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #1a1a1a; text-align: center; font-family: serif;">PINK & BLUE Parrucchieri</h2>
            <p style="color: #4a4a4a; font-size: 16px;">Ciao <b>${name}</b>,</p>
            <p style="color: #4a4a4a; font-size: 16px;">La tua prenotazione è stata confermata con successo. Ecco i dettagli:</p>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><b>Servizio:</b> ${serviceName}</p>
              <p style="margin: 5px 0;"><b>Data:</b> ${date}</p>
              <p style="margin: 5px 0;"><b>Ora:</b> ${time}</p>
            </div>
            <p style="color: #4a4a4a; font-size: 16px;">Ti aspettiamo in salone!</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">PINK & BLUE Parrucchieri - Via della Bellezza, 12, Milano</p>
          </div>
        `
      });
      console.log('Message sent: %s', mailInfo.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(mailInfo));
    }
  } catch (err) {
    console.error('Error sending email:', err);
  }

  res.json({ success: true, id: info.lastInsertRowid });
});

// Admin login (simple hardcoded password for demo)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'admin123') {
    res.json({ success: true, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get all appointments (for admin)
app.get('/api/admin/appointments', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer fake-jwt-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const stmt = db.prepare('SELECT * FROM appointments ORDER BY date ASC, time ASC');
  const appointments = stmt.all();
  res.json({ appointments });
});

// Delete an appointment (for admin)
app.delete('/api/admin/appointments/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer fake-jwt-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM appointments WHERE id = ?');
  stmt.run(id);
  res.json({ success: true });
});

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

  console.log('🚀 Starting server...');
  console.log('📦 Node environment:', process.env.NODE_ENV || 'development');

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚡ Initializing Vite dev server...');
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('✅ Vite dev server initialized successfully');

      // Serve index.html for all non-API routes (SPA fallback)
      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;

        // Skip API routes
        if (url.startsWith('/api')) {
          return next();
        }

        try {
          // Read index.html
          let html = fs.readFileSync(
            path.resolve(process.cwd(), 'index.html'),
            'utf-8'
          );

          // Apply Vite HTML transforms (handles HMR injection, etc.)
          html = await vite.transformIndexHtml(url, html);

          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          console.error('Error serving index.html:', e);
          next(e);
        }
      });
    } catch (error) {
      console.error('❌ Error initializing Vite:', error);
      throw error;
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log('📝 Ready to accept requests');
  });
}

console.log('🔧 Initializing database and starting server...');
startServer().catch(err => {
  console.error('💥 Fatal error starting server:', err);
  process.exit(1);
});
