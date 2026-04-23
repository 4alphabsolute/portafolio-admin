import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
    page?: 'home' | 'blog' | 'project';
}

export default function StructuredData({ page = 'home' }: StructuredDataProps) {
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Andrés Almeida",
        "alternateName": ["Andrés Almeida Data Analyst", "Andrés Almeida BI", "Soy Andrés Almeida"],
        "jobTitle": "Data & Business Intelligence Analyst",
        "description": "Analista de Datos y Arquitecto de Soluciones IA especializado en Power BI, R, SQL, SDD (Spec Driven Development) y sistemas agénticos con MCP.",
        "url": "https://soyandresalmeida.com",
        "email": "soyandresalmeida@gmail.com",
        "telephone": "+34633084828",
        "image": "https://soyandresalmeida.com/images/perfil.png",
        "sameAs": [
            "https://www.linkedin.com/in/soyandresalmeida",
            "https://github.com/4alphabsolute",
            "https://www.instagram.com/soyandresalmeida/",
            "https://www.facebook.com/andres.almeida.90/"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Madrid",
            "addressRegion": "Madrid",
            "addressCountry": "ES"
        },
        "alumniOf": [
            {
                "@type": "EducationalOrganization",
                "name": "EUDE Business School",
                "sameAs": "https://www.eude.es/"
            },
            {
                "@type": "EducationalOrganization",
                "name": "Universidad Católica Andrés Bello",
                "sameAs": "https://www.ucab.edu.ve/"
            }
        ],
        "knowsAbout": [
            "Power BI",
            "SQL",
            "R Programming",
            "Python",
            "Spec Driven Development (SDD)",
            "AI Agent Orchestration",
            "MCP (Model Context Protocol)",
            "Data Analysis",
            "Business Intelligence",
            "Financial Analysis",
            "Project Management (Gantt, Master Plan)",
            "Real Estate Analysis",
            "DAX"
        ],
        "hasOccupation": {
            "@type": "Occupation",
            "name": "Data Analyst",
            "occupationalCategory": "15-2051.00",
            "estimatedSalary": {
                "@type": "MonetaryAmountDistribution",
                "name": "base",
                "currency": "EUR",
                "duration": "P1Y",
                "percentile10": 35000,
                "percentile25": 40000,
                "median": 50000,
                "percentile75": 60000,
                "percentile90": 70000
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://soyandresalmeida.com"
            }
        },
        "workExperience": [
            {
                "@type": "OrganizationRole",
                "roleName": "Especialista de Control y Gestión del Dato",
                "startDate": "2025-03",
                "endDate": "2025-06",
                "organizationName": "Banesco Seguros",
                "description": "Automatización de reportes actuariales y financieros con R e IA, desarrollo de dashboards en Power BI"
            },
            {
                "@type": "OrganizationRole",
                "roleName": "Analista de Crédito",
                "startDate": "2024-02",
                "endDate": "2025-02",
                "organizationName": "Banesco Banco Universal",
                "description": "Análisis de riesgo financiero mediante flujos de caja, reclasificaciones y KPIs financieros"
            }
        ]
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://soyandresalmeida.com",
        "name": "Andrés Almeida - Portfolio Profesional",
        "description": "Portfolio profesional de Andrés Almeida, Analista de Datos y Business Intelligence especializado en Power BI, SQL y análisis financiero",
        "author": {
            "@type": "Person",
            "name": "Andrés Almeida"
        },
        "inLanguage": ["es-ES", "en-US"]
    };

    const professionalServiceSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Andrés Almeida - Servicios de Análisis de Datos",
        "image": "https://soyandresalmeida.com/images/perfil.png",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Madrid",
            "addressRegion": "Madrid",
            "addressCountry": "ES"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 40.4168,
            "longitude": -3.7038
        },
        "url": "https://soyandresalmeida.com",
        "telephone": "+34633084828",
        "priceRange": "Consultar",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "reviewCount": "1"
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://soyandresalmeida.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Sobre mí",
                "item": "https://soyandresalmeida.com#about"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "Experiencia",
                "item": "https://soyandresalmeida.com#experience"
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": "Proyectos",
                "item": "https://soyandresalmeida.com#projects"
            },
            {
                "@type": "ListItem",
                "position": 5,
                "name": "Blog",
                "item": "https://soyandresalmeida.com#blog"
            }
        ]
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(personSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(websiteSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(professionalServiceSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(breadcrumbSchema)}
            </script>
        </Helmet>
    );
}
