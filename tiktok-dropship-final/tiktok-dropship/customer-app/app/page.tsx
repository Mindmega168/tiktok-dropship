import { createClient } from "@/lib/supabase/server";
import Banner from "@/components/home/Banner";
import ProductHall from "@/components/home/ProductHall";
import CommissionRanking from "@/components/home/CommissionRanking";
import TopMembers from "@/components/home/TopMembers";
import { Button } from "@/components/ui/button";
import Logo from "@/components/layout/Logo";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(4);

  const { data: rankingUsers } = await supabase
    .from("profiles")
    .select("username, total_profit")
    .order("total_profit", { ascending: false })
    .limit(5);

  const { data: topMembers } = await supabase
    .from("profiles")
    .select("username, vip_level")
    .order("vip_level", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-9 w-9" />
            <span className="text-xl font-bold tracking-tight">
              TikTok <span className="tiktok-text-gradient">Drop</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-[#25F4EE]">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-4 md:p-6">
        <Banner />
        <ProductHall products={products || []} />
        <div className="grid gap-6 md:grid-cols-2">
          <CommissionRanking users={rankingUsers || []} />
          <TopMembers members={topMembers || []} />
        </div>
      </main>
    </div>
  );
}
