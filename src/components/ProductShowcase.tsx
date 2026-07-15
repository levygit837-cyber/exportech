import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import {
  convertUSDToBRL,
  formatBRL,
  formatUSD,
  getPriceUSD,
  INSTALLMENT_COUNT,
  type Product,
  products,
  type StorageId,
  USD_BRL_RATE,
} from "../data/products";
import { blurReveal, stagger } from "../lib/motion";

export default function ProductShowcase() {
  const railRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.12, once: true });

  const scroll = (direction: "next" | "prev") => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-card]");
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
              Do essencial ao Pro Max. Escolha armazenamento, acabamento e compare o valor final.
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
          <ProductCard key={product.id} product={product} index={index} />
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </motion.div>
    </section>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const reduceMotion = useReducedMotion();
  const [finishId, setFinishId] = useState(product.defaultFinish);
  const [storageId, setStorageId] = useState<StorageId>(product.defaultStorage);

  const finish = product.finishes.find((item) => item.id === finishId)!;
  const priceUSD = getPriceUSD(product, finishId, storageId);
  const priceBRL = convertUSDToBRL(priceUSD);

  return (
    <motion.article
      variants={blurReveal}
      data-card
      id={product.id}
      className="group relative flex w-[86vw] max-w-[430px] shrink-0 snap-start flex-col rounded-3xl border border-white/[0.08] bg-[#0e0f12] p-3.5 transition-colors duration-500 hover:border-white/[0.16] sm:w-[430px]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <figure
        data-product-media
        className="product-media-surface relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.06]"
      >
        <motion.img
          key={finish.image}
          src={finish.image}
          alt={`${product.name} em ${finish.name}`}
          loading={index < 2 ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-contain p-4 sm:p-5"
          initial={
            reduceMotion
              ? false
              : { opacity: 0, scale: product.mediaScale * 0.98 }
          }
          animate={{ opacity: 1, scale: product.mediaScale }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        />
      </figure>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="min-h-5 text-[11px] text-zinc-500">
          {product.label && <span>{product.label}</span>}
        </div>

        <div className="mt-2">
          <h3 className="text-[18px] font-medium tracking-tight text-zinc-50">
            {product.name}
          </h3>
          <p className="mt-1 min-h-10 text-[13px] leading-relaxed text-zinc-400">
            {product.tagline}
          </p>
        </div>

        <div className="mt-4 grid gap-4">
          <fieldset>
            <legend className="mb-2 text-[11px] font-medium text-zinc-400">
              Armazenamento
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.storages.map((option) => {
                const selected = option.id === storageId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setStorageId(option.id)}
                    className={
                      "rounded-full border px-3 py-1.5 text-[11px] font-medium transition duration-200 active:scale-[0.98] " +
                      (selected
                        ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]")
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[11px] font-medium text-zinc-400">
              Cor: <span className="text-zinc-200">{finish.name}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.finishes.map((option) => {
                const selected = option.id === finishId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={`Selecionar ${option.name}`}
                    aria-pressed={selected}
                    title={option.name}
                    onClick={() => setFinishId(option.id)}
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-full border transition duration-200 active:scale-[0.94] " +
                      (selected
                        ? "border-zinc-100 bg-white/10"
                        : "border-white/10 bg-transparent hover:border-white/30")
                    }
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: option.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[0.07] pt-4">
          <div aria-live="polite">
            <p className="text-[10px] text-zinc-500">Valor estimado em BRL</p>
            <p className="mt-0.5 font-mono text-[19px] text-zinc-50">
              {formatBRL(priceBRL)}
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-500">
              {formatUSD(priceUSD)} · {INSTALLMENT_COUNT}x de {formatBRL(priceBRL / INSTALLMENT_COUNT, true)}
            </p>
          </div>

          <a
            href="#suporte"
            className="group/link inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-zinc-200 transition duration-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            aria-label={`Consultar ${product.name}, ${storageId}, ${finish.name}`}
          >
            Consultar
            <CaretRight
              size={13}
              weight="bold"
              className="transition-transform duration-300 group-hover/link:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
