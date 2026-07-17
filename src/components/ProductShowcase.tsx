import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  formatBRL,
  products,
  USD_BRL_RATE,
} from "../data/products";
import { stagger } from "../lib/motion";
import ProductCard from "./ProductCard";

export default function ProductShowcase() {
  const railRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.12, once: true });

  const scroll = (direction: "next" | "prev") => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-product-card]");
    const step = card ? card.offsetWidth + 20 : 360;
    rail.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="loja"
      ref={sectionRef}
      className="relative border-t border-white/[0.06] py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-fluid-h2 text-zinc-50">Toda a linha.</h2>
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-zinc-400">
              Do essencial ao Pro Max. Escolha armazenamento, acabamento e confira a estimativa atual.
            </p>
            <p className="mt-3 text-[11px] text-zinc-500">
              Cotação base: USD 1 = {formatBRL(USD_BRL_RATE, true)}. Valores arredondados para padrão comercial.
            </p>
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              aria-label="Ver modelos anteriores"
              onClick={() => scroll("prev")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 transition duration-300 hover:bg-white/[0.08] active:scale-[0.96]"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button
              type="button"
              aria-label="Ver próximos modelos"
              onClick={() => scroll("next")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 transition duration-300 hover:bg-white/[0.08] active:scale-[0.96]"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        variants={stagger(0.05)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:px-8"
        ref={railRef}
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            variant="rail"
          />
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </motion.div>
    </section>
  );
}
