import { ReactNode } from "react";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <Navbar />
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
