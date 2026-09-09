"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Ticket, CheckCircle2, AlertCircle, Loader2, MapPin, User as UserIcon, QrCode, Copy, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isValidImageUrl } from "@/lib/utils";

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
  const { user, isLoggedIn } = useCurrentUser();
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const pixKey = "atletica.engsoft@unigran.br";

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
      setError("Você precisa estar logado para garantir seu ingresso.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Simulação de registro / envio do pedido de ingresso
      // Pode ser expandido em tabela de ingressos se necessário
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao garantir ingresso.");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              {success ? "Ingresso Reservado!" : "Garantir Ingresso"}
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
                  Ingresso Reservado com Sucesso!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sua reserva para <strong className="text-foreground">{quantity}x {event.nome}</strong> foi confirmada.
                </p>
              </div>

              {!isGratuito && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-left space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm text-primary">
                    <QrCode className="w-4 h-4" />
                    <span>Pagamento via Pix</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Para validar seus ingressos, faça o Pix de <strong className="text-foreground">{valorTotal}</strong> para a chave abaixo:
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
                          <span className="text-emerald-500">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-muted/40 border border-border text-left space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <MapPin className="w-4 h-4 text-primary" /> Entrada do Evento
                </p>
                <p>
                  Apresente sua Carteirinha Digital de Membro {!isGratuito && "e o comprovante do Pix"} na portaria do evento.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button asChild className="w-full gold-gradient text-primary-foreground font-semibold">
                  <Link href="/">
                    Ver Carteirinha Digital
                  </Link>
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Fechar
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
                <span className="text-sm font-medium text-foreground">Ingressos</span>
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
                    Você está navegando como visitante.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block text-primary font-semibold hover:underline"
                  >
                    Entrar com sua conta acadêmica para reservar →
                  </Link>
                </div>
              )}

              {/* Resumo do Total */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
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
              Cancelar
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
                  <span>Processando...</span>
                </>
              ) : (
                <span>Reservar Ingresso</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
