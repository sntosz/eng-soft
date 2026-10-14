"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";
import { Calendar, MapPin, Clock, Users, Ticket, Plus, Edit2, Trash2 } from "lucide-react";
import { Event } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/contexts/I18nContext";
import { EventModal } from "@/components/EventModal";
import { isValidImageUrl } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EventsPage = () => {
  const { user } = useCurrentUser();
  const { t } = useI18n();
  const isAdmin = user?.e_admin === true;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/events");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t("events.errorLoad"));
      setEvents(data.events || []);
    } catch (err: any) {
      console.error("Erro ao buscar eventos:", err);
      setError(err.message || t("events.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = () => { setSelectedEvent(null); setIsModalOpen(true); };
  const handleEdit = (e: Event) => { setSelectedEvent(e); setIsModalOpen(true); };

  const handleDelete = (event: Event) => {
    setEventToDelete(event);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    const eventId = eventToDelete.id;
    setEventToDelete(null);

    try {
      const res = await fetch(`/api/events?id=${eventId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("events.errorDelete"));

      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      toast.success(t("events.deleted"));
    } catch (err: any) {
      toast.error(err.message || t("events.errorDelete"));
    }
  };

  const handleSubmit = async (data: Partial<Event>) => {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t("events.errorSave"));

      setIsModalOpen(false);
      await loadEvents();
      toast.success(data.id ? t("events.updated") : t("events.created"));
    } catch(err: any) {
      toast.error(err.message || t("events.errorSave"));
    }
  };

  const EventCard = ({ event }: { event: Event }) => {
    const date = new Date(event.data_evento);
    const monthNames = t("events.months").split(",");

    const hasValidImage = isValidImageUrl(event.imagem_url);

    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden group card-glow flex flex-col md:flex-row transition-all hover:border-primary/50">
        <div className="md:w-64 h-48 md:h-auto bg-muted relative overflow-hidden shrink-0">
          {hasValidImage ? (
            <Image width={600} height={400}
              src={event.imagem_url}
              alt={event.nome}
              unoptimized
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full gold-gradient opacity-20 flex items-center justify-center">
              <Calendar className="w-16 h-16 text-primary" />
            </div>
          )}

          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center w-14 h-14 border border-border shadow-lg">
            <span className="text-primary font-bold text-lg leading-none">{date.getDate()}</span>
            <span className="text-xs font-medium uppercase text-muted-foreground">{monthNames[date.getMonth()]}</span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-display font-bold text-xl text-foreground">
                {event.nome}
              </h3>
              {event.preco > 0 ? (
                <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">
                  R$ {event.preco.toFixed(2)}
                </span>
              ) : (
                <span className="font-bold text-secondary-foreground bg-secondary px-3 py-1 rounded-full text-sm">
                  {t("events.free")}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
              {event.descricao || t("events.defaultDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{event.local || t("events.defaultLocation")}</span>
            </span>
            <span className="flex items-center gap-2 md:col-span-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  toast.info(t("events.registered"), {
                    description: t("events.ticketHint"),
                  });
                }}
                className="gold-gradient text-primary-foreground px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
              >
                <Ticket className="w-4 h-4" />
                {t("events.buyTicket")}
              </button>
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-col gap-2 p-4 md:border-l border-border bg-secondary/10 justify-center min-w-[120px]">
             <button onClick={() => handleEdit(event)} className="w-full border px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-secondary bg-background"><Edit2 className="w-4 h-4"/> {t("common.edit")}</button>
             <button onClick={() => handleDelete(event)} className="w-full bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-destructive/20"><Trash2 className="w-4 h-4"/> {t("common.delete")}</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t("events.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("events.subtitle")}
            </p>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <button onClick={handleCreate} className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">
                <Plus className="w-4 h-4" /> {t("events.new")}
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t("events.loading")}</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center py-12 border-2 border-dashed border-border rounded-xl">
              <div className="text-center space-y-3">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground font-medium">{t("events.empty")}</p>
                <p className="text-sm text-muted-foreground">{t("events.emptyHint")}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
        <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} initialData={selectedEvent || undefined} />
        <Dialog open={eventToDelete !== null} onOpenChange={(open) => !open && setEventToDelete(null)}>
          <DialogContent className="max-w-md border-border bg-card">
            <DialogHeader>
              <DialogTitle>{t("events.deleteConfirm")}</DialogTitle>
              <DialogDescription>
                {t("events.deleteBody", {
                  name: eventToDelete?.nome ? `"${eventToDelete.nome}"` : t("events.thisEvent"),
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row justify-end gap-2 space-x-0">
              <Button variant="outline" onClick={() => setEventToDelete(null)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                {t("common.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default EventsPage;
