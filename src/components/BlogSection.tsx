import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import TradingViewWidget from './TradingViewWidget';

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
  image: string;
  imageUrl?: string; // For backward compatibility
}

interface BlogSectionProps {
  t: any;
  language?: 'es' | 'en';
}

export default function BlogSection({ t, language = 'es' }: BlogSectionProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'analysis'>('articles');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'blog_posts'));
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as BlogPost));
        setBlogPosts(posts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t?.blog?.title || 'Artículos y Casos de Estudio'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t?.blog?.subtitle || 'Comparto mi experiencia práctica en análisis de datos, BI y automatización'}
          </p>
        </div>

        {/* Tabs de Navegación */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'articles'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
            >
              {t?.blog?.tabs?.articles || 'Artículos'}
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'analysis'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
            >
              {t?.blog?.tabs?.analysis || 'Análisis de Mercado'}
            </button>
          </div>
        </div>

        {activeTab === 'analysis' ? (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t?.blog?.analysis?.title || 'Visión de Mercado'}
                </h3>
                <p className="text-gray-600">
                  {t?.blog?.analysis?.subtitle || 'Seguimiento en tiempo real de los principales índices y activos financieros.'}
                </p>
              </div>
              <TradingViewWidget
                language={language}
                title={t?.blog?.analysis?.title}
                subtitle={t?.blog?.analysis?.subtitle}
              />
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fade-in">
            {blogPosts.map((post, index) => (
              <article key={post.id || index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{post.image || post.imageUrl}</span>
                    <div className="flex items-center space-x-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                      {post.status === 'coming-soon' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          {t?.blog?.comingSoon || 'Próximamente'}
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
                    <span>{post.readTime} {t?.blog?.readTime || 'lectura'}</span>
                  </div>

                  {post.content && post.content.trim().length > 0 ? (
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {t?.blog?.readArticle || 'Leer Artículo'}
                      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  ) : post.status === 'published' && post.linkedinUrl ? (
                    <a
                      href={post.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                    >
                      {t?.blog?.readOnLinkedin || 'Leer en LinkedIn'}
                      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                    >
                      {t?.blog?.inDevelopment || 'En desarrollo'}
                      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </article>
            ))}
            {blogPosts.length === 0 && !loading && (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-500 text-lg">{t?.blog?.noPosts || 'No hay artículos publicados aún.'}</p>
              </div>
            )}
          </div>
        )}

        {/* Modal de Artículo de Blog */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideIn relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8 md:p-12">
                <div className="flex items-center space-x-4 mb-6">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedPost.category}
                  </span>
                  <span className="text-gray-500 text-sm">{selectedPost.date}</span>
                  <span className="text-gray-500 text-sm">• {selectedPost.readTime} lect.</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                  {selectedPost.title}
                </h3>

                <div
                  className="prose prose-blue prose-lg max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content || '' }}
                />

                {selectedPost.linkedinUrl && (
                  <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                    <a
                      href={selectedPost.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium border border-blue-200"
                    >
                      Ver post original en LinkedIn
                      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Newsletter/Follow CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t?.blog?.cta?.title || '¿Te interesa mi contenido técnico?'}
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              {t?.blog?.cta?.subtitle || 'Sígueme en LinkedIn para recibir mis artículos sobre análisis de datos y BI'}
            </p>
            <a
              href="https://linkedin.com/in/soyandresalmeida"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {t?.blog?.cta?.button || 'Seguir en LinkedIn'}
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