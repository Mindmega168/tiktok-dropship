import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Wallet, TrendingUp, DollarSign, Package, Crown } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: vipLevel } = await supabase
    .from("vip_levels")
    .select("*")
    .eq("level", profile?.vip_level || 0)
    .single();

  const { data: recentTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (profile?.is_frozen) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-[#FE2C55]/50 bg-[#FE2C55]/10 p-8 text-center">
          <h2 className="text-xl font-bold text-[#FE2C55]">Account Frozen</h2>
          <p className="mt-2 text-white/60">Please contact support for assistance.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/60">Welcome back, {profile?.username || profile?.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-[#25F4EE]" />
          <span className="font-semibold text-white">VIP {profile?.vip_level}</span>
          <span className="text-sm text-white/60">
            ({profile?.tasks_completed_today || 0}/{vipLevel?.tasks_per_day || 0} tasks today)
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-[#161823] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Balance</CardTitle>
            <Wallet className="h-4 w-4 text-[#25F4EE]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(profile?.balance || 0)}</div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#161823] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#FE2C55]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(profile?.total_profit || 0)}</div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-[#161823] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/60">Total Deposit</CardTitle>
            <DollarSign className="h-4 w-4 text-[#25F4EE]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(profile?.total_deposit || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-[#161823] text-white">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild className="bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90">
                <Link href="/dashboard/deposit">Deposit</Link>
              </Button>
              <Button variant="outline" asChild className="border-white/10 bg-black text-white hover:bg-white/10 hover:text-[#25F4EE]">
                <Link href="/dashboard/withdraw">Withdraw</Link>
              </Button>
              <Button variant="outline" asChild className="border-white/10 bg-black text-white hover:bg-white/10 hover:text-[#25F4EE]">
                <Link href="/dashboard/tasks">Start Task</Link>
              </Button>
              <Button variant="outline" asChild className="border-white/10 bg-black text-white hover:bg-white/10 hover:text-[#25F4EE]">
                <Link href="/dashboard/team">My Team</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#161823] text-white">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks && recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg bg-black/40 p-3">
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-[#25F4EE]" />
                      <div>
                        <p className="text-sm font-medium text-white">{task.product_name}</p>
                        <p className="text-xs text-white/50">{task.order_number}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#FE2C55]">+{formatCurrency(task.commission)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60">No tasks completed yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
