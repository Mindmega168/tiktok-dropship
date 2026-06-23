"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, CheckCircle, Crown } from "lucide-react";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  commission: number;
  category: string;
}

export default function TasksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [vipLevel, setVipLevel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [completedTask, setCompletedTask] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: productsData }, { data: profileData }] = await Promise.all([
      supabase.from("products").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
      supabase.from("profiles").select("*").eq("id", user.id).single(),
    ]);

    setProducts(productsData || []);
    setProfile(profileData);

    if (profileData) {
      const { data: vipData } = await supabase
        .from("vip_levels")
        .select("*")
        .eq("level", profileData.vip_level)
        .single();
      setVipLevel(vipData);
    }
  };

  const handleAutoMatch = async () => {
    if (products.length === 0) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    await completeTask(randomProduct);
  };

  const completeTask = async (product: Product) => {
    setLoading(true);
    setMessage("");
    setCompletedTask(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    // Refresh profile to ensure latest task count
    const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

    if (!currentProfile) {
      setMessage("Profile not found.");
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const lastTaskDate = currentProfile.last_task_date;

    // Reset counter if new day
    let tasksToday = currentProfile.tasks_completed_today;
    if (lastTaskDate !== today) {
      tasksToday = 0;
    }

    if (tasksToday >= vipLevel?.tasks_per_day) {
      setMessage(`You have reached your daily task limit (${vipLevel?.tasks_per_day}).`);
      setLoading(false);
      return;
    }

    // Create task
    const orderNumber = generateOrderNumber();
    const { data: taskData, error: taskError } = await supabase
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

    if (taskError) {
      setMessage(taskError.message);
      setLoading(false);
      return;
    }

    // Update profile balance and task count
    const newBalance = currentProfile.balance + product.commission;
    const newProfit = currentProfile.total_profit + product.commission;
    const newTasksToday = tasksToday + 1;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        balance: newBalance,
        total_profit: newProfit,
        tasks_completed_today: newTasksToday,
        last_task_date: today,
      })
      .eq("id", user.id);

    if (updateError) {
      setMessage(updateError.message);
      setLoading(false);
      return;
    }

    // Distribute referral commissions
    await distributeReferralCommissions(user.id, product.commission, taskData.id);

    // Check VIP upgrade based on total deposit
    await checkVipUpgrade(user.id);

    setCompletedTask(taskData);
    setProfile({
      ...currentProfile,
      balance: newBalance,
      total_profit: newProfit,
      tasks_completed_today: newTasksToday,
      last_task_date: today,
    });
    setMessage(`Task completed! You earned ${formatCurrency(product.commission)}.`);
    setLoading(false);
  };

  const distributeReferralCommissions = async (userId: string, commission: number, taskId: string) => {
    const { data: referrals } = await supabase
      .from("referrals")
      .select("*")
      .eq("referred_id", userId);

    if (!referrals || referrals.length === 0) return;

    for (const ref of referrals) {
      const rate = ref.level === 1 ? 0.1 : ref.level === 2 ? 0.05 : 0.02;
      const amount = commission * rate;

      await supabase.from("referral_commissions").insert({
        referrer_id: ref.referrer_id,
        task_id: taskId,
        level: ref.level,
        amount,
      });

      await supabase.rpc("increment_balance", {
        user_id: ref.referrer_id,
        amount,
      });
    }
  };

  const checkVipUpgrade = async (userId: string) => {
    const { data: p } = await supabase.from("profiles").select("total_deposit, vip_level").eq("id", userId).single();
    if (!p) return;

    const { data: levels } = await supabase
      .from("vip_levels")
      .select("*")
      .lte("min_total_deposit", p.total_deposit)
      .order("level", { ascending: false })
      .limit(1);

    if (levels && levels.length > 0 && levels[0].level > p.vip_level) {
      await supabase.from("profiles").update({ vip_level: levels[0].level }).eq("id", userId);
    }
  };

  const tasksRemaining = Math.max(
    0,
    (vipLevel?.tasks_per_day || 0) - (profile?.tasks_completed_today || 0)
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Center</h1>
          <p className="text-sm text-muted-foreground">Complete tasks to earn commissions</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold">VIP {profile?.vip_level}</span>
          <span className="text-sm text-muted-foreground">| {tasksRemaining} tasks left today</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold">Auto Match Product</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            We&apos;ll automatically match you with a product task.
          </p>
          <Button size="lg" onClick={handleAutoMatch} disabled={loading || tasksRemaining === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Start Dropshipping Task
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {completedTask && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Task Completed!</span>
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <p><span className="text-muted-foreground">Order:</span> {completedTask.order_number}</p>
              <p><span className="text-muted-foreground">Product:</span> {completedTask.product_name}</p>
              <p><span className="text-muted-foreground">Amount:</span> {formatCurrency(completedTask.amount)}</p>
              <p><span className="text-muted-foreground">Commission:</span> +{formatCurrency(completedTask.commission)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {message && !completedTask && (
        <div className={`mb-6 rounded-lg p-4 text-sm ${message.includes("error") || message.includes("limit") ? "bg-destructive/10 text-destructive" : "bg-green-50 text-green-700"}`}>
          {message}
        </div>
      )}

      <h2 className="mb-4 text-xl font-bold">Available Products</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              <Image src={product.image_url} alt={product.name} fill className="object-cover" />
            </div>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{product.name}</h3>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Price: {formatCurrency(product.price)}</span>
                <span className="font-bold text-green-600">+{formatCurrency(product.commission)}</span>
              </div>
              <Button
                className="mt-3 w-full"
                size="sm"
                onClick={() => completeTask(product)}
                disabled={loading || tasksRemaining === 0}
              >
                Complete Task
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
