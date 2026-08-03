import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name")?.trim() || "";
  const email = url.searchParams.get("email")?.trim() || "";
  const password = url.searchParams.get("password") || "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing name, email or password" }, { status: 400 });
  }

  if (!JWT_SECRET) {
    return NextResponse.json({ error: "Server JWT secret not set" }, { status: 500 });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from("members")
      .insert({ name, email, password_hash })
      .select("id,name,email")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const token = jwt.sign({ sub: data.id, email: data.email, name: data.name }, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({ user: data, token });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
