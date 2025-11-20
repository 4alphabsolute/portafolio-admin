import { useState, useEffect } from 'react';
import { translateDynamicContent } from '../utils/dynamicTranslations';
import { getFirebaseData, initializeFirebaseData } from '../utils/fullFirebaseManager';

interface Experience {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

interface ExperienceSectionProps {
  t: any;
  language?: 'es' | 'en';
}

export default function ExperienceSection({ t, language = 'es' }: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        await initializeFirebaseData();
        const firebaseExp = await getFirebaseData('experiences') as Experience[];
        const processedExp = firebaseExp.map(exp =>
          translateDynamicContent(exp, language)
        );

        const sortedExp = processedExp.sort((a, b) => {
          const yearA = parseInt(a.startDate);
          const yearB = parseInt(b.startDate);
          return yearB - yearA;
        });

        setExperiences(sortedExp);
      } catch (error) {
        console.error('Error cargando experiencias:', error);
        setExperiences([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [language]);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t?.experience?.loading || 'Cargando experiencia...'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            💼 {t?.experience?.title || 'Experiencia Profesional'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t?.experience?.subtitle || 'Trayectoria profesional en análisis de datos y sector financiero'}
          </p>
        </div>

        {experiences.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{t?.experience?.noData || 'No hay experiencia disponible'}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {experiences.map((exp, index) => (
              <div key={exp.id || index} className="relative mb-12 last:mb-0">
                {/* Timeline line */}
                {index !== experiences.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-full bg-gray-200"></div>
                )}

                <div className="flex items-start space-x-6">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {experiences.length - index}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {exp.position}
                        </h3>
                        <p className="text-xl text-blue-600 font-semibold">
                          {exp.company}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                          {exp.startDate === exp.endDate ? exp.startDate : `${exp.startDate} - ${exp.endDate}`}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {exp.description}
                    </p>

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}