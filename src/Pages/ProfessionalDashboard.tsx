import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface Mensaje {
  nombre: string;
  email: string;
  mensaje: string;
  empresa?: string;
  tipoProyecto?: string;
  idioma?: string;
  fecha: { seconds: number };
}

interface BotInteraction {
  userType: string;
  language: string;
  messageCount: number;
  timestamp: { seconds: number };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ProfessionalDashboard() {
  const [user, setUser] = useState<any>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [botInteractions, setBotInteractions] = useState<BotInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  
  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    todayMessages: 0,
    recruiterContacts: 0,
    avgResponseTime: '< 24h',
    conversionRate: 0,
    topProjectTypes: [] as { name: string; count: number }[],
    languageDistribution: [] as { name: string; value: number }[],
    dailyActivity: [] as { date: string; messages: number; interactions: number }[]
  });

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth') === 'true';
    if (isAuth) {
      setUser({ displayName: 'Andrés Almeida', email: 'soyandresalmeida@gmail.com' });
    } else {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Calcular fecha límite según rango seleccionado
      const now = new Date();
      const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

      // Obtener mensajes
      const mensajesQuery = query(
        collection(db, 'mensajes'),
        orderBy('fecha', 'desc'),
        limit(100)
      );
      const mensajesSnapshot = await getDocs(mensajesQuery);
      const mensajesData = mensajesSnapshot.docs.map(doc => doc.data() as Mensaje);
      setMensajes(mensajesData);

      // Obtener interacciones del bot
      const botQuery = query(
        collection(db, 'bot_interactions'),
        orderBy('timestamp', 'desc'),
        limit(200)
      );
      const botSnapshot = await getDocs(botQuery);
      const botData = botSnapshot.docs.map(doc => doc.data() as BotInteraction);
      setBotInteractions(botData);

      // Calcular métricas
      calculateMetrics(mensajesData, botData, startDate);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (messages: Mensaje[], interactions: BotInteraction[], startDate: Date) => {
    const filteredMessages = messages.filter(m => 
      new Date(m.fecha.seconds * 1000) >= startDate
    );
    const filteredInteractions = interactions.filter(i => 
      new Date(i.timestamp.seconds * 1000) >= startDate
    );

    // Mensajes de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = messages.filter(m => 
      new Date(m.fecha.seconds * 1000) >= today
    ).length;

    // Contactos de reclutadores (estimado por palabras clave)
    const recruiterKeywords = ['reclutador', 'recruiter', 'hiring', 'job', 'position', 'vacancy', 'empresa', 'company'];
    const recruiterContacts = filteredMessages.filter(m => 
      recruiterKeywords.some(keyword => 
        m.mensaje.toLowerCase().includes(keyword) || 
        (m.empresa && m.empresa.length > 0)
      )
    ).length;

    // Tipos de proyecto más solicitados
    const projectTypes: Record<string, number> = {};
    filteredMessages.forEach(m => {
      if (m.tipoProyecto) {
        projectTypes[m.tipoProyecto] = (projectTypes[m.tipoProyecto] || 0) + 1;
      }
    });
    const topProjectTypes = Object.entries(projectTypes)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Distribución de idiomas
    const languages: Record<string, number> = { es: 0, en: 0 };
    [...filteredMessages, ...filteredInteractions].forEach(item => {
      const lang = item.idioma || item.language || 'es';
      languages[lang] = (languages[lang] || 0) + 1;
    });
    const languageDistribution = Object.entries(languages)
      .map(([name, value]) => ({ name: name === 'es' ? 'Español' : 'English', value }));

    // Actividad diaria
    const dailyActivity: Record<string, { messages: number; interactions: number }> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => {
      dailyActivity[date] = { messages: 0, interactions: 0 };
    });

    filteredMessages.forEach(m => {
      const date = new Date(m.fecha.seconds * 1000).toISOString().split('T')[0];
      if (dailyActivity[date]) {
        dailyActivity[date].messages++;
      }
    });

    filteredInteractions.forEach(i => {
      const date = new Date(i.timestamp.seconds * 1000).toISOString().split('T')[0];
      if (dailyActivity[date]) {
        dailyActivity[date].interactions++;
      }
    });

    const dailyActivityArray = Object.entries(dailyActivity).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
      messages: data.messages,
      interactions: data.interactions
    }));

    setMetrics({
      totalMessages: filteredMessages.length,
      todayMessages,
      recruiterContacts,
      avgResponseTime: '< 24h',
      conversionRate: Math.round((recruiterContacts / Math.max(filteredMessages.length, 1)) * 100),
      topProjectTypes,
      languageDistribution,
      dailyActivity: dailyActivityArray
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h2>
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">📊 Portfolio Analytics</h1>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { value: '7d', label: '7 días' },
                  { value: '30d', label: '30 días' },
                  { value: '90d', label: '90 días' }
                ].map(range => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      timeRange === range.value 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <span className="text-sm text-gray-600">{user.displayName}</span>
              </div>
              <a href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                Admin Panel
              </a>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contactos</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalMessages}</p>
                <p className="text-sm text-green-600">+{metrics.todayMessages} hoy</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reclutadores</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.recruiterContacts}</p>
                <p className="text-sm text-green-600">{metrics.conversionRate}% del total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Respuesta</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.avgResponseTime}</p>
                <p className="text-sm text-green-600">Promedio</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bot Interacciones</p>
                <p className="text-3xl font-bold text-gray-900">{botInteractions.length}</p>
                <p className="text-sm text-blue-600">Conversaciones</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Actividad Diaria */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Diaria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.dailyActivity}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="messages" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="interactions" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución de Idiomas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Idiomas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.languageDistribution}
                  cx="50%" cy="50%" outerRadius={80}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                >
                  {metrics.languageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tipos de Proyecto */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Proyecto Más Solicitados</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.topProjectTypes} layout="horizontal">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Últimos Contactos */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Contactos</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {mensajes.slice(0, 8).map((m, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {m.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{m.nombre}</p>
                      <span className="text-xs text-gray-500">
                        {new Date(m.fecha.seconds * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{m.email}</p>
                    {m.empresa && <p className="text-xs text-blue-600">{m.empresa}</p>}
                    <p className="text-sm text-gray-800 mt-1 line-clamp-2">{m.mensaje}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}