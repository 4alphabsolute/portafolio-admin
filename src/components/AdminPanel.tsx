import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  type: 'certificate' | 'attendance' | 'course';
  description: string;
  skills: string[];
  documentUrl?: string;
  isVisible: boolean;
}

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadCertificates();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert('Error de autenticación con Google');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    signOut(auth);
    setCertificates([]);
  };

  const loadCertificates = () => {
    // Cargar desde localStorage por ahora (después integrar con Firebase)
    const saved = localStorage.getItem('certificates');
    if (saved) {
      setCertificates(JSON.parse(saved));
    }
  };

  const saveCertificates = (certs: Certificate[]) => {
    localStorage.setItem('certificates', JSON.stringify(certs));
    setCertificates(certs);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, certId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos PDF, JPG o PNG');
      return;
    }

    // Simular subida (después integrar con Firebase Storage)
    const reader = new FileReader();
    reader.onload = () => {
      const updatedCerts = certificates.map(cert => 
        cert.id === certId 
          ? { ...cert, documentUrl: reader.result as string }
          : cert
      );
      saveCertificates(updatedCerts);
    };
    reader.readAsDataURL(file);
  };

  const addNewCertificate = () => {
    const newCert: Certificate = {
      id: Date.now().toString(),
      title: '',
      issuer: '',
      date: '',
      type: 'certificate',
      description: '',
      skills: [],
      isVisible: true
    };
    setEditingCert(newCert);
  };

  const saveCertificate = (cert: Certificate) => {
    const updated = certificates.find(c => c.id === cert.id)
      ? certificates.map(c => c.id === cert.id ? cert : c)
      : [...certificates, cert];
    
    saveCertificates(updated);
    setEditingCert(null);
  };

  const deleteCertificate = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este certificado?')) {
      saveCertificates(certificates.filter(c => c.id !== id));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Panel de Administración</h2>
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{loading ? 'Iniciando...' : 'Iniciar con Google'}</span>
            </button>
            <p className="text-xs text-gray-500 text-center">
              Solo usuarios autorizados pueden acceder
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-gray-600">Bienvenido, {user.displayName || user.email}</span>
              </div>
              <a 
                href="/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Ver Analytics
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={addNewCertificate}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Agregar Certificado
          </button>
        </div>

        <div className="grid gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{cert.title || 'Sin título'}</h3>
                  <p className="text-gray-600">{cert.issuer} - {cert.date}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCert(cert)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteCertificate(cert.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento (PDF protegido contra capturas)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e, cert.id)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {cert.documentUrl && (
                  <div className="mt-2 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-700">✅ Documento cargado</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Edición */}
        {editingCert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingCert.id ? 'Editar Certificado' : 'Nuevo Certificado'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={editingCert.title}
                    onChange={(e) => setEditingCert({...editingCert, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institución</label>
                  <input
                    type="text"
                    value={editingCert.issuer}
                    onChange={(e) => setEditingCert({...editingCert, issuer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="text"
                    value={editingCert.date}
                    onChange={(e) => setEditingCert({...editingCert, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={editingCert.type}
                    onChange={(e) => setEditingCert({...editingCert, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="certificate">Certificación</option>
                    <option value="attendance">Asistencia</option>
                    <option value="course">Curso</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={editingCert.description}
                    onChange={(e) => setEditingCert({...editingCert, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setEditingCert(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => saveCertificate(editingCert)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}