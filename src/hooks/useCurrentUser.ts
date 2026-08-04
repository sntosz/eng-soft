import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<{
    id?: string;
    nome: string;
    email: string;
    curso: string;
    ano_curso?: string;
    e_admin?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Erro ao obter usuário:", err);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, isLoggedIn };
}
