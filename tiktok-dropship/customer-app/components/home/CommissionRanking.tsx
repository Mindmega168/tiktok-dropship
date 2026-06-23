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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Commission Ranking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ranking data yet.</p>
          ) : (
            users.map((user, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                    ${index === 0 ? "bg-yellow-100 text-yellow-700" : 
                      index === 1 ? "bg-gray-100 text-gray-700" : 
                      index === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}
                  `}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{user.username || "Anonymous"}</span>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(user.total_profit)}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
