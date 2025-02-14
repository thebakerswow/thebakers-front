import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    console.log("Token recebido:", token);

    if (token) {
      localStorage.setItem("jwt", token);
      setIsAuthenticated(true); // Força a re-renderização
    } else {
      console.error("Token não encontrado na URL.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  return <p>Autenticando...</p>;
}
