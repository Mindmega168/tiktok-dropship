"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getPaymentMethodLabel } from "@/lib/utils";
import { Deposit } from "@/types";

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    const res = await fetch("/api/deposits");
    const data = await res.json();
    setDeposits(data || []);
  };

  const handleAction = async (deposit: Deposit, action: "approve" | "reject") => {
    await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: deposit.id,
        action,
        user_id: deposit.user_id,
        amount: deposit.amount,
      }),
    });
    fetchDeposits();
  };

  const filteredDeposits =
    filter === "all" ? deposits : deposits.filter((d) => d.status === filter);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Deposit Management</h1>

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
                  <th className="py-3 px-4 text-left font-medium">Reference</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDeposits.map((deposit) => (
                  <tr key={deposit.id}>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{deposit.user?.username || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{deposit.user?.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold">{formatCurrency(deposit.amount)}</td>
                    <td className="py-3 px-4">{getPaymentMethodLabel(deposit.method)}</td>
                    <td className="py-3 px-4">{deposit.transaction_id || "N/A"}</td>
                    <td className="py-3 px-4">{formatDate(deposit.created_at)}</td>
                    <td className="py-3 px-4">
                      {deposit.status === "approved" ? (
                        <Badge className="bg-green-100 text-green-700">Approved</Badge>
                      ) : deposit.status === "rejected" ? (
                        <Badge variant="destructive">Rejected</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {deposit.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAction(deposit, "approve")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(deposit, "reject")}>
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
