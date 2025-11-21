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

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
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
                    {(project.github || project.githubUrl) && (
                      <a
                        href={project.github || project.githubUrl}
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