"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";

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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            T
          </div>
          <span className="text-xl font-bold">TikTok Drop</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
            Dashboard
          </Link>
          <Link href="/dashboard/tasks" className="text-sm font-medium hover:text-primary">
            Tasks
          </Link>
          <Link href="/dashboard/team" className="text-sm font-medium hover:text-primary">
            Team
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4" />
              Account
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3">
          <Link href="/" className="block py-2 font-medium" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/dashboard" className="block py-2 font-medium" onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          <Link href="/dashboard/tasks" className="block py-2 font-medium" onClick={() => setIsOpen(false)}>
            Tasks
          </Link>
          <Link href="/dashboard/team" className="block py-2 font-medium" onClick={() => setIsOpen(false)}>
            Team
          </Link>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
