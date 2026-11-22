import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlugDb, listProducts } from "@/lib/db";
import ProductDetail from "@/components/products/ProductDetail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugDb(slug);
  if (!product) return { title: "Product not found — ERAYA" };
  return {
    title: `${product.name} — ERAYA`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlugDb(slug);
  if (!product) notFound();
  const all = await listProducts();
  const same = all.filter((p) => p.category === product.category && p.id !== product.id);
  const others = all.filter((p) => p.category !== product.category && p.id !== product.id);
  const related = [...same, ...others].slice(0, 4);
  return <ProductDetail product={product} related={related} />;
}
