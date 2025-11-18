import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { getBotStats } from '../utils/dataManager';

interface BotInteraction {
  id: string;
  userMessage: string;
  botResponse: string;
  analysis: {
    category: string;
    summary: string;
    priority: string;
  };
  createdAt: any;
}

export default function BotAnalytics() {
  const [stats, setStats] = useState<any>({});
  const [interactions, setInteractions] = useState<BotInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBotData();
  }, []);

  const fetchBotData = async () => {
    try {
      // Obtener estadísticas
      const botStats = await getBotStats();
      setStats(botStats);

      // Obtener últimas interacciones relevantes
      const q = query(
        collection(db, 'bot_interactions'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const interactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BotInteraction));
      
      setInteractions(interactionsData);
    } catch (error) {
      console.error('Error fetching bot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recruitment': return 'bg-green-100 text-green-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas del Bot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Interacciones</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.today || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reclutamiento</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.byCategory?.recruitment || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Alta Prioridad</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.highPriority || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Interacciones */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Interacciones Relevantes</h3>
        
        {interactions.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No hay interacciones registradas aún</p>
            <p className="text-xs text-gray-400 mt-1">Las interacciones aparecerán cuando los usuarios usen el chatbot</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(interaction.analysis?.category)}`}>
                      {interaction.analysis?.category || 'general'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(interaction.analysis?.priority)}`}>
                      {interaction.analysis?.priority || 'medium'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {interaction.createdAt?.toDate?.()?.toLocaleString() || 'Fecha no disponible'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Usuario:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {interaction.userMessage?.substring(0, 150)}
                      {interaction.userMessage?.length > 150 ? '...' : ''}
                    </p>
                  </div>
                  
                  {interaction.analysis?.summary && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Resumen:</p>
                      <p className="text-sm text-blue-600 italic">{interaction.analysis.summary}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}