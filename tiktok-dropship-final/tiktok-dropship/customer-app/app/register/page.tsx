"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { generateReferralCode, isValidCambodianPhone, normalizePhone, phoneToEmail } from "@/lib/utils";
import Logo from "@/components/layout/Logo";

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md border-white/10 bg-[#161823] text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-sm text-white/60">Loading...</p>
        </CardHeader>
      </Card>
    </div>
  );
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isValidCambodianPhone(phone)) {
      setLoading(false);
      setError("Please enter a valid Cambodian phone number (e.g. 012345678 or +85512345678)");
      return;
    }

    const normalizedPhone = normalizePhone(phone);

    // 1. Sign up with Supabase Auth using a deterministic email derived from the phone number
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: phoneToEmail(phone),
      password,
      options: {
        data: { username, phone: normalizedPhone },
      },
    });

    if (authError || !authData.user) {
      setLoading(false);
      setError(authError?.message || "Registration failed");
      return;
    }

    // 2. Create profile
    let referredBy = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode.trim().toUpperCase())
        .single();
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      phone: normalizedPhone,
      username: username || null,
      referral_code: generateReferralCode(),
      referred_by: referredBy,
    });

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    // 3. Create referral chain (level 1, 2, 3)
    if (referredBy) {
      await supabase.from("referrals").insert({
        referrer_id: referredBy,
        referred_id: authData.user.id,
        level: 1,
      });

      const { data: level1 } = await supabase
        .from("profiles")
        .select("referred_by")
        .eq("id", referredBy)
        .single();

      if (level1?.referred_by) {
        await supabase.from("referrals").insert({
          referrer_id: level1.referred_by,
          referred_id: authData.user.id,
          level: 2,
        });

        const { data: level2 } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("id", level1.referred_by)
          .single();

        if (level2?.referred_by) {
          await supabase.from("referrals").insert({
            referrer_id: level2.referred_by,
            referred_id: authData.user.id,
            level: 3,
          });
        }
      }
    }

    setLoading(false);
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
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-sm text-white/60">Start earning commissions today</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Username</label>
              <Input
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-white/10 bg-black text-white placeholder:text-white/40 focus-visible:ring-[#25F4EE]"
              />
            </div>
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Referral Code (Optional)</label>
              <Input
                placeholder="REFXXXXX"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
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
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-[#25F4EE] hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
