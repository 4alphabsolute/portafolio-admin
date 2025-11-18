import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import cvData from '../data/cv-data.json';

// Migrar datos del JSON a Firebase (solo una vez)
export const migrateJSONToFirebase = async () => {
  try {
    console.log('🔄 Migrando datos del JSON a Firebase...');

    // Migrar certificaciones
    if (cvData.certifications && cvData.certifications.length > 0) {
      for (const cert of cvData.certifications) {
        await addDoc(collection(db, 'certificates'), {
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
          credentialId: cert.credentialId || '',
          url: cert.url || '',
          migratedFromJSON: true,
          createdAt: new Date()
        });
      }
      console.log('✅ Certificaciones migradas');
    }

    // Migrar experiencias
    if (cvData.experience && cvData.experience.length > 0) {
      for (const exp of cvData.experience) {
        await addDoc(collection(db, 'experiences'), {
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
          technologies: exp.technologies || [],
          migratedFromJSON: true,
          createdAt: new Date()
        });
      }
      console.log('✅ Experiencias migradas');
    }

    // Migrar proyectos
    if (cvData.projects && cvData.projects.length > 0) {
      for (const project of cvData.projects) {
        await addDoc(collection(db, 'projects'), {
          name: project.name,
          description: project.description,
          technologies: project.technologies || [],
          url: project.url || '',
          github: project.github || '',
          status: 'completed',
          migratedFromJSON: true,
          createdAt: new Date()
        });
      }
      console.log('✅ Proyectos migrados');
    }

    // Marcar migración como completada
    await setDoc(doc(db, 'system', 'migration'), {
      completed: true,
      completedAt: new Date(),
      version: '1.0'
    });

    console.log('🎉 Migración completada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return false;
  }
};

// Verificar si ya se migró
export const checkMigrationStatus = async () => {
  try {
    const migrationDoc = await getDocs(collection(db, 'system'));
    return migrationDoc.docs.some(doc => doc.id === 'migration' && doc.data().completed);
  } catch (error) {
    console.error('Error checking migration:', error);
    return false;
  }
};

// Guardar interacción del bot con análisis de Gemini
export const saveBotInteraction = async (interaction: {
  userMessage: string;
  botResponse: string;
  userAgent?: string;
  timestamp: Date;
}) => {
  try {
    // Analizar si la interacción es relevante usando Gemini
    const relevanceAnalysis = await analyzeInteractionRelevance(interaction);
    
    if (relevanceAnalysis.isRelevant) {
      await addDoc(collection(db, 'bot_interactions'), {
        ...interaction,
        analysis: relevanceAnalysis,
        createdAt: new Date(),
        isRelevant: true
      });
      console.log('💬 Interacción relevante guardada');
      return true;
    } else {
      console.log('🚫 Interacción descartada (no relevante)');
      return false;
    }
  } catch (error) {
    console.error('Error saving interaction:', error);
    return false;
  }
};

// Analizar relevancia de la interacción con Gemini
const analyzeInteractionRelevance = async (interaction: any) => {
  try {
    const prompt = `
    Analiza esta interacción de chatbot y determina si es relevante para un reclutador o empleador:
    
    Usuario: "${interaction.userMessage}"
    Bot: "${interaction.botResponse}"
    
    Responde en JSON:
    {
      "isRelevant": boolean,
      "category": "recruitment" | "technical" | "general" | "spam",
      "summary": "resumen en 1 línea",
      "priority": "high" | "medium" | "low"
    }
    
    Considera relevante si:
    - Preguntas sobre experiencia laboral, habilidades técnicas
    - Consultas sobre disponibilidad, salario, proyectos
    - Interés en contratación o colaboración
    - Preguntas técnicas específicas sobre tecnologías
    
    NO relevante:
    - Saludos simples, pruebas del bot
    - Preguntas muy generales sin contexto profesional
    - Spam o mensajes sin sentido
    `;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        isAnalysis: true
      })
    });

    if (response.ok) {
      const result = await response.text();
      return JSON.parse(result);
    }
    
    // Fallback si falla el análisis
    return {
      isRelevant: true,
      category: 'general',
      summary: 'Análisis no disponible',
      priority: 'medium'
    };
  } catch (error) {
    console.error('Error analyzing relevance:', error);
    return {
      isRelevant: true,
      category: 'general', 
      summary: 'Error en análisis',
      priority: 'medium'
    };
  }
};

// Obtener estadísticas del bot para el dashboard
export const getBotStats = async () => {
  try {
    const interactions = await getDocs(collection(db, 'bot_interactions'));
    const data = interactions.docs.map(doc => doc.data());
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      total: data.length,
      today: data.filter(i => i.createdAt?.toDate() >= today).length,
      byCategory: {
        recruitment: data.filter(i => i.analysis?.category === 'recruitment').length,
        technical: data.filter(i => i.analysis?.category === 'technical').length,
        general: data.filter(i => i.analysis?.category === 'general').length
      },
      highPriority: data.filter(i => i.analysis?.priority === 'high').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting bot stats:', error);
    return {
      total: 0,
      today: 0,
      byCategory: { recruitment: 0, technical: 0, general: 0 },
      highPriority: 0
    };
  }
};