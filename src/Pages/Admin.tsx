import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import MigrationButton from '../components/MigrationButton';
import BotAnalytics from '../components/BotAnalytics';

interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('certificates');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [certForm, setCertForm] = useState<Certificate>({ name: '', issuer: '', date: '', description: '', url: '' });
  const [projectForm, setProjectForm] = useState<Project>({ title: '', description: '', technologies: [] });
  const [expForm, setExpForm] = useState<Experience>({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] });
  const [uploading, setUploading] = useState(false);

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
      // Fetch certificates
      const certsSnapshot = await getDocs(collection(db, 'certificates'));
      const certsData = certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certificate));
      setCertificates(certsData);

      // Fetch projects
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);

      // Fetch experiences
      const expSnapshot = await getDocs(collection(db, 'experiences'));
      const expData = expSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience));
      setExperiences(expData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      await addDoc(collection(db, 'certificates'), certForm);
      setCertForm({ name: '', issuer: '', date: '', description: '', url: '' });
      fetchData();
      alert('Certificado agregado exitosamente');
    } catch (error) {
      console.error('Error adding certificate:', error);
      alert('Error al agregar certificado');
    } finally {
      setUploading(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      await addDoc(collection(db, 'projects'), projectForm);
      setProjectForm({ title: '', description: '', technologies: [] });
      fetchData();
      alert('Proyecto agregado exitosamente');
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Error al agregar proyecto');
    } finally {
      setUploading(false);
    }
  };

  const deleteCertificate = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este certificado?')) {
      try {
        await deleteDoc(doc(db, 'certificates', id));
        fetchData();
        alert('Certificado eliminado');
      } catch (error) {
        console.error('Error deleting certificate:', error);
      }
    }
  };

  const deleteProject = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        fetchData();
        alert('Proyecto eliminado');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      await addDoc(collection(db, 'experiences'), expForm);
      setExpForm({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] });
      fetchData();
      alert('Experiencia agregada exitosamente');
    } catch (error) {
      console.error('Error adding experience:', error);
      alert('Error al agregar experiencia');
    } finally {
      setUploading(false);
    }
  };

  const deleteExperience = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta experiencia?')) {
      try {
        await deleteDoc(doc(db, 'experiences', id));
        fetchData();
        alert('Experiencia eliminada');
      } catch (error) {
        console.error('Error deleting experience:', error);
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
                { id: 'bot', name: 'Bot Analytics', icon: '🤖' },
                { id: 'system', name: 'Sistema', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
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
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-105"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agregando...
                    </div>
                  ) : (
                    '✨ Agregar Certificado'
                  )}
                </button>
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
                        <button
                          onClick={() => cert.id && deleteCertificate(cert.id)}
                          className="ml-3 text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Eliminar certificado"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías (separadas por coma)</label>
                  <input
                    type="text"
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
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Agregando...' : 'Agregar Proyecto'}
                </button>
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
                      <button
                        onClick={() => project.id && deleteProject(project.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías (separadas por coma)</label>
                  <input
                    type="text"
                    placeholder="Power BI, SQL, R"
                    onChange={(e) => setExpForm({ ...expForm, technologies: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Agregando...' : 'Agregar Experiencia'}
                </button>
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
                      <button
                        onClick={() => exp.id && deleteExperience(exp.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
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

        {/* Bot Analytics Tab */}
        {activeTab === 'bot' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis del Chatbot</h3>
            <BotAnalytics />
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión del Sistema</h3>
              <MigrationButton />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Información del Sistema</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Frontend:</p>
                  <p className="text-gray-600">Firebase Hosting</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Base de Datos:</p>
                  <p className="text-gray-600">Firebase Firestore</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Bot API:</p>
                  <p className="text-gray-600">Vercel Serverless</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Almacenamiento:</p>
                  <p className="text-gray-600">Firebase Storage</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}