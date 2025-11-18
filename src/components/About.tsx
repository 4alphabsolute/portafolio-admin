import { BarChart3, Database, TrendingUp, Code } from 'lucide-react';

interface AboutProps {
  t: any;
}

export default function About({ t }: AboutProps) {
  const skills = [
    { icon: <BarChart3 size={32} />, name: 'Power BI' },
    { icon: <Database size={32} />, name: 'SQL' },
    { icon: <TrendingUp size={32} />, name: 'Tableau' },
    { icon: <Code size={32} />, name: 'Python & R' }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          {t.about.title}
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.about.description}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.about.education}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition transform hover:scale-105"
              >
                <div className="text-[#0A66C2] mb-3">
                  {skill.icon}
                </div>
                <span className="text-gray-900 font-semibold text-center">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
