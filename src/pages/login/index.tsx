import axios from 'axios';
import { useState } from 'react';

export function Login() {
  const [errorMessage, _] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://thebakers-backend.onrender.com/v1/login/discord");
      console.log(response)
      console.log(response.data.data)

      if (response.data.data) {
        window.location.href = response.data.data; // Redireciona para o Discord
      }
    } catch (error) {
      console.error("Erro ao iniciar login com Discord:", error);
    }
  };



  return (
    <div className="bg-zinc-700 text-gray-100 p-4 h-[300px] w-[800px] text-4xl flex flex-col gap-4 items-center justify-center font-semibold rounded-xl shadow-2xl mt-20">
      {/* <input
        className="pl-2 rounded-md text-black"
        type="text"
        placeholder="Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="pl-2 rounded-md text-black"
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
      /> */}
      <button
        className="px-4 bg-red-600 rounded-md font-semibold hover:bg-red-500"
        onClick={handleLogin}
      >
        Login
      </button>

      {/* Exibe a mensagem de erro, se existir */}
      {errorMessage && (
        <div className="text-red-400 text-lg mt-2">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
