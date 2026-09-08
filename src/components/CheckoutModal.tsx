"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, CheckCircle2, AlertCircle, Loader2, MapPin, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isValidImageUrl } from "@/lib/utils";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: (novoEstoque: number) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: CheckoutModalProps) {
  const { user, isLoggedIn } = useCurrentUser();
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const precoUnitario = Number(product.preco) || 0;
  const maxQuantity = Math.max(1, Math.min(product.estoque, 10));
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

  const handleConfirmOrder = async () => {
    if (!isLoggedIn) {
      setError("Você precisa estar logado para realizar um pedido.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto_id: product.id,
          quantidade: quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Não foi possível concluir o pedido.");
      }

      setSuccess(true);
      onSuccess(data.novo_estoque ?? Math.max(0, product.estoque - quantity));
    } catch (err: any) {
      setError(err.message || "Erro ao realizar pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              {success ? "Pedido Confirmado!" : "Confirmar Pedido"}
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
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 animate-in zoom-in-90 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-foreground">
                  Pedido Registrado com Sucesso!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Seu pedido de <strong className="text-foreground">{quantity}x {product.nome}</strong> foi enviado para a diretoria da atlética.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border text-left space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <MapPin className="w-4 h-4 text-primary" /> Retirada no Campus
                </p>
                <p>
                  Apresente sua Carteirinha Digital de Membro para retirar seus produtos nos dias de jogos ou diretamente com a diretoria.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button asChild className="w-full gold-gradient text-primary-foreground font-semibold">
                  <Link href="/">
                    Ver na Carteirinha Digital
                  </Link>
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Continuar Comprando
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

              {/* Card do Produto Selecionado */}
              <div className="flex gap-4 items-center p-3 rounded-xl bg-muted/40 border border-border">
                <div className="w-20 h-20 bg-background rounded-lg border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
                  {isValidImageUrl(product.imagem_url) ? (
                    <Image
                      src={product.imagem_url!}
                      alt={product.nome}
                      fill
                      unoptimized
                      className="object-contain p-2"
                    />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate text-base">
                    {product.nome}
                  </h4>
                  <p className="text-primary font-bold text-sm mt-0.5">
                    {precoUnitario.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.estoque} unidade{product.estoque !== 1 ? "s" : ""} em estoque
                  </p>
                </div>
              </div>

              {/* Seletor de Quantidade */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/20">
                <span className="text-sm font-medium text-foreground">Quantidade</span>
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

              {/* Identificação do Comprador */}
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
                    Entrar com sua conta acadêmica para finalizar →
                  </Link>
                </div>
              )}

              {/* Resumo do Total */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total do Pedido</span>
                <span className="font-display text-xl font-bold text-primary">
                  {valorTotal}
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
              onClick={handleConfirmOrder}
              disabled={submitting || !isLoggedIn}
              className="gold-gradient text-primary-foreground font-semibold flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <span>Confirmar Pedido</span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
