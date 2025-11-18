import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  t: any;
  language: 'es' | 'en';
  toggleLanguage: () => void;
}

export default function Navbar({ t, language, toggleLanguage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-[#0A66C2]">AA</h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-[#0A66C2] transition">
              {t.nav.home}
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-[#0A66C2] transition">
              {t.nav.about}
            </button>
            <button onClick={() => scrollToSection('experience')} className="text-gray-700 hover:text-[#0A66C2] transition">
              {t.nav.experience}
            </button>
            <button onClick={() => scrollToSection('projects')} className="text-gray-700 hover:text-[#0A66C2] transition">
              {t.nav.projects}
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-[#0A66C2] transition">
              {t.nav.contact}
            </button>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#094a8f] transition"
            >
              <Globe size={18} />
              <span className="font-semibold">{language.toUpperCase()}</span>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 bg-[#0A66C2] text-white rounded-lg"
            >
              <Globe size={16} />
              <span className="text-sm font-semibold">{language.toUpperCase()}</span>
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              {t.nav.home}
            </button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              {t.nav.about}
            </button>
            <button onClick={() => scrollToSection('experience')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              {t.nav.experience}
            </button>
            <button onClick={() => scrollToSection('projects')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              {t.nav.projects}
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              {t.nav.contact}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
