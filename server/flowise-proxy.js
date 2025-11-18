import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const FLOWISE_BASE = process.env.FLOWISE_BASE || 'http://localhost:3000';
const FLOWISE_BEARER = process.env.FLOWISE_BEARER || '';

console.log('🚀 Proxy iniciado con configuración:');
console.log('   FLOWISE_BASE:', FLOWISE_BASE);
console.log('   FLOWISE_BEARER:', FLOWISE_BEARER ? '✅ Configurado' : '❌ No configurado');

app.post('/api/andybot/:canvasId', async (req, res) => {
  try {
    const { canvasId } = req.params;
    const url = `${FLOWISE_BASE}/api/v1/prediction/${canvasId}`;
    
    console.log('📤 Enviando request a Flowise:', url);
    console.log('📝 Body:', JSON.stringify(req.body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(FLOWISE_BEARER ? { Authorization: `Bearer ${FLOWISE_BEARER}` } : {}),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('📥 Respuesta de Flowise:', response.status, data);
    
    res.status(response.status).json(data);
  } catch (err) {
    console.error('❌ Error en proxy:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', flowise: FLOWISE_BASE });
});

const port = process.env.PROXY_PORT || 4000;
app.listen(port, () => {
  console.log(`🔗 Flowise proxy corriendo en http://localhost:${port}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});