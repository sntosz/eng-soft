"use client";

import {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {LogOut, Users, Mail, BookOpen, Plus, Edit2, ShieldAlert} from "lucide-react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import {Button} from "@/components/ui/button";
import {MemberModal, MemberData} from "@/components/MemberModal";
import {useCurrentUser} from "@/hooks/useCurrentUser";
import { Member } from "@/types";


const MembersPage = () => {
    const {user, loading: userLoading, isLoggedIn} = useCurrentUser();
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAdmin = user?.e_admin === true;

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch("/api/members");
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao buscar membros");
            }

            setMembers(data.members);
        } catch (err: any) {
            console.error("Erro ao buscar membros:", err);
            setError(err.message || "Erro ao buscar membros");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userLoading) return;

        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        if (!isAdmin) {
            setLoading(false);
            return;
        }

        fetchMembers();
    }, [userLoading, isLoggedIn, isAdmin, router, fetchMembers]);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", {method: "POST"});
        router.push("/login");
    };

    const handleCreateMember = () => {
        setSelectedMember(null);
        setIsModalOpen(true);
    };

    const handleEditMember = (member: Member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const handleSubmitMember = async (formData: MemberData) => {
        setIsSubmitting(true);
        try {
            const endpoint = selectedMember
                ? "/api/members/update"
                : "/api/members/create";

            const payload = {
                ...formData,
                ...(selectedMember && {id: selectedMember.id}),
            };

            const res = await fetch(endpoint, {
                method: selectedMember ? "PUT" : "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Erro ao salvar membro");
            }

            await fetchMembers();
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredMembers = members.filter(
        (member) =>
            member.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.curso.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Enquanto o usuário carrega, ou enquanto o redirect para /login acontece
    if (userLoading || !isLoggedIn) {
        return (
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar/>
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Carregando...</p>
                </main>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar/>
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="max-w-md text-center space-y-4">
                        <div
                            className="w-14 h-14 rounded-full bg-destructive/15 flex items-center justify-center mx-auto">
                            <ShieldAlert className="w-7 h-7 text-destructive"/>
                        </div>
                        <h1 className="font-display text-xl font-bold text-foreground">
                            Acesso restrito
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Esta área é exclusiva para administradores da atlética.
                        </p>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/">Voltar para a Home</Link>
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar/>

            <main className="flex-1 overflow-y-auto">
                <header
                    className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary"/>
                            Membros
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {filteredMembers.length} membro{filteredMembers.length !== 1 ? "s" : ""} encontrado{filteredMembers.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleCreateMember}
                            className="gap-2 gold-gradient text-primary-foreground hover:opacity-90"
                        >
                            <Plus className="w-4 h-4"/>
                            <span className="hidden sm:inline">Novo Membro</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-2 text-muted-foreground hover:text-foreground border"
                            aria-label="Sair"
                        >
                            <LogOut className="w-4 h-4"/>
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    {/* Search */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou curso..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>

                    {/* Members Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Carregando membros...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-destructive">{error}</p>
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">
                                {searchTerm ? "Nenhum membro encontrado." : "Nenhum membro disponível."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors card-glow"
                                >
                                    <div className="gold-gradient h-2"/>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-foreground">
                                                {member.nome}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4"/>
                                                {member.curso}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {member.ano_curso}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                                            <Mail className="w-4 h-4 text-primary"/>
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="text-sm text-primary hover:underline truncate"
                                            >
                                                {member.email}
                                            </a>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                      <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary">
                        Ativo
                      </span>
                                            {member.e_admin && (
                                                <span
                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground">
                          Admin
                        </span>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                onClick={() => handleEditMember(member)}
                                                variant="outline"
                                                size="sm"
                                                className="w-full gap-2"
                                            >
                                                <Edit2 className="w-4 h-4"/>
                                                Editar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats */}
                    {!loading && filteredMembers.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-border">
                            <div className="grid grid-cols-3 gap-4 max-w-md">
                                <div className="bg-card border border-border rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-primary">{filteredMembers.length}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Membros</p>
                                </div>
                                <div className="bg-card border border-border rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-primary">
                                        {new Set(filteredMembers.map((m) => m.curso)).size}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">Cursos</p>
                                </div>
                                <div className="bg-card border border-border rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-primary">{filteredMembers.length}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Ativos</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <MemberModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmitMember}
                    initialData={
                        selectedMember
                            ? {
                                id: selectedMember.id,
                                nome: selectedMember.nome,
                                email: selectedMember.email,
                                curso: selectedMember.curso,
                                ano_curso: selectedMember.ano_curso
                            }
                            : undefined
                    }
                    isLoading={isSubmitting}
                />
            </main>
        </div>
    );
};

export default MembersPage;
