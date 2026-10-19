"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, ClipboardCheck, Loader2, RefreshCw, ShieldAlert, XCircle } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/contexts/I18nContext";
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
  const { t } = useI18n();
  const { user, loading: userLoading, isLoggedIn } = useCurrentUser();
  const router = useRouter();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{ request: AccessRequest; action: "approve" | "reject" } | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/members/requests", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || t("requests.errorLoad"));
      setRequests(payload.requests);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("requests.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (userLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (user?.e_admin) void loadRequests();
  }, [userLoading, isLoggedIn, user?.e_admin, router, loadRequests]);

  const reviewRequest = async (request: AccessRequest, action: "approve" | "reject") => {
    const actionError = action === "approve" ? t("requests.errorApprove") : t("requests.errorReject");
    setConfirming(null);
    setSubmittingId(request.id);
    try {
      const response = await fetch("/api/members/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, action }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || actionError);
      toast.success(action === "approve" ? t("requests.approved") : t("requests.rejected"));
      await loadRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : actionError);
    } finally {
      setSubmittingId(null);
    }
  };

  if (userLoading || !isLoggedIn) {
    return <div className="flex min-h-screen items-center justify-center">{t("common.loading")}</div>;
  }

  if (!user?.e_admin) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center">
            <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <h1 className="font-display text-xl font-bold">{t("requests.restricted")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("requests.adminOnly")}</p>
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
              {t("requests.listTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("requests.subtitle")}
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
              {t("requests.empty")}
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
                    <div className="flex gap-1"><dt className="text-muted-foreground">{t("requests.course")}</dt><dd>{request.curso}</dd></div>
                    {request.ano_turma && (
                      <div className="flex gap-1"><dt className="text-muted-foreground">{t("requests.year")}</dt><dd>{request.ano_turma}</dd></div>
                    )}
                    <div className="flex gap-1"><dt className="text-muted-foreground">{t("requests.requestedAt")}</dt><dd>{new Date(request.criado_em).toLocaleDateString("pt-BR")}</dd></div>
                  </dl>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setConfirming({ request, action: "approve" })}
                      disabled={submittingId !== null}
                      className="gold-gradient"
                    >
                      {submittingId === request.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}
                      {t("requests.approveBtn")}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setConfirming({ request, action: "reject" })}
                      disabled={submittingId !== null}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t("requests.rejectBtn")}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirming?.action === "approve" ? t("requests.approve") : t("requests.reject")}
            </DialogTitle>
            <DialogDescription>
              {confirming &&
                t("requests.confirmBody", {
                  action: confirming.action === "approve"
                    ? t("requests.approveBtn").toLowerCase()
                    : t("requests.rejectBtn").toLowerCase(),
                  name: confirming.request.nome,
                  rgm: confirming.request.rgm,
                })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)}>{t("common.cancel")}</Button>
            <Button
              variant={confirming?.action === "reject" ? "destructive" : "default"}
              className={confirming?.action === "approve" ? "gold-gradient" : undefined}
              onClick={() => confirming && void reviewRequest(confirming.request, confirming.action)}
            >
              {confirming?.action === "approve" ? t("requests.approveBtn") : t("requests.rejectBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
