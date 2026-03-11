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

// ──────────────────────────────────────────────────────────────────
// BOT INTERACTIONS
// ──────────────────────────────────────────────────────────────────

type UserType = 'recruiter' | 'technical' | 'strategist' | 'casual' | 'unknown';

// Categoriza la interacción directamente desde el tipo de usuario,
// sin necesitar llamadas a un servidor externo.
const categorizeFromUserType = (userType: UserType): { isRelevant: boolean; category: string; priority: string; summary: string } => {
  switch (userType) {
    case 'recruiter':
      return { isRelevant: true, category: 'recruitment', priority: 'high', summary: 'Interacción de reclutador detectada' };
    case 'strategist':
      return { isRelevant: true, category: 'recruitment', priority: 'high', summary: 'Sesión de Modo Estratega (generación de CV)' };
    case 'technical':
      return { isRelevant: true, category: 'technical', priority: 'medium', summary: 'Consulta técnica detectada' };
    case 'casual':
      return { isRelevant: true, category: 'general', priority: 'low', summary: 'Conversación general' };
    default:
      return { isRelevant: false, category: 'general', priority: 'low', summary: 'Interacción sin clasificar' };
  }
};

export const saveBotInteraction = async (interaction: {
  userMessage: string;
  botResponse: string;
  userType: UserType;
  timestamp: Date;
}) => {
  try {
    const analysis = categorizeFromUserType(interaction.userType);
    if (!analysis.isRelevant) return false;

    await addDoc(collection(db, 'bot_interactions'), {
      userMessage: interaction.userMessage.substring(0, 500),
      botResponse: interaction.botResponse.substring(0, 500),
      analysis,
      userType: interaction.userType,
      timestamp: interaction.timestamp,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error saving bot interaction:', error);
    return false;
  }
};

// Obtener estadísticas del bot para el dashboard
export const getBotStats = async () => {
  try {
    const interactions = await getDocs(collection(db, 'bot_interactions'));
    const data = interactions.docs.map(doc => doc.data());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: data.length,
      today: data.filter(i => i.createdAt?.toDate?.() >= today).length,
      byCategory: {
        recruitment: data.filter(i => i.analysis?.category === 'recruitment').length,
        technical: data.filter(i => i.analysis?.category === 'technical').length,
        general: data.filter(i => i.analysis?.category === 'general').length,
      },
      highPriority: data.filter(i => i.analysis?.priority === 'high').length,
    };
  } catch (error) {
    console.error('Error getting bot stats:', error);
    return { total: 0, today: 0, byCategory: { recruitment: 0, technical: 0, general: 0 }, highPriority: 0 };
  }
};

// ──────────────────────────────────────────────────────────────────
// PAGE VISITS
// ──────────────────────────────────────────────────────────────────

export const savePageVisit = async () => {
  try {
    await addDoc(collection(db, 'page_visits'), {
      timestamp: new Date(),
      language: navigator.language || 'unknown',
      userAgent: navigator.userAgent.substring(0, 200),
    });
  } catch (error) {
    // Falla silenciosamente — no interrumpir la navegación
    console.warn('Could not save page visit:', error);
  }
};

export const getPageVisitCount = async (): Promise<number> => {
  try {
    const snapshot = await getDocs(collection(db, 'page_visits'));
    return snapshot.size;
  } catch (error) {
    console.error('Error getting page visit count:', error);
    return 0;
  }
};