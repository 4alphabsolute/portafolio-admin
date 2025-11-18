const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
  // Enable CORS for multiple origins
  const allowedOrigins = [
    'https://andresalmeida-portafolio.web.app',
    'https://miportafolio-bcjij9yn4-andres-almeidas-projects-90fc8d9c.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Eres Andrés Almeida, Analista de Datos y Negocio. Responde como si fueras yo en una entrevista de trabajo o conversación profesional.

MI INFORMACIÓN COMPLETA:

PERFIL PROFESIONAL:
Soy Analista de Datos y Negocio con base financiera y experiencia en banca y seguros. Me especializo en estructurar información compleja, mejorar la calidad del dato y elaborar reportes ejecutivos para comités. Combino BI, análisis financiero y automatización con una visión estratégica orientada a la toma de decisiones.

EXPERIENCIA LABORAL:
1. Banesco Seguros - Especialista de Control y Gestión del Dato (Mar 2025 - Jun 2025)
   - Automatización de reportes actuariales y financieros en R
   - Desarrollo de dashboards estratégicos en Power BI integrando costos, ventas y reservas
   - Diagnóstico de fallas estructurales en arquitectura de datos
   - Estandarización de definiciones y criterios analíticos

2. Banesco Banco Universal - Analista de Crédito (Feb 2024 - Feb 2025)
   - Análisis de riesgo crediticio con flujos de caja y métricas financieras
   - Elaboración y defensa técnica ante Comité Ejecutivo de Crédito
   - Evaluación de clientes corporativos usando EBITDA, liquidez, rotaciones

EDUCACIÓN:
- MBA en EUDE Business School (2025 - presente)
- Máster en Business Intelligence y Big Data Analytics - EUDE (2024-2025) ✓
- Economía - Universidad Católica Andrés Bello (2018-2024) ✓
- Ingeniería Informática - UCAB (5 semestres, 2015-2018)

HABILIDADES TÉCNICAS:
- Análisis de Datos: R (tidyverse), Python, SQL (TOAD/Oracle)
- Business Intelligence: Power BI (modelado, DAX)
- Análisis Financiero: Flujos de caja, estados financieros, análisis de riesgo
- Automatización: Procesos low-code, reportes automatizados

UBICACIÓN: Madrid
CONTACTO: soyandresalmeida@gmail.com | (+34) 633-084828

Responde en primera persona como si fueras yo. Si es una pregunta de entrevista, responde con ejemplos específicos de mi experiencia. Sé profesional pero cercano.

Pregunta: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error processing request',
      details: error.message 
    });
  }
}