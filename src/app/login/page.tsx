"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import logoAaaes from "@/assets/logo-aaaes.png";


const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Login failed");
        setLoading(false);
        return;
      }

      // save token and mark logged in
      localStorage.setItem("aaaes:token", json.token);
      localStorage.setItem("aaaes:isLoggedIn", "true");

      router.push("/");
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <section className="hidden lg:flex flex-col items-center text-center gap-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-110" />
            <Image
              src={logoAaaes}
              alt="Logotipo da A.A.A.E.S. - Atlética de Engenharia de Software"
              width={320}
              height={320}
              className="relative w-80 h-80 object-contain drop-shadow-[0_0_40px_hsl(var(--primary)/0.4)]"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">
              Associação Atlética Acadêmica
            </p>
            <h1 className="text-4xl font-bold tracking-tight">
              Engenharia <span className="gold-text">de Software</span>
            </h1>
            <p className="text-sm text-muted-foreground italic">
              "Código. Disciplina. Domínio."
            </p>
          </div>
        </section>

        <section className="w-full">
          <div className="surface-glass card-glow rounded-2xl border border-border p-8 md:p-10">
            <div className="flex lg:hidden justify-center mb-6">
              <Image
                src={logoAaaes}
                alt="Logotipo A.A.A.E.S."
                width={112}
                height={112}
                className="w-28 h-28 object-contain"
              />
            </div>

            <header className="mb-8">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Acesso de Membro</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Bem-vindo de volta</h2>
              <p className="text-sm text-muted-foreground">
                Entre na sua conta para acessar o painel da Atlética.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">
                  E-mail institucional
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.nome@universidade.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-secondary/40 border-border focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80">
                    Senha
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 bg-secondary/40 border-border focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground font-normal cursor-pointer"
                >
                  Manter conectado neste dispositivo
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold gold-gradient hover:opacity-90 transition-opacity"
              >
                Entrar no Painel
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} A.A.A.E.S. — Todos os direitos reservados.
          </p>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
