import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const supabase = createServiceRoleClient();

  const { data: admin } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .eq("is_active", true)
    .single();

  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // For default seeded admin with placeholder hash, allow password admin123
  const isValid = admin.password_hash.startsWith("$2a$")
    ? await bcrypt.compare(password, admin.password_hash)
    : password === "admin123";

  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_token", admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return NextResponse.json({ success: true });
}
