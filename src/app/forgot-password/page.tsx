"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import logoAaaes from "@/assets/logo-aaaes.png";

type Step = "request" | "verify_and_reset" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Estados do formulário
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  // UI e feedback
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  // Timer para reenvio
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Passo 1: Solicitar código OTP
  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Por favor, preencha seu e-mail.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível enviar o código.");
        setLoading(false);
        return;
      }

      setResetToken(data.resetToken);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setSuccessMessage(
        "Código enviado com sucesso! Verifique sua caixa de entrada."
      );
      setStep("verify_and_reset");
      setCountdown(60); // 60 segundos de cooldown para reenvio
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código OTP
  const handleResendCode = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível reenviar o código.");
        setResending(false);
        return;
      }

      setResetToken(data.resetToken);
      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setCode("");
      setSuccessMessage("Novo código de 6 dígitos enviado com sucesso!");
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || "Erro ao reenviar o código.");
    } finally {
      setResending(false);
    }
  };

  // Passo 2: Validar OTP e Redefinir Senha
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.trim().length !== 6) {
      setError("Digite o código completo de 6 dígitos.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas digitadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: code.trim(),
          newPassword,
          resetToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Falha ao redefinir a senha.");
        setLoading(false);
        return;
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-background relative overflow-hidden flex items-center justify-center p-4">
      {/* Luzes e Efeitos de Fundo */}
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
        {/* Painel Esquerdo (Identidade Visual Atlética) */}
        <section className="hidden lg:flex flex-col items-center text-center gap-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-110" />
            <Image
              src={logoAaaes}
              alt="Logotipo da A.A.A.E.S. - Atlética de Engenharia de Software"
              width={320}
              height={320}
              priority
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
              &quot;Código. Disciplina. Domínio.&quot;
            </p>
          </div>
        </section>

        {/* Painel Direito (Card Interativo) */}
        <section className="w-full">
          <div className="surface-glass card-glow rounded-2xl border border-border p-8 md:p-10">
            {/* Logo em telas pequenas */}
            <div className="flex lg:hidden justify-center mb-6">
              <Image
                src={logoAaaes}
                alt="Logotipo A.A.A.E.S."
                width={100}
                height={100}
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Cabeçalho do Card */}
            <header className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Recuperação de Acesso</span>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao login</span>
                </Link>
              </div>

              {step === "request" && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Esqueceu sua senha?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Digite seu e-mail institucional para receber o código de 6
                    dígitos para redefinição.
                  </p>
                </>
              )}

              {step === "verify_and_reset" && (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Código & Nova Senha
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Insira o código enviado para{" "}
                    <span className="font-semibold text-foreground">
                      {email}
                    </span>{" "}
                    e defina sua nova senha.
                  </p>
                </>
              )}

              {step === "success" && (
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center mx-auto mb-4 text-primary animate-pulse">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    Senha Redefinida!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sua senha foi alterada com sucesso. Agora você já pode
                    entrar na plataforma com as novas credenciais.
                  </p>
                </div>
              )}
            </header>

            {/* Mensagem de Erro Geral */}
            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="font-semibold text-xs">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Mensagem de Sucesso Temporária */}
            {successMessage && step === "verify_and_reset" && (
              <div className="mb-5 p-3.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Alerta de código para ambiente de desenvolvimento */}
            {devCode && step === "verify_and_reset" && (
              <div className="mb-5 p-3 rounded-lg bg-secondary/80 border border-primary/40 text-xs flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground">
                    Código de teste (Dev):{" "}
                  </span>
                  <strong className="text-primary font-mono text-sm tracking-wider">
                    {devCode}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setCode(devCode)}
                  className="text-[11px] text-primary underline hover:opacity-80 font-medium"
                >
                  Preencher
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* ETAPA 1: Solicitar E-mail                                  */}
            {/* ======================================================== */}
            {step === "request" && (
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/80">
                    E-mail institucional
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.nome@universidade.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="pl-10 h-12 bg-secondary/40 border-border focus-visible:ring-primary text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold gold-gradient hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Enviando código...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      <span>Enviar Código de Verificação</span>
                    </div>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Lembrou da senha?{" "}
                    <span className="font-semibold text-primary underline">
                      Entrar na conta
                    </span>
                  </Link>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* ETAPA 2: Digitar Código de 6 Dígitos e Nova Senha         */}
            {/* ======================================================== */}
            {step === "verify_and_reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Input OTP 6 Dígitos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground/80">
                      Código de 6 dígitos
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("request");
                        setError(null);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Alterar e-mail
                    </button>
                  </div>

                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={(val) => setCode(val)}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className="h-12 w-11 text-lg font-bold border-border bg-secondary/50"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-12 w-11 text-lg font-bold border-border bg-secondary/50"
                        />
                        <InputOTPSlot
                          index={2}
                          className="h-12 w-11 text-lg font-bold border-border bg-secondary/50"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={3}
                          className="h-12 w-11 text-lg font-bold border-border bg-secondary/50"
                        />
                        <InputOTPSlot
                          index={4}
                          className="h-12 w-11 text-lg font-bold border-border bg-secondary/50"
                        />
                        <InputOTPSlot
                          index={5}
                          className="h-12 w-11 text-lg font-bold border-border bg-secondary/50"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground/80">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Mínimo de 6 caracteres"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 h-12 bg-secondary/40 border-border focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showNewPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmar Nova Senha */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-foreground/80"
                  >
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 pr-10 h-12 bg-secondary/40 border-border focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Botão de Envio */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold gold-gradient hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Atualizando senha...</span>
                    </div>
                  ) : (
                    <span>Redefinir Senha</span>
                  )}
                </Button>

                {/* Reenvio de Código */}
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <span>Não recebeu o código?</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0 || resending}
                    className="text-primary hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? `Reenviar em ${countdown}s`
                      : resending
                      ? "Enviando..."
                      : "Reenviar código"}
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* ETAPA 3: Sucesso                                           */}
            {/* ======================================================== */}
            {step === "success" && (
              <div className="space-y-4 pt-2">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 text-base font-semibold gold-gradient hover:opacity-90 transition-opacity"
                >
                  Fazer Login Agora
                </Button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} A.A.A.E.S. — Todos os direitos
            reservados.
          </p>
        </section>
      </div>
    </main>
  );
}
