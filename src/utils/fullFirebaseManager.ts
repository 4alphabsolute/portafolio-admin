import { collection, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import cvData from '../data/cv-data.json';

// Migración completa y limpieza de duplicados
export const initializeFirebaseData = async () => {
  try {
    console.log('🔄 Inicializando datos Firebase...');

    // 1. Verificar si ya hay datos en Firebase
    const [certsSnapshot, expSnapshot, projectsSnapshot] = await Promise.all([
      getDocs(collection(db, 'certificates')),
      getDocs(collection(db, 'experiences')),
      getDocs(collection(db, 'projects'))
    ]);

    // 2. Si no hay datos, migrar desde JSON
    if (certsSnapshot.empty && expSnapshot.empty && projectsSnapshot.empty) {
      console.log('📦 Migrando datos desde JSON...');
      await migrateFromJSON();
    }

    // 3. Marcar como inicializado
    await setDoc(doc(db, 'system', 'initialized'), {
      completed: true,
      timestamp: new Date(),
      version: '2.0'
    });

    console.log('✅ Firebase inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
    return false;
  }
};

// Migrar datos del JSON a Firebase (solo una vez)
const migrateFromJSON = async () => {
  // Migrar certificaciones
  for (const cert of cvData.certifications) {
    await addDoc(collection(db, 'certificates'), {
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      description: cert.description || '',
      credentialId: cert.credentialId || '',
      url: cert.url || '',
      createdAt: new Date()
    });
  }

  // Migrar experiencias
  for (const exp of cvData.experience) {
    await addDoc(collection(db, 'experiences'), {
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description,
      technologies: exp.technologies || [],
      createdAt: new Date()
    });
  }

  // Migrar proyectos
  for (const project of cvData.projects) {
    await addDoc(collection(db, 'projects'), {
      name: project.name,
      description: project.description,
      technologies: project.technologies || [],
      url: project.url || '',
      github: project.github || '',
      status: 'completed',
      createdAt: new Date()
    });
  }
};

// Obtener datos solo de Firebase
export const getFirebaseData = async (collection_name: string) => {
  try {
    const snapshot = await getDocs(collection(db, collection_name));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error obteniendo ${collection_name}:`, error);
    return [];
  }
};

// Verificar si Firebase está inicializado
export const isFirebaseInitialized = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'system'));
    return snapshot.docs.some(doc => doc.id === 'initialized' && doc.data().completed);
  } catch (error) {
    return false;
  }
};