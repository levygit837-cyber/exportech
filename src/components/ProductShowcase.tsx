import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CaretRight, CaretLeft } from "@phosphor-icons/react";
import { products, formatBRL } from "../data/products";
import { blurReveal, stagger } from "../lib/motion";

export default function ProductShowcase() {
  const railRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.2, once: true });

  const scroll = (dir: "next" | "prev") => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
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
            <p className="mt-3 max-w-[40ch] text-[15px] text-zinc-400">
              Quatro modelos para cada momento. Compare, escolha o seu.
            </p>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              aria-label="Anterior"
              onClick={() => scroll("prev")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 transition-all duration-300 hover:bg-white/[0.08] active:scale-[0.96]"
            >
              <CaretLeft size={16} weight="regular" />
            </button>
            <button
              aria-label="Próximo"
              onClick={() => scroll("next")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200 transition-all duration-300 hover:bg-white/[0.08] active:scale-[0.96]"
            >
              <CaretRight size={16} weight="regular" />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        variants={stagger(0.06)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-8 lg:gap-6"
        ref={railRef}
      >
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </motion.div>
    </section>
  );
}

function ProductCard({
  product,
  index,
}: {
  product: (typeof products)[number];
  index: number;
}) {
  return (
    <motion.a
      variants={blurReveal}
      data-card
      href={`#${product.id}`}
      className="group relative flex w-[78vw] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/15 hover:bg-white/[0.04] sm:w-[420px]"
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Image well */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-zinc-50 backdrop-blur-md">
            {product.badge}
          </span>
        )}
        <motion.img
          src={product.image}
          alt={product.name}
          loading={index === 0 ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_30%,transparent_50%,rgba(10,10,10,0.6)_100%)]" />
      </div>

      {/* Body */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-zinc-50">{product.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-400">
            {product.tagline}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] tracking-[0.14em] text-zinc-500 uppercase">
            A partir de
          </p>
          <p className="mt-0.5 font-mono text-[14px] text-zinc-100">
            {formatBRL(product.priceBRL)}
          </p>
        </div>
      </div>

      {/* Colors */}
      <div className="mt-4 flex items-center justify-between">
        <ul className="flex items-center gap-1.5">
          {product.colors.slice(0, 4).map((c) => (
            <li
              key={c.name}
              title={c.name}
              className="block h-3 w-3 rounded-full ring-1 ring-white/10"
              style={{ background: c.hex }}
            />
          ))}
          {product.colors.length > 4 && (
            <li className="text-[10px] text-zinc-500">
              +{product.colors.length - 4}
            </li>
          )}
        </ul>
        <span className="inline-flex items-center gap-1 text-[12px] text-zinc-300 transition-colors group-hover:text-zinc-50">
          Comprar
          <CaretRight size={12} weight="regular" />
        </span>
      </div>
    </motion.a>
  );
}
