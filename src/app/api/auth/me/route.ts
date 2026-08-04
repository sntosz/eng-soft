import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;

    return NextResponse.json({
      user: {
        id: decoded.sub,
        email: decoded.email,
        nome: decoded.nome,
        curso: decoded.curso,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
