"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Logo from "@/components/layout/Logo";

export default function Banner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#161823] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#25F4EE]/10 via-transparent to-[#FE2C55]/10" />
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#FE2C55]/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#25F4EE]/20 blur-3xl" />

      <div className="relative px-6 py-12 md:py-16 md:px-12">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#25F4EE]/30 bg-[#25F4EE]/10 px-4 py-1.5 text-sm font-medium text-[#25F4EE] backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Earn commission on every task
          </div>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
            TikTok <span className="tiktok-text-gradient">Drop Shopping</span>
          </h1>
          <p className="mb-6 text-base md:text-lg text-white/70">
            Complete simple dropshipping tasks, earn instant commissions, and withdraw your earnings. 
            Join thousands of members earning daily.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90">
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-[#25F4EE]">
              <Link href="/login">
                Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
