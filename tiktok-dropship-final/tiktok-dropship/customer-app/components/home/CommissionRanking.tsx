"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RankingUser {
  username: string;
  total_profit: number;
}

interface CommissionRankingProps {
  users: RankingUser[];
}

export default function CommissionRanking({ users }: CommissionRankingProps) {
  return (
    <Card className="border-white/10 bg-[#161823] text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-[#25F4EE]" />
          Commission Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-white/50">No ranking data yet.</p>
          ) : (
            users.map((user, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-black/40 p-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                    ${index === 0 ? "bg-[#FE2C55] text-white" : 
                      index === 1 ? "bg-[#25F4EE] text-black" : 
                      index === 2 ? "bg-white/20 text-white" : "bg-white/10 text-white/60"}
                  `}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{user.username || "Anonymous"}</span>
                </div>
                <span className="font-bold text-[#25F4EE]">{formatCurrency(user.total_profit)}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
