import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BotAnalytics from '../components/BotAnalytics';


interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  sourceType?: string;
  primaryKey?: string;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  sourceType?: string;
  primaryKey?: string;
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
  sourceType?: string;
  primaryKey?: string;
}

interface CaseStudy {
  id?: string;
  title: string;
  client: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string;
  technologies: string[];
  duration: string;
  imageUrl?: string;
  featured?: boolean;
}

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('certificates');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [certForm, setCertForm] = useState<Certificate>({ name: '', issuer: '', date: '', description: '', url: '' });
  const [projectForm, setProjectForm] = useState<Project>({ title: '', description: '', technologies: [] });
  const [expForm, setExpForm] = useState<Experience>({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] });
  const [caseForm, setCaseForm] = useState<CaseStudy>({ title: '', client: '', industry: '', challenge: '', solution: '', results: '', technologies: [], duration: '' });
  const [uploading, setUploading] = useState(false);

  // Edit states
  const [editingCert, setEditingCert] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingExp, setEditingExp] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<string | null>(null);

  // Debug states
  const [debugData, setDebugData] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth') === 'true';
    if (isAuth) {
      setUser({ displayName: 'Admin', email: 'admin@portafolio.com' });
    } else {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch certificates con fallback
      try {
        const certsSnapshot = await getDocs(collection(db, 'certificates'));
        const certsData = certsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          technologies: doc.data().technologies || []
        } as unknown as Certificate));
        setCertificates(certsData);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setCertificates([]);
      }

      // Fetch projects con fallback
      try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsData = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          technologies: doc.data().technologies || []
        } as unknown as Project));
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      }

      // Fetch experiences con fallback
      try {
        const expSnapshot = await getDocs(collection(db, 'experiences'));
        const expData = expSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          technologies: doc.data().technologies || []
        } as unknown as Experience));
        setExperiences(expData);
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setExperiences([]);
      }

      // Fetch case studies
      const caseSnapshot = await getDocs(collection(db, 'case_studies'));
      const caseData = caseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaseStudy));
      setCaseStudies(caseData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingCert) {
        // Actualizar certificado existente
        await updateDoc(doc(db, 'certificates', editingCert), {
          ...certForm,
          updatedAt: new Date()
        });
        setEditingCert(null);
        alert('Certificado actualizado exitosamente');
      } else {
        // Agregar nuevo certificado
        await addDoc(collection(db, 'certificates'), {
          ...certForm,
          sourceType: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        alert('Certificado agregado exitosamente');
      }
      setCertForm({ name: '', issuer: '', date: '', description: '', url: '' });
      fetchData();
    } catch (error) {
      console.error('Error with certificate:', error);
      alert('Error al procesar certificado');
    } finally {
      setUploading(false);
    }
  };

  const editCertificate = async (cert: Certificate) => {
    // Si es del JSON, migrarlo a Firebase con primaryKey para evitar duplicados
    if (cert.sourceType === 'json') {
      try {
        const docRef = await addDoc(collection(db, 'certificates'), {
          ...cert,
          sourceType: 'migrated',
          primaryKey: cert.primaryKey || `json_${cert.id}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        // Actualizar el estado local
        cert.id = docRef.id;
        cert.sourceType = 'migrated';
        fetchData(); // Refrescar para ocultar el JSON y mostrar el migrado
      } catch (error) {
        console.error('Error migrating certificate:', error);
      }
    }
    setCertForm(cert);
    setEditingCert(cert.id!);
  };

  const cancelEditCert = () => {
    setCertForm({ name: '', issuer: '', date: '', description: '', url: '' });
    setEditingCert(null);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject), {
          ...projectForm,
          updatedAt: new Date()
        });
        setEditingProject(null);
        alert('Proyecto actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectForm,
          sourceType: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        alert('Proyecto agregado exitosamente');
      }
      setProjectForm({ title: '', description: '', technologies: [] });
      fetchData();
    } catch (error) {
      console.error('Error with project:', error);
      alert('Error al procesar proyecto');
    } finally {
      setUploading(false);
    }
  };

  const editProject = async (project: Project) => {
    // Si es del JSON, primero migrarlo a Firebase
    if (project.sourceType === 'json') {
      try {
        const docRef = await addDoc(collection(db, 'projects'), {
          ...project,
          sourceType: 'migrated',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        project.id = docRef.id;
        project.sourceType = 'migrated';
      } catch (error) {
        console.error('Error migrating project:', error);
      }
    }
    setProjectForm(project);
    setEditingProject(project.id!);
  };

  const cancelEditProject = () => {
    setProjectForm({ title: '', description: '', technologies: [] });
    setEditingProject(null);
  };

  const deleteCertificate = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este certificado?')) {
      try {
        if (!id || typeof id !== 'string') {
          console.error('ID inválido:', id);
          alert('Error: ID de certificado inválido');
          return;
        }
        await deleteDoc(doc(db, 'certificates', String(id)));
        fetchData();
        alert('Certificado eliminado');
      } catch (error) {
        console.error('Error deleting certificate:', error);
        alert('Error al eliminar certificado: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  const deleteProject = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        if (!id || typeof id !== 'string') {
          console.error('ID inválido:', id);
          alert('Error: ID de proyecto inválido');
          return;
        }
        await deleteDoc(doc(db, 'projects', String(id)));
        fetchData();
        alert('Proyecto eliminado');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error al eliminar proyecto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingExp) {
        await updateDoc(doc(db, 'experiences', editingExp), {
          ...expForm,
          updatedAt: new Date()
        });
        setEditingExp(null);
        alert('Experiencia actualizada exitosamente');
      } else {
        await addDoc(collection(db, 'experiences'), {
          ...expForm,
          sourceType: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        alert('Experiencia agregada exitosamente');
      }
      setExpForm({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] });
      fetchData();
    } catch (error) {
      console.error('Error with experience:', error);
      alert('Error al procesar experiencia');
    } finally {
      setUploading(false);
    }
  };

  const editExperience = async (exp: Experience) => {
    // Si es del JSON, primero migrarlo a Firebase
    if (exp.sourceType === 'json') {
      try {
        const docRef = await addDoc(collection(db, 'experiences'), {
          ...exp,
          sourceType: 'migrated',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        exp.id = docRef.id;
        exp.sourceType = 'migrated';
      } catch (error) {
        console.error('Error migrating experience:', error);
      }
    }
    setExpForm(exp);
    setEditingExp(exp.id!);
  };

  const cancelEditExp = () => {
    setExpForm({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] });
    setEditingExp(null);
  };

  // Case Study functions
  const handleCaseStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingCase) {
        await updateDoc(doc(db, 'case_studies', editingCase), {
          ...caseForm,
          updatedAt: new Date()
        });
        setEditingCase(null);
        alert('Caso de estudio actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'case_studies'), {
          ...caseForm,
          sourceType: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        alert('Caso de estudio agregado exitosamente');
      }
      setCaseForm({ title: '', client: '', industry: '', challenge: '', solution: '', results: '', technologies: [], duration: '' });
      fetchData();
    } catch (error) {
      console.error('Error with case study:', error);
      alert('Error al procesar caso de estudio');
    } finally {
      setUploading(false);
    }
  };

  const editCaseStudy = (caseStudy: CaseStudy) => {
    setCaseForm(caseStudy);
    setEditingCase(caseStudy.id!);
  };

  const cancelEditCase = () => {
    setCaseForm({ title: '', client: '', industry: '', challenge: '', solution: '', results: '', technologies: [], duration: '' });
    setEditingCase(null);
  };

  const deleteCaseStudy = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este caso de estudio?')) {
      try {
        await deleteDoc(doc(db, 'case_studies', id));
        fetchData();
        alert('Caso de estudio eliminado');
      } catch (error) {
        console.error('Error deleting case study:', error);
      }
    }
  };

  // Debug functions
  const fetchDebugData = async () => {
    setDebugLoading(true);
    setDebugError(null);

    try {
      const [certsSnap, projSnap, expSnap, caseSnap] = await Promise.all([
        getDocs(collection(db, 'certificates')),
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'experiences')),
        getDocs(collection(db, 'case_studies'))
      ]);

      const firebaseCerts = certsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Certificate));
      const firebaseProjects = projSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Project));
      const firebaseExps = expSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Experience));
      const firebaseCases = caseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as CaseStudy));

      const { default: cvData } = await import('../data/cv-data.json');
      const jsonCerts = cvData.certifications || [];
      const jsonProjects = cvData.projects || [];
      const jsonExps = cvData.experience || [];

      const missingCerts = jsonCerts.filter(json =>
        !firebaseCerts.some(fb => fb.primaryKey === `json_${json.id}` || fb.name === json.name)
      ).map(c => c.name || 'Sin nombre');

      const missingProjects = jsonProjects.filter(json =>
        !firebaseProjects.some(fb => fb.primaryKey === `json_${json.id}` || fb.title === json.name)
      ).map(p => p.name || 'Sin nombre');

      const missingExps = jsonExps.filter(json =>
        !firebaseExps.some(fb => fb.primaryKey === `json_${json.id}` || fb.company === json.company)
      ).map(e => `${e.company} - ${e.position}`);

      setDebugData({
        certificates: { firebase: firebaseCerts, json: jsonCerts, missing: missingCerts },
        projects: { firebase: firebaseProjects, json: jsonProjects, missing: missingProjects },
        experiences: { firebase: firebaseExps, json: jsonExps, missing: missingExps },
        cases: { firebase: firebaseCases, json: [], missing: [] },
        lastUpdate: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setDebugLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'debug') {
      fetchDebugData();
    }
  }, [activeTab]);

  const deleteExperience = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
      try {
        if (!id || typeof id !== 'string') {
          console.error('ID inválido:', id);
          alert('Error: ID de experiencia inválido');
          return;
        }
        await deleteDoc(doc(db, 'experiences', String(id)));
        fetchData();
        alert('Experiencia eliminada');
      } catch (error) {
        console.error('Error deleting experience:', error);
        alert('Error al eliminar experiencia: ' + (error instanceof Error ? error.message : 'Error desconocido'));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800">← Volver al Dashboard</a>
              <a href="/" className="text-blue-600 hover:text-blue-800">Ver Portafolio</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'certificates', name: 'Certificados', icon: '🏆' },
                { id: 'projects', name: 'Proyectos', icon: '💼' },
                { id: 'experiences', name: 'Experiencia', icon: '💼' },
                { id: 'cases', name: 'Casos de Estudio', icon: '📊' },
                { id: 'bot', name: 'Bot Analytics', icon: '🤖' },
                { id: 'debug', name: 'Database Status', icon: '🔍' },
                { id: 'system', name: 'Sistema', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.icon} {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add Certificate Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 Agregar Certificado</h3>
              <form onSubmit={handleCertificateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Certificado</label>
                  <input
                    type="text"
                    value={certForm.name}
                    onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Certificación en Power BI"
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institución/Emisor</label>
                  <input
                    type="text"
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Microsoft, Coursera, etc."
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Obtención</label>
                  <input
                    type="text"
                    value={certForm.date}
                    onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 2024, Enero 2024, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                  <textarea
                    value={certForm.description || ''}
                    onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe brevemente lo que aprendiste o el enfoque del certificado..."
                    spellCheck={true}
                    lang="es"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL del Certificado (opcional)</label>
                  <input
                    type="url"
                    value={certForm.url || ''}
                    onChange={(e) => setCertForm({ ...certForm, url: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingCert ? 'Actualizando...' : 'Agregando...'}
                      </div>
                    ) : (
                      editingCert ? '✏️ Actualizar Certificado' : '✨ Agregar Certificado'
                    )}
                  </button>
                  {editingCert && (
                    <button
                      type="button"
                      onClick={cancelEditCert}
                      className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Certificates List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 Certificados Dinámicos</h3>
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Gestión de Certificados</p>
                    <p className="text-sm text-blue-700">
                      Los certificados académicos principales (MBA, Máster, Licenciatura) están en el archivo JSON.
                      Aquí puedes agregar certificaciones adicionales, cursos especializados y nuevas credenciales.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {certificates.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No hay certificados dinámicos agregados</p>
                    <p className="text-sm text-gray-400 mt-1">Agrega certificaciones adicionales usando el formulario</p>
                  </div>
                ) : (
                  certificates.map((cert) => (
                    <div key={cert.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{cert.name}</h4>
                          <p className="text-sm text-blue-600 font-medium">{cert.issuer}</p>
                          <p className="text-xs text-gray-500">{cert.date}</p>
                          {cert.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{cert.description}</p>
                          )}
                          {cert.url && (
                            <a href={cert.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-700 mt-1 inline-block">
                              Ver certificado →
                            </a>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => editCertificate(cert)}
                            className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                            title="Editar certificado"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => cert.id && deleteCertificate(cert.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                            title={`Eliminar certificado ${cert.sourceType === 'json' ? '(JSON)' : '(Admin)'}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Add Project Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Proyecto</h3>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título del Proyecto</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías (separadas por coma)</label>
                  <input
                    type="text"
                    value={projectForm.technologies.join(', ')}
                    placeholder="React, TypeScript, Firebase"
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de GitHub (opcional)</label>
                  <input
                    type="url"
                    value={projectForm.githubUrl || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Live (opcional)</label>
                  <input
                    type="url"
                    value={projectForm.liveUrl || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? (editingProject ? 'Actualizando...' : 'Agregando...') : (editingProject ? '✏️ Actualizar Proyecto' : '✨ Agregar Proyecto')}
                  </button>
                  {editingProject && (
                    <button
                      type="button"
                      onClick={cancelEditProject}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Projects List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyectos Actuales</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <div key={project.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editProject(project)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => project.id && deleteProject(project.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Experiencia</h3>
              <form onSubmit={handleExperienceSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
                  <input
                    type="text"
                    value={expForm.position}
                    onChange={(e) => setExpForm({ ...expForm, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                    <input
                      type="text"
                      value={expForm.startDate}
                      onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                      placeholder="2024-01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                    <input
                      type="text"
                      value={expForm.endDate}
                      onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                      placeholder="presente"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías (separadas por coma)</label>
                  <input
                    type="text"
                    value={expForm.technologies.join(', ')}
                    placeholder="Power BI, SQL, R"
                    onChange={(e) => setExpForm({ ...expForm, technologies: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? (editingExp ? 'Actualizando...' : 'Agregando...') : (editingExp ? '✏️ Actualizar Experiencia' : '✨ Agregar Experiencia')}
                  </button>
                  {editingExp && (
                    <button
                      type="button"
                      onClick={cancelEditExp}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiencias Actuales</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{exp.position}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editExperience(exp)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => exp.id && deleteExperience(exp.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{exp.description.substring(0, 100)}...</p>
                    <div className="flex flex-wrap gap-1">
                      {exp.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Case Studies Tab */}
        {activeTab === 'cases' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Agregar Caso de Estudio</h3>
              <form onSubmit={handleCaseStudySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título del Caso</label>
                  <input
                    type="text"
                    value={caseForm.title}
                    onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Automatización de Reportes Actuariales"
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <input
                      type="text"
                      value={caseForm.client}
                      onChange={(e) => setCaseForm({ ...caseForm, client: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Banesco Seguros"
                      spellCheck={true}
                      lang="es"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industria</label>
                    <input
                      type="text"
                      value={caseForm.industry}
                      onChange={(e) => setCaseForm({ ...caseForm, industry: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Seguros, Banca, etc."
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desafío</label>
                  <textarea
                    value={caseForm.challenge}
                    onChange={(e) => setCaseForm({ ...caseForm, challenge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe el problema o desafío que se necesitaba resolver..."
                    spellCheck={true}
                    lang="es"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solución</label>
                  <textarea
                    value={caseForm.solution}
                    onChange={(e) => setCaseForm({ ...caseForm, solution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Explica la solución implementada..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resultados</label>
                  <textarea
                    value={caseForm.results}
                    onChange={(e) => setCaseForm({ ...caseForm, results: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe los resultados obtenidos, métricas, impacto..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías</label>
                    <input
                      type="text"
                      placeholder="R, Power BI, SQL"
                      onChange={(e) => setCaseForm({ ...caseForm, technologies: e.target.value.split(',').map(t => t.trim()) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                    <input
                      type="text"
                      value={caseForm.duration}
                      onChange={(e) => setCaseForm({ ...caseForm, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3 meses, 6 semanas, etc."
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? (editingCase ? 'Actualizando...' : 'Agregando...') : (editingCase ? '✏️ Actualizar Caso' : '✨ Agregar Caso')}
                  </button>
                  {editingCase && (
                    <button
                      type="button"
                      onClick={cancelEditCase}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Casos de Estudio</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {caseStudies.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No hay casos de estudio agregados</p>
                  </div>
                ) : (
                  caseStudies.map((caseStudy) => (
                    <div key={caseStudy.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{caseStudy.title}</h4>
                          <p className="text-sm text-blue-600 font-medium">{caseStudy.client} • {caseStudy.industry}</p>
                          <p className="text-xs text-gray-500 mb-2">Duración: {caseStudy.duration}</p>
                          <p className="text-sm text-gray-600 mb-2">{caseStudy.challenge.substring(0, 100)}...</p>
                          <div className="flex flex-wrap gap-1">
                            {caseStudy.technologies.map((tech, i) => (
                              <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <button
                            onClick={() => editCaseStudy(caseStudy)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => caseStudy.id && deleteCaseStudy(caseStudy.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bot Analytics Tab */}
        {activeTab === 'bot' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis del Chatbot</h3>
            <BotAnalytics />
          </div>
        )}

        {/* Database Status Tab */}
        {activeTab === 'debug' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🔍 Database Status Monitor</h3>
              <button
                onClick={fetchDebugData}
                disabled={debugLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {debugLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    🔄 Actualizar Estado
                  </>
                )}
              </button>
            </div>

            {debugError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-red-600">❌</span>
                  <h4 className="font-medium text-red-800">Error al cargar datos</h4>
                </div>
                <p className="text-red-700 mt-1">{debugError}</p>
                <button
                  onClick={() => setDebugError(null)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Cerrar
                </button>
              </div>
            )}

            {debugData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  {[
                    { key: 'certificates', name: 'Certificados', icon: '🏆' },
                    { key: 'projects', name: 'Proyectos', icon: '💼' },
                    { key: 'experiences', name: 'Experiencias', icon: '🏢' },
                    { key: 'cases', name: 'Casos de Estudio', icon: '📊' }
                  ].map(({ key, name, icon }) => {
                    const data = debugData[key];
                    const isHealthy = data.missing.length === 0;
                    return (
                      <div key={key} className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">{icon} {name}</span>
                          <span className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Firebase:</span>
                            <span className="font-medium">{data.firebase.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>JSON:</span>
                            <span className="font-medium">{data.json.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Faltantes:</span>
                            <span className={`font-medium ${data.missing.length > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                              {data.missing.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Status */}
                <div className="bg-white rounded-lg border p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Estado Detallado</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(debugData).filter(([key]) => key !== 'lastUpdate').map(([key, data]: [string, any]) => {
                      const names = { certificates: 'Certificados', projects: 'Proyectos', experiences: 'Experiencias', cases: 'Casos de Estudio' };
                      return (
                        <div key={key} className="space-y-3">
                          <h5 className="font-medium text-gray-800">{names[key as keyof typeof names]}</h5>
                          {data.missing.length > 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <p className="text-red-800 font-medium text-sm mb-2">⚠️ Elementos faltantes:</p>
                              <ul className="text-red-700 text-xs space-y-1">
                                {data.missing.map((item: string, i: number) => (
                                  <li key={i}>• {item}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              <p className="text-green-800 text-sm">✅ Todos los elementos migrados correctamente</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Última actualización: {debugData.lastUpdate}</span>
                      <span>Total faltantes: {Object.values(debugData).reduce((acc: number, data: any) =>
                        acc + (data.missing?.length || 0), 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!debugData && !debugLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <p className="text-gray-600">Haz click en "Actualizar Estado" para cargar el monitor de base de datos</p>
              </div>
            )}
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Información del Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Frontend:</p>
                    <p className="text-gray-600">Firebase Hosting</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Base de Datos:</p>
                    <p className="text-gray-600">Firebase Firestore</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Bot API:</p>
                    <p className="text-gray-600">Vercel Serverless</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Almacenamiento:</p>
                    <p className="text-gray-600">Firebase Storage</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Estado del Proyecto</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-green-800 font-medium">Sistema operativo y optimizado</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Proyecto depurado, componentes redundantes eliminados, estructura limpia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}