import { useState } from 'react';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  linkedinUrl?: string;
  status: 'published' | 'coming-soon';
  image: string;
}

export default function BlogSection() {
  const blogPosts: BlogPost[] = [
    {
      title: "Cómo construí mi portafolio profesional con IA y React",
      excerpt: "El proceso completo de crear un portafolio interactivo con chatbot inteligente, generación dinámica de CVs y detección de usuarios. Desde la idea hasta el deploy en Firebase.",
      date: "Enero 2025",
      readTime: "8 min",
      category: "Desarrollo Web",
      status: "coming-soon",
      image: "🚀",
      linkedinUrl: "#" // Aquí irá tu post de LinkedIn
    },
    {
      title: "5 errores comunes en Power BI que cuestan dinero a las empresas",
      excerpt: "Basado en mi experiencia en Banesco, analizo los errores más frecuentes en implementaciones de BI y cómo evitarlos para maximizar el ROI.",
      date: "Próximamente",
      readTime: "6 min", 
      category: "Business Intelligence",
      status: "coming-soon",
      image: "📊"
    },
    {
      title: "Automatización de reportes actuariales con R: De 8 horas a 30 minutos",
      excerpt: "Caso práctico de cómo transformé el proceso de reportería en Banesco Seguros usando R, reduciendo tiempo operativo y mejorando precisión.",
      date: "Próximamente",
      readTime: "10 min",
      category: "Automatización",
      status: "coming-soon", 
      image: "⚡"
    },
    {
      title: "Del Excel al Dashboard Ejecutivo: Guía práctica para analistas",
      excerpt: "Metodología paso a paso para migrar de reportes manuales en Excel a dashboards interactivos que realmente impacten en la toma de decisiones.",
      date: "Próximamente",
      readTime: "7 min",
      category: "Data Analytics",
      status: "coming-soon",
      image: "📈"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Artículos y Casos de Estudio
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comparto mi experiencia práctica en análisis de datos, BI y automatización
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post, index) => (
            <article key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{post.image}</span>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    {post.status === 'coming-soon' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Próximamente
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <span>{post.date}</span>
                  <span>{post.readTime} lectura</span>
                </div>
                
                {post.status === 'published' && post.linkedinUrl ? (
                  <a 
                    href={post.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Leer en LinkedIn
                    <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                ) : (
                  <button 
                    disabled
                    className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                  >
                    En desarrollo
                    <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter/Follow CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Te interesa mi contenido técnico?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Sígueme en LinkedIn para recibir mis artículos sobre análisis de datos y BI
            </p>
            <a 
              href="https://linkedin.com/in/soyandresalmeida"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Seguir en LinkedIn
              <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}