import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
  convertUSDToBRL,
  formatBRL,
  formatUSD,
  getPriceUSD,
  type Product,
  type StorageId,
} from "../data/products";
import { blurReveal } from "../lib/motion";

type ProductCardProps = {
  product: Product;
  index: number;
  variant: "rail" | "catalog";
};

export default function ProductCard({
  product,
  index,
  variant,
}: ProductCardProps) {
  const reduceMotion = useReducedMotion();
  const [finishId, setFinishId] = useState(product.defaultFinish);
  const [storageId, setStorageId] = useState<StorageId>(product.defaultStorage);

  const finish = product.finishes.find((item) => item.id === finishId)!;
  const priceUSD = getPriceUSD(product, finishId, storageId);
  const priceBRL = convertUSDToBRL(priceUSD);
  const titleId = `${variant}-${product.id}-title`;
  const Heading = variant === "rail" ? "h3" : "h2";

  return (
    <motion.div
      variants={blurReveal}
      className={
        variant === "rail"
          ? "w-[86vw] max-w-[430px] shrink-0 snap-start sm:w-[430px]"
          : "min-w-0"
      }
    >
      <article
        id={variant === "catalog" ? product.id : undefined}
        data-product-card
        data-product-id={product.id}
        aria-labelledby={titleId}
        className="product-card group relative flex h-full scroll-mt-28 flex-col rounded-3xl border border-white/[0.08] bg-[#0e0f12] p-3.5 transition-[transform,border-color] duration-200"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        <figure
          data-product-media
          className="product-media-surface relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.06]"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={finish.image}
              src={finish.image}
              alt={`${product.name} em ${finish.name}`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-contain p-4 sm:p-5"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: product.mediaScale * 0.985 }
              }
              animate={{ opacity: 1, scale: product.mediaScale }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: product.mediaScale * 1.01 }
              }
              transition={{
                duration: reduceMotion ? 0 : 0.22,
                ease: [0.32, 0.72, 0, 1],
              }}
            />
          </AnimatePresence>
        </figure>

        <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
          <div className="min-h-5 text-[11px] text-zinc-500">
            {product.label && <span>{product.label}</span>}
          </div>

          <div className="mt-2">
            <Heading
              id={titleId}
              className="text-[18px] font-medium tracking-tight text-zinc-50"
            >
              {product.name}
            </Heading>
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
                        "min-h-11 rounded-full border px-3 py-2 text-[11px] font-medium transition duration-200 active:scale-[0.98] " +
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
                        "flex h-11 w-11 items-center justify-center rounded-full border transition duration-200 active:scale-[0.96] " +
                        (selected
                          ? "border-zinc-100 bg-white/10"
                          : "border-white/10 bg-transparent hover:border-white/30")
                      }
                    >
                      <span
                        className="h-4 w-4 rounded-full ring-1 ring-black/20"
                        style={{ backgroundColor: option.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="mt-5 border-t border-white/[0.07] pt-4" aria-live="polite">
            <p className="text-[10px] text-zinc-500">Estimativa em BRL</p>
            <p className="mt-0.5 font-mono text-[19px] text-zinc-50">
              {formatBRL(priceBRL)}
            </p>
            <p className="mt-1 text-[10px] text-zinc-500">
              Referência original: {formatUSD(priceUSD)}
            </p>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
