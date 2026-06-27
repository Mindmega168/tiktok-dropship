import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function isAuthenticated() {
  const cookieStore = await cookies();
  return !!cookieStore.get("admin_token")?.value;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("deposits")
    .select("*, profiles(username, phone)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, action, user_id, amount } = await request.json();
  const supabase = createServiceRoleClient();

  if (action === "approve") {
    const { error } = await supabase.rpc("approve_deposit", {
      deposit_id: id,
      user_id,
      amount,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else if (action === "reject") {
    const { error } = await supabase.from("deposits").update({ status: "rejected" }).eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
