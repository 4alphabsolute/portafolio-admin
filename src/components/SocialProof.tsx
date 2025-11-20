export default function SocialProof() {
  const companies = [
    { name: 'Banesco', logo: '🏦', color: '#0A66C2' },
    { name: 'EUDE', logo: '🎓', color: '#059669' },
    { name: 'UCAB', logo: '🏛️', color: '#6366F1' }
  ];

  const stats = [
    { number: '2+', label: 'Años experiencia', icon: '📈' },
    { number: '50+', label: 'Reportes automatizados', icon: '🤖' },
    { number: '100%', label: 'Proyectos completados', icon: '✅' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
      {/* Empresas */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600 mb-3">Experiencia con empresas líderes</p>
        <div className="flex justify-center items-center gap-6">
          {companies.map((company, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{company.logo}</span>
              <span className="font-medium" style={{ color: company.color }}>
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900">{stat.number}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Testimonial hint */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
        <p className="text-xs text-blue-700">
          💬 "Automatizó nuestros reportes actuariales, ahorrando 15 horas semanales"
        </p>
        <p className="text-xs text-blue-600 mt-1">- Equipo Banesco Seguros</p>
      </div>
    </div>
  );
}