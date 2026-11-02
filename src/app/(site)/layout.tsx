import { Suspense } from "react";
import AppBar from "@/components/shared/AppBar";
import Footer from "@/components/shared/Footer";
import Logo from "@/components/shared/Logo";
import Providers from "@/components/shared/Providers";
import TabBar from "@/components/shared/TabBar";
import { getProducts } from "@/data/catalogue";
import { photoCredits } from "@/data/photos";

// Public site chrome: app bar, tab bar, footer and the enquiry basket.
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const products = await getProducts();

  return (
    <Providers products={products}>
      <Suspense fallback={<AppBarFallback />}>
        <AppBar logo={<Logo priority />} />
      </Suspense>
      <main className="flex-1">{children}</main>
      <div data-chrome data-footer className="pb-tabbar md:pb-0">
        <Footer credits={photoCredits(products)} />
      </div>
      <Suspense>
        <TabBar />
      </Suspense>
    </Providers>
  );
}

function AppBarFallback() {
  return (
    <div data-chrome className="sticky top-0 z-40 bg-background" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex h-14 max-w-[1800px] items-center px-4 md:h-[72px] md:px-6 xl:px-10">
        <Logo />
      </div>
    </div>
  );
}
