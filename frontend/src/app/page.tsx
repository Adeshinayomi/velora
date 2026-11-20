import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromoSection from "@/components/home/PromoSection";

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <PromoSection />
      </main>

      <Footer />
    </>
  );
}