"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Search } from "lucide-react";
import { Profile } from "@/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data || []);
    setLoading(false);
  };

  const updateUser = async (userId: string, updates: Partial<Profile>) => {
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, updates }),
    });
    fetchUsers();
  };

  const toggleFreeze = async (userId: string, current: boolean) => {
    await updateUser(userId, { is_frozen: !current });
  };

  const updateVip = async (userId: string, level: string) => {
    await updateUser(userId, { vip_level: parseInt(level) });
  };

  const adjustBalance = async (userId: string) => {
    const amount = prompt("Enter amount to add (negative to subtract):");
    if (!amount) return;
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    await updateUser(userId, { balance: user.balance + parseFloat(amount) });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.phone.includes(search) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">User Management</h1>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Users</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by phone or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 md:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Phone</th>
                    <th className="py-3 text-left font-medium">Username</th>
                    <th className="py-3 text-left font-medium">Balance</th>
                    <th className="py-3 text-left font-medium">VIP</th>
                    <th className="py-3 text-left font-medium">Status</th>
                    <th className="py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3">{user.phone}</td>
                      <td className="py-3">{user.username || "N/A"}</td>
                      <td className="py-3">{formatCurrency(user.balance)}</td>
                      <td className="py-3">
                        <select
                          value={user.vip_level}
                          onChange={(e) => updateVip(user.id, e.target.value)}
                          className="rounded border px-2 py-1"
                        >
                          {[0, 1, 2, 3].map((level) => (
                            <option key={level} value={level}>
                              VIP {level}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        {user.is_frozen ? (
                          <Badge variant="destructive">Frozen</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => adjustBalance(user.id)}>
                            Balance
                          </Button>
                          <Button
                            size="sm"
                            variant={user.is_frozen ? "default" : "destructive"}
                            onClick={() => toggleFreeze(user.id, user.is_frozen)}
                          >
                            {user.is_frozen ? "Unfreeze" : "Freeze"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
