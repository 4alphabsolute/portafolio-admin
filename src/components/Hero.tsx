import { Download, ChevronDown } from 'lucide-react';

interface HeroProps {
  t: any;
  language: 'es' | 'en';
}

export default function Hero({ t, language }: HeroProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cvLinks = {
    es: "https://drive.google.com/uc?export=download&id=1mDiLw1H1DX0xEjdpSxjYKEHXm1uELkXb",
    en: "https://drive.google.com/uc?export=download&id=1wZ_gwFfx4Vntke-aLZOxLllQL0k6C7HX",
  };

  return (
    <section
      id="home"
      className="min-h-screen flex flex-col justify-center items-center pt-20 px-6 text-center"
      style={{
        backgroundImage: "url('images/HeroBar.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Contenido principal */}
      <div className="animate-fade-in flex flex-col items-center space-y-6 max-w-3xl">

        {/* Imagen */}
        <img
          src="/images/perfil.png"
          alt="Andrés Almeida"
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-[#0A66C2] shadow-lg object-cover"
        />

        {/* Nombre */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Andrés Almeida
        </h1>

        {/* Subtítulo */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl text-[#0A66C2] font-semibold leading-snug px-4">
          {t.hero.title}
        </h2>

        {/* Descripción */}
        <p className="text-lg sm:text-xl text-gray-700 max-w-lg px-4 leading-relaxed">
          {t.hero.tagline}
        </p>

        {/* Botón */}
        <a
          href={cvLinks[language]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-7 py-3 rounded-lg text-lg font-semibold hover:bg-[#094a8f] transition transform hover:scale-105"
        >
          <Download size={20} />
          {t.hero.downloadCV}
        </a>
      </div>

      {/* Flecha — SIEMPRE centrada */}
      <div className="w-full flex justify-center mt-10">
        <button
          onClick={() => scrollToSection("about")}
          className="animate-bounce cursor-pointer"
        >
          <ChevronDown size={38} className="text-[#0A66C2]" />
        </button>
      </div>
    </section>
  );
}

