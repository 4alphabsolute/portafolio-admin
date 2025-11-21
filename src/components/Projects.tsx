import { BarChart2, PieChart, LineChart } from 'lucide-react';

interface ProjectsProps {
  t: any;
}

export default function Projects({ t }: ProjectsProps) {
  const projects = [
    {
      icon: <BarChart2 size={48} />,
      title: 'Power BI Dashboard',
      type: 'Business Intelligence'
    },
    {
      icon: <PieChart size={48} />,
      title: 'Tableau Analytics',
      type: 'Data Visualization'
    },
    {
      icon: <LineChart size={48} />,
      title: 'Python Analysis',
      type: 'Predictive Models'
    }
  ];

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          {t.projects.title}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-2 border border-blue-100"
            >
              <div className="text-[#0A66C2] mb-4">
                {project.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {project.type}
              </p>
              <div className="inline-block bg-blue-100 text-[#0A66C2] px-4 py-2 rounded-full text-sm font-semibold">
                {t.projects.comingSoon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
