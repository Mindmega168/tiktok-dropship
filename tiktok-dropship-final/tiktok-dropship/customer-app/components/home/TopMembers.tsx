"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

interface Member {
  username: string;
  vip_level: number;
}

interface TopMembersProps {
  members: Member[];
}

export default function TopMembers({ members }: TopMembersProps) {
  return (
    <Card className="border-white/10 bg-[#161823] text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-[#FE2C55]" />
          Top Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-white/50">No members yet.</p>
          ) : (
            members.map((member, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-black/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25F4EE] text-black text-sm font-bold">
                    {member.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="font-medium">{member.username || "Anonymous"}</span>
                </div>
                <span className="rounded-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] px-2.5 py-0.5 text-xs font-bold text-black">
                  VIP {member.vip_level}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
