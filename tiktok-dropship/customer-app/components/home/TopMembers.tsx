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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-pink-500" />
          Top Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            members.map((member, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {member.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="font-medium">{member.username || "Anonymous"}</span>
                </div>
                <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
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
