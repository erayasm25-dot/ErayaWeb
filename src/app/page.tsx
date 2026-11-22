import HeroSection from "@/components/homepage/HeroSection";
import CategorySection from "@/components/homepage/CategorySection";
import NewArrivalsSection from "@/components/homepage/NewArrivalsSection";
import FeaturedSection from "@/components/homepage/FeaturedSection";
import BestsellersSection from "@/components/homepage/BestsellersSection";
import EditorialSection from "@/components/homepage/EditorialSection";
import CollectionsSection from "@/components/homepage/CollectionsSection";
import CustomOrdersSection from "@/components/homepage/CustomOrdersSection";
import RecentlyViewedSection from "@/components/homepage/RecentlyViewedSection";
import InstagramSection from "@/components/homepage/InstagramSection";
import { listProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProducts();

  return (
    <>
      <HeroSection />
      <CategorySection />
      <NewArrivalsSection products={products} />
      <FeaturedSection products={products} />
      <BestsellersSection products={products} />
      <EditorialSection />
      <CollectionsSection products={products} />
      <CustomOrdersSection />
      <RecentlyViewedSection />
      <InstagramSection />
    </>
  );
}
