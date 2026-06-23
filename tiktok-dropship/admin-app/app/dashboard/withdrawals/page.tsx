"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getPaymentMethodLabel } from "@/lib/utils";
import { Withdrawal } from "@/types";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const res = await fetch("/api/withdrawals");
    const data = await res.json();
    setWithdrawals(data || []);
  };

  const handleAction = async (withdrawal: Withdrawal, action: "approve" | "reject") => {
    await fetch("/api/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: withdrawal.id,
        action,
        user_id: withdrawal.user_id,
        amount: withdrawal.amount,
      }),
    });
    fetchWithdrawals();
  };

  const filteredWithdrawals =
    filter === "all" ? withdrawals : withdrawals.filter((w) => w.status === filter);

  const renderAccountDetails = (withdrawal: Withdrawal) => {
    const details = withdrawal.account_details;
    if (withdrawal.method === "usdt_trc20") {
      return <span className="text-xs">{details.usdt_address}</span>;
    }
    return (
      <div className="text-xs">
        <p>{details.bank_name}</p>
        <p>{details.account_number}</p>
        <p>{details.account_name}</p>
      </div>
    );
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Withdrawal Management</h1>

      <div className="mb-4 flex gap-2">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              filter === status
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">User</th>
                  <th className="py-3 px-4 text-left font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Method</th>
                  <th className="py-3 px-4 text-left font-medium">Account Details</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{withdrawal.user?.username || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{withdrawal.user?.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">{formatCurrency(withdrawal.amount)}</td>
                    <td className="py-3 px-4">{getPaymentMethodLabel(withdrawal.method)}</td>
                    <td className="py-3 px-4">{renderAccountDetails(withdrawal)}</td>
                    <td className="py-3 px-4">{formatDate(withdrawal.created_at)}</td>
                    <td className="py-3 px-4">
                      {withdrawal.status === "approved" ? (
                        <Badge className="bg-green-100 text-green-700">Approved</Badge>
                      ) : withdrawal.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAction(withdrawal, "approve")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(withdrawal, "reject")}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
