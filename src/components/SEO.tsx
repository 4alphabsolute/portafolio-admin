import { Helmet } from 'react-helmet-async';

interface SEOProps {
    page?: 'home' | 'about' | 'projects' | 'experience' | 'blog' | 'contact';
    language?: 'es' | 'en';
}

export default function SEO({ page = 'home', language = 'es' }: SEOProps) {
    const seoData = {
        home: {
            es: {
                title: "Andrés Almeida | Analista de Datos & BI | Power BI, SQL, R | Madrid",
                description: "Portfolio profesional de Andrés Almeida. Especialista en Power BI, SQL, R y análisis financiero. MBA EUDE + Máster BI. Experiencia en banca (Banesco) y seguros. Disponible en Madrid, España.",
                keywords: "Andrés Almeida, Data Analyst Madrid, Power BI Expert Spain, SQL Analyst Madrid, Business Intelligence Madrid, Analista Datos España, BI Developer Madrid, Financial Analysis, Banesco, EUDE MBA, R Programming, DAX, Power Query, Data Science Madrid"
            },
            en: {
                title: "Andrés Almeida | Data & BI Analyst | Power BI, SQL, R | Madrid",
                description: "Professional portfolio of Andrés Almeida. Specialist in Power BI, SQL, R and financial analysis. MBA EUDE + BI Master. Experience in banking (Banesco) and insurance. Available in Madrid, Spain.",
                keywords: "Andrés Almeida, Data Analyst Madrid, Power BI Expert, SQL Analyst, Business Intelligence Madrid, BI Developer Spain, Financial Analysis, R Programming, Python, DAX, Trading Analysis"
            }
        }
    };

    const locale = language === 'es' ? 'es_ES' : 'en_US';
    const alternateLang = language === 'es' ? 'en_US' : 'es_ES';
    const data = seoData[page]?.[language] || seoData.home[language];
    const canonicalUrl = "https://soyandresalmeida.com";
    const socialImage = "https://soyandresalmeida.com/images/perfil.png";

    return (
        <Helmet>
            {/* Basic SEO */}
            <html lang={language} />
            <title>{data.title}</title>
            <meta name="description" content={data.description} />
            <meta name="keywords" content={data.keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph (LinkedIn, Facebook) */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={data.title} />
            <meta property="og:description" content={data.description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={socialImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content={locale} />
            <meta property="og:locale:alternate" content={alternateLang} />
            <meta property="og:site_name" content="Andrés Almeida Portfolio" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={data.title} />
            <meta name="twitter:description" content={data.description} />
            <meta name="twitter:image" content={socialImage} />
            <meta name="twitter:creator" content="@andresalmeida" />

            {/* Additional SEO */}
            <meta name="author" content="Andrés Almeida" />
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow" />
            <meta name="bingbot" content="index, follow" />

            {/* Geo Tags */}
            <meta name="geo.region" content="ES-MD" />
            <meta name="geo.placename" content="Madrid" />
            <meta name="geo.position" content="40.4168;-3.7038" />
            <meta name="ICBM" content="40.4168, -3.7038" />

            {/* Mobile */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="theme-color" content="#0A66C2" />

            {/* Preconnect important resources */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        </Helmet>
    );
}
