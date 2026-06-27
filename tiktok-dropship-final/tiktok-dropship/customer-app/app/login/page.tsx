"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { isValidCambodianPhone, phoneToEmail } from "@/lib/utils";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isValidCambodianPhone(phone)) {
      setLoading(false);
      setError("Please enter a valid Cambodian phone number (e.g. 012345678 or +85512345678)");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(phone),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-[#25F4EE]/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-[#FE2C55]/10 blur-3xl" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-white/10 bg-[#161823] text-white">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo className="h-16 w-16" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <p className="text-sm text-white/60">Login to your TikTok Drop account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Phone Number</label>
              <Input
                type="tel"
                placeholder="012345678 or +85512345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="border-white/10 bg-black text-white placeholder:text-white/40 focus-visible:ring-[#25F4EE]"
              />
              <p className="text-xs text-white/40">No SMS verification needed. Use any Cambodian number.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-white/10 bg-black text-white placeholder:text-white/40 focus-visible:ring-[#25F4EE]"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-[#FE2C55]/10 p-3 text-sm text-[#FE2C55]">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[#25F4EE] hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
