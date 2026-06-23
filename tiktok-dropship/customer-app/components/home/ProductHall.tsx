"use client";

import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface ProductHallProps {
  products: Product[];
}

export default function ProductHall({ products }: ProductHallProps) {
  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Hall</h2>
        <span className="text-sm text-muted-foreground">Popular items</span>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              <Image
                src={product.image_url || "https://placehold.co/300x300"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="truncate font-semibold">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold">{formatCurrency(product.price)}</span>
                <span className="text-xs text-green-600">+{formatCurrency(product.commission)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
