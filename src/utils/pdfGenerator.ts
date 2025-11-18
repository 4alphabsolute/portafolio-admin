import jsPDF from 'jspdf';
import cvProfiles from '../data/cv-profiles.json';

export const generateDynamicCV = (profileType: keyof typeof cvProfiles.profiles, language: 'es' | 'en' = 'es'): void => {
  const profile = cvProfiles.profiles[profileType];
  if (!profile) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = 30;

  // Función para agregar línea separadora
  const addSeparatorLine = () => {
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  };

  // Función para verificar espacio y agregar página
  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 30;
    }
  };

  // ENCABEZADO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ANDRÉS ALMEIDA', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const locationText = language === 'en' ? 'Madrid, Spain' : 'Madrid, España';
  doc.text(`(+34) 633-084828 • ${locationText} • soyandresalmeida@gmail.com`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('LinkedIn: linkedin.com/in/soyandresalmeida • Web: andresalmeida-portafolio.web.app', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  addSeparatorLine();

  // PERFIL PROFESIONAL
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const profileTitle = language === 'en' ? 'PROFESSIONAL PROFILE' : 'PERFIL PROFESIONAL';
  doc.text(profileTitle, margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Descripción en inglés si es necesario
  let profileDescription = profile.description;
  if (language === 'en') {
    const englishDescriptions: Record<string, string> = {
      'MASTER': 'Hybrid Data and Business Analyst with financial background and experience in banking and insurance. I transform fragmented data into reliable information for executive committees through BI, financial analysis and automation. Proficient in Power BI, SQL, R and low-code tools for reporting, data validation and analytical prototyping.',
      'BI': 'Business Intelligence Analyst with experience in data modeling, executive reporting, strategic dashboards and KPI definition. Ability to structure scattered information, improve data quality and automate processes with SQL, R and Power BI.',
      'DATA': 'Data Analyst focused on cleaning, validation, transformation, integration and analysis of complex datasets. Proficient in SQL, R (tidyverse), low-code automation and applied AI to convert raw data into clear insights.',
      'FINANZAS': 'Financial Analyst specialized in credit risk, financial statement analysis, cash flows and corporate KPIs. BI integration (Power BI, SQL, R) to prepare strategic reports and technical analysis for executive committees.',
      'CONSULTOR': 'Results-oriented digital solutions consultant. I help professionals, entrepreneurs and small businesses transform ideas into real tools through generative AI, low-code automation and data analysis. I develop conversational assistants, executive dashboards, automated workflows and functional websites without complex infrastructure needs.\n\nCombined experience in economics, BI and trading (crypto assets, futures, technical indicators and Wyckoff methodologies). Ability to interpret data from a strategic perspective and convert it into actionable decisions. If you need clarity, automation or a quick and functional solution, I build it for you.'
    };
    profileDescription = englishDescriptions[profileType] || profile.description;
  }
  
  const profileText = doc.splitTextToSize(profileDescription, pageWidth - 2 * margin);
  doc.text(profileText, margin, yPosition);
  yPosition += profileText.length * 4 + 10;

  addSeparatorLine();

  // EXPERIENCIA PROFESIONAL
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const experienceTitle = language === 'en' ? 'PROFESSIONAL EXPERIENCE' : 'EXPERIENCIA PROFESIONAL';
  doc.text(experienceTitle, margin, yPosition);
  yPosition += 10;

  // Banesco Seguros
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Especialista de Control y Gestión del Dato', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('Mar 2025 – Jun 2025', pageWidth - margin - 40, yPosition);
  yPosition += 5;
  
  doc.setFont('helvetica', 'italic');
  doc.text('Banesco Seguros', margin, yPosition);
  yPosition += 6;

  const segurosItems = [
    '• Automatización de reportes actuariales y financieros con R e IA',
    '• Desarrollo de dashboards estratégicos en Power BI (costos, ventas, cobranzas)',
    '• Identificación de fallas estructurales en arquitectura de datos',
    '• Integración con áreas actuariales para estandarizar criterios'
  ];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  segurosItems.forEach(item => {
    checkPageBreak(8);
    doc.text(item, margin + 5, yPosition);
    yPosition += 4;
  });
  yPosition += 5;

  // Banesco Banco
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Analista de Crédito', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('Feb 2024 – Feb 2025', pageWidth - margin - 40, yPosition);
  yPosition += 5;
  
  doc.setFont('helvetica', 'italic');
  doc.text('Banesco Banco Universal', margin, yPosition);
  yPosition += 6;

  const bancoItems = [
    '• Análisis de riesgo financiero mediante flujos de caja y KPIs financieros',
    '• Preparación y defensa técnica ante Comité Ejecutivo de Crédito',
    '• Evaluación de clientes corporativos (liquidez, rentabilidad, flujo efectivo)',
    '• Apoyo comercial equilibrando análisis técnico y contexto macroeconómico'
  ];
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  bancoItems.forEach(item => {
    checkPageBreak(8);
    doc.text(item, margin + 5, yPosition);
    yPosition += 4;
  });
  yPosition += 10;

  addSeparatorLine();

  // EDUCACIÓN
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const educationTitle = language === 'en' ? 'EDUCATION' : 'EDUCACIÓN';
  doc.text(educationTitle, margin, yPosition);
  yPosition += 8;

  // MBA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('MBA', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('2025 – En curso', pageWidth - margin - 30, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('EUDE Business School', margin, yPosition);
  yPosition += 8;

  // Máster BI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Máster en Business Intelligence y Big Data Analytics', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('2024 – 2025', pageWidth - margin - 30, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('EUDE Business School', margin, yPosition);
  yPosition += 8;

  // Economía
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Economía', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('2018 – 2024', pageWidth - margin - 30, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Universidad Católica Andrés Bello', margin, yPosition);
  yPosition += 8;

  // Ingeniería (solo si hay espacio)
  if (yPosition < pageHeight - 60) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Ingeniería Informática (5 semestres)', margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('2015 – 2018', pageWidth - margin - 30, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Universidad Católica Andrés Bello', margin, yPosition);
    yPosition += 10;
  }

  addSeparatorLine();

  // COMPETENCIAS TÉCNICAS (Personalizadas por perfil)
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const skillsTitle = language === 'en' ? 'TECHNICAL SKILLS' : 'COMPETENCIAS TÉCNICAS';
  doc.text(skillsTitle, margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const skillsText = [
    `Business Intelligence: ${profile.skills_focus.includes('Power BI') ? 'Power BI (Avanzado), DAX, Power Query, dashboards ejecutivos' : 'Power BI, DAX, Power Query'}`,
    `Datos: ${profile.skills_focus.includes('SQL') ? 'SQL (TOAD for Oracle - Avanzado), R (tidyverse, automatización), Excel avanzado' : 'SQL, R, Excel avanzado'}`,
    `AI & Automation: ${profile.skills_focus.includes('IA Generativa') ? 'Generative AI (Avanzado), Flowise, conversational agents, Firebase' : 'Generative AI, automatización low-code'}`,
    `Finanzas: ${profile.skills_focus.includes('Análisis Financiero') ? 'Riesgo crediticio (Avanzado), análisis financiero, flujos de caja, KPIs' : 'Análisis financiero, KPIs'}`,
    'Programación: Fundamentos de Python, macros, prototipado asistido por IA'
  ];

  if (profileType === 'CONSULTOR') {
    skillsText.push('Trading: Criptoactivos, futuros, análisis técnico, metodología Wyckoff');
  }

  skillsText.forEach(skill => {
    checkPageBreak(8);
    doc.text(skill, margin, yPosition);
    yPosition += 5;
  });

  // Soft Skills e Idiomas (si hay espacio)
  if (yPosition < pageHeight - 50) {
    yPosition += 5;
    addSeparatorLine();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const softSkillsTitle = language === 'en' ? 'SOFT SKILLS & LANGUAGES' : 'SOFT SKILLS E IDIOMAS';
    doc.text(softSkillsTitle, margin, yPosition);
    yPosition += 8;

    // Dos columnas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const softSkillsLabel = language === 'en' ? 'Soft Skills:' : 'Soft Skills:';
    const languagesLabel = language === 'en' ? 'Languages:' : 'Idiomas:';
    doc.text(softSkillsLabel, margin, yPosition);
    doc.text(languagesLabel, pageWidth / 2 + 10, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const softSkills = language === 'en' ? 
      ['Critical thinking', 'Clear communication', 'Adaptability', 'Fast learning', 'Collaborative work'] :
      ['Pensamiento crítico', 'Comunicación clara', 'Adaptabilidad', 'Aprendizaje rápido', 'Trabajo colaborativo'];
    const idiomas = language === 'en' ? 
      ['Spanish (Native)', 'English (B2)'] :
      ['Español (Nativo)', 'Inglés (B2)'];

    softSkills.forEach((skill, index) => {
      doc.text(`• ${skill}`, margin, yPosition + (index * 4));
    });

    idiomas.forEach((idioma, index) => {
      doc.text(`• ${idioma}`, pageWidth / 2 + 10, yPosition + (index * 4));
    });
  }

  const filename = `CV_AndresAlmeida_${profileType}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};