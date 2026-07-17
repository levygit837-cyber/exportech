import BentoBenefits from "../components/BentoBenefits";
import BuyingGuide from "../components/BuyingGuide";
import Hero from "../components/Hero";
import ProductShowcase from "../components/ProductShowcase";

export default function HomePage() {
  return (
    <>
      <title>Exportech | Catálogo premium de iPhone</title>
      <meta
        name="description"
        content="Compare modelos, armazenamentos, acabamentos e estimativas de iPhone em BRL, com referência original em USD."
      />
      <Hero />
      <ProductShowcase />
      <BentoBenefits />
      <BuyingGuide />
    </>
  );
}
