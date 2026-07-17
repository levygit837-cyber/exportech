import BentoBenefits from "../components/BentoBenefits";
import BuyingGuide from "../components/BuyingGuide";
import Hero, { type HeroMode } from "../components/Hero";
import ProductShowcase from "../components/ProductShowcase";

export default function HomePage({ heroMode }: { heroMode: HeroMode }) {
  return (
    <>
      <title>Exportech | Catálogo premium de iPhone</title>
      <meta
        name="description"
        content="Compare modelos, armazenamentos, acabamentos e estimativas de iPhone em BRL, com referência original em USD."
      />
      <Hero mode={heroMode} />
      <ProductShowcase />
      <BentoBenefits />
      <BuyingGuide />
    </>
  );
}
