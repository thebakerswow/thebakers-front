import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("jwt", token);
      window.location.href = "/home"; // Redireciona para home ou outra página
    }
  }, [searchParams]);

  return <p>Autenticando...</p>;
};
