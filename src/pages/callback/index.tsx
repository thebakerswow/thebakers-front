import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Token recebido:", token);

    if (token) {
      localStorage.setItem("jwt", token);

      setTimeout(() => {
        navigate("/home"); // Redireciona para /home após salvar o token
      }, 100); // 100ms de atraso para garantir que o token foi salvo
    } else {
      console.error("Token não encontrado na URL.");
      navigate("/"); // Redireciona para a página de login
    }
  }, [searchParams, navigate]);


  return <p>Autenticando...</p>;
}
