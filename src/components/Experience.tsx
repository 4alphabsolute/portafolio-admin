import { Briefcase, Calendar } from 'lucide-react';

interface ExperienceProps {
  t: any;
}

export default function Experience({ t }: ExperienceProps) {
  const experiences = [
    {
      ...t.experience.job1,
      color: 'border-l-blue-500'
    },
    {
      ...t.experience.job2,
      color: 'border-l-blue-600'
    }
  ];

  return (
    <section id="experience" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          {t.experience.title}
        </h2>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${exp.color} hover:shadow-lg transition`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase size={24} className="text-[#0A66C2]" />
                    {exp.title}
                  </h3>
                  <p className="text-lg text-[#0A66C2] font-semibold mt-1">
                    {exp.company}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mt-2 sm:mt-0">
                  <Calendar size={18} />
                  <span className="font-medium">{exp.period}</span>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
