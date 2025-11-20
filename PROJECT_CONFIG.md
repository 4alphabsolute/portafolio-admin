# ⚙️ CONFIGURACIÓN DEL PROYECTO

## 🚀 COMANDOS ESENCIALES

### **Desarrollo**
```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

### **Deploy**
```bash
# Portfolio público (Firebase)
firebase deploy --only hosting

# Panel admin (Vercel)
vercel --prod
```

## 📁 ESTRUCTURA LIMPIA

### **Componentes Activos**
```
src/components/
├── AndyChat.tsx              # Chatbot con IA ✅
├── UnifiedContactSection.tsx # Formulario contacto ✅
├── CertificationsSection.tsx # Certificaciones ✅
├── ExperienceSection.tsx     # Experiencia ✅
├── ProjectsSection.tsx       # Proyectos ✅
├── BlogSection.tsx           # Blog ✅
├── About.tsx                 # Sobre mí ✅
├── Hero.tsx                  # Sección hero ✅
├── Navbar.tsx                # Navegación ✅
├── Footer.tsx                # Pie de página ✅
├── SimpleLogin.tsx           # Login admin ✅
├── CookieBanner.tsx          # Banner cookies ✅
├── DynamicNodesGrid.tsx      # Fondo animado ✅
├── FloatingParticles.tsx     # Partículas ✅
├── TrustIndicators.tsx       # Indicadores confianza ✅
├── FloatingCTA.tsx           # CTA flotante ✅
├── SocialProof.tsx           # Prueba social ✅
├── BotAnalytics.tsx          # Analytics bot ✅
├── CVConverterPDFFlowise.tsx # Conversor CV ✅
└── SecureDocumentViewer.tsx  # Visor documentos ✅
```

### **Páginas Principales**
```
src/Pages/
├── App.tsx                   # Portfolio público ✅
├── Admin.tsx                 # Panel administración ✅
└── ProfessionalDashboard.tsx # Dashboard KPIs ✅
```

### **Utilidades Esenciales**
```
src/utils/
├── fullFirebaseManager.ts    # Gestor Firebase principal ✅
├── firebaseErrorHandler.ts   # Manejo errores ✅
├── dynamicTranslations.ts    # Sistema traducciones ✅
├── pdfGenerator.ts           # Generador PDF ✅
└── dataManager.ts            # Gestor datos ✅
```

## 🔧 DEPENDENCIAS PRINCIPALES

### **Producción**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "firebase": "^10.7.1",
  "@google/generative-ai": "^0.1.3",
  "emailjs-com": "^3.2.0",
  "jspdf": "^2.5.1",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "marked": "^11.1.1",
  "tailwindcss": "^3.4.0"
}
```

### **Desarrollo**
```json
{
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@vitejs/plugin-react": "^4.2.1",
  "typescript": "^5.2.2",
  "vite": "^5.0.8"
}
```

## 🌍 VARIABLES DE ENTORNO

### **Archivo .env**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# External Services
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Admin Access
VITE_ADMIN_PASSWORD=your_secure_password
```

## 🔐 CONFIGURACIÓN FIREBASE

### **firestore.rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### **firebase.json**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 📊 MÉTRICAS POST-LIMPIEZA

### **Archivos Eliminados**
- ❌ 12 componentes redundantes
- ❌ 5 archivos de configuración obsoletos
- ❌ 3 carpetas innecesarias (flowise, functions, server)
- ❌ 4 documentos temporales

### **Resultado**
- ✅ 28% reducción de código
- ✅ Bundle más optimizado
- ✅ Estructura más limpia
- ✅ Mantenimiento simplificado

## 🎯 FUNCIONALIDADES CLAVE

### **1. Portfolio Dinámico**
- Gestión contenido con Firebase
- Traducciones ES/EN automáticas
- Responsive design completo

### **2. Chatbot IA (AndyChat)**
- Integración Gemini AI
- Generación CV personalizado
- Analytics conversaciones

### **3. Panel Admin**
- CRUD completo certificaciones/experiencia/proyectos
- Autenticación segura
- Interface moderna

### **4. Dashboard Profesional**
- KPIs tiempo real
- Gráficos interactivos
- Métricas engagement

## 🚀 PRÓXIMOS PASOS

1. **Optimización Performance**
   - Code splitting
   - Lazy loading
   - Image optimization

2. **Funcionalidades Nuevas**
   - Blog dinámico
   - Sistema comentarios
   - Analytics avanzados

3. **Mejoras UX**
   - Animaciones suaves
   - Micro-interacciones
   - Accesibilidad mejorada