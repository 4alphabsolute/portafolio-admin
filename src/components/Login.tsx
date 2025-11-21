import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      setError('Error al iniciar sesión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error al procesar redirección:", error);
      }
    };

    const user = auth.currentUser;
    if (user) {
      navigate("/dashboard");
    } else {
      checkRedirectResult();
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Acceso Privado</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Redirigiendo...</span>
            </>
          ) : (
            <>
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
              Iniciar sesión con Google
            </>
          )}
        </button>
        
        <p className="text-sm text-gray-600 mt-4">
          Serás redirigido a Google para autenticarte
        </p>
      </div>
    </div>
  );
}
