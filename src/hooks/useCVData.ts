import { useState, useEffect } from 'react';
import cvData from '../data/cv-data.json';

export interface CVData {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    id: number;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  skills: {
    frontend: string[];
    backend: string[];
    database: string[];
    cloud: string[];
    tools: string[];
  };
  projects: Array<{
    id: number;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
  }>;
  certifications: Array<{
    id: number;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
}

export const useCVData = (): CVData => {
  return cvData as CVData;
};

// Hook para formatear fechas
export const useFormatDate = () => {
  const formatDate = (dateStr: string, language: 'es' | 'en' = 'es') => {
    if (dateStr === 'presente' || dateStr === 'present') {
      return language === 'es' ? 'Presente' : 'Present';
    }
    
    const [year, month] = dateStr.split('-');
    const months = {
      es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    
    return `${months[language][parseInt(month) - 1]} ${year}`;
  };
  
  return { formatDate };
};