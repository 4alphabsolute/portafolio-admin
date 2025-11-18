import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from 'marked';
import cvProfiles from '../data/cv-profiles.json';
import personalityConfig from '../data/personality-config.json';

interface Message {
  from: 'user' | 'bot';
  text: string;
}

interface UserProfile {
  type: 'recruiter' | 'casual' | 'technical' | 'unknown';
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
    
    return 'MASTER'; // Default
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
        `¡Perfecto! He generado tu CV personalizado para el perfil "${profile.title}". El archivo PDF se ha descargado automáticamente.\n\n¿Te gustaría que ajuste algo específico o genere otro perfil?`;
      
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
    if (!input.trim()) {
      console.log('[AndyChat] send aborted: empty input');
      return;
    }
    const question = input.trim();
    setMessages((m) => [...m, { from: 'user', text: question }]);
    setInput('');

    setSending(true);
    
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyDBcGIh9f7ehSZDZyct9e9b4JqaqqmACV0');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Sistema anti-troll
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
      
      // Actualizar historial de mensajes
      setMessageHistory(prev => [...prev, question].slice(-10));
      
      // Actualizar contexto y perfil de usuario
      const newContext = [...conversationContext, question].slice(-10);
      setConversationContext(newContext);
      
      const detectedProfile = detectUserType(question, userProfile);
      setUserProfile(detectedProfile);
      
      const suggestedCV = suggestCVProfile(newContext);
      
      // Generar pregunta proactiva
      const proactiveQuestion = generateProactiveQuestion(detectedProfile.type, detectedProfile.language);
      
      let contextualPrompt = '';
      if (detectedProfile.type === 'recruiter') {
        contextualPrompt = detectedProfile.language === 'en' ? 
          `\n\nNOTE: I detected you're a recruiter. I can generate a specific CV for your search. ${proactiveQuestion}` :
          `\n\nNOTA: Detecté que eres un reclutador. ${proactiveQuestion}`;
      } else if (detectedProfile.type === 'technical') {
        contextualPrompt = detectedProfile.language === 'en' ? 
          `\n\nNOTE: I see you have technical interest. ${proactiveQuestion}` :
          `\n\nNOTA: ${proactiveQuestion}`;
      } else if (detectedProfile.messageCount === 1) {
        // Primera interacción - ser proactivo
        contextualPrompt = `\n\nPREGUNTA PROACTIVA: ${proactiveQuestion}`;
      }
      
      const basePrompt = detectedProfile.language === 'en' ? 
        `You are Andrés Almeida responding in first person as an experienced professional.

MY COMPLETE PROFILE:
- Data and Business Analyst specialized in banking and insurance
- Banesco Seguros: Actuarial reports automation in R, Power BI dashboards
- Banesco Banco: Credit risk analysis, EBITDA, cash flows
- MBA EUDE Business School (ongoing) + BI Master completed
- Skills: Power BI (DAX), R (tidyverse), SQL (Oracle), Python, financial analysis
- Madrid, Spain | soyandresalmeida@gmail.com
- Web: https://andresalmeida-portafolio.web.app

PERSONALITY: ${personalityConfig.personality.communication_style}
STRENGTHS: ${personalityConfig.personality.strengths.join(', ')}

USER CONTEXT:
- Detected type: ${detectedProfile.type}
- Suggested profile: ${suggestedCV}
- Language: English

RESPOND AS ME with specific technical examples. If recruiter, be direct about results and achievements. If asking about CV or downloads, mention I can generate a personalized CV.

Question: ${question}` :
        `Eres Andrés Almeida respondiendo en primera persona como un profesional experimentado.

MI PERFIL COMPLETO:
- Analista de Datos y Negocio especializado en banca y seguros
- Banesco Seguros: Automatización reportes actuariales en R, dashboards Power BI
- Banesco Banco: Análisis riesgo crediticio, EBITDA, flujos de caja
- MBA EUDE Business School (cursando) + Máster BI completado
- Skills: Power BI (DAX), R (tidyverse), SQL (Oracle), Python, análisis financiero
- Madrid, España | soyandresalmeida@gmail.com
- Web: https://andresalmeida-portafolio.web.app

PERSONALIDAD: ${personalityConfig.personality.communication_style}
FORTALEZAS: ${personalityConfig.personality.strengths.join(', ')}
DEBILIDADES: ${personalityConfig.personality.weaknesses.join(', ')}

CONTEXTO DEL USUARIO:
- Tipo detectado: ${detectedProfile.type}
- Perfil sugerido: ${suggestedCV}
- Idioma: Español

RESPONDE COMO YO con ejemplos técnicos específicos. Si es un reclutador, sé más directo sobre resultados y logros. Si preguntan sobre CV o descargas, menciona que puedo generar un CV personalizado.

Pregunta: ${question}`;
      
