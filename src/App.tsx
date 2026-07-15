import Nav from "./components/Nav";
import Hero from "./components/Hero";
import ProductShowcase from "./components/ProductShowcase";
import BentoBenefits from "./components/BentoBenefits";
import BuyingGuide from "./components/BuyingGuide";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-[#0A0A0A] text-zinc-50">
      <Nav />
      <main>
        <Hero />
        <ProductShowcase />
        <BentoBenefits />
        <BuyingGuide />
      </main>
      <Footer />
    </div>
  );
}
