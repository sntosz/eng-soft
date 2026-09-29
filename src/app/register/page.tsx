"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, BookOpen, Calendar, AlertCircle, Loader2, UserPlus, CreditCard, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoAaaes from "@/assets/logo-aaaes.png";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoggedIn, loading: userLoading } = useCurrentUser();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [curso, setCurso] = useState("Engenharia de Software");
  const [anoTurma, setAnoTurma] = useState("");
  const [rgm, setRgm] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!userLoading && isLoggedIn) {
      router.replace("/");
    }
  }, [userLoading, isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (senha !== confirmaSenha) {
      setError("As senhas informadas não coincidem.");
      setLoading(false);
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome.trim(),
          email: email.trim(),
          rgm: rgm.trim(),
          curso: curso.trim(),
          ano_curso: anoTurma.trim(),
          password: senha,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Falha ao realizar cadastro.");
        setLoading(false);
        return;
      }

      setRequestSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center p-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="surface-glass card-glow rounded-2xl border border-border p-8 md:p-10">
          <div className="flex justify-center mb-4">
            <Image
              src={logoAaaes}
              alt="Logotipo A.A.A.E.S."
              width={96}
              height={96}
              className="w-24 h-24 object-contain"
            />
          </div>

          <header className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold mb-2">
              <UserPlus className="w-4 h-4" />
              <span>Junte-se à Atlética</span>
            </div>
            <h2 className="text-2xl font-bold">Solicitar acesso</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enviaremos sua solicitação para conferência do RGM na lista de sócios.
            </p>
          </header>

          {requestSent ? (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-6 text-center">
              <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h3 className="text-lg font-semibold">Solicitação enviada</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Vamos conferir seu RGM com a lista de sócios. Sua conta só poderá ser acessada depois da aprovação; então você poderá entrar com a senha cadastrada.
              </p>
              <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-primary hover:underline">
                Voltar para o login
              </Link>
            </div>
          ) : (
          <>
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="pl-10 h-11 bg-secondary/40 border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 bg-secondary/40 border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rgm">Número da matrícula (RGM)</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="rgm"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Seu RGM conforme a carteirinha"
                  value={rgm}
                  onChange={(e) => setRgm(e.target.value)}
                  required
                  className="pl-10 h-11 bg-secondary/40 border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usaremos o RGM para conferir sua carteirinha com a lista de sócios.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="curso">Curso</Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="curso"
                    type="text"
                    value={curso}
                    onChange={(e) => setCurso(e.target.value)}
                    required
                    className="pl-10 h-11 bg-secondary/40 border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="anoTurma">Turma / Ano</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="anoTurma"
                    type="text"
                    placeholder="Ex: 2024 / Turma B"
                    value={anoTurma}
                    onChange={(e) => setAnoTurma(e.target.value)}
                    className="pl-10 h-11 bg-secondary/40 border-border"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="pl-10 h-11 bg-secondary/40 border-border"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmaSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmaSenha"
                    type="password"
                    placeholder="••••••••"
                    value={confirmaSenha}
                    onChange={(e) => setConfirmaSenha(e.target.value)}
                    required
                    className="pl-10 h-11 bg-secondary/40 border-border"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-base font-semibold gold-gradient mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Enviando solicitação...</span>
                </>
              ) : (
                <span>Solicitar acesso</span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Fazer login
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </main>
  );
}
