import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Proxy submit directly to Google Apps Script Web App without browser CORS limitations
  app.post('/api/submit-sheet', async (req, res) => {
    try {
      const { webAppUrl, payload } = req.body;

      if (!webAppUrl || typeof webAppUrl !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Google Apps Script Web App URL is required.',
        });
      }

      const targetUrl = webAppUrl.trim();
      if (!targetUrl.startsWith('http')) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid Web App URL. Must start with https://script.google.com/macros/s/...',
        });
      }

      // Perform server-side fetch with follow redirect
      const gasResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      const responseText = await gasResponse.text();
      let responseJson: any;

      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = {
          status: gasResponse.ok ? 'success' : 'error',
          message: responseText || 'Submission processed by Google Apps Script.',
        };
      }

      return res.status(gasResponse.status >= 400 ? gasResponse.status : 200).json(responseJson);
    } catch (err: any) {
      console.error('Server proxy submit error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Proxy delivery error: ' + (err.message || String(err)),
      });
    }
  });

  // API Route: Test Google Apps Script Web App connection
  app.post('/api/test-connection', async (req, res) => {
    try {
      const { webAppUrl } = req.body;

      if (!webAppUrl || typeof webAppUrl !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Web App URL is required.',
        });
      }

      const targetUrl = webAppUrl.trim();
      const testResponse = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
      });

      const responseText = await testResponse.text();
      let responseJson: any;

      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = {
          status: testResponse.ok ? 'online' : 'error',
          message: responseText || 'HTTP ' + testResponse.status,
        };
      }

      return res.status(testResponse.status >= 400 ? testResponse.status : 200).json(responseJson);
    } catch (err: any) {
      return res.status(500).json({
        status: 'error',
        message: 'Connection test failed: ' + (err.message || String(err)),
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Dhenkanal RS SO Consent API' });
  });

  // Mount Vite middleware in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dhenkanal RS SO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
