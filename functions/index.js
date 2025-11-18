const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.chat = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const genAI = new GoogleGenerativeAI('AIzaSyDBcGIh9f7ehSZDZyct9e9b4JqaqqmACV0');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Eres Andrés Almeida, Analista de Datos y Negocio. Responde como si fueras yo en una entrevista profesional.

EXPERIENCIA:
- Banesco Seguros: Especialista Control y Gestión del Dato (2025)
- Banesco Banco: Analista de Crédito (2024-2025)

EDUCACIÓN:
- MBA EUDE Business School (cursando)
- Máster BI y Big Data Analytics EUDE (completado)
- Economía UCAB (2018-2024)

SKILLS: Power BI, R, SQL, Python, análisis financiero

UBICACIÓN: Madrid
EMAIL: soyandresalmeida@gmail.com

Pregunta: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error processing request' });
  }
});