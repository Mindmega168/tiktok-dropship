"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Wallet, Package, Gift, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate, getPaymentMethodLabel } from "@/lib/utils";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [data, setData] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let result;
    switch (activeTab) {
      case "deposits":
        result = await supabase
          .from("deposits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        break;
      case "withdrawals":
        result = await supabase
          .from("withdrawals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        break;
      case "profit":
        result = await supabase
          .from("referral_commissions")
          .select("*, tasks(product_name)")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });
        break;
      case "tasks":
      default:
        result = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
    }

    setData(result?.data || []);
  };

  const tabs = [
    { id: "tasks", label: "Tasks", icon: Package },
    { id: "deposits", label: "Deposits", icon: Wallet },
    { id: "profit", label: "Profit", icon: Gift },
    { id: "withdrawals", label: "Withdrawals", icon: ArrowUpRight },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return <Badge className="bg-green-100 text-green-700">{status}</Badge>;
      case "pending":
        return <Badge variant="secondary">{status}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <History className="h-6 w-6" />
        History
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No {activeTab} history found.</div>
          ) : (
            <div className="divide-y">
              {data.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div>
                    {activeTab === "tasks" && (
                      <>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">{item.order_number}</p>
                      </>
                    )}
                    {activeTab === "deposits" && (
                      <>
                        <p className="font-medium">Deposit via {getPaymentMethodLabel(item.method)}</p>
                        <p className="text-xs text-muted-foreground">Ref: {item.transaction_id || "N/A"}</p>
                      </>
                    )}
                    {activeTab === "withdrawals" && (
                      <>
                        <p className="font-medium">Withdraw via {getPaymentMethodLabel(item.method)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                      </>
                    )}
                    {activeTab === "profit" && (
                      <>
                        <p className="font-medium">Level {item.level} Commission</p>
                        <p className="text-xs text-muted-foreground">From task: {item.tasks?.product_name || "N/A"}</p>
                      </>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                  </div>
                  <div className="text-right">
                    {activeTab !== "profit" ? (
                      <p className={`font-bold ${activeTab === "withdrawals" ? "text-destructive" : "text-green-600"}`}>
                        {activeTab === "withdrawals" ? "-" : "+"}
                        {formatCurrency(item.amount || item.commission || 0)}
                      </p>
                    ) : (
                      <p className="font-bold text-green-600">+{formatCurrency(item.amount)}</p>
                    )}
                    <div className="mt-1">{getStatusBadge(item.status)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
