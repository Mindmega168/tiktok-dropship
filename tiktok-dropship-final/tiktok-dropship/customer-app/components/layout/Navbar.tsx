"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="text-xl font-bold tracking-tight text-white">
            TikTok <span className="tiktok-text-gradient">Drop</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-[#25F4EE] transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-white/80 hover:text-[#25F4EE] transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard/tasks" className="text-sm font-medium text-white/80 hover:text-[#25F4EE] transition-colors">
            Tasks
          </Link>
          <Link href="/dashboard/team" className="text-sm font-medium text-white/80 hover:text-[#25F4EE] transition-colors">
            Team
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10 hover:text-[#25F4EE]">
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4" />
              Account
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10 hover:text-[#FE2C55]">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-black px-4 py-4 space-y-3">
          <Link href="/" className="block py-2 font-medium text-white/80 hover:text-[#25F4EE]" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/dashboard" className="block py-2 font-medium text-white/80 hover:text-[#25F4EE]" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link href="/dashboard/tasks" className="block py-2 font-medium text-white/80 hover:text-[#25F4EE]" onClick={() => setIsOpen(false)}>
            Tasks
          </Link>
          <Link href="/dashboard/team" className="block py-2 font-medium text-white/80 hover:text-[#25F4EE]" onClick={() => setIsOpen(false)}>
            Team
          </Link>
          <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 hover:text-[#FE2C55]" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
