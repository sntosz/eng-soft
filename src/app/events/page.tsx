"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";
import { Calendar, MapPin, Clock, Ticket, Plus, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Event } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { EventModal } from "@/components/EventModal";
import { EventTicketModal } from "@/components/EventTicketModal";
import { isValidImageUrl } from "@/lib/utils";

const EventsPage = () => {
  const { user } = useCurrentUser();
  const isAdmin = user?.e_admin === true;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Estados do Modal de Compra de Ingresso
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [eventForTicket, setEventForTicket] = useState<Event | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data, error: sbError } = await supabase
          .from("eventos")
          .select("*")
          .order("data_evento", { ascending: true });

        if (sbError) {
          throw sbError;
        }

        setEvents(data || []);
      } catch (err: any) {
        console.error("Erro ao buscar eventos:", err);
        setError(err.message || "Erro ao buscar eventos");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const handleCreate = () => { setSelectedEvent(null); setIsModalOpen(true); };
  const handleEdit = (e: Event) => { setSelectedEvent(e); setIsModalOpen(true); };
  const handleBuyTicket = (e: Event) => {
    setEventForTicket(e);
    setIsTicketModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      const { error } = await supabase.from("eventos").delete().eq("id", id);
      if (error) throw error;
      setEvents(events.filter(e => e.id !== id));
    } catch(err: any) { alert("Erro ao excluir: " + err.message); }
  };

  const handleSubmit = async (data: Partial<Event>) => {
    try {
      const formattedData = { ...data, data_evento: data.data_evento ? new Date(data.data_evento).toISOString() : new Date().toISOString() };
      if (data.id) {
        const { error } = await supabase.from("eventos").update(formattedData).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("eventos").insert([formattedData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      const { data: res } = await supabase.from("eventos").select("*").order("data_evento", { ascending: true });
      setEvents(res || []);
    } catch(err: any) { alert("Erro ao salvar: " + err.message); }
  };

  const EventCard = ({ event }: { event: Event }) => {
    const date = new Date(event.data_evento);
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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
                  Gratuito
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
              {event.descricao || "Participe de mais um evento incrível da nossa atlética."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{event.local || "Local a definir"}</span>
            </span>
            <span className="flex items-center gap-2 md:col-span-2 mt-4">
              <button
                onClick={() => handleBuyTicket(event)}
                className="gold-gradient text-primary-foreground px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto justify-center cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                Garantir Ingresso
              </button>
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-col gap-2 p-4 md:border-l border-border bg-secondary/10 justify-center min-w-[120px]">
             <button onClick={() => handleEdit(event)} className="w-full border px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-secondary bg-background"><Edit2 className="w-4 h-4"/> Editar</button>
             <button onClick={() => handleDelete(event.id)} className="w-full bg-destructive/10 text-destructive px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-destructive/20"><Trash2 className="w-4 h-4"/> Excluir</button>
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
              Eventos
            </h1>
            <p className="text-sm text-muted-foreground">
              Festas, competições e eventos sociais da atlética
            </p>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto">
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <button onClick={handleCreate} className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo Evento
              </button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Carregando eventos...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center py-12 border-2 border-dashed border-border rounded-xl">
              <div className="text-center space-y-3">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                <p className="text-muted-foreground font-medium">Nenhum evento agendado</p>
                <p className="text-sm text-muted-foreground">Fique de olho nas nossas redes sociais para novidades.</p>
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

        {/* Modal de Adicionar / Editar Evento */}
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedEvent || undefined}
        />

        {/* Modal de Compra / Reserva de Ingresso */}
        <EventTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          event={eventForTicket}
        />
      </main>
    </div>
  );
};

export default EventsPage;
