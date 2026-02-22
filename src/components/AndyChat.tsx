import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

import cvProfiles from '../data/cv-profiles.json';
import personalityConfig from '../data/personality-config.json';

interface Message {
  from: 'user' | 'bot';
  text: string;
}

interface UserProfile {
  type: 'recruiter' | 'casual' | 'technical' | 'strategist' | 'unknown';
  detectedProfile?: string;
  confidence: number;
  language: 'es' | 'en';
  messageCount: number;
  lastMessageTime: number;
  warningCount: number;
  isBlocked: boolean;
}


export default function AndyChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    type: 'unknown',
    confidence: 0,
    language: 'es',
    messageCount: 0,
    lastMessageTime: 0,
    warningCount: 0,
    isBlocked: false
  });
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert and Compress Image to Gemini Inline Data
  async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions for compression (e.g., standard Full HD)
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 80% quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            const base64Data = dataUrl.split(',')[1];
            resolve({
              inlineData: { data: base64Data, mimeType: 'image/jpeg' },
            });
          } else {
            // Fallback if canvas fails
            resolve({
              inlineData: { data: (event.target?.result as string).split(',')[1], mimeType: file.type },
            });
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle Paste Event
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const newImages: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) newImages.push(file);
      }
    }
    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      e.preventDefault();
    }
  };

  // Detectar idioma
  const detectLanguage = (text: string): 'es' | 'en' => {
    const lowerText = text.toLowerCase();
    const { en, es } = personalityConfig.languages.detection_keywords;

    let enScore = 0;
    let esScore = 0;

    en.forEach(keyword => {
      if (lowerText.includes(keyword)) enScore++;
    });

    es.forEach(keyword => {
      if (lowerText.includes(keyword)) esScore++;
    });

    return enScore > esScore ? 'en' : 'es';
  };

  // Sistema anti-troll
  const checkForTroll = (text: string, currentProfile: UserProfile): { isTroll: boolean; shouldWarn: boolean; shouldBlock: boolean } => {
    const lowerText = text.toLowerCase();
    const now = Date.now();
    const { spam_patterns, inappropriate_patterns, repetitive_threshold, max_messages_per_minute } = personalityConfig.anti_troll;

    // Verificar spam patterns
    const hasSpam = spam_patterns.some(pattern => lowerText.includes(pattern));
    const hasInappropriate = inappropriate_patterns.some(pattern => lowerText.includes(pattern));

    // Verificar rate limiting
    const timeDiff = now - currentProfile.lastMessageTime;
    const isRateLimited = timeDiff < (60000 / max_messages_per_minute); // 60000ms / max_per_minute

    // Verificar mensajes repetitivos
    const recentMessages = messageHistory.slice(-repetitive_threshold);
    const isRepetitive = recentMessages.length >= repetitive_threshold &&
      recentMessages.every(msg => msg.toLowerCase() === lowerText);

    const isTroll = hasSpam || hasInappropriate || isRateLimited || isRepetitive;
    const shouldWarn = isTroll && currentProfile.warningCount < 2;
    const shouldBlock = isTroll && currentProfile.warningCount >= 2;

    return { isTroll, shouldWarn, shouldBlock };
  };

  // Detectar tipo de usuario basado en patrones
  const detectUserType = (text: string, currentProfile: UserProfile): UserProfile => {
    const lowerText = text.toLowerCase();
    const { recruiter_patterns, casual_patterns, technical_patterns } = cvProfiles.user_detection;
    const detectedLang = detectLanguage(text);
    const now = Date.now();

    let recruiterScore = 0;
    let casualScore = 0;
    let technicalScore = 0;

    recruiter_patterns.forEach(pattern => {
      if (lowerText.includes(pattern)) recruiterScore++;
    });

    casual_patterns.forEach(pattern => {
      if (lowerText.includes(pattern)) casualScore++;
    });

    technical_patterns.forEach(pattern => {
      if (lowerText.includes(pattern)) technicalScore++;
    });

    const maxScore = Math.max(recruiterScore, casualScore, technicalScore);
    let type: UserProfile['type'] = 'unknown';
    let confidence = 0;

    if (maxScore > 0) {
      if (recruiterScore === maxScore) {
        type = 'recruiter';
        confidence = recruiterScore / recruiter_patterns.length;
      } else if (technicalScore === maxScore) {
        type = 'technical';
        confidence = technicalScore / technical_patterns.length;
      } else {
        type = 'casual';
        confidence = casualScore / casual_patterns.length;
      }
    }

    return {
      ...currentProfile,
      type: confidence > currentProfile.confidence ? type : currentProfile.type,
      confidence: Math.max(confidence, currentProfile.confidence),
      language: detectedLang,
      messageCount: currentProfile.messageCount + 1,
      lastMessageTime: now
    };
  };

  // Generar preguntas proactivas
  const generateProactiveQuestion = (userType: UserProfile['type'], language: 'es' | 'en'): string => {
    const { proactive_questions } = personalityConfig;

    if (language === 'en') {
      // Versiones en inglés de las preguntas
      switch (userType) {
        case 'recruiter':
          return "Interesting! What type of profile are you looking for exactly? What's the biggest technical challenge your team is currently facing?";
        case 'technical':
          return "Are you interested in any particular technical aspect? I can dive deeper into Power BI, R, financial analysis...";
        case 'casual':
          return "What do you find most interesting about the data world? Is there something specific you'd like to know about my experience?";
        default:
          return "Hello! I'm curious to know what brought you here. Are you from a particular company, or just exploring?";
      }
    }

    // Versiones en español
    switch (userType) {
      case 'recruiter':
        const recruiterQuestions = proactive_questions.recruiter_follow_up;
        return recruiterQuestions[Math.floor(Math.random() * recruiterQuestions.length)];
      case 'technical':
        const technicalQuestions = proactive_questions.technical_follow_up;
        return technicalQuestions[Math.floor(Math.random() * technicalQuestions.length)];
      case 'casual':
        const casualQuestions = proactive_questions.casual_follow_up;
        return casualQuestions[Math.floor(Math.random() * casualQuestions.length)];
      default:
        const initialQuestions = proactive_questions.initial_greeting;
        return initialQuestions[Math.floor(Math.random() * initialQuestions.length)];
    }
  };

  // Sugerir perfil CV basado en conversación
  const suggestCVProfile = (context: string[]): string => {
    const fullContext = context.join(' ').toLowerCase();

    for (const [key, profile] of Object.entries(cvProfiles.profiles)) {
      const matches = profile.keywords.filter(keyword =>
        fullContext.includes(keyword.toLowerCase())
      ).length;

      if (matches >= 2) return key;
    }

    return 'DATA'; // Default changed to DATA as it's the more central one now
  };

  // Generar PDF dinámico
  const generateDynamicCV = async (profileType: string) => {
    const profile = cvProfiles.profiles[profileType as keyof typeof cvProfiles.profiles];
    if (!profile) return;

    try {
      const { generateDynamicCV: generatePDF } = await import('../utils/pdfGenerator');
      generatePDF(profileType as keyof typeof cvProfiles.profiles, userProfile.language);

      // Agregar mensaje del bot confirmando la descarga
      const confirmMessage = userProfile.language === 'en' ?
        `Perfect! I've generated your personalized CV for the "${profile.title}" profile. The PDF file has been downloaded automatically.\n\nWould you like me to adjust something specific or generate another profile?` :
        `¡Perfecto! He generado tu CV personalizado para el perfil "${profile.title_es || profile.title}". El archivo PDF se ha descargado automáticamente.\n\n¿Te gustaría que ajuste algo específico o genere otro perfil?`;

      setMessages(m => [...m, {
        from: 'bot',
        text: confirmMessage
      }]);
    } catch (error) {
      console.error('Error generando PDF:', error);
      const errorMessage = userProfile.language === 'en' ?
        'Sorry, there was a problem generating the PDF. As an alternative, I can send you my information via email or LinkedIn.' :
        'Disculpa, hubo un problema generando el PDF. Como alternativa, puedo enviarte mi información por email o LinkedIn.';

      setMessages(m => [...m, {
        from: 'bot',
        text: errorMessage
      }]);
    }
  };

  const send = async () => {
    console.log('[AndyChat] send() called, input=', input);
    if (!input.trim() && images.length === 0) {
      console.log('[AndyChat] send aborted: empty input and no images');
      return;
    }
    const question = input.trim() || (images.length > 0 ? '[Imagen adjunta]' : '');
    setMessages((m) => [...m, { from: 'user', text: question }]);
    setInput('');
    const currentImages = [...images];
    setImages([]); // Clear images from input area immediately after sending

    setSending(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API Key not found');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      // Check Strategist Mode Authentication
      const lowerQuestion = question.toLowerCase();
      if (lowerQuestion.includes('soy andrés') || lowerQuestion.includes('soy andres')) {
        setMessages((m) => [...m, { from: 'bot', text: 'Hola Andrés. Por favor, dime el santo y seña para activar el modo estratega.' }]);
        setSending(false);
        return;
      }

      if (lowerQuestion.includes('el trabajador')) {
        setUserProfile(prev => ({ ...prev, type: 'strategist', language: 'es' }));
        setMessages((m) => [...m, { from: 'bot', text: 'Modo Estratega Activado. 🕴️\nEnvíame la vacante (texto o imagen). Te daré mi análisis como Asesor de RRHH y generaré el CV híbrido correspondiente listo para descargar.' }]);
        setSending(false);
        return;
      }

      // Sistema anti-troll (solo si no es estratega)
      if (userProfile.type !== 'strategist') {
        const trollCheck = checkForTroll(question, userProfile);

        if (trollCheck.shouldBlock) {
          setUserProfile(prev => ({ ...prev, isBlocked: true }));
          setMessages(m => [...m, {
            from: 'bot',
            text: personalityConfig.anti_troll.block_message
          }]);
          setSending(false);
          return;
        }

        if (trollCheck.shouldWarn) {
          setUserProfile(prev => ({ ...prev, warningCount: prev.warningCount + 1 }));
          setMessages(m => [...m, {
            from: 'bot',
            text: personalityConfig.anti_troll.warning_message
          }]);
          setSending(false);
          return;
        }
      }

      // Actualizar historial de mensajes
      setMessageHistory(prev => [...prev, question].slice(-10));

      // Actualizar contexto y perfil de usuario
      const newContext = [...conversationContext, question].slice(-10);
      setConversationContext(newContext);

      const detectedProfile = detectUserType(question, userProfile);
      if (userProfile.type === 'strategist') {
        detectedProfile.type = 'strategist';
      }
      setUserProfile(detectedProfile);

      const suggestedCV = suggestCVProfile(newContext);

      // Generar pregunta proactiva
      const proactiveQuestion = generateProactiveQuestion(detectedProfile.type, detectedProfile.language);

      // Detectar intención explícita de descarga
      const isDownloadIntent =
        (lowerQuestion.includes('cv') || lowerQuestion.includes('currículum') || lowerQuestion.includes('pdf')) &&
        (lowerQuestion.includes('dame') || lowerQuestion.includes('quiero') || lowerQuestion.includes('bajar') || lowerQuestion.includes('descargar') || lowerQuestion.includes('generar') || lowerQuestion.includes('si') || lowerQuestion.includes('sí') || lowerQuestion.includes('yes') || lowerQuestion.includes('please'));

      if (isDownloadIntent && detectedProfile.type !== 'unknown') {
        setUserProfile(prev => ({ ...prev, type: detectedProfile.type })); // Forzar el tipo detectado
        await generateDynamicCV(suggestedCV);
        setSending(false);
        return;
      }

      let contextualPrompt = '';
      if (detectedProfile.type === 'recruiter') {
        contextualPrompt = detectedProfile.language === 'en' ?
          `\n\nNOTE: I detected you're a recruiter. ERES DIRECTO. Si piden CV, DÁSELO. NO PREGUNTES MÁS. SI EL USUARIO DICE "SI", GENERA EL PDF. ${proactiveQuestion}` :
          `\n\nNOTA: Detecté que eres un reclutador. ERES DIRECTO. Si piden CV, DÁSELO. NO PREGUNTES MÁS. SI EL USUARIO DICE "SI", GENERA EL PDF.`;
      } else if (detectedProfile.type === 'technical') {
        contextualPrompt = detectedProfile.language === 'en' ?
          `\n\nNOTE: I see you have technical interest. ${proactiveQuestion}` :
          `\n\nNOTA: ${proactiveQuestion}`;
      } else if (detectedProfile.messageCount === 1) {
        // Primera interacción - ser proactivo
        contextualPrompt = `\n\nPREGUNTA PROACTIVA: ${proactiveQuestion}`;
      }

      const antiHallucinationRules = detectedProfile.language === 'en' ?
        `\n\nCRITICAL ANTI-HALLUCINATION RULES:
      1. REALITY CHECK: You are based strictly on Andrés Almeida's real profile (Business Intelligence, Data Analyst, MBA Student at EUDE, Banesco Seguros experience).
      2. DO NOT INVENT: Do NOT say he worked at NASA, Google, Harvard, or companies not mentioned. 
      3. ADMIT IGNORANCE: If asked about a specific detail you don't know (e.g. "What year did he finish high school?"), simply say: "I don't have that specific detail handy, but it's likely in his full CV. Would you like to generate it?"
      4. STAY GROUNDED: Your purpose is to bridge the user to the CV, not to be a storyteller.
      5. ACTION OVER TALK: If the user says "YES" or asks for the CV, assume they want it NOW. Do not ask "Do you want it?" again.` :
        `\n\nREGLAS CRÍTICAS ANTI-ALUCINACIÓN:
      1. REALIDAD: Estás basado estrictamente en el perfil real de Andrés Almeida (Business Intelligence, Analista de Datos, MBA en EUDE, experiencia en Banesco Seguros).
      2. NO INVENTES: NO digas que trabajó en la NASA, Google, Harvard, ni ninguna empresa que no esté en tu contexto.
      3. ADMITE IGNORANCIA: Si te preguntan un detalle específico que no sabes (ej. "¿En qué año terminó el bachillerato?"), di simplemente: "No tengo ese dato específico a mano, pero seguro está en su CV completo. ¿Quieres que lo genere?"
      4. MANTENTE EN TIERRA: Tu propósito es llevar al usuario al CV, no inventar historias.
      5. ACCIÓN SOBRE CHARLA: Si el usuario dice "SÍ" o pide el CV, asume que lo quiere YA. No preguntes "¿Lo quieres?" de nuevo. CONFIRMA LA ACCIÓN.`;

      const basePrompt = detectedProfile.language === 'en' ?
        `SYSTEM PROMPT: ANDYCHAT (V8.0 - THE CHAMELEON STRATEGY)
        ${antiHallucinationRules}
        
        ROLE:
        You are AndyChat, Andrés Almeida's advanced virtual assistant. You are a "Career Architect" and "Intelligent Lead Magnet". Your goal is to qualify the visitor and guide them to the Andrés profile that best solves their need.

        YOUR CORE KNOWLEDGE (THE MODULAR STRATEGY):
        Andrés is a hybrid profile. Detect what the user is looking for and activate one of these 5 modes:
        
        1. DATA (Technical Analyst): If looking for SQL, ETL, Power BI. Hook: "Andrés reduces operational times by 60% automating data. Want to see his Python/SQL code?"
        2. FINTECH (Consultant / Strategist): If looking for Banking, Business, Product Owner. Hook: "He has an MBA and knows how to code. The perfect bridge between Business and IT."
        3. BUILDER (AI Engineer / Dev): If looking for React, Apps, Startups, AI. Hook: "Andrés builds real products (like me, this bot). Check out his Supabase and React architecture."
        4. FINANCE (Traditional Banking): If looking for Risk, Audit. Hook: "Analytical and financial rigor. Expert in balance sheet analysis and banking regulations."
        5. SALES (Real Estate / Commercial): If looking for Sales, Customer Service. Hook: "Commercial empathy + Data management. Optimizes occupancy and closes sales with strategy."

        TONE: Professional but approachable (B2B Friendly), Tech-savvy, Direct.
        
        INTERACTION RULES:
        1. Discovery Phase: If it's the start, ask: "${proactiveQuestion}"
        2. Selling Phase: Highlight ONLY relevant achievements for the detected interest.
        3. Call to Action (CTA): Guide them to download the specific PDF. "I have a specific CV for [Detected Profile]. Shall I generate it now?"

        TECHNICAL KNOWLEDGE:
        You run on React 18, Vite, Firebase, Gemini 2.0 Flash. Show off that Andrés knows how to build modern software.

        USER CONTEXT:
        - Detected type: ${detectedProfile.type}
        - Suggested profile: ${suggestedCV}
        - Language: English

        Question: ${question}` :
        `SYSTEM PROMPT: ANDYCHAT (V8.0 - LA ESTRATEGIA CAMALEÓN)
        ${antiHallucinationRules}
        
        ROL:
        Eres AndyChat, el asistente virtual avanzado de Andrés Almeida. Eres un "Arquitecto de Carreras" y un "Lead Magnet Inteligente". Tu objetivo es cualificar al visitante y guiarlo hacia el perfil de Andrés que mejor resuelva su necesidad.

        TU CONOCIMIENTO CENTRAL (LA ESTRATEGIA MODULAR):
        Andrés es un perfil híbrido. Detecta qué busca el usuario y activa uno de los 5 modos:
        
        1. DATA (Analista Técnico): Si buscan SQL, ETL, Power BI. Gancho: "Andrés reduce tiempos operativos un 60% automatizando datos. ¿Quieres ver su código Python/SQL?"
        2. FINTECH (Consultor / Estratega): Si buscan Banca, Negocio, Product Owner. Gancho: "Tiene MBA y sabe programar. El puente perfecto entre Negocio y TI."
        3. BUILDER (Ingeniero IA / Dev): Si buscan React, Apps, Startups, IA. Gancho: "Andrés construye productos reales (como yo, este bot). Mira su arquitectura en Supabase y React."
        4. FINANCE (Banca Tradicional): Si buscan Riesgos, Auditoría. Gancho: "Rigor analítico y financiero. Experto en análisis de balances y normativa bancaria."
        5. SALES (Real Estate / Comercial): Si buscan Ventas, Atención al Cliente. Gancho: "Empatía comercial + Gestión de datos. Optimiza la ocupación y cierra ventas con estrategia."

        TONO: Profesional pero cercano (B2B Friendly), Tech-savvy, Directo.
        
        REGLAS DE INTERACCIÓN:
        1. Fase de Descubrimiento: Si es el inicio, pregunta: "${proactiveQuestion}"
        2. Fase de Venta: Destaca SOLO los logros relevantes para el interés detectado.
        3. Call to Action (CTA): Llévalos a descargar el PDF específico. "Tengo un CV específico para [Perfil detectado]. ¿Te lo genero ahora?"

        CONOCIMIENTO TÉCNICO:
        Funcionas con React 18, Vite, Firebase, Gemini 2.0 Flash. Presume de ello. Demuestra que Andrés sabe construir software moderno.

        CONTEXTO DEL USUARIO:
        - Tipo detectado: ${detectedProfile.type}
        - Perfil sugerido: ${suggestedCV}
        - Idioma: Español

        Pregunta: ${question}`;

      let prompt = '';

      if (userProfile.type === 'strategist') {
        prompt = `Rol: Eres el Asesor de RRHH y Estratega de Carrera personal de Andrés Almeida. Tu objetivo es analizar ofertas de empleo (incluso a partir del texto extraído de imágenes) y darle asesoría experta. Además, generarás una versión optimizada (híbrida) de su perfil para el CV en formato JSON estricto, basándote exclusivamente en su base de datos.
        Instrucciones:
        1. Analiza los Keywords de la vacante proporcionada.
        2. Determina el nivel de hibridación (ej. Data vs Finance).
        3. No inventes información. Usa solo los datos de experiencia y skills base proporcionados.
        4. OBLIGATORIO: Devuelve SOLO un JSON con la siguiente estructura, sin markdown (bloques \`\`\`json) ni texto adicional:
        {
          "profile": {
            "title": "TÍTULO ADAPTADO A LA OFERTA",
            "description": "Redacta un párrafo que una el rigor del Economista con la capacidad técnica del Master en Big Data, enfocado a la oferta.",
            "skills_focus": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
            "skills_soft": ["Soft Skill 1", "Soft Skill 2", "Soft Skill 3"]
          },
          "experience": {
            "seguros": [
              "Adapta los logros base de Banesco Seguros enfocándolos en lo que pide la vacante. Ej: si piden automatización, resalta la reducción del 60% en tiempos de carga (ETL).",
              "Logro 2"
            ],
            "banco": [
              "Adapta los logros base de Banesco Banco Universal enfocándolos en lo que pide la vacante. Ej: Riesgos, B2B, B2C, scoring.",
              "Logro 2"
            ]
          },
          "suggestedFilename": "Sugerencia-Nombre-Rol",
          "advisor_message": "Escribe aquí tu análisis como Asesor de RRHH. Qué le recomiendas a Andrés para esta vacante, qué puntos fuertes tiene respecto a lo que piden, y qué posibles objeciones debería preparar para la entrevista. Háblale directamente a Andrés de forma pro y motivadora."
        }
        
        Vacante proporcionada por el usuario:
        "${question}"
        
        Base de Datos Hardcodeada de Andrés:
        ${JSON.stringify({
          experiencia_base_seguros: cvProfiles.experience_variants.default.seguros,
          experiencia_base_banco: cvProfiles.experience_variants.default.banco,
          skills_tech_generales: ["SQL", "Power BI", "R", "ETL", "Tableau", "Agile", "Scrum", "React", "Modelado Financiero", "Riesgos", "Auditoría"],
          skills_soft_generales: ["Pensamiento Crítico", "Resolución de Problemas", "Adaptabilidad", "Liderazgo", "Empatía", "Comunicación Analítica"]
        })}`;
      } else {
        const promptMain = (basePrompt + contextualPrompt).replace(/^\s+/gm, '');
        prompt = promptMain;
      }

      const imageParts = await Promise.all(currentImages.map(fileToGenerativePart));
      const requestParts: any[] = [prompt, ...imageParts];

      // Add a 45-second timeout specifically for image processing on mobile networks
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT: La solicitud tardó demasiado. La imagen puede ser muy pesada o la red lenta.')), 45000)
      );

      const result = await Promise.race([
        model.generateContent(requestParts),
        timeoutPromise
      ]) as any;

      const response = await result.response;
      const text = response.text();

      if (userProfile.type === 'strategist') {
        try {
          // Clean up potential markdown code block formatting
          const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedData = JSON.parse(cleanText);

          const { generateCVFromData } = await import('../utils/pdfGenerator');
          const finalFilename = `CV_AndresAlmeida_${parsedData.suggestedFilename}_${new Date().toISOString().slice(0, 10)}.pdf`;

          generateCVFromData(parsedData.profile, parsedData.experience, 'es', finalFilename);

          setMessages((m) => [...m, {
            from: 'bot',
            text: `💼 **Análisis de RRHH:**\n${parsedData.advisor_message || 'He analizado la vacante.'}\n\n---\n📄 ¡Estrategia completada! He generado y descargado el archivo **${finalFilename}**.\n\nDestacado:\n- Título sugerido: *${parsedData.profile.title}*\n- Habilidades clave: ${parsedData.profile.skills_focus.join(', ')}`
          }]);
        } catch (jsonError) {
          console.error('Error parsing strategist JSON:', jsonError, text);
          setMessages((m) => [...m, { from: 'bot', text: 'Error procesando la estrategia. El formato generado no es válido. Mostrando respuesta cruda:\\n\\n' + text }]);
        }
      } else {
        setMessages((m) => [...m, { from: 'bot', text }]);
      }
    } catch (error: any) {
      console.error('Gemini error:', error);
      if (userProfile.type === 'strategist') {
        setMessages((m) => [...m, {
          from: 'bot',
          text: `Error en Modo Estratega: ${error.message || 'Error desconocido'}\n\nDetalles técnicos para debugear en móvil.`
        }]);
      } else {
        setMessages((m) => [...m, {
          from: 'bot',
          text: 'Disculpa, tengo problemas técnicos. Como Analista de Datos, puedo contarte que trabajo con Power BI, R y análisis financiero en Banesco. ¿Qué te interesa saber específicamente?'
        }]);
      }
    } finally {
      setSending(false);
    }
  };

  // autoscroll to bottom when messages change
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          data-chat-button
          onClick={() => setOpen((v) => !v)}
          className="bg-gradient-to-r from-[#0A66C2] to-[#0052A3] text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="flex items-center gap-2">
            {open ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
                <span className="hidden group-hover:inline text-sm">Cerrar</span>
              </>
            ) : (
              <>
                <span className="text-xl animate-pulse">🤖</span>
                <span className="text-sm font-medium">AndyChat</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </>
            )}
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 w-96 sm:w-[500px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[70vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 ring-1 ring-black/5 font-sans">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg text-white">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">AndyBot</h3>
                <p className="text-xs text-blue-600 font-medium">Asistente IA • En línea</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-4">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner mb-2">
                  👋
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">¡Hola! Soy AndyBot</h4>
                  <p className="text-sm text-gray-500 max-w-[250px] mx-auto mt-1 leading-relaxed">
                    Pregúntame sobre la experiencia, habilidades y proyectos de Andrés.
                  </p>
                </div>

                {/* Botones de CV rápido */}
                <div className="w-full max-w-xs space-y-3 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Generar CV Personalizado</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Object.entries(cvProfiles.profiles).map(([key, profile]) => (
                      <button
                        key={key}
                        onClick={() => generateDynamicCV(key)}
                        className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all duration-200 shadow-sm"
                        title={profile.description}
                      >
                        {key === 'DATA' ? '📊 Datos' :
                          key === 'FINTECH' ? '💳 Fintech' :
                            key === 'BUILDER' ? '🛠️ Dev AI' :
                              key === 'FINANCE' ? '📈 Finanzas' :
                                '💼 Ventas'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex w - full ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate - slideIn`}
              >
                <div
                  className={`max - w - [85 %] p - 3.5 rounded - 2xl shadow - sm text - sm leading - relaxed ${m.from === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none font-medium'
                    } `}
                >
                  {/* Markdown simplificado para el bot */}
                  {m.from === 'bot' ? (
                    <div className="prose prose-sm prose-blue max-w-none dark:prose-invert text-gray-900" dangerouslySetInnerHTML={{
                      __html:
                        m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                    }} />
                  ) : (
                    <p className="break-words whitespace-pre-wrap">{m.text}</p>
                  )}
                  <div className={`text - [10px] mt - 1 text - right font - medium ${m.from === 'user' ? 'text-blue-100' : 'text-gray-500'} `}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex w-full justify-start animate-slideIn mt-4 mb-2">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium tracking-wide">Analizando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Action Bar */}
          {userProfile.type !== 'unknown' && !sending && (
            <div className="bg-blue-50 border-t border-blue-100 p-2 px-4 flex justify-between items-center animate-slideIn">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700">
                  🎯 Perfil Detectado: {userProfile.type === 'recruiter' ? 'Reclutador' : userProfile.type === 'technical' ? 'Técnico' : 'General'}
                </span>
              </div>
              <button
                onClick={() => generateDynamicCV(suggestCVProfile(conversationContext))}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar CV
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={URL.createObjectURL(img)} alt="preview" className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files) {
                    setImages(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                title="Adjuntar imagen de la vacante"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !sending && send()}
                onPaste={handlePaste}
                placeholder="Escribe tu mensaje o pega una imagen..."
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                disabled={sending}
              />
              <button
                onClick={send}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                disabled={sending || (!input.trim() && images.length === 0)}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-center mt-2">
              <p className="text-[10px] text-gray-300">Powered by Google Gemini 2.5</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
