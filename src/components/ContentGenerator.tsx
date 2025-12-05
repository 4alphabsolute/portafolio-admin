import { useState } from 'react';
import { generateBlogContent, GeneratedContent } from '../services/gemini';
import { marked } from 'marked';

interface ContentGeneratorProps {
    onSelectDraft: (draft: { title: string; body: string; tags: string[] }) => void;
}

export default function ContentGenerator({ onSelectDraft }: ContentGeneratorProps) {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<'professional' | 'casual' | 'technical'>('professional');
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');

    const handleGenerate = async () => {
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);
        setGeneratedContent(null);

        try {
            const content = await generateBlogContent(topic, tone);
            setGeneratedContent(content);
            setViewMode('preview'); // Show preview first to wow the user
        } catch (err: any) {
            const msg = err.message || 'Error desconocido';
            setError(`Error: ${msg}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateContent = (newBody: string) => {
        if (generatedContent) {
            setGeneratedContent({ ...generatedContent, body: newBody });
        }
    };

    const openUnsplash = () => {
        if (!generatedContent) return;
        const query = generatedContent.tags.slice(0, 2).join(' ') || topic;
        window.open(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, '_blank');
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
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-mono break-all">
                        {error}
                    </div>
                )}

                {/* Results Section */}
                {generatedContent && (
                    <div className="mt-8 border-t pt-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">Borrador Generado</h4>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('edit')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'edit' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'preview' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        👁️ Vista Previa
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={openUnsplash}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center gap-2"
                                    title="Buscar imagen en Unsplash"
                                >
                                    📷 Buscar Imagen
                                </button>
                                <button
                                    onClick={() => onSelectDraft(generatedContent)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2"
                                >
                                    📝 Usar este Borrador
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="mb-4">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título Sugerido</span>
                                <input
                                    type="text"
                                    value={generatedContent.title}
                                    onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
                                    className="w-full text-xl font-bold text-gray-900 mt-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                                />
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
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Contenido</span>

                                {viewMode === 'edit' ? (
                                    <textarea
                                        value={generatedContent.body}
                                        onChange={(e) => handleUpdateContent(e.target.value)}
                                        className="w-full h-96 p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                                    />
                                ) : (
                                    <div
                                        className="prose prose-sm max-w-none bg-white p-6 rounded-lg border border-gray-200 min-h-[24rem]"
                                        dangerouslySetInnerHTML={{ __html: marked(generatedContent.body) as string }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
