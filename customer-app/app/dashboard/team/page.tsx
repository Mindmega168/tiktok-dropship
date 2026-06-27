"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TeamMember {
  id: string;
  username: string | null;
  phone: string;
  level: number;
  total_profit: number;
}

export default function TeamPage() {
  const [profile, setProfile] = useState<any>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [commissions, setCommissions] = useState(0);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(profileData);

    const { data: teamData } = await supabase
      .from("referrals")
      .select("level, referred_id, profiles(id, username, phone, total_profit)")
      .eq("referrer_id", user.id)
      .order("level", { ascending: true });

    if (teamData) {
      const formattedTeam = teamData.map((item: any) => ({
        id: item.referred_id,
        level: item.level,
        username: item.profiles?.username,
        phone: item.profiles?.phone,
        total_profit: item.profiles?.total_profit || 0,
      }));
      setTeam(formattedTeam);
    }

    const { data: commissionData } = await supabase
      .from("referral_commissions")
      .select("amount")
      .eq("referrer_id", user.id);

    if (commissionData) {
      setCommissions(commissionData.reduce((sum, c) => sum + c.amount, 0));
    }
  };

  const referralLink = profile
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${profile.referral_code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const levelCounts = {
    1: team.filter((m) => m.level === 1).length,
    2: team.filter((m) => m.level === 2).length,
    3: team.filter((m) => m.level === 3).length,
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">My Team</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Level 1 (10%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{levelCounts[1]}</div>
            <p className="text-xs text-muted-foreground">Direct referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Level 2 (5%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{levelCounts[2]}</div>
            <p className="text-xs text-muted-foreground">Indirect referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Level 3 (2%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{levelCounts[3]}</div>
            <p className="text-xs text-muted-foreground">Extended referrals</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite Friends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Share your referral link and earn commissions from their task earnings.
          </p>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly />
            <Button onClick={copyLink} variant="outline">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-4 rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">Total Referral Commissions</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(commissions)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {team.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members yet. Share your link to start building your team.</p>
          ) : (
            <div className="space-y-3">
              {team.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div>
                    <p className="font-medium">{member.username || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{member.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Level {member.level}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Profit: {formatCurrency(member.total_profit)}
                    </p>
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
