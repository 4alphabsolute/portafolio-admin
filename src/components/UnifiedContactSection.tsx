import { useState, FormEvent, ChangeEvent } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import emailjs from 'emailjs-com';
import { useFirebaseErrorHandler } from '../utils/firebaseErrorHandler';
import { Mail, Phone, Linkedin, Instagram } from 'lucide-react';
import { translateDynamicContent } from '../utils/dynamicTranslations';

interface FormData {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
}

interface UnifiedContactProps {
  language: 'es' | 'en';
}

export default function UnifiedContactSection({ language = 'es' }: UnifiedContactProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', company: '', projectType: '', message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleError } = useFirebaseErrorHandler();

  // Traducciones dinámicas
  const t = {
    es: {
      title: '¿Necesitas transformar tus datos en decisiones estratégicas?',
      subtitle: 'Hablemos de tu proyecto',
      benefits: [
        { title: 'Dashboards que impactan', desc: 'Transformo datos dispersos en visualizaciones que facilitan decisiones ejecutivas' },
        { title: 'Automatización inteligente', desc: 'Reduzco procesos manuales de horas a minutos con R, Python y herramientas low-code' },
        { title: 'Soluciones a medida', desc: 'Desde análisis financiero hasta chatbots con IA, creo herramientas que resuelven problemas reales' }
      ],
      form: {
        name: 'Nombre *', email: 'Email *', company: 'Empresa', 
        projectType: 'Tipo de proyecto *', message: 'Cuéntame sobre tu proyecto *',
        submit: 'Enviar mensaje', success: '¡Mensaje enviado!', 
        successDesc: 'Te responderé en menos de 24 horas para discutir tu proyecto.',
        another: 'Enviar otro mensaje'
      },
      contact: { email: 'Correo', phone: 'Teléfono' },
      projects: [
        { value: 'dashboard-bi', label: 'Dashboard / Business Intelligence' },
        { value: 'automatizacion', label: 'Automatización de procesos' },
        { value: 'analisis-datos', label: 'Análisis de datos' },
        { value: 'chatbot-ia', label: 'Chatbot / IA' },
        { value: 'consultoria', label: 'Consultoría estratégica' },
        { value: 'otro', label: 'Otro' }
      ]
    },
    en: {
      title: 'Need to transform your data into strategic decisions?',
      subtitle: 'Let\'s talk about your project',
      benefits: [
        { title: 'Impactful dashboards', desc: 'I transform scattered data into visualizations that facilitate executive decisions' },
        { title: 'Smart automation', desc: 'I reduce manual processes from hours to minutes with R, Python and low-code tools' },
        { title: 'Custom solutions', desc: 'From financial analysis to AI chatbots, I create tools that solve real problems' }
      ],
      form: {
        name: 'Name *', email: 'Email *', company: 'Company', 
        projectType: 'Project type *', message: 'Tell me about your project *',
        submit: 'Send message', success: 'Message sent!', 
        successDesc: 'I\'ll respond within 24 hours to discuss your project.',
        another: 'Send another message'
      },
      contact: { email: 'Email', phone: 'Phone' },
      projects: [
        { value: 'dashboard-bi', label: 'Dashboard / Business Intelligence' },
        { value: 'automatizacion', label: 'Process automation' },
        { value: 'analisis-datos', label: 'Data analysis' },
        { value: 'chatbot-ia', label: 'Chatbot / AI' },
        { value: 'consultoria', label: 'Strategic consulting' },
        { value: 'otro', label: 'Other' }
      ]
    }
  };

  const content = t[language];

  const contactInfo = [
    {
      icon: <Mail size={20} />,
      label: content.contact.email,
      value: 'soyandresalmeida@gmail.com',
      link: 'mailto:soyandresalmeida@gmail.com',
    },
    {
      icon: <Phone size={20} />,
      label: content.contact.phone,
      value: '+34 633 084 828',
      link: 'tel:+34633084828',
    },
    {
      icon: <Linkedin size={20} />,
      label: 'LinkedIn',
      value: 'linkedin.com/in/soyandresalmeida',
      link: 'https://linkedin.com/in/soyandresalmeida',
    },
    {
      icon: <Instagram size={20} />,
      label: 'Instagram',
      value: '@soyandresalmeida',
      link: 'https://instagram.com/soyandresalmeida',
    },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Guardar en Firestore
      await addDoc(collection(db, 'mensajes'), {
        nombre: formData.name,
        email: formData.email,
        empresa: formData.company,
        tipoProyecto: formData.projectType,
        mensaje: formData.message,
        fecha: serverTimestamp(),
        idioma: language
      });

      // Enviar por EmailJS
      await emailjs.send(
        'service_kfsvijd',
        'template_sgwzlwr',
        {
          nombre: formData.name,
          email: formData.email,
          mensaje: `Empresa: ${formData.company}\nTipo: ${formData.projectType}\n\n${formData.message}`
        },
        '7v50Xny8AMXCIriqU'
      );

      setIsSubmitted(true);
      setFormData({ name: '', email: '', company: '', projectType: '', message: '' });
    } catch (error) {
      handleError(error);
      alert(language === 'en' ? 'Error sending message. Please try again.' : 'Error al enviar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 shadow-2xl">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.form.success}</h2>
            <p className="text-lg text-gray-600 mb-8">{content.form.successDesc}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://linkedin.com/in/soyandresalmeida"
                target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                LinkedIn
              </a>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {content.form.another}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Value Proposition */}
            <div className="text-white">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {content.title.split('decisiones estratégicas')[0]}
                <span className="text-yellow-400">decisiones estratégicas</span>
                {content.title.split('decisiones estratégicas')[1]}
              </h2>
              
              <div className="space-y-6 mb-8">
                {content.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="bg-yellow-400 rounded-full p-2 mt-1">
                      <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-blue-100">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-800/50 rounded-xl p-6 backdrop-blur-sm">
                <p className="text-lg font-medium mb-2">⚡ Respuesta rápida garantizada</p>
                <p className="text-blue-100">Te contacto en menos de 24 horas</p>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{content.subtitle}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{content.form.name}</label>
                    <input
                      type="text" name="name" required value={formData.name} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{content.form.email}</label>
                    <input
                      type="email" name="email" required value={formData.email} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@empresa.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{content.form.company}</label>
                  <input
                    type="text" name="company" value={formData.company} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{content.form.projectType}</label>
                  <select
                    name="projectType" required value={formData.projectType} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una opción</option>
                    {content.projects.map(project => (
                      <option key={project.value} value={project.value}>{project.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{content.form.message}</label>
                  <textarea
                    name="message" required rows={4} value={formData.message} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe tu desafío, objetivos y cómo puedo ayudarte..."
                  />
                </div>
                
                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : content.form.submit}
                </button>
              </form>
              
              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4 text-center">O contáctame directamente:</p>
                <div className="grid grid-cols-2 gap-4">
                  {contactInfo.map((item, i) => (
                    <a key={i} href={item.link} target={item.link.startsWith('http') ? '_blank' : undefined}
                       className="flex items-center text-gray-600 hover:text-blue-600 transition-colors text-sm">
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}