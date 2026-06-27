import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const today = new Date().toISOString().split("T")[0];
  const lastTaskDate = profile.last_task_date;
  let tasksToday = profile.tasks_completed_today;

  if (lastTaskDate !== today) {
    tasksToday = 0;
  }

  const { data: vipLevel } = await supabase
    .from("vip_levels")
    .select("tasks_per_day")
    .eq("level", profile.vip_level)
    .single();

  if (tasksToday >= (vipLevel?.tasks_per_day || 0)) {
    return NextResponse.json({ error: "Daily task limit reached" }, { status: 400 });
  }

  const orderNumber = generateOrderNumber();

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      product_id: product.id,
      order_number: orderNumber,
      product_name: product.name,
      amount: product.price,
      commission: product.commission,
      status: "completed",
    })
    .select()
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: taskError?.message || "Task creation failed" }, { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      balance: profile.balance + product.commission,
      total_profit: profile.total_profit + product.commission,
      tasks_completed_today: tasksToday + 1,
      last_task_date: today,
    })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Referral commissions
  const { data: referrals } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_id", user.id);

  if (referrals && referrals.length > 0) {
    for (const ref of referrals) {
      const rate = ref.level === 1 ? 0.1 : ref.level === 2 ? 0.05 : 0.02;
      const amount = product.commission * rate;

      await supabase.from("referral_commissions").insert({
        referrer_id: ref.referrer_id,
        task_id: task.id,
        level: ref.level,
        amount,
      });

      await supabase.rpc("increment_balance", {
        user_id: ref.referrer_id,
        amount,
      });
    }
  }

  // VIP upgrade check
  const { data: levels } = await supabase
    .from("vip_levels")
    .select("*")
    .lte("min_total_deposit", profile.total_deposit)
    .order("level", { ascending: false })
    .limit(1);

  if (levels && levels.length > 0 && levels[0].level > profile.vip_level) {
    await supabase.from("profiles").update({ vip_level: levels[0].level }).eq("id", user.id);
  }

  return NextResponse.json({ task, newBalance: profile.balance + product.commission });
}
