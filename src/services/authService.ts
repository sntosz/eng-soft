import {supabaseAdmin} from "@/lib/supabaseAdmin";
import {comparePassword, signToken} from "@/lib/auth";

export async function authenticate(email: string, password: string) {

    const res = await supabaseAdmin
        .from("membros")
        .select("id,nome,email,curso,senha_hash")
        .eq("email", email)
        .maybeSingle();

    if (res.error) throw new Error(res.error.message);
    if (res.data) {
        const ok = await comparePassword(password, (res.data as any).senha_hash);
        if (!ok) return null;
        const token = signToken({sub: res.data.id, email: res.data.email, nome: res.data.nome, curso: (res.data as any).curso});
        return {user: {id: res.data.id, nome: res.data.nome, email: res.data.email, curso: (res.data as any).curso}, token};
    }
}
