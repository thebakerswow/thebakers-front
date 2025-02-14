import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"

type DiscordTokenPayload = {
  username: string;
  discriminator: string;
  avatar: string;
  id: string;
};

export function HomePage() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    try {
      // Decodifica o JWT para obter os dados do usuário
      const decoded = jwtDecode<DiscordTokenPayload>(token);

      // Monta o nome do usuário
      setUsername(`${decoded.username}#${decoded.discriminator}`);

      // Monta a URL do avatar
      if (decoded.avatar) {
        setAvatarUrl(
          `https://cdn.discordapp.com/avatars/${decoded.id}/${decoded.avatar}.png`
        );
      } else {
        setAvatarUrl(
          "https://cdn.discordapp.com/embed/avatars/0.png"
        );
      }
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
    }
  }, []);

  return (
    <div className="bg-zinc-700 text-gray-100 p-4 h-[400px] w-[800px] text-4xl flex flex-col items-center justify-center font-semibold rounded-xl shadow-2xl mt-20">
      <div>
        Welcome to TheBakers <span className="text-red-700 font-bold">Hub</span>
      </div>
      {username && (
        <div className="text-2xl mt-4">
          Olá, <span className="text-red-500">{username}</span>!
        </div>
      )}
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-32 h-32 rounded-full mt-4"
        />
      )}
    </div>
  );
}
