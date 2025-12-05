import { useState } from 'react';
import { generateBlogContent, GeneratedContent } from '../services/gemini';

interface ContentGeneratorProps {
    onSelectDraft: (draft: { title: string; body: string; tags: string[] }) => void;
}

export default function ContentGenerator({ onSelectDraft }: ContentGeneratorProps) {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<'professional' | 'casual' | 'technical'>('professional');
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setGeneratedContent(null);

        try {
            const content = await generateBlogContent(topic, tone);
            setGeneratedContent(content);
        } catch (err) {
            setError('Error al generar contenido. Verifica tu API Key o intenta de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🤖</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Generador de Contenido IA</h3>
                    <p className="text-sm text-gray-500">Impulsado por Google Gemini</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Input Section */}
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tema o Título
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ej: El futuro de Power BI en 2025..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tono
                        </label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="professional">Profesional</option>
                            <option value="casual">Casual</option>
                            <option value="technical">Técnico</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Generando Borrador...
                        </>
                    ) : (
                        <>
                            ✨ Generar Borrador
                        </>
                    )}
                </button>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {generatedContent && (
                    <div className="mt-8 border-t pt-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-900">Borrador Generado</h4>
                            <button
                                onClick={() => onSelectDraft(generatedContent)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
                            >
                                📝 Usar este Borrador
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título Sugerido</span>
                                <h2 className="text-xl font-bold text-gray-900 mt-1">{generatedContent.title}</h2>
                            </div>

                            <div className="mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tags</span>
                                <div className="flex gap-2 mt-1">
                                    {generatedContent.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contenido</span>
                                <div className="mt-2 prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap font-mono text-xs bg-white p-4 rounded border">
                                    {generatedContent.body}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
