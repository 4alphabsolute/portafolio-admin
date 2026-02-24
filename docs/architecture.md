# Arquitectura y Flujo de "Mi Portafolio" 🚀

A continuación se detalla la arquitectura técnica y el flujo de usuarios del portafolio interactivo, divido en tres áreas principales: El lado público, el panel de administración privado, y la lógica de inteligencia artificial (AndyBot).

```mermaid
graph TD
    %% Secciones del Sistema
    subgraph Lado Público [Experiencia del Visitante]
        User((Usuario/Reclutador)) --> Web[Portafolio Web<br/>React + Tailwind]
        
        Web --> SecHome[Inicio]
        Web --> SecAbout[Sobre Mí]
        Web --> SecExp[Experiencia / Certificados]
        Web --> SecProj[Proyectos]
        Web --> SecBlog[Blog]
        Web --> SecBot[AndyBot AI]
        
        %% Detalles modales
        SecProj -.-> ModalProj[Detalles de Proyecto<br/>Texto Enriquecido + Galería]
        SecBlog -.-> ModalBlog[Artículo Completo<br/>Texto Enriquecido]
    end

    subgraph AndyBot [Cerebro de Inteligencia Artificial]
        SecBot --> Chat[Chat Interactivo]
        Chat -->|Consulta de Texto / Imágenes| Gemini(Gemini AI API)
        Gemini -->|Respuesta Conversacional| Chat
        
        %% Flow del Modo Estratega
        Chat -.->|Santo y Seña:<br/>"Modo Estratega"| StrategistMode{Modo Estratega Activado}
        StrategistMode -->|Analiza Pantallazo de Vacante<br/>+ CV Base de Andrés| Gemini
        Gemini -->|Retorna Diccionario JSON| PDFGen[Motor de PDF<br/>jsPDF + AutoTable]
        PDFGen -->|Genera y Descarga Automática| CVDownload[(CV Híbrido .pdf)]
    end

    subgraph Panel de Control [Administración Privada]
        Admin((Andrés / Admin)) --> AdminPanel[Admin Panel<br/>Rutas Protegidas]
        AdminPanel --> Auth[Firebase Auth]
        Auth -->|Acceso Validado| Dashboard[Dashboard de Gestión]
        
        Dashboard --> FormProj[Gestor de Proyectos<br/>ReactQuill Editor]
        Dashboard --> FormBlog[Gestor de Blog<br/>ReactQuill Editor]
        Dashboard --> FormCV[Gestor de Experiencia]
        
        FormProj -->|Sube Imágenes Originales| Storage[(Firebase Storage)]
        Storage -.->|Genera URL Pública| Firestore
        
        FormProj -->|Escribe Datos + HTML| Firestore[(Firebase Firestore<br/>Base de Datos)]
        FormBlog -->|Escribe Datos + HTML| Firestore
        FormCV -->|Escribe Datos| Firestore
    end
    
    %% Flujo de datos al frontend
    Firestore ===>|Lectura Pública en Tiempo Real| Web
    Storage ===>|Sirve Imágenes Optimizadas| Web
    
    %% Estilos de Nodos
    classDef frontend fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef backend fill:#7c2d12,stroke:#f59e0b,stroke-width:2px,color:#f8fafc;
    classDef ai fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    classDef external fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#f8fafc;
    
    class Web,SecHome,SecAbout,SecExp,SecProj,SecBlog,SecBot,AdminPanel,Dashboard,FormProj,FormBlog,FormCV,ModalProj,ModalBlog,Chat,PDFGen frontend;
    class Firestore,Storage,Auth backend;
    class Gemini ai;
    class User,Admin external;
```

## Puntos Clave del Flujo

1. **Gestión de Contenido (CMS Custom):** Toda la información de tu portafolio no está estática; vive en **Firestore**. Cuando escribes un blog o agregas un proyecto y usas *ReactQuill* para darle formato, ese HTML seguro viaja a la base de datos y se pinta en tiempo real para los visitantes.
2. **Almacenamiento de Multimedia:** Las imágenes ahora van directo a **Firebase Storage**. El panel verifica tu autenticación, sube el archivo, y guarda la URL mágica en Firestore.
3. **El Modo Estratega de AndyBot:** Es el flujo más avanzado. Interrumpe la conversación normal de Gemini, inyecta un comportamiento de "Reclutador experto", cruza la vacante con tu experiencia, y ensambla un PDF sobre la marcha en el navegador del usuario sin pasar por servidores backend intermediarios.
