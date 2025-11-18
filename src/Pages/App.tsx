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
    <div className="min-h-screen">
      <Navbar t={t} language={language} toggleLanguage={toggleLanguage} />
      <Hero t={t} language={language} />
      <About t={t} />
      <CertificationsSection language={language} />
      <ExperienceSection t={t} language={language} />
      <ProjectsSection t={t} language={language} />
      <BlogSection />
      <UnifiedContactSection language={language} />
      <Footer t={t} />
      <AndyChat />
      <CookieBanner t={t} />
    </div>
  );
}

export default App;
