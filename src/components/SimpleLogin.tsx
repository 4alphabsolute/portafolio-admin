import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SimpleLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password simple para acceso admin
    if (password === 'El_7rabajo') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/dashboard');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Acceso Admin</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña de administrador"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Acceder
          </button>
        </form>
        
        <p className="text-sm text-gray-600 mt-4">
          Acceso restringido solo para administradores
        </p>
      </div>
    </div>
  );
}