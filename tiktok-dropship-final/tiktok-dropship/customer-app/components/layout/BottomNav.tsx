"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Package, Users, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/deposit", label: "Wallet", icon: Wallet },
  { href: "/dashboard/tasks", label: "Tasks", icon: Package },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/history", label: "History", icon: History },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black md:hidden">
      <nav className="mx-auto flex h-16 max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive ? "text-[#FE2C55]" : "text-white/60 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[#FE2C55]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
