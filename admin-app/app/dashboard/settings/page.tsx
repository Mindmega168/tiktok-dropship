"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VipLevel } from "@/types";

export default function AdminSettingsPage() {
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [siteName, setSiteName] = useState("");
  const [withdrawalMin, setWithdrawalMin] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data: levels } = await supabase.from("vip_levels").select("*").order("level", { ascending: true });
    setVipLevels(levels || []);

    const { data: siteNameSetting } = await supabase.from("site_settings").select("*").eq("key", "site_name").single();
    if (siteNameSetting) setSiteName(siteNameSetting.value);

    const { data: withdrawalMinSetting } = await supabase.from("site_settings").select("*").eq("key", "withdrawal_min").single();
    if (withdrawalMinSetting) setWithdrawalMin(withdrawalMinSetting.value.amount);
  };

  const updateVipLevel = async (id: number, tasksPerDay: string) => {
    await supabase.from("vip_levels").update({ tasks_per_day: parseInt(tasksPerDay) }).eq("id", id);
    fetchSettings();
  };

  const saveSettings = async () => {
    await supabase.from("site_settings").update({ value: siteName }).eq("key", "site_name");
    await supabase.from("site_settings").update({ value: { amount: parseFloat(withdrawalMin) } }).eq("key", "withdrawal_min");
    alert("Settings saved");
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Name</label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Withdrawal (USD)</label>
              <Input
                type="number"
                value={withdrawalMin}
                onChange={(e) => setWithdrawalMin(e.target.value)}
              />
            </div>
            <Button onClick={saveSettings}>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VIP Task Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vipLevels.map((level) => (
                <div key={level.id} className="flex items-center justify-between rounded-lg bg-muted p-4">
                  <div>
                    <p className="font-semibold">{level.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Min deposit: ${level.min_total_deposit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Tasks/day:</label>
                    <Input
                      type="number"
                      className="w-24"
                      value={level.tasks_per_day}
                      onChange={(e) => updateVipLevel(level.id, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
