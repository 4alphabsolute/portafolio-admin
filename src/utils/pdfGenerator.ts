import { jsPDF } from 'jspdf';
import cvProfiles from '../data/cv-profiles.json';

type ProfileKey = keyof typeof cvProfiles.profiles;

export const generateDynamicCV = (profileType: ProfileKey, language: 'es' | 'en' = 'es'): void => {
  const profile = cvProfiles.profiles[profileType] as any;
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
  doc.setFont('helvetica', 'bold');
  const displayTitle = language === 'en' ? profile.title : profile.title_es || profile.title;
  doc.text(displayTitle.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const locationText = language === 'en' ? 'Madrid, Spain' : 'Madrid, España';
  doc.text(`(+34) 633-084828 • ${locationText} • soyandresalmeida@gmail.com`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.text('LinkedIn: linkedin.com/in/soyandresalmeida • Web: soyandresalmeida.com', pageWidth / 2, yPosition, { align: 'center' });
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

  const description = language === 'en' ? (profile.description_en || profile.description) : profile.description;
  const profileText = doc.splitTextToSize(description, pageWidth - 2 * margin);
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

  const variantKey = profile.special_experience || 'default';
  const variant = (cvProfiles.experience_variants as any)[variantKey];

  // Banesco Seguros
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const positionSeguros = language === 'en' ? 'Control and Management Specialist' : 'Especialista de Control y Gestión';
  doc.text(positionSeguros, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('Jun 2025', pageWidth - margin - 30, yPosition);
  yPosition += 5;

  doc.setFont('helvetica', 'italic');
  doc.text('Banesco Seguros', margin, yPosition);
  yPosition += 6;

  const segurosItems = language === 'en' ? variant.seguros_en : variant.seguros;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  segurosItems.forEach((item: string) => {
    checkPageBreak(8);
    doc.text(`• ${item}`, margin + 5, yPosition);
    yPosition += 4;
  });
  yPosition += 5;

  // Banesco Banco
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const positionBanco = language === 'en' ? 'Credit Risk Analyst (B2B & B2C)' : 'Analista de Riesgo de Crédito (B2B & B2C)';
  doc.text(positionBanco, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('2024 – 2025', pageWidth - margin - 30, yPosition);
  yPosition += 5;

  doc.setFont('helvetica', 'italic');
  doc.text('Banesco Banco Universal', margin, yPosition);
  yPosition += 6;

  const bancoItems = language === 'en' ? variant.banco_en : variant.banco;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  bancoItems.forEach((item: string) => {
    checkPageBreak(8);
    doc.text(`• ${item}`, margin + 5, yPosition);
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
  doc.text('MBA - Strategic Direction', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  const mbaDate = language === 'en' ? 'Ongoing' : 'En curso';
  doc.text(mbaDate, pageWidth - margin - 30, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('EUDE Business School, Madrid', margin, yPosition);
  yPosition += 8;

  // Máster BI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Master in Big Data & Business Intelligence', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('2025', pageWidth - margin - 30, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('EUDE Business School, Madrid', margin, yPosition);
  yPosition += 8;

  // Economía
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const ecoTitle = language === 'en' ? 'Bachelor in Economics' : 'Licenciatura en Economía';
  doc.text(ecoTitle, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text('2024', pageWidth - margin - 30, yPosition);
  yPosition += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text('Universidad Católica Andrés Bello (UCAB)', margin, yPosition);
  yPosition += 8;

  // Ingeniería (solo para BUILDER)
  if (profile.show_engineering) {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const engTitle = language === 'en' ? 'Computer Engineering (5 Semesters)' : 'Ingeniería Informática (5 Semestres)';
    doc.text(engTitle, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('2018', pageWidth - margin - 30, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    const engInst = language === 'en' ? 'UCAB - Fundamentals of Logic and Algorithms' : 'UCAB - Fundamentos de Lógica y Algoritmia';
    doc.text(engInst, margin, yPosition);
    yPosition += 10;
  }

  addSeparatorLine();

  // COMPETENCIAS Y HABILIDADES
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const combinedSkillsTitle = language === 'en' ? 'SKILLS & COMPETENCIES' : 'COMPETENCIAS Y HABILIDADES';
  doc.text(combinedSkillsTitle, margin, yPosition);
  yPosition += 10;

  // Dos columnas para skills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const techLabel = language === 'en' ? 'TECHNICAL SKILLS' : 'HABILIDADES TÉCNICAS';
  const softLabel = language === 'en' ? 'SOFT SKILLS' : 'SOFT SKILLS';

  doc.text(techLabel, margin, yPosition);
  doc.text(softLabel, pageWidth / 2 + 5, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const techSkills = profile.skills_focus;
  const softSkills = language === 'en' ? profile.skills_soft_en : profile.skills_soft;

  const maxItems = Math.max(techSkills.length, softSkills.length);
  for (let i = 0; i < maxItems; i++) {
    checkPageBreak(5);
    if (techSkills[i]) doc.text(`• ${techSkills[i]}`, margin + 2, yPosition + (i * 4.5));
    if (softSkills[i]) doc.text(`• ${softSkills[i]}`, pageWidth / 2 + 7, yPosition + (i * 4.5));
  }

  yPosition += maxItems * 4.5 + 8;

  // Idiomas
  doc.setFont('helvetica', 'bold');
  doc.text(language === 'en' ? 'LANGUAGES' : 'IDIOMAS', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(language === 'en' ? '• Spanish (Native)  • English (B2)' : '• Español (Nativo)  • Inglés (B2)', margin + 2, yPosition);

  const filename = `CV_AndresAlmeida_${profileType}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
