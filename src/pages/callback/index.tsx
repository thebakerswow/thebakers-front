import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  console.log("AuthCallback montado"); // Verifique se isto aparece no console

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Token recebido:", token); // Isso também deve aparecer

    if (token) {
      localStorage.setItem("jwt", token);
      navigate("/home"); // Redireciona para home ou outra página
    } else {
      console.error("Token não encontrado na URL.");
      navigate("/"); // Redireciona para a página de login
    }
  }, [searchParams, navigate]);

  return <p>Autenticando...</p>;
}
