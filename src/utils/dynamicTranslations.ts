// Sistema de traducciones dinámicas para datos de Firebase
export const translateDynamicContent = (content: any, language: 'es' | 'en') => {
  if (!content || language === 'es') return content;

  // Traducciones automáticas para campos comunes
  const translations: Record<string, Record<string, string>> = {
    // Certificaciones
    'MBA': {
      en: 'MBA'
    },
    'Máster en Business Intelligence y Big Data Analytics': {
      en: 'Master in Business Intelligence and Big Data Analytics'
    },
    'Licenciatura en Economía': {
      en: 'Bachelor\'s Degree in Economics'
    },
    'Ingeniería Informática (5 semestres)': {
      en: 'Computer Engineering (5 semesters)'
    },
    'EUDE Business School': {
      en: 'EUDE Business School'
    },
    'Universidad Católica Andrés Bello (UCAB)': {
      en: 'Universidad Católica Andrés Bello (UCAB)'
    },

    // Experiencia
    'Especialista de Control y Gestión del Dato': {
      en: 'Data Control and Management Specialist'
    },
    'Analista de Crédito': {
      en: 'Credit Analyst'
    },
    'Banesco Seguros': {
      en: 'Banesco Insurance'
    },
    'Banesco Banco Universal': {
      en: 'Banesco Universal Bank'
    },

    // Descripciones de certificaciones
    'Programa de Maestría en Administración de Empresas con enfoque en gestión estratégica y liderazgo empresarial': {
      en: 'Master of Business Administration program with focus on strategic management and business leadership'
    },
    'Programa completo en BI, análisis de datos, Power BI, SQL y herramientas de Big Data para la toma de decisiones empresariales': {
      en: 'Complete program in BI, data analysis, Power BI, SQL and Big Data tools for business decision making'
    },
    'Formación sólida en economía con enfoque en análisis cuantitativo, finanzas y políticas públicas': {
      en: 'Solid training in economics with focus on quantitative analysis, finance and public policy'
    },
    'Fundamentos de programación, estructuras de datos y pensamiento lógico aplicados a la analítica': {
      en: 'Programming fundamentals, data structures and logical thinking applied to analytics'
    },

    // Descripciones de experiencia
    'Automatización de reportes actuariales y financieros en R, mejorando consistencia y tiempos de entrega. Desarrollo de dashboards estratégicos en Power BI integrando costos, ventas y reservas. Diagnóstico de fallas estructurales en la arquitectura de datos y propuestas de mejora de gobernanza. Estandarización de definiciones y criterios analíticos entre áreas actuariales y gerenciales.': {
      en: 'Automation of actuarial and financial reports in R, improving consistency and delivery times. Development of strategic dashboards in Power BI integrating costs, sales and reserves. Diagnosis of structural failures in data architecture and governance improvement proposals. Standardization of analytical definitions and criteria between actuarial and managerial areas.'
    },
    'Análisis de riesgo crediticio con flujos de caja, métricas financieras y reclasificación contable. Elaboración y defensa técnica de expedientes ante el Comité Ejecutivo de Crédito. Integración del análisis técnico con necesidades comerciales y contexto macroeconómico. Evaluación de clientes corporativos usando EBITDA, liquidez, rotaciones y flujo operativo.': {
      en: 'Credit risk analysis with cash flows, financial metrics and accounting reclassification. Preparation and technical defense of files before the Executive Credit Committee. Integration of technical analysis with commercial needs and macroeconomic context. Evaluation of corporate clients using EBITDA, liquidity, rotations and operating flow.'
    },

    // Proyectos
    'Mi Portafolio': {
      en: 'My Portfolio'
    },
    'Portafolio personal con chatbot integrado usando Flowise y Gemini': {
      en: 'Personal portfolio with integrated chatbot using Flowise and Gemini'
    },

    // Estados de proyectos
    'completado': {
      en: 'completed'
    },
    'en progreso': {
      en: 'in progress'
    },
    'planeado': {
      en: 'planned'
    }
  };

  // Si es un string, traducir directamente
  if (typeof content === 'string') {
    return translations[content]?.[language] || content;
  }

  // Si es un objeto, traducir campos específicos
  if (typeof content === 'object' && content !== null) {
    const translated = { ...content };

    // Campos a traducir - Lista de propiedades que contienen texto traducible
    const fieldsToTranslate = ['name', 'issuer', 'company', 'position', 'description', 'title'];
    
    fieldsToTranslate.forEach(field => {
      if (translated[field] && typeof translated[field] === 'string') {
        translated[field] = translations[translated[field]]?.[language] || translated[field];
      }
    });

    return translated;
  }

  return content;
};

// Hook para usar traducciones dinámicas
export const useDynamicTranslation = (language: 'es' | 'en') => {
  return (content: any) => translateDynamicContent(content, language);
};