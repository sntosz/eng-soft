"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ClipboardCheck, Loader2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "@/components/ui/sonner";

interface AccessRequest {
  id: string;
  nome: string;
  email: string;
  rgm: string;
  curso: string;
  ano_turma: string | null;
  criado_em: string;
}

export default function AccessRequestsPage() {
  const { user, loading: userLoading, isLoggedIn } = useCurrentUser();
  const router = useRouter();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/members/requests", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar as solicitações.");
      setRequests(payload.requests);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar as solicitações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (user?.e_admin) void loadRequests();
  }, [userLoading, isLoggedIn, user?.e_admin, router, loadRequests]);

  const reviewRequest = async (request: AccessRequest, action: "approve" | "reject") => {
    const verb = action === "approve" ? "aprovar" : "recusar";
    if (!window.confirm(`Confirma ${verb} o acesso de ${request.nome} (RGM ${request.rgm})?`)) return;

    setSubmittingId(request.id);
    try {
      const response = await fetch("/api/members/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, action }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Não foi possível ${verb} a solicitação.`);
      toast.success(action === "approve" ? "Membro aprovado. A conta já pode ser acessada." : "Solicitação recusada.");
      await loadRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Não foi possível ${verb} a solicitação.`);
    } finally {
      setSubmittingId(null);
    }
  };

  if (userLoading || !isLoggedIn) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  if (!user?.e_admin) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <h1 className="font-display text-xl font-bold">Acesso restrito</h1>
            <p className="mt-2 text-sm text-muted-foreground">Esta área é exclusiva para administradores.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border surface-glass px-6 py-4">
          <div>
            <h1 className="flex items-center gap-2 font-display text-xl font-bold">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Solicitações de acesso
            </h1>
            <p className="text-sm text-muted-foreground">
              Confira o RGM na planilha de sócios antes de aprovar.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadRequests()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </header>

        <section className="p-6">
          {error && <p role="alert" className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-border p-10 text-center text-muted-foreground">
              Não há solicitações pendentes de análise.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {requests.map((request) => (
                <article key={request.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{request.nome}</h2>
                      <p className="break-all text-sm text-muted-foreground">{request.email}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-sm font-bold text-primary">
                      RGM {request.rgm}
                    </span>
                  </div>
                  <dl className="space-y-1 text-sm">
                    <div className="flex gap-1"><dt className="text-muted-foreground">Curso:</dt><dd>{request.curso}</dd></div>
                    {request.ano_turma && (
                      <div className="flex gap-1"><dt className="text-muted-foreground">Turma/ano:</dt><dd>{request.ano_turma}</dd></div>
                    )}
                    <div className="flex gap-1"><dt className="text-muted-foreground">Solicitado:</dt><dd>{new Date(request.criado_em).toLocaleDateString("pt-BR")}</dd></div>
                  </dl>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => void reviewRequest(request, "approve")}
                      disabled={submittingId !== null}
                      className="gold-gradient"
                    >
                      {submittingId === request.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void reviewRequest(request, "reject")}
                      disabled={submittingId !== null}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Recusar
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
