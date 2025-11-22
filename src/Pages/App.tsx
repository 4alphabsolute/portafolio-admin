import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import CertificationsSection from '../components/CertificationsSection';
import ExperienceSection from '../components/ExperienceSection';
import ProjectsSection from '../components/ProjectsSection';
import BlogSection from '../components/BlogSection';
import UnifiedContactSection from '../components/UnifiedContactSection';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import AndyChat from '../components/AndyChat';
import DynamicNodesGrid from '../components/DynamicNodesGrid';
import FloatingParticles from '../components/FloatingParticles';
import SEO from '../components/SEO';
import { translations } from '../translations';

function App() {
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'es' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = translations[language];

  // Google Tag Manager Script (Mantenido del original)
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX', {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
    window.gtag = gtag;
  }, []);

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(180deg, #DBEAFE 0%, #E0F2FE 8%, #F0F9FF 16%, #F8FAFC 24%, #F1F5F9 32%, #F8FAFC 40%, #F1F5F9 48%, #EEF2FF 56%, #E0E7FF 64%, #DDD6FE 72%, #C4B5FD 80%, #A78BFA 88%, #7C3AED 96%, #6D28D9 100%)'
    }}>
      <SEO />

      {/* EL CANVAS GLOBAL QUE HACE LA MAGIA */}
      <DynamicNodesGrid />
      <FloatingParticles />

      <div className="relative z-20">
        <Navbar t={t} language={language} toggleLanguage={toggleLanguage} />

        {/* SECCIONES CON IDs PARA EL SCROLLYTELLING */}
        <div id="hero">
          <Hero t={t} language={language} />
        </div>

        <section id="about">
          <About t={t} />
        </section>

        <section id="certifications">
          <CertificationsSection language={language} />
        </section>

        <section id="experience">
          <ExperienceSection t={t} language={language} />
        </section>

        <section id="projects">
          <ProjectsSection t={t} language={language} />
        </section>

        <section id="blog">
          <BlogSection t={t} language={language} />
        </section>

        <section id="contact">
          <UnifiedContactSection language={language} />
        </section>

        <Footer t={t} />
      </div>

      <AndyChat />
      <CookieBanner t={t} />
    </div>
  );
}

export default App;