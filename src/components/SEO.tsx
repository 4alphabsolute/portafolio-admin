import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
}

export default function SEO({
    title = 'Andrés Almeida | Data Analyst & Economist',
    description = 'Andrés Almeida - Analista de Datos, Economista, Business Intelligence & Big Data. Transformo datos en decisiones estratégicas.',
    keywords = 'Andrés Almeida, Data Analyst, Economista, Power BI, Tableau, Python, SQL, Business Intelligence',
    image = '/og-image.png',
    url = 'https://soyandresalmeida.com'
}: SEOProps) {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            <link rel="canonical" href={url} />
        </Helmet>
    );
}
