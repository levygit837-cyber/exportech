import {
  ArrowRight,
  Feather,
  Lightning,
  Sparkle,
  Tag,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import {
  convertUSDToBRL,
  formatBRL,
  formatUSD,
  getPriceUSD,
  products,
} from "../data/products";
import { blurReveal, stagger } from "../lib/motion";

type ProfileId = "maximum" | "light" | "balanced" | "essential";

const profiles = [
  {
    id: "maximum",
    label: "Quero o máximo",
    hint: "Sem meio-termo",
    productId: "iphone-17-pro-max",
    headline: "Tudo no máximo. Inclusive a presença.",
    description:
      "Para quem quer o topo da linha e pretende ficar muito tempo com o próximo iPhone.",
    icon: Lightning,
  },
  {
    id: "light",
    label: "Quero leveza",
    hint: "Menos peso",
    productId: "iphone-air",
    headline: "Menos peso. Mais presença.",
    description:
      "Para quem valoriza um iPhone fino, elegante e fácil de levar durante o dia inteiro.",
    icon: Feather,
  },
  {
    id: "balanced",
    label: "Quero equilíbrio",
    hint: "Na medida certa",
    productId: "iphone-17",
    headline: "O ponto certo entre desejo e decisão.",
    description:
      "Para quem quer uma experiência atual, completa e sem pagar por excessos que não vai usar.",
    icon: Sparkle,
  },
  {
    id: "essential",
    label: "Quero economizar",
    hint: "Escolha inteligente",
    productId: "iphone-17e",
    headline: "O essencial, muito bem escolhido.",
    description:
      "Para quem quer entrar na linha mais recente com um preço mais leve e uma compra consciente.",
    icon: Tag,
  },
] as const;

export default function BuyingGuide() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });
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
  const priceBRL = convertUSDToBRL(priceUSD);

  return (
    <section
      id="escolha"
      ref={ref}
      className="relative border-t border-white/[0.06] py-24 md:py-32"
    >
      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-12 px-5 md:grid-cols-12 md:gap-8 md:px-8"
      >
        <div className="md:col-span-4">
          <motion.p
            variants={blurReveal}
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-accent-soft)]"
          >
            Escolha por você
          </motion.p>
          <motion.h2
            variants={blurReveal}
            className="text-fluid-h2 mt-4 max-w-[11ch] text-zinc-50"
            style={{ textWrap: "balance" }}
          >
            O melhor iPhone não é o mais caro. É o mais seu.
          </motion.h2>
          <motion.p
            variants={blurReveal}
            className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-zinc-400"
          >
            Escolha o que pesa mais na sua decisão. Nós encurtamos o caminho.
          </motion.p>

          <motion.fieldset variants={blurReveal} className="mt-8 grid gap-2">
            <legend className="sr-only">Escolha seu perfil de compra</legend>
            {profiles.map((item) => {
              const selected = item.id === profileId;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setProfileId(item.id)}
                  className={
                    "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition duration-300 active:scale-[0.99] " +
                    (selected
                      ? "border-[color:var(--color-accent)]/45 bg-[color:var(--color-accent)]/10 text-zinc-50"
                      : "border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:border-white/[0.16] hover:bg-white/[0.04]")
                  }
                >
                  <span
                    className={
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors " +
                      (selected
                        ? "border-[color:var(--color-accent)]/35 bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent-soft)]"
                        : "border-white/10 bg-white/[0.04] text-zinc-400")
                    }
                  >
                    <Icon size={17} weight="regular" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-zinc-500">
                      {item.hint}
                    </span>
                  </span>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden
                    className={
                      "transition duration-300 " +
                      (selected
                        ? "translate-x-0 text-[color:var(--color-accent-soft)]"
                        : "-translate-x-1 text-zinc-600 group-hover:translate-x-0 group-hover:text-zinc-400")
                    }
                  />
                </button>
              );
            })}
          </motion.fieldset>
        </div>

        <motion.div variants={blurReveal} className="md:col-span-8">
          <div className="grid min-h-full overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0e0f12] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="product-media-surface relative min-h-[390px] overflow-hidden border-b border-white/[0.07] lg:min-h-[580px] lg:border-b-0 lg:border-r">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={finish.image}
                  src={finish.image}
                  alt={`${product.name} em ${finish.name}`}
                  className="absolute inset-0 h-full w-full object-contain p-8"
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: 18, scale: product.mediaScale * 0.96 }
                  }
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: Math.min(product.mediaScale, 1.32),
                  }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: -18, scale: product.mediaScale * 0.98 }
                  }
                  transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
                />
              </AnimatePresence>
            </div>

            <div className="flex min-h-[430px] flex-col p-6 sm:p-8 lg:min-h-0 lg:p-9" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={profile.id}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-500">
                    Nossa escolha para você
                  </p>
                  <p className="mt-6 text-[13px] text-[color:var(--color-accent-soft)]">
                    {profile.hint}
                  </p>
                  <h3 className="mt-2 text-3xl font-medium tracking-[-0.035em] text-zinc-50 sm:text-4xl">
                    {product.name}
                  </h3>
                  <p className="mt-5 text-[20px] font-medium leading-snug tracking-[-0.025em] text-zinc-200">
                    {profile.headline}
                  </p>
                  <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
                    {profile.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-auto border-t border-white/[0.08] pt-6">
                <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                  Estimativa a partir de
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <strong className="font-mono text-2xl font-medium text-zinc-50">
                    {formatBRL(priceBRL)}
                  </strong>
                  <span className="text-[11px] text-zinc-500">
                    {formatUSD(priceUSD)}
                  </span>
                </div>

                <div className="mt-6">
                  <Link
                    to={`/iphones#${product.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-50 px-5 py-3 text-[13px] font-medium whitespace-nowrap text-zinc-950 transition hover:bg-white active:scale-[0.98]"
                  >
                    Ver esta configuração
                    <ArrowRight size={14} weight="bold" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
