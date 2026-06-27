"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wallet } from "lucide-react";

const methods = [
  { id: "usdt_trc20", name: "USDT TRC20", description: "Send USDT to TRC20 address" },
  { id: "aba", name: "ABA Bank", description: "Transfer to ABA account" },
  { id: "acleda", name: "ACLEDA Bank", description: "Transfer to ACLEDA account" },
  { id: "bakong", name: "Bakong KHQR", description: "Scan KHQR code" },
];

export default function DepositPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("usdt_trc20");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("deposits").insert({
      user_id: user.id,
      amount: parseFloat(amount),
      method,
      transaction_id: transactionId || null,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Deposit request submitted. Awaiting admin approval.");
      setAmount("");
      setTransactionId("");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Deposit</h1>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Add Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (USD)</label>
                <Input
                  type="number"
                  min="10"
                  step="0.01"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="grid gap-3">
                  {methods.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                        method === m.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{m.name}</span>
                        <div
                          className={`h-4 w-4 rounded-full border ${
                            method === m.id ? "border-4 border-primary" : "border-muted-foreground"
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction ID / Reference</label>
                <Input
                  placeholder="Enter transaction reference"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              {message && (
                <p className={`rounded-lg p-3 text-sm ${message.includes("error") ? "bg-destructive/10 text-destructive" : "bg-green-50 text-green-700"}`}>
                  {message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Deposit Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
