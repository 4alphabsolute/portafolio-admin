import { useState, useEffect } from 'react';
import { translateDynamicContent } from '../utils/dynamicTranslations';
import { getFirebaseData, initializeFirebaseData } from '../utils/fullFirebaseManager';

interface Project {
  id?: string;
  name?: string;
  title?: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  liveUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  images?: string[];
  visibility?: 'public' | 'draft';
  status?: 'completed' | 'in-progress' | 'planned';
}

interface ProjectsSectionProps {
  t: any;
  language?: 'es' | 'en';
}

export default function ProjectsSection({ t, language = 'es' }: ProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await initializeFirebaseData();
        const firebaseProjects = await getFirebaseData('projects') as Project[];
        const translatedProjects = firebaseProjects.map(project =>
          translateDynamicContent(project, language)
        ).filter(project => project.visibility !== 'draft');
        setProjects(translatedProjects);
      } catch (error) {
        console.error('Error cargando proyectos:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [language]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t?.projects?.completed || 'Completado';
      case 'in-progress': return t?.projects?.inProgress || 'En Progreso';
      case 'planned': return t?.projects?.planned || 'Planeado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t?.projects?.loading || 'Cargando proyectos...'}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 {t?.projects?.title || 'Proyectos'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t?.projects?.subtitle || 'Proyectos desarrollados y en curso'}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{t?.projects?.noData || 'No hay proyectos disponibles'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div key={project.id || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {project.imageUrl && (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.title || project.name || 'Proyecto sin título'}
                    </h3>
                    {project.status && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    )}
                  </div>

                  <div
                    className="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: project.description }}
                  />

                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors mb-4 flex items-center gap-1"
                  >
                    Ver Detalles
                    <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.slice(0, 4).map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm whitespace-nowrap"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-500 rounded text-sm font-medium">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 mt-auto">
                    {(project.url || project.liveUrl) && (
                      <a
                        href={project.url || project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${(project.github || project.githubUrl) ? 'flex-1' : 'w-full'} bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium`}
                      >
                        {t?.projects?.viewLive || 'Ver Proyecto'}
                      </a>
                    )}
                    {(project.githubUrl || project.github) && (
                      <a
                        href={project.githubUrl || project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${(project.url || project.liveUrl) ? 'flex-1' : 'w-full'} bg-gray-800 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium`}
                      >
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Detalles del Proyecto */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideIn relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {selectedProject.imageUrl && (
                <div className="w-full h-64 bg-slate-100">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title || selectedProject.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {selectedProject.title || selectedProject.name || 'Proyecto'}
                  </h3>
                  {selectedProject.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedProject.status)}`}>
                      {getStatusLabel(selectedProject.status)}
                    </span>
                  )}
                </div>

                <div
                  className="my-6 prose prose-blue max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                />

                <h4 className="font-semibold text-gray-900 mb-3 text-lg">Tecnologías Utilizadas</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedProject.technologies?.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {selectedProject.images && selectedProject.images.length > 0 && (
                  <div className="mb-8 border-t border-gray-100 pt-8">
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">Galería del Proyecto</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProject.images.map((img: string, idx: number) => (
                        <div key={idx} className="rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 aspect-video group">
                          <img
                            src={img}
                            alt={`Captura ${idx + 1} de ${selectedProject.title || 'Proyecto'}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                            onClick={() => window.open(img, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  {(selectedProject.url || selectedProject.liveUrl) && (
                    <a
                      href={selectedProject.url || selectedProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                    >
                      {t?.projects?.viewLive || 'Ver Proyecto en Vivo'}
                    </a>
                  )}
                  {(selectedProject.githubUrl || selectedProject.github) && (
                    <a
                      href={selectedProject.githubUrl || selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-900 text-white text-center py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                      Ver Repositorio
                    </a>
                  )}
                </div>
              </div>
            </div>
            {/* Overlay click para cerrar */}
            <div className="absolute inset-0 -z-10" onClick={() => setSelectedProject(null)}></div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              {t?.projects?.cta?.title || '¿Tienes un proyecto en mente?'}
            </h3>
            <p className="text-lg mb-6 opacity-90">
              {t?.projects?.cta?.subtitle || 'Conversemos sobre cómo puedo ayudarte a llevarlo a cabo'}
            </p>
            <a
              href="#contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              {t?.projects?.cta?.button || 'Contactar'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}