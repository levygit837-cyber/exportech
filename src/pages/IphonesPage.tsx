import { motion } from "motion/react";
import { Link } from "react-router";
import ProductCard from "../components/ProductCard";
import {
  formatBRL,
  products,
  USD_BRL_RATE,
} from "../data/products";
import { stagger } from "../lib/motion";

export default function IphonesPage() {
  return (
    <>
      <title>iPhones | Exportech</title>
      <meta
        name="description"
        content="Confira todos os iPhones catalogados pela Exportech, com acabamentos, armazenamentos e estimativas em BRL."
      />

      <section className="pb-24 pt-32 md:pb-32 md:pt-40">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
          <nav aria-label="Navegação estrutural" className="text-[12px] text-zinc-500">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="transition-colors hover:text-zinc-200">
                  Início
                </Link>
              </li>
              <li aria-hidden className="text-zinc-700">
                /
              </li>
              <li aria-current="page" className="text-zinc-300">
                iPhones
              </li>
            </ol>
          </nav>

          <div className="mt-10 max-w-[720px]">
            <h1 className="text-fluid-display max-w-[10ch] text-zinc-50">
              Escolha seu iPhone.
            </h1>
            <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-zinc-400">
              Selecione armazenamento e acabamento para conferir a estimativa atual de cada configuração.
            </p>
          </div>

          <details
            className="group mt-8 max-w-[720px] border-l border-white/10 pl-4 text-[12px] text-zinc-500"
          >
            <summary className="min-h-11 w-fit cursor-pointer content-center font-medium text-zinc-400 transition-colors hover:text-zinc-200">
              Como os valores são calculados
            </summary>
            <p className="max-w-[64ch] pb-2 leading-relaxed text-zinc-500">
              A estimativa em BRL usa a taxa estática de USD 1 = {formatBRL(USD_BRL_RATE, true)} e arredondamento comercial. A referência original em USD permanece visível em cada card.
            </p>
          </details>

          <motion.div
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            className="catalog-grid mt-12"
            data-testid="catalog-grid"
          >
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                variant="catalog"
              />
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
