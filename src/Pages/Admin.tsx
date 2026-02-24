import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import BotAnalytics from '../components/BotAnalytics';
import ContentGenerator from '../components/ContentGenerator';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

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
  images?: string[];
  sourceType?: string;
  primaryKey?: string;
  visibility?: 'public' | 'draft';
  status?: 'completed' | 'in-progress' | 'planned';
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
  sourceType?: string;
}

interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  readTime: string;
  category: string;
  linkedinUrl?: string;
  status: 'published' | 'coming-soon';
  imageUrl?: string;
  image?: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('certificates');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [certForm, setCertForm] = useState<Certificate>({ name: '', issuer: '', date: '', description: '', url: '' });
  const [projectForm, setProjectForm] = useState<Project>({ title: '', description: '', technologies: [], visibility: 'public', status: 'completed', images: [] });
  const [expForm, setExpForm] = useState<Experience>({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] });
  const [caseForm, setCaseForm] = useState<CaseStudy>({ title: '', client: '', industry: '', challenge: '', solution: '', results: '', technologies: [], duration: '' });
  const [blogForm, setBlogForm] = useState<BlogPost>({ title: '', excerpt: '', content: '', date: '', readTime: '', category: '', status: 'published', imageUrl: '', linkedinUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleDraftSelection = (draft: { title: string; body: string; tags: string[] }) => {
    setBlogForm({
      ...blogForm,
      title: draft.title,
      excerpt: draft.body.replace(/<[^>]+>/g, '').substring(0, 150) + '...',
      content: draft.body,
      category: draft.tags[0] || 'General',
    });
    setActiveTab('blog');
    alert('✅ Datos aplicados al formulario.\n\nNota: Tu blog usa enlaces externos. Copia el contenido completo del generador para publicarlo en LinkedIn, y luego pega aquí la URL.');
  };

  // Edit states
  const [editingCert, setEditingCert] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingExp, setEditingExp] = useState<string | null>(null);
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);

  // Debug states
  const [debugData, setDebugData] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    // Auth is now handled by PrivateRoute
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        displayName: currentUser.displayName || 'Admin',
        email: currentUser.email
      });
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
      try {
        const certsSnapshot = await getDocs(collection(db, 'certificates'));
        setCertificates(certsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Certificate)));
      } catch (e) { console.error(e); setCertificates([]); }

      // Fetch projects
      try {
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        setProjects(projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Project)));
      } catch (e) { console.error(e); setProjects([]); }

      // Fetch experiences
      try {
        const expSnapshot = await getDocs(collection(db, 'experiences'));
        setExperiences(expSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Experience)));
      } catch (e) { console.error(e); setExperiences([]); }

      // Fetch case studies
      try {
        const caseSnapshot = await getDocs(collection(db, 'case_studies'));
        setCaseStudies(caseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CaseStudy)));
      } catch (e) { console.error(e); setCaseStudies([]); }

      // Fetch blog posts
      try {
        const blogSnapshot = await getDocs(collection(db, 'blog_posts'));
        setBlogPosts(blogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
      } catch (e) { console.error(e); setBlogPosts([]); }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Certificate Handlers
  const handleCertificateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingCert) {
        await updateDoc(doc(db, 'certificates', editingCert), { ...certForm, updatedAt: new Date() });
        setEditingCert(null);
      } else {
        await addDoc(collection(db, 'certificates'), { ...certForm, sourceType: 'admin', createdAt: new Date(), updatedAt: new Date() });
      }
      setCertForm({ name: '', issuer: '', date: '', description: '', url: '' });
      fetchData();
    } catch (error) { console.error(error); alert('Error'); } finally { setUploading(false); }
  };

  const editCertificate = (cert: Certificate) => { setCertForm(cert); setEditingCert(cert.id!); };
  const cancelEditCert = () => { setCertForm({ name: '', issuer: '', date: '', description: '', url: '' }); setEditingCert(null); };
  const deleteCertificate = async (id: string) => { if (confirm('Eliminar?')) { await deleteDoc(doc(db, 'certificates', id)); fetchData(); } };

  // Project Handlers
  const uploadImageToStorage = async (file: File, folder: string) => {
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleProjectCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const url = await uploadImageToStorage(file, 'projects');
      setProjectForm(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Error uploading cover:", error);
      alert("Error subiendo imagen de portada");
    } finally {
      setUploading(false);
    }
  };

  const handleProjectGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const uploadPromises = files.map(file => uploadImageToStorage(file, 'projects/gallery'));
      const urls = await Promise.all(uploadPromises);
      setProjectForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch (error) {
      console.error("Error uploading gallery:", error);
      alert("Error subiendo imágenes a la galería");
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setProjectForm(prev => ({
      ...prev,
      images: prev.images?.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject), { ...projectForm, updatedAt: new Date() });
        setEditingProject(null);
      } else {
        await addDoc(collection(db, 'projects'), { ...projectForm, sourceType: 'admin', createdAt: new Date(), updatedAt: new Date() });
      }
      setProjectForm({ title: '', description: '', technologies: [], visibility: 'public', status: 'completed', imageUrl: '', images: [] });
      fetchData();
    } catch (error) { console.error(error); alert('Error'); } finally { setUploading(false); }
  };

  const editProject = (project: Project) => { setProjectForm({ ...project, images: project.images || [] }); setEditingProject(project.id!); };
  const cancelEditProject = () => { setProjectForm({ title: '', description: '', technologies: [], visibility: 'public', status: 'completed', imageUrl: '', images: [] }); setEditingProject(null); };
  const deleteProject = async (id: string) => { if (confirm('Eliminar?')) { await deleteDoc(doc(db, 'projects', id)); fetchData(); } };

  // Experience Handlers
  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingExp) {
        await updateDoc(doc(db, 'experiences', editingExp), { ...expForm, updatedAt: new Date() });
        setEditingExp(null);
      } else {
        await addDoc(collection(db, 'experiences'), { ...expForm, sourceType: 'admin', createdAt: new Date(), updatedAt: new Date() });
      }
      setExpForm({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] });
      fetchData();
    } catch (error) { console.error(error); alert('Error'); } finally { setUploading(false); }
  };

  const editExperience = (exp: Experience) => { setExpForm(exp); setEditingExp(exp.id!); };
  const cancelEditExp = () => { setExpForm({ company: '', position: '', startDate: '', endDate: '', description: '', technologies: [] }); setEditingExp(null); };
  const deleteExperience = async (id: string) => { if (confirm('Eliminar?')) { await deleteDoc(doc(db, 'experiences', id)); fetchData(); } };

  // Case Study Handlers
  const handleCaseStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingCase) {
        await updateDoc(doc(db, 'case_studies', editingCase), { ...caseForm, updatedAt: new Date() });
        setEditingCase(null);
      } else {
        await addDoc(collection(db, 'case_studies'), { ...caseForm, sourceType: 'admin', createdAt: new Date(), updatedAt: new Date() });
      }
      setCaseForm({ title: '', client: '', industry: '', challenge: '', solution: '', results: '', technologies: [], duration: '' });
      fetchData();
    } catch (error) { console.error(error); alert('Error'); } finally { setUploading(false); }
  };

  const editCaseStudy = (caseStudy: CaseStudy) => { setCaseForm(caseStudy); setEditingCase(caseStudy.id!); };
  const cancelEditCase = () => { setCaseForm({ title: '', client: '', industry: '', challenge: '', solution: '', results: '', technologies: [], duration: '' }); setEditingCase(null); };
  const deleteCaseStudy = async (id: string) => { if (confirm('Eliminar?')) { await deleteDoc(doc(db, 'case_studies', id)); fetchData(); } };

  // Blog Handlers
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editingBlog) {
        await updateDoc(doc(db, 'blog_posts', editingBlog), { ...blogForm, updatedAt: new Date() });
        setEditingBlog(null);
        alert('Artículo actualizado');
      } else {
        await addDoc(collection(db, 'blog_posts'), { ...blogForm, createdAt: new Date(), updatedAt: new Date() });
        alert('Artículo agregado');
      }
      setBlogForm({ title: '', excerpt: '', date: '', readTime: '', category: '', status: 'published', imageUrl: '', linkedinUrl: '' });
      fetchData();
    } catch (error) { console.error(error); alert('Error'); } finally { setUploading(false); }
  };

  const editBlog = (post: BlogPost) => { setBlogForm(post); setEditingBlog(post.id!); };
  const cancelEditBlog = () => { setBlogForm({ title: '', excerpt: '', date: '', readTime: '', category: '', status: 'published', imageUrl: '', linkedinUrl: '' }); setEditingBlog(null); };
  const deleteBlog = async (id: string) => { if (confirm('Eliminar?')) { await deleteDoc(doc(db, 'blog_posts', id)); fetchData(); } };

  const fetchDebugData = async () => {
    setDebugLoading(true);
    setDebugError(null);
    try {
      const collections = ['certificates', 'projects', 'experiences', 'case_studies', 'blog_posts'];
      const data: any = {};

      for (const colName of collections) {
        const snapshot = await getDocs(collection(db, colName));
        data[colName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      setDebugData(data);
    } catch (error: any) {
      console.error('Debug fetch error:', error);
      setDebugError(error.message);
    } finally {
      setDebugLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">Acceso Restringido</div>;

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
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {[
                { id: 'certificates', name: 'Certificados', icon: '🏆' },
                { id: 'projects', name: 'Proyectos', icon: '💼' },
                { id: 'experiences', name: 'Experiencia', icon: '💼' },
                { id: 'cases', name: 'Casos de Estudio', icon: '📊' },
                { id: 'blog', name: 'Blog', icon: '✍️' },
                { id: 'generator', name: 'Generador IA', icon: '✨' },
                { id: 'bot', name: 'Bot Analytics', icon: '🤖' },
                { id: 'debug', name: 'Database Status', icon: '🔍' },
                { id: 'system', name: 'Sistema', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📜 Agregar Certificado</h3>
              <form onSubmit={handleCertificateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Certificado</label>
                  <input type="text" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Certificación en Power BI" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institución/Emisor</label>
                  <input type="text" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Microsoft" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input type="text" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 2024" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea value={certForm.description || ''} onChange={(e) => setCertForm({ ...certForm, description: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input type="url" value={certForm.url || ''} onChange={(e) => setCertForm({ ...certForm, url: e.target.value })} className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {uploading ? 'Guardando...' : (editingCert ? 'Actualizar' : 'Agregar')}
                  </button>
                  {editingCert && <button type="button" onClick={cancelEditCert} className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">Cancelar</button>}
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 Certificados Dinámicos</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {certificates.map((cert) => (
                  <div key={cert.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                        <p className="text-sm text-blue-600">{cert.issuer}</p>
                        <p className="text-xs text-gray-500">{cert.date}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editCertificate(cert)} className="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                        <button onClick={() => cert.id && deleteCertificate(cert.id)} className="text-red-500 hover:text-red-700 p-1">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agregar Proyecto</h3>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input type="text" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <div className="bg-white">
                    <ReactQuill
                      theme="snow"
                      value={projectForm.description || ''}
                      onChange={(val) => setProjectForm({ ...projectForm, description: val })}
                      modules={quillModules}
                      className="h-48 mb-12"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías</label>
                  <input type="text" value={projectForm.technologies.join(', ')} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value.split(',').map(t => t.trim()) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
                    <input type="url" value={projectForm.githubUrl || ''} onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
                    <input type="url" value={projectForm.liveUrl || ''} onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-4 border border-gray-200 p-4 rounded-lg bg-gray-50">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Imágenes del Proyecto</h4>

                  {/* Portada */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Portada (Principal)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={projectForm.imageUrl || ''}
                        onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Pegar URL externa o..."
                      />
                      <span className="text-gray-500 text-sm">o</span>
                      <label className="cursor-pointer bg-white border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-50 text-sm font-medium">
                        Subir Archivo
                        <input type="file" accept="image/*" onChange={handleProjectCoverUpload} className="hidden" />
                      </label>
                    </div>
                    {projectForm.imageUrl && (
                      <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        ✓ Portada lista <img src={projectForm.imageUrl} alt="preview" className="h-6 w-6 object-cover rounded ml-2" />
                      </div>
                    )}
                  </div>

                  {/* Galería */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Galería de Imágenes (Múltiples vistas, dashboards, etc.)</label>
                    <label className="cursor-pointer flex items-center justify-center w-full bg-white border-2 border-dashed border-gray-300 px-3 py-4 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors text-sm font-medium text-gray-600">
                      📄 Clic para subir múltiples imágenes a la vez
                      <input type="file" multiple accept="image/*" onChange={handleProjectGalleryUpload} className="hidden" />
                    </label>

                    {projectForm.images && projectForm.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {projectForm.images.map((img, idx) => (
                          <div key={idx} className="relative group rounded-md overflow-hidden border border-gray-200 aspect-video">
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx)}
                                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visibilidad</label>
                    <select
                      value={projectForm.visibility || 'public'}
                      onChange={(e) => setProjectForm({ ...projectForm, visibility: e.target.value as 'public' | 'draft' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">Público</option>
                      <option value="draft">Borrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Proyecto</label>
                    <select
                      value={projectForm.status || 'completed'}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as 'completed' | 'in-progress' | 'planned' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="completed">Completado</option>
                      <option value="in-progress">En Progreso</option>
                      <option value="planned">Planeado</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {uploading ? 'Guardando...' : (editingProject ? 'Actualizar' : 'Agregar')}
                  </button>
                  {editingProject && <button type="button" onClick={cancelEditProject} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancelar</button>}
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyectos Actuales</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <div key={project.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {project.title}
                          {project.visibility === 'draft' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Borrador</span>}
                          <span className="ml-2 text-xs text-gray-500">({project.status || 'completed'})</span>
                        </h4>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editProject(project)} className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                        <button onClick={() => project.id && deleteProject(project.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
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
                  <input type="text" value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posición</label>
                  <input type="text" value={expForm.position} onChange={(e) => setExpForm({ ...expForm, position: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                    <input type="text" value={expForm.startDate} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                    <input type="text" value={expForm.endDate} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías</label>
                  <input type="text" value={expForm.technologies.join(', ')} onChange={(e) => setExpForm({ ...expForm, technologies: e.target.value.split(',').map(t => t.trim()) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {uploading ? 'Guardando...' : (editingExp ? 'Actualizar' : 'Agregar')}
                  </button>
                  {editingExp && <button type="button" onClick={cancelEditExp} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancelar</button>}
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiencias Actuales</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{exp.position}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editExperience(exp)} className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                        <button onClick={() => exp.id && deleteExperience(exp.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
                      </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input type="text" value={caseForm.title} onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <input type="text" value={caseForm.client} onChange={(e) => setCaseForm({ ...caseForm, client: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industria</label>
                    <input type="text" value={caseForm.industry} onChange={(e) => setCaseForm({ ...caseForm, industry: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desafío</label>
                  <textarea value={caseForm.challenge} onChange={(e) => setCaseForm({ ...caseForm, challenge: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solución</label>
                  <textarea value={caseForm.solution} onChange={(e) => setCaseForm({ ...caseForm, solution: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resultados</label>
                  <textarea value={caseForm.results} onChange={(e) => setCaseForm({ ...caseForm, results: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tecnologías</label>
                    <input type="text" onChange={(e) => setCaseForm({ ...caseForm, technologies: e.target.value.split(',').map(t => t.trim()) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                    <input type="text" value={caseForm.duration} onChange={(e) => setCaseForm({ ...caseForm, duration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {uploading ? 'Guardando...' : (editingCase ? 'Actualizar' : 'Agregar')}
                  </button>
                  {editingCase && <button type="button" onClick={cancelEditCase} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancelar</button>}
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Casos de Estudio</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {caseStudies.map((caseStudy) => (
                  <div key={caseStudy.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{caseStudy.title}</h4>
                        <p className="text-sm text-blue-600">{caseStudy.client}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editCaseStudy(caseStudy)} className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                        <button onClick={() => caseStudy.id && deleteCaseStudy(caseStudy.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingBlog ? '✏️ Editar Artículo' : '✍️ Nuevo Artículo'}
              </h3>
              <form onSubmit={handleBlogSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extracto (Resumen corto)</label>
                  <textarea
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenido Completo del Artículo</label>
                  <div className="bg-white">
                    <ReactQuill
                      theme="snow"
                      value={blogForm.content || ''}
                      onChange={(val) => setBlogForm({ ...blogForm, content: val })}
                      modules={quillModules}
                      className="h-64 mb-12"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="text"
                      value={blogForm.date}
                      onChange={(e) => setBlogForm({ ...blogForm, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Enero 2025"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de lectura</label>
                    <input
                      type="text"
                      value={blogForm.readTime}
                      onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 5 min"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <input
                      type="text"
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Desarrollo Web"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={blogForm.status}
                      onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as 'published' | 'coming-soon' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="published">Publicado</option>
                      <option value="coming-soon">Próximamente</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de LinkedIn (Opcional)</label>
                  <input
                    type="url"
                    value={blogForm.linkedinUrl || ''}
                    onChange={(e) => setBlogForm({ ...blogForm, linkedinUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/pulse/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (Opcional)</label>
                  <input
                    type="url"
                    value={blogForm.imageUrl || ''}
                    onChange={(e) => setBlogForm({ ...blogForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Guardando...' : (editingBlog ? 'Actualizar' : 'Agregar')}
                  </button>
                  {editingBlog && (
                    <button
                      type="button"
                      onClick={cancelEditBlog}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Artículos</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {blogPosts.map((post) => (
                  <div key={post.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {post.status === 'published' ? 'Publicado' : 'Próximamente'}
                          </span>
                          <span className="text-xs text-gray-500">{post.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editBlog(post)} className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                        <button onClick={() => post.id && deleteBlog(post.id)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Generator Tab */}
        {activeTab === 'generator' && (
          <div className="max-w-4xl mx-auto">
            <ContentGenerator onSelectDraft={handleDraftSelection} />
          </div>
        )}

        {/* Bot Analytics Tab */}
        {activeTab === 'bot' && <BotAnalytics />}

        {/* Debug Tab */}
        {activeTab === 'debug' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🔍 Estado de la Base de Datos</h3>
                <button
                  onClick={fetchDebugData}
                  disabled={debugLoading}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50"
                >
                  {debugLoading ? 'Analizando...' : 'Analizar Datos'}
                </button>
              </div>

              {debugError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                  Error: {debugError}
                </div>
              )}

              {debugData && (
                <div className="space-y-6">
                  {Object.entries(debugData).map(([collectionName, items]: [string, any]) => (
                    <div key={collectionName} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b font-medium flex justify-between">
                        <span className="capitalize">{collectionName.replace('_', ' ')}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {items.length} items
                        </span>
                      </div>
                      <div className="p-4 max-h-60 overflow-y-auto bg-gray-50 font-mono text-xs">
                        <pre>{JSON.stringify(items, null, 2)}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}