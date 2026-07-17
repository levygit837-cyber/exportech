import Nav from "./components/Nav";
import Hero, { type HeroMode } from "./components/Hero";
import ProductShowcase from "./components/ProductShowcase";
import BentoBenefits from "./components/BentoBenefits";
import BuyingGuide from "./components/BuyingGuide";
import Footer from "./components/Footer";

export default function App() {
  const prototypeEnabled =
    import.meta.env.VITE_ENABLE_HERO3D_PROTOTYPE === "true";
  const heroMode: HeroMode =
    prototypeEnabled &&
    new URLSearchParams(window.location.search).get("hero3d") === "1"
      ? "prototype-3d"
      : "static";

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-[#0A0A0A] text-zinc-50">
      <Nav />
      <main>
        <Hero mode={heroMode} />
        <ProductShowcase />
        <BentoBenefits />
        <BuyingGuide />
      </main>
      <Footer />
    </div>
  );
}
