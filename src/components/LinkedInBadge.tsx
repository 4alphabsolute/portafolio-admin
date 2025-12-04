import { useEffect } from 'react';

export default function LinkedInBadge() {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://platform.linkedin.com/badges/js/profile.js';
        script.async = true;
        script.defer = true;
        script.type = 'text/javascript';
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div className="flex justify-center my-6">
            <div
                className="badge-base LI-profile-badge"
                data-locale="es_ES"
                data-size="large"
                data-theme="light"
                data-type="HORIZONTAL"
                data-vanity="soyandresalmeida"
                data-version="v1"
            >
                <a
                    className="badge-base__link LI-simple-link"
                    href="https://es.linkedin.com/in/soyandresalmeida?trk=profile-badge"
                >
                    Andrés Almeida
                </a>
            </div>
        </div>
    );
}