      const prompt = basePrompt + contextualPrompt;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setMessages((m) => [...m, { from: 'bot', text }]);
    } catch (error) {
      console.error('Gemini error:', error);
      setMessages((m) => [...m, { 
        from: 'bot', 
        text: 'Disculpa, tengo problemas técnicos. Como Analista de Datos, puedo contarte que trabajo con Power BI, R y análisis financiero en Banesco. ¿Qué te interesa saber específicamente?' 
      }]);
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
                <span className="text-xl">🤖</span>
                <span className="text-sm font-medium">AndyChat</span>
              </>
            )}
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A66C2] to-[#0052A3] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">AndyBot</h3>
                <p className="text-xs opacity-90">Asistente de Andrés Almeida</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-auto space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-4xl mb-2">💼</div>
                <p className="font-medium">¡Hola! Soy AndyBot</p>
                <p className="text-sm">Pregúntame sobre la experiencia,</p>
                <p className="text-sm">habilidades y proyectos de Andrés</p>
                
                {/* Botones de CV rápido */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-gray-600">CV Personalizado:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {Object.entries(cvProfiles.profiles).map(([key, profile]) => (
                      <button
                        key={key}
                        onClick={() => generateDynamicCV(key)}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                        title={profile.description}
                      >
                        {key === 'MASTER' ? 'Analista Híbrido' : 
                         key === 'BI' ? 'Analista BI' :
                         key === 'DATA' ? 'Analista de Datos' :
                         key === 'FINANZAS' ? 'Analista Financiero' :
                         'Consultor Digital'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                  m.from === 'user' 
                    ? 'bg-[#0A66C2] text-white rounded-br-md' 
                    : 'bg-white text-gray-800 rounded-bl-md border'
                }`}>
                  <div 
                    className={`text-sm leading-relaxed prose prose-sm max-w-none ${
                      m.from === 'user' ? 'prose-invert' : 'prose-gray'
                    }`}
                    dangerouslySetInnerHTML={{ 
                      __html: marked(m.text, { 
                        breaks: true,
                        gfm: true 
                      }) as string
                    }}
                  />
                  
                  {/* Mostrar botón de CV si el bot sugiere descarga */}
                  {m.from === 'bot' && (m.text.toLowerCase().includes('cv') || m.text.toLowerCase().includes('currículum')) && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Generar CV personalizado:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(cvProfiles.profiles).slice(0, 3).map(([key, profile]) => (
                          <button
                            key={key}
                            onClick={() => generateDynamicCV(key)}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            {key === 'MASTER' ? 'Híbrido' : 
                             key === 'BI' ? 'BI' :
                             key === 'DATA' ? 'Datos' :
                             key === 'FINANZAS' ? 'Financiero' :
                             'Consultor'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={`text-xs mt-1 opacity-70 ${
                    m.from === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-md border shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500">AndyBot está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !sending && send()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent" 
                disabled={sending} 
              />
              <button 
                onClick={send} 
                className="bg-[#0A66C2] text-white p-3 rounded-xl hover:bg-[#0052A3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={sending || !input.trim()}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
