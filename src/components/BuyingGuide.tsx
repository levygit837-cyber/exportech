import {
  ArrowRight,
  Feather,
  Lightning,
  Sparkle,
  Tag,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import {
  convertUSDToBRL,
  formatBRL,
  formatUSD,
  getPriceUSD,
  products,
} from "../data/products";
import { emitInteraction } from "../lib/interactionEvents";

type ProfileId = "maximum" | "light" | "balanced" | "essential";

const profiles = [
  {
    id: "maximum",
    label: "Quero o máximo",
    productId: "iphone-17-pro-max",
    description: "Desempenho, câmeras e autonomia no topo da linha.",
    icon: Lightning,
  },
  {
    id: "light",
    label: "Quero leveza",
    productId: "iphone-air",
    description: "Um iPhone fino e leve para acompanhar o dia inteiro.",
    icon: Feather,
  },
  {
    id: "balanced",
    label: "Quero equilíbrio",
    productId: "iphone-17",
    description: "Recursos atuais e preço equilibrado dentro da linha.",
    icon: Sparkle,
  },
  {
    id: "essential",
    label: "Quero economizar",
    productId: "iphone-17e",
    description: "O essencial da geração mais recente por um valor menor.",
    icon: Tag,
  },
] as const;

export default function BuyingGuide() {
  const reduceMotion = useReducedMotion();
  const [profileId, setProfileId] = useState<ProfileId>("maximum");
  const profile = profiles.find((item) => item.id === profileId)!;
  const product = products.find((item) => item.id === profile.productId)!;
  const finish = product.finishes.find(
    (item) => item.id === product.defaultFinish,
  )!;
  const priceUSD = getPriceUSD(
    product,
    product.defaultFinish,
    product.defaultStorage,
  );
  const destination = `/iphones/${product.id}?finish=${product.defaultFinish}&storage=${product.defaultStorage}`;

  const selectProfile = (nextProfileId: ProfileId) => {
    setProfileId(nextProfileId);
    const nextProfile = profiles.find((item) => item.id === nextProfileId)!;
    emitInteraction({
      name: "guide_profile_select",
      profileId: nextProfileId,
      productId: nextProfile.productId,
    });
  };

  return (
    <section
      id="escolha"
      aria-labelledby="guide-title"
      className="scroll-mt-0 border-t border-white/[0.06] py-16 md:py-20"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <div>
          <p className="text-[12px] text-[color:var(--color-accent-soft)]">
            Não sabe qual escolher?
          </p>
          <h2
            id="guide-title"
            className="mt-2 text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1] tracking-[-0.04em] text-zinc-50"
          >
            Conte como você usa.
          </h2>
        </div>

        <fieldset className="mt-8 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <legend className="sr-only">Escolha seu perfil de compra</legend>
          {profiles.map((item) => {
            const selected = item.id === profileId;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectProfile(item.id)}
                className={
                  "group flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-[12px] font-medium transition duration-300 active:scale-[0.98] sm:px-4 " +
                  (selected
                    ? "border-[color:var(--color-accent-soft)]/70 bg-[color:var(--color-accent)]/10 text-zinc-50"
                    : "border-white/10 bg-white/[0.025] text-zinc-400 hover:border-white/20 hover:text-zinc-100")
                }
              >
                <Icon
                  size={16}
                  weight={selected ? "fill" : "regular"}
                  aria-hidden
                  className={
                    selected
                      ? "text-[color:var(--color-accent-soft)]"
                      : "text-zinc-500 transition-colors group-hover:text-zinc-300"
                  }
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </fieldset>

        <div
          className="mt-4 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d0f13]"
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={profile.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="grid items-center gap-5 p-4 sm:grid-cols-[112px_1fr_auto] sm:p-5 md:gap-8"
            >
              <div className="product-media-surface relative aspect-[4/3] overflow-hidden rounded-xl">
                <img
                  src={finish.image}
                  alt={`${product.name} em ${finish.name}`}
                  className="absolute inset-0 h-full w-full object-contain p-2"
                  style={{ scale: Math.min(product.mediaScale, 1.22) }}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-[color:var(--color-accent-soft)]">
                  Recomendado para você
                </p>
                <h3 className="mt-1 text-[22px] font-medium tracking-[-0.03em] text-zinc-50">
                  {product.name}
                </h3>
                <p className="mt-2 max-w-[48ch] text-[13px] leading-relaxed text-zinc-400">
                  {profile.description}
                </p>
              </div>

              <div className="grid gap-4 sm:min-w-[220px] sm:justify-items-end">
                <div className="sm:text-right">
                  <p className="text-[10px] text-zinc-500">A partir de</p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2 sm:justify-end">
                    <strong className="font-mono text-xl font-medium text-zinc-50">
                      {formatBRL(convertUSDToBRL(priceUSD))}
                    </strong>
                    <span className="text-[10px] text-zinc-500">
                      {formatUSD(priceUSD)}
                    </span>
                  </div>
                </div>

                <Link
                  to={destination}
                  onClick={() =>
                    emitInteraction({
                      name: "guide_product_open",
                      profileId: profile.id,
                      productId: product.id,
                      destination,
                    })
                  }
                  className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-zinc-50 px-5 py-2.5 text-[12px] font-medium whitespace-nowrap text-zinc-950 transition hover:bg-white active:scale-[0.98] sm:w-auto"
                >
                  Conhecer o modelo
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
