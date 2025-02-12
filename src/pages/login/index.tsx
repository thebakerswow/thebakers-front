import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log('Username:', username);
    console.log('Password:', password);
    navigate('/home');
  };

  return (
    <div className="bg-zinc-700 text-gray-100 p-4 h-[300px] w-[800px] text-4xl flex flex-col gap-4 items-center justify-center font-semibold rounded-xl shadow-2xl mt-20">
      <input
        className="pl-2 rounded-md text-black"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="pl-2 rounded-md text-black"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="px-4 bg-red-600 rounded-md font-semibold hover:bg-red-500"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}
