import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginDiscord() {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há um code na URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Faz a requisição para o backend trocar o code pelo access_token
      axios
        .get(`https://thebakers-backend.onrender.com/v1/auth/discord/callback?code=${code}`)
        .then((res) => {
          // Armazena o token recebido no localStorage
          const token = res.data.token;
          localStorage.setItem('authToken', token);

          // Limpa o código da URL para evitar reutilização
          window.history.replaceState({}, document.title, window.location.pathname);

          navigate('/home');
        })
        .catch((error) => {
          console.error('Erro durante autenticação:', error);
          setErrorMessage('Erro durante autenticação. Tente novamente.');
        });
    }
  }, [navigate]);

  const handleDiscordLogin = () => {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const redirectUri = 'http://localhost:5173/';
    const scope = 'identify';
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
    window.location.href = discordAuthUrl;
  };

  return (
    <div className="bg-zinc-700 text-gray-100 p-4 h-[300px] w-[800px] text-4xl flex flex-col gap-4 items-center justify-center font-semibold rounded-xl shadow-2xl mt-20">
      <button
        className="px-4 bg-blue-600 rounded-md font-semibold hover:bg-blue-500"
        onClick={handleDiscordLogin}
      >
        Login com Discord
      </button>

      {errorMessage && (
        <div className="text-red-400 text-lg mt-2">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
