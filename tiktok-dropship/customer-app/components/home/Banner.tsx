"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Banner() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
      <div className="relative px-6 py-12 md:py-16 md:px-12">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Earn commission on every task
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">
            TikTok Drop Shopping
          </h1>
          <p className="mb-6 text-base md:text-lg text-white/90">
            Complete simple dropshipping tasks, earn instant commissions, and withdraw your earnings. 
            Join thousands of members earning daily.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-white/90">
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
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
