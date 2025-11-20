import { useState, useEffect } from 'react';
import { translateDynamicContent } from '../utils/dynamicTranslations';
import { getFirebaseData, initializeFirebaseData } from '../utils/fullFirebaseManager';

interface Certificate {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
  description?: string;
}

export default function CertificationsSection({ language = 'es' }: { language?: 'es' | 'en' }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        await initializeFirebaseData();
        const firebaseCerts = await getFirebaseData('certificates') as Certificate[];
        const translatedCerts = firebaseCerts.map(cert =>
          translateDynamicContent(cert, language)
        );
        setCertificates(translatedCerts);
      } catch (error) {
        console.error('Error cargando certificaciones:', error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [language]);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{language === 'en' ? 'Loading certifications...' : 'Cargando certificaciones...'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 {language === 'en' ? 'Academic Background & Certifications' : 'Formación Académica y Certificaciones'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {language === 'en' ? 'Solid training from Engineering to MBA, specialized in Business Intelligence and Big Data' : 'Formación sólida desde Ingeniería hasta MBA, especializado en Business Intelligence y Big Data'}
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{language === 'en' ? 'No certifications available' : 'No hay certificaciones disponibles'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((cert, index) => (
              <div key={cert.id || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${(cert.name || '').includes('MBA') ? 'bg-purple-100 text-purple-800' :
                      (cert.name || '').includes('Máster') ? 'bg-green-100 text-green-800' :
                        (cert.name || '').includes('Licenciatura') ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {(cert.name || '').includes('MBA') ? 'MBA' :
                        (cert.name || '').includes('Máster') ? 'Máster' :
                          (cert.name || '').includes('Licenciatura') ? 'Licenciatura' :
                            (cert.name || '').includes('Ingeniería') ? 'Ingeniería' : 'Certificación'}
                    </span>
                    <span className="text-sm text-gray-500">{cert.date}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {cert.name}
                  </h3>

                  <p className="text-blue-600 font-medium mb-3">
                    {cert.issuer}
                  </p>

                  {cert.description && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {cert.description}
                    </p>
                  )}



                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {language === 'en' ? 'View Certificate' : 'Ver certificado'}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              {language === 'en' ? 'Solid training from Engineering to MBA' : 'Formación sólida desde Ingeniería hasta MBA'}
            </h3>
            <p className="text-lg mb-6 opacity-90">
              {language === 'en' ? 'Combining technical engineering foundations, economic analysis and BI specialization to offer comprehensive solutions' : 'Combinando fundamentos técnicos de ingeniería, análisis económico y especialización en BI para ofrecer soluciones integrales'}
            </p>
            <a
              href="#contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              {language === 'en' ? "Let's talk about your project" : 'Conversemos sobre tu proyecto'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}