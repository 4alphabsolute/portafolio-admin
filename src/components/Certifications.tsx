import { useState } from 'react';

interface Certification {
  title: string;
  issuer: string;
  date: string;
  type: 'certificate' | 'attendance' | 'course';
  description: string;
  skills: string[];
}

export default function Certifications() {
  const [selectedType, setSelectedType] = useState<string>('all');

  const certifications: Certification[] = [
    {
      title: "MBA",
      issuer: "EUDE Business School", 
      date: "2025 - En curso",
      type: "certificate",
      description: "Programa de Maestría en Administración de Empresas con enfoque en gestión estratégica",
      skills: ["Strategic Management", "Business Analysis", "Leadership", "Finance"]
    },
    {
      title: "Máster en Business Intelligence y Big Data Analytics",
      issuer: "EUDE Business School",
      date: "2024-2025",
      type: "certificate",
      description: "Programa completo en BI, análisis de datos, Power BI, SQL y herramientas de Big Data",
      skills: ["Power BI", "SQL", "Big Data", "Analytics", "Data Modeling"]
    },
    {
      title: "Economía",
      issuer: "Universidad Católica Andrés Bello (UCAB)",
      date: "2018-2024",
      type: "certificate",
      description: "Licenciatura en Economía con enfoque en análisis financiero y econometría",
      skills: ["Análisis Económico", "Econometría", "Finanzas", "Estadística", "Modelado Financiero"]
    },
    {
      title: "Ingeniería Informática (5 semestres)",
      issuer: "Universidad Católica Andrés Bello (UCAB)",
      date: "2015-2018",
      type: "course",
      description: "Formación en programación, algoritmos y fundamentos de sistemas informáticos",
      skills: ["Programación", "Algoritmos", "Bases de Datos", "Sistemas", "Lógica Computacional"]
    },
    {
      title: "Próximamente - Certificados de Asistencia",
      issuer: "Próximamente",
      date: "Próximamente",
      type: "attendance",
      description: "Certificados de asistencia a eventos y cursos especializados serán agregados próximamente",
      skills: ["En actualización"]
    }
  ];

  const filteredCerts = selectedType === 'all' 
    ? certifications 
    : certifications.filter(cert => cert.type === selectedType);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'certificate': return 'bg-green-100 text-green-800';
      case 'attendance': return 'bg-blue-100 text-blue-800';
      case 'course': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'certificate': return 'Certificación';
      case 'attendance': return 'Asistencia';
      case 'course': return 'Curso';
      default: return type;
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Certificaciones y Formación
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Formación continua en tecnologías de análisis de datos y gestión empresarial
          </p>
        </div>

        {/* Filtros */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4 bg-white rounded-lg p-2 shadow-md">
            {['all', 'certificate', 'attendance', 'course'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-6 py-2 rounded-md transition-all duration-300 ${
                  selectedType === type
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {type === 'all' ? 'Todas' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Certificaciones */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCerts.map((cert, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(cert.type)}`}>
                    {getTypeLabel(cert.type)}
                  </span>
                  <span className="text-sm text-gray-500">{cert.date}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {cert.title}
                </h3>
                
                <p className="text-blue-600 font-medium mb-3">
                  {cert.issuer}
                </p>
                
                <p className="text-gray-600 mb-4">
                  {cert.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {cert.skills.map((skill, skillIndex) => (
                    <span 
                      key={skillIndex}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Formación sólida desde Ingeniería hasta MBA
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Combinando fundamentos técnicos de ingeniería, análisis económico y especialización en BI para ofrecer soluciones integrales
            </p>
            <a 
              href="#contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Conversemos sobre tu proyecto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}