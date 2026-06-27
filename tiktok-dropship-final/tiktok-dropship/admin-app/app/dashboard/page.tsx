import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Clock,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = createServiceRoleClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: deposits } = await supabase
    .from("deposits")
    .select("amount, status");

  const { data: withdrawals } = await supabase
    .from("withdrawals")
    .select("amount, status");

  const totalDeposits = deposits?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const totalWithdrawals = withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;
  const pendingDeposits = deposits?.filter((d) => d.status === "pending").length || 0;
  const pendingWithdrawals = withdrawals?.filter((w) => w.status === "pending").length || 0;

  const { data: profitData } = await supabase
    .from("profiles")
    .select("total_profit");
  const totalProfit = profitData?.reduce((sum, p) => sum + p.total_profit, 0) || 0;

  const stats = [
    { label: "Total Users", value: totalUsers || 0, icon: Users },
    { label: "Total Deposits", value: formatCurrency(totalDeposits), icon: Wallet },
    { label: "Total Withdrawals", value: formatCurrency(totalWithdrawals), icon: ArrowUpRight },
    { label: "Total Profit", value: formatCurrency(totalProfit), icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span>Pending Deposits</span>
                <span className="font-bold">{pendingDeposits}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <span>Pending Withdrawals</span>
                <span className="font-bold">{pendingWithdrawals}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
