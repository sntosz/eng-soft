import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/authServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  return NextResponse.json(
    { user },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}

