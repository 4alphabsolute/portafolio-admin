import { useState } from 'react';
import { Upload, Download, FileText, Loader2, CheckCircle, Copy } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function CVConverterPDFFlowise() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [jsonResult, setJsonResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setExtractedText('');
      setJsonResult('');
      
      // Extraer texto automáticamente
      await extractTextFromPDF(selectedFile);
    } else {
      setError('Por favor selecciona un archivo PDF válido');
    }
  };

  const extractTextFromPDF = async (file: File) => {
    setExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Configuración más robusta para PDFs de Overleaf
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        disableFontFace: false,
        verbosity: 0
      }).promise;
      
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false
          });
          
          // Mejor procesamiento del texto
          const pageText = textContent.items
            .map((item: any) => {
              if (item.str && item.str.trim()) {
                return item.str;
              }
              return '';
            })
            .filter(text => text.length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
        } catch (pageErr) {
          console.warn(`Error en página ${i}:`, pageErr);
          // Continuar con las otras páginas
        }
      }
      
      if (fullText.trim().length > 10) {
        setExtractedText(fullText.trim());
      } else {
        throw new Error('PDF parece estar vacío o ser una imagen. Intenta con el método manual.');
      }
      
    } catch (err) {
      console.error('Error completo:', err);
      setError(`Error al leer PDF de Overleaf. Solución: Abre el PDF, selecciona todo (Ctrl+A), copia (Ctrl+C) y pégalo abajo.`);
    } finally {
      setExtracting(false);
    }
  };

  const convertToJSON = async () => {
    if (!extractedText.trim()) {
      setError('No hay texto para convertir');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Usar Flowise que ya funciona
      const proxyBase = 'http://localhost:4000';
      const canvasId = '03fe25e4-9ea8-48fc-98ed-0bae9c814a41';
      
      const prompt = `Convierte este CV a formato JSON estructurado. Responde ÚNICAMENTE con JSON válido:

{
  "personal": {
    "name": "Nombre completo",
    "title": "Título profesional",
    "email": "email@ejemplo.com",
    "phone": "+57 300 123 4567", 
    "location": "Ciudad, País",
    "summary": "Resumen profesional"
  },
  "experience": [
    {
      "id": 1,
      "company": "Empresa",
      "position": "Cargo",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "description": "Descripción",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "education": [
    {
      "id": 1,
      "institution": "Universidad", 
      "degree": "Título",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "status": "Completado"
    }
  ],
  "skills": {
    "frontend": [],
    "backend": [],
    "database": [],
    "cloud": [],
    "tools": []
  },
  "projects": [],
  "certifications": []
}

CV: ${extractedText}`;

      const response = await fetch(`${proxyBase}/api/andybot/${canvasId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });

      if (!response.ok) {
        throw new Error(`Error del proxy: ${response.status}`);
      }

      const data = await response.json();
      
      // Extraer respuesta de Flowise
      let responseText = '';
      if (typeof data === 'string') {
        responseText = data;
      } else if (data.text) {
        responseText = data.text;
      } else if (data.output) {
        responseText = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
      } else {
        responseText = JSON.stringify(data);
      }

      // Limpiar y extraer JSON
      let cleanedText = responseText.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      cleanedText = cleanedText.replace(/&quot;/g, '"'); // Decodificar HTML entities
      
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`No se encontró JSON válido. Respuesta: ${responseText}`);
      }

      const jsonString = jsonMatch[0];
      const parsedJson = JSON.parse(jsonString);
      
      setJsonResult(JSON.stringify(parsedJson, null, 2));
      
    } catch (err) {
      console.error('Error:', err);
      setError(`Error al convertir: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!jsonResult) return;
    const blob = new Blob([jsonResult], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonResult);
    alert('JSON copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CV to JSON Converter
          </h1>
          <p className="text-lg text-gray-600">
            Sube tu PDF y conviértelo automáticamente con Flowise 🚀
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Requisitos:</strong> Flowise corriendo en localhost:3000 y proxy en localhost:4000
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Subir CV en PDF
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0A66C2] transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  Arrastra tu PDF aquí o haz clic para seleccionar
                </p>
              </label>
            </div>
            
            {file && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
                
                {extracting && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extrayendo texto del PDF...</span>
                  </div>
                )}
                
                {extractedText && !extracting && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>✅ Texto extraído ({extractedText.length} caracteres)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fallback Text Input */}
          {error && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Plan B: Pegar texto manualmente
              </label>
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Si el PDF no se pudo leer, pega aquí el texto..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Convert Button */}
          <div className="mb-8">
            <button
              onClick={convertToJSON}
              disabled={!extractedText || loading || extracting}
              className="w-full bg-[#0A66C2] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#0052A3] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando con Flowise...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  Convertir a JSON
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* JSON Result */}
          {jsonResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  🎉 JSON Generado
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copiar
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#0052A3] text-sm flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm font-mono">
                  {jsonResult}
                </pre>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <strong>¡Perfecto!</strong> Ahora actualicemos tu portafolio con esta información.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}