import { ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import {
  convertUSDToBRL,
  formatBRL,
  formatUSD,
  getStartingPriceUSD,
  products,
} from "../data/products";
import { emitInteraction } from "../lib/interactionEvents";

const runwayEntries = [
  {
    productId: "iphone-17-pro-max",
    index: "01",
    title: "Experiência máxima",
    description: "Desempenho Pro, câmeras avançadas e a maior autonomia da linha.",
  },
  {
    productId: "iphone-17",
    index: "02",
    title: "Escolha equilibrada",
    description: "Tela fluida e recursos atuais para acompanhar todos os dias.",
  },
  {
    productId: "iphone-17e",
    index: "03",
    title: "Entrada mais acessível",
    description: "Os recursos essenciais da linha mais recente por um valor menor.",
  },
] as const;

export default function ProductRunway() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="destaques"
      aria-labelledby="destaques-title"
      className="scroll-mt-0 border-t border-white/[0.06]"
      data-testid="product-runway"
    >
      <div className="sr-only">
        <h2 id="destaques-title">Destaques da linha iPhone</h2>
      </div>

      {runwayEntries.map((entry, position) => {
        const product = products.find((item) => item.id === entry.productId)!;
        const finish = product.finishes.find(
          (item) => item.id === product.defaultFinish,
        )!;
        const priceUSD = getStartingPriceUSD(product);
        const destination = `/iphones/${product.id}`;
        const imageFirst = position === 1;

        return (
          <motion.article
            key={entry.productId}
            data-featured-product={product.id}
            initial={reduceMotion ? false : { opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="runway-row border-b border-white/[0.06]"
          >
            <div className="mx-auto grid min-h-[680px] w-full max-w-[1240px] items-center gap-x-10 gap-y-8 px-5 py-20 md:min-h-[680px] md:grid-cols-12 md:px-8 md:py-20 lg:min-h-[720px]">
              <div
                className={`runway-copy md:col-span-5 ${
                  imageFirst ? "md:col-start-8 md:row-start-1" : "md:col-start-1 md:row-start-1"
                }`}
              >
                <p className="font-mono text-[12px] text-[color:var(--color-accent-soft)]">
                  {entry.index}
                </p>
                <h3 className="mt-6 max-w-[9ch] text-[clamp(2.65rem,5vw,5.3rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-zinc-50">
                  {entry.title}
                </h3>
                <p className="mt-4 text-[18px] font-medium tracking-[-0.02em] text-zinc-200">
                  {product.name}
                </p>
                <p className="mt-6 max-w-[34ch] text-[14px] leading-relaxed text-zinc-400">
                  {entry.description}
                </p>

              </div>

              <div
                className={`runway-media relative min-h-[390px] overflow-hidden md:col-span-7 md:min-h-[560px] ${
                  imageFirst
                    ? "md:col-start-1 md:row-span-2 md:row-start-1"
                    : "md:col-start-6 md:row-span-2 md:row-start-1"
                }`}
              >
                <div className="runway-media-glow absolute inset-[12%] rounded-full" aria-hidden />
                <motion.img
                  src={finish.image}
                  alt={`${product.name} em ${finish.name}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-3 sm:p-8"
                  style={{ scale: Math.min(product.mediaScale, 1.22) }}
                  initial={reduceMotion ? false : { opacity: 0, x: imageFirst ? -28 : 28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.82, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <div
                className={`runway-commerce md:col-span-5 md:self-start ${
                  imageFirst ? "md:col-start-8 md:row-start-2" : "md:col-start-1 md:row-start-2"
                }`}
              >
                <p className="text-[11px] text-zinc-500">A partir de</p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <strong className="font-mono text-[28px] font-medium tracking-tight text-zinc-50">
                    {formatBRL(convertUSDToBRL(priceUSD))}
                  </strong>
                  <span className="text-[11px] text-zinc-500">
                    {formatUSD(priceUSD)}
                  </span>
                </div>

                <Link
                  to={destination}
                  onClick={() =>
                    emitInteraction({
                      name: "featured_product_open",
                      productId: product.id,
                      destination,
                    })
                  }
                  className="group mt-8 inline-flex min-h-11 items-center gap-3 rounded-full text-[13px] font-medium text-zinc-200 transition-colors hover:text-white"
                >
                  Conhecer o modelo
                  <ArrowRight
                    size={15}
                    weight="bold"
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </motion.article>
        );
      })}

      <div className="mx-auto flex w-full max-w-[1240px] justify-center px-5 py-14 md:px-8 md:py-16">
        <Link
          to="/iphones"
          onClick={() =>
            emitInteraction({
              name: "featured_catalog_open",
              destination: "/iphones",
            })
          }
          className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/[0.035] px-6 py-3 text-[13px] font-medium text-zinc-200 transition duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
        >
          Ver todos os iPhones
          <ArrowRight
            size={15}
            weight="bold"
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  );
}
