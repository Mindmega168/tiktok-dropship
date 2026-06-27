"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WithdrawPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("usdt_trc20");
  const [accountDetails, setAccountDetails] = useState({
    usdt_address: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [vipLevel, setVipLevel] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: v } = await supabase.from("vip_levels").select("*").eq("level", p?.vip_level || 0).single();
      setProfile(p);
      setVipLevel(v);
    };
    fetchProfile();
  }, [supabase]);

  const canWithdraw = profile && vipLevel && profile.tasks_completed_today >= vipLevel.tasks_per_day;

  const handleWithdraw = async (e: React.FormEvent) => {
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

    if (!canWithdraw) {
      setMessage(`You must complete ${vipLevel?.tasks_per_day} tasks today before withdrawing.`);
      setLoading(false);
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > (profile?.balance || 0)) {
      setMessage("Insufficient balance.");
      setLoading(false);
      return;
    }

    if (withdrawAmount < 10) {
      setMessage("Minimum withdrawal is $10.");
      setLoading(false);
      return;
    }

    const details =
      method === "usdt_trc20"
        ? { usdt_address: accountDetails.usdt_address }
        : {
            bank_name: accountDetails.bank_name,
            account_number: accountDetails.account_number,
            account_name: accountDetails.account_name,
          };

    const { error } = await supabase.from("withdrawals").insert({
      user_id: user.id,
      amount: withdrawAmount,
      method,
      account_details: details,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Withdrawal request submitted. Awaiting admin approval.");
      setAmount("");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">Withdraw</h1>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Withdraw Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(profile?.balance || 0)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tasks today: {profile?.tasks_completed_today || 0} / {vipLevel?.tasks_per_day || 0}
              </p>
            </div>

            {!canWithdraw && profile && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                You must complete {vipLevel?.tasks_per_day} tasks today before you can withdraw.
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
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
                <label className="text-sm font-medium">Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {["usdt_trc20", "bank"].map((m) => (
                    <div
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`cursor-pointer rounded-lg border p-3 text-center transition-colors ${
                        method === m ? "border-primary bg-primary/5" : "hover:bg-muted"
                      }`}
                    >
                      <span className="font-semibold">{m === "usdt_trc20" ? "USDT TRC20" : "Bank Transfer"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {method === "usdt_trc20" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">USDT TRC20 Address</label>
                  <Input
                    placeholder="T..."
                    value={accountDetails.usdt_address}
                    onChange={(e) => setAccountDetails({ ...accountDetails, usdt_address: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bank Name</label>
                    <Input
                      placeholder="ABA / ACLEDA / Other"
                      value={accountDetails.bank_name}
                      onChange={(e) => setAccountDetails({ ...accountDetails, bank_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Number</label>
                    <Input
                      placeholder="Account number"
                      value={accountDetails.account_number}
                      onChange={(e) => setAccountDetails({ ...accountDetails, account_number: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Name</label>
                    <Input
                      placeholder="Account holder name"
                      value={accountDetails.account_name}
                      onChange={(e) => setAccountDetails({ ...accountDetails, account_name: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              {message && (
                <p className={`rounded-lg p-3 text-sm ${message.includes("error") || message.includes("must") || message.includes("Insufficient") || message.includes("Minimum") ? "bg-destructive/10 text-destructive" : "bg-green-50 text-green-700"}`}>
                  {message}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading || !canWithdraw}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request Withdrawal"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
