"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Ticket, CheckCircle2, AlertCircle, Loader2, MapPin, User as UserIcon, QrCode, Copy, Check, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isValidImageUrl } from "@/lib/utils";
import { PIX_KEY, WHATSAPP_NUMBER } from "@/lib/checkoutConfig";
import { useI18n } from "@/contexts/I18nContext";

interface EventTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export function EventTicketModal({
  isOpen,
  onClose,
  event,
}: EventTicketModalProps) {
  const { t } = useI18n();
  const { user, isLoggedIn } = useCurrentUser();
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixKey = PIX_KEY;
  const whatsappNumber = WHATSAPP_NUMBER;

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
      setSuccess(false);
      setCopied(false);
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const precoUnitario = Number(event.preco) || 0;
  const isGratuito = precoUnitario === 0;
  const maxQuantity = 5;
  const valorTotal = (precoUnitario * quantity).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) setQuantity((q) => q + 1);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmTicket = async () => {
    if (!isLoggedIn) {
      setError(t("ticket.loginRequired"));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evento_id: event.id,
          quantidade: quantity,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || t("ticket.errorGeneric"));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("ticket.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const eventDate = new Date(event.data_evento);
  const formattedDate = eventDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Mensagem formatada do WhatsApp para ingressos
  const whatsappMessage = encodeURIComponent(
    `Olá! Reservei ingressos para o evento da Atlética:\n\n` +
    `👤 *Cliente:* ${user?.nome || "Membro"}\n` +
    `🎉 *Evento:* ${event.nome}\n` +
    `🎟️ *Quantidade:* ${quantity} ingresso(s)\n` +
    `💰 *{t("ticket.total")}* ${isGratuito ? "Gratuito" : valorTotal}\n` +
    (!isGratuito ? `🔑 *Chave Pix:* ${pixKey}\n\nSegue em anexo o meu comprovante de pagamento.` : "")
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              {success ? t("ticket.reserved") : t("events.buyTicket")}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-5">
          {success ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-foreground">
                  {t("ticket.reserved")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("ticket.successPre")} <strong className="text-foreground">{quantity}x {event.nome}</strong> {t("ticket.successPost")}
                </p>
              </div>

              {!isGratuito && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-left space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm text-primary">
                    <QrCode className="w-4 h-4" />
                    <span>{t("ticket.pixData")}</span>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground border-b border-primary/20 pb-2">
                    <p className="flex justify-between">
                      <span>{t("ticket.ticketsColon")}</span>
                      <strong className="text-foreground">{quantity} un.</strong>
                    </p>
                    <p className="flex justify-between">
                      <span>{t("ticket.total")}</span>
                      <strong className="text-primary text-sm font-bold">{valorTotal}</strong>
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      {t("ticket.pixKeyLabel")}
                    </p>
                    <div className="flex items-center justify-between bg-background border border-border p-2.5 rounded-lg">
                      <span className="text-xs font-mono text-foreground font-semibold truncate mr-2">
                        {pixKey}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyPix}
                        className="h-7 px-2.5 text-xs flex items-center gap-1 shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">{t("common.copied")}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t("common.copy")}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Redirecionamento para o WhatsApp */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left space-y-2">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  {!isGratuito ? t("ticket.sendReceiptTitle") : t("ticket.whatsappConfirm")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {!isGratuito
                    ? t("ticket.sendReceipt")
                    : t("ticket.notifyBoard")}
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors shadow-md inline-flex"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t("ticket.whatsappBtn")}
                </a>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border text-left space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {t("ticket.entryTitle")}
                </p>
                <p>
                  {t("ticket.entryHint")}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button variant="outline" onClick={onClose} className="w-full">
                  {t("common.close")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Card do Evento Selecionado */}
              <div className="flex gap-4 items-center p-3 rounded-xl bg-muted/40 border border-border">
                <div className="w-20 h-20 bg-background rounded-lg border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
                  {isValidImageUrl(event.imagem_url) ? (
                    <Image
                      src={event.imagem_url!}
                      alt={event.nome}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate text-base">
                    {event.nome}
                  </h4>
                  <p className="text-primary font-bold text-sm mt-0.5">
                    {isGratuito ? "Gratuito" : (precoUnitario.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }))}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Seletor de Quantidade */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                <span className="text-sm font-medium text-foreground">{t("ticket.tickets")}</span>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDecrease}
                    disabled={quantity <= 1}
                    className="h-8 w-8 rounded-lg"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </Button>
                  <span className="font-display font-bold text-base w-6 text-center">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleIncrease}
                    disabled={quantity >= maxQuantity}
                    className="h-8 w-8 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Identificação do Usuário */}
              {isLoggedIn && user ? (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-xs overflow-hidden">
                    <p className="font-semibold text-foreground truncate">
                      {user.nome}
                    </p>
                    <p className="text-muted-foreground truncate">
                      {user.curso} {user.ano_curso ? `· Turma ${user.ano_curso}` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-secondary/40 border border-border text-xs text-center space-y-2">
                  <p className="text-muted-foreground">
                    {t("checkout.guestNotice")}
                  </p>
                  <Link
                    href="/login"
                    className="inline-block text-primary font-semibold hover:underline"
                  >
                    {t("ticket.loginToReserve")}
                  </Link>
                </div>
              )}

              {/* Resumo do Total */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("common.total")}</span>
                <span className="font-display text-xl font-bold text-primary">
                  {isGratuito ? "Gratuito" : valorTotal}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Rodapé / Ações */}
        {!success && (
          <div className="p-5 border-t border-border bg-muted/20 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmTicket}
              disabled={submitting || !isLoggedIn}
              className="gold-gradient text-primary-foreground font-semibold flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("common.processing")}</span>
                </>
              ) : (
                <span>{t("ticket.confirm")}</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
