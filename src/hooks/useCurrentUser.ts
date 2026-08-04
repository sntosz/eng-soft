import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;
  email: string;
  nome?: string;
  name?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("aaaes:token");
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        setUser({
          nome: decoded.nome || decoded.name || "Usuário",
          email: decoded.email,
        });
      }
    } catch (err) {
      console.error("Erro ao decodificar token:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading };
}
