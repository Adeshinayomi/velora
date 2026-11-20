import { Suspense } from "react";
import AnnouncementBar from "@/components/layout/AnnoucementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductDetails from "@/components/product/ProductDetails";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function ProductPageContent({ params }: ProductPageProps) {
  const { slug } = await params;

  return <ProductDetails slug={slug} />;
}

function ProductDetailsFallback() {
  return (
    <main
      aria-busy="true"
      className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-14"
    >
      <div className="aspect-[4/5] animate-pulse bg-[#eeece7]" />
      <div className="space-y-5 pt-8">
        <div className="h-4 w-1/3 animate-pulse bg-[#eeece7]" />
        <div className="h-10 w-2/3 animate-pulse bg-[#eeece7]" />
        <div className="h-5 w-1/4 animate-pulse bg-[#eeece7]" />
        <div className="h-20 animate-pulse bg-[#eeece7]" />
      </div>
    </main>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <Suspense fallback={<ProductDetailsFallback />}>
        <ProductPageContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}