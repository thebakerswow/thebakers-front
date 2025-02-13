import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: string;
  username: string;
}

export function HomePage() {
  const [user, setUser] = useState<User | null>(null); // Definindo o tipo User ou null
  const [_, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      // Se não tiver token, redireciona para a página de login
      navigate('/');
      return;
    }

    // Faz a requisição para pegar as informações do usuário com o token
    axios
      .get('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data); // Armazena os dados do usuário
      })
      .catch((error) => {
        console.error('Erro ao buscar informações do usuário:', error);
        setErrorMessage('Erro ao verificar o usuário. Tente novamente.');
      });
  }, [navigate]);

  if (!user) {
    return <div>Carregando...</div>; // Ou um loader
  }

  return (
    <div className="bg-zinc-700 text-gray-100 p-4 h-[300px] w-[800px] text-4xl flex items-center justify-center font-semibold rounded-xl shadow-2xl mt-20">
      Welcome to TheBakers
      <span className="text-red-700 font-bold">Hub</span>
      <div className="mt-4 text-xl">
        <p>Bem-vindo, {user.username}!</p>
        <p>Seu ID de usuário do Discord: {user.id}</p>
      </div>
    </div>
  );
}
