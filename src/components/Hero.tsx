import { ArrowRight } from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";
import {
  convertUSDToBRL,
  featuredProduct,
  formatBRL,
  formatUSD,
  getStartingPriceUSD,
} from "../data/products";
import { blurReveal, stagger } from "../lib/motion";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 48]);
  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0.975]);

  const finish = featuredProduct.finishes.find(
    (item) => item.id === featuredProduct.defaultFinish,
  )!;
  const priceUSD = getStartingPriceUSD(featuredProduct);
  const priceBRL = convertUSDToBRL(priceUSD);

  return (
    <section
      id="iphone"
      ref={ref}
      className="relative flex min-h-[100dvh] items-center pb-16 pt-24 md:pb-20"
    >
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-12 md:gap-8 md:px-8">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
          className="md:col-span-5"
        >
          <motion.p
            variants={blurReveal}
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-accent-soft)]"
          >
            Linha de lançamento
          </motion.p>

          <motion.h1
            variants={blurReveal}
            className="text-fluid-display mt-4 max-w-[9ch] text-zinc-50"
          >
            iPhone 17 Pro Max.
          </motion.h1>

          <motion.p
            variants={blurReveal}
            className="mt-6 max-w-[18ch] text-[22px] font-medium leading-[1.28] tracking-[-0.025em] text-zinc-300 sm:text-[25px]"
          >
            Tão poderoso. Tão Pro. <span className="text-[color:var(--color-accent-soft)]">Tão Max.</span>
          </motion.p>

          <motion.div variants={blurReveal} className="mt-8">
            <Link
              to="/iphones"
              className="group inline-flex items-center gap-3 rounded-full bg-zinc-50 px-5 py-3 text-[14px] font-medium text-zinc-950 transition duration-300 hover:bg-white active:scale-[0.98]"
            >
              Ver catálogo
              <ArrowRight
                size={16}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative md:col-span-7">
          <motion.figure
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
            style={{ y: phoneY, scale: phoneScale }}
            data-product-media
            className="hero-product-well relative mx-auto aspect-[1.05/1] w-full max-w-[680px] overflow-hidden rounded-[28px] border border-white/[0.08] md:rounded-[32px]"
          >
            <motion.img
              src={finish.image}
              alt={`${featuredProduct.name} em ${finish.name}`}
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-contain p-3 pb-7 pt-5 sm:p-5 sm:pb-8"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 18, scale: featuredProduct.mediaScale * 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: featuredProduct.mediaScale }}
              transition={{ duration: 1, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            />
          </motion.figure>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.32, 0.72, 0, 1] }}
            aria-label={`Preço do ${featuredProduct.name}`}
            className="hero-price-panel relative mx-3 -mt-7 grid gap-4 rounded-2xl border border-white/10 bg-[#121419]/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:mx-auto sm:max-w-[560px] sm:grid-cols-[1fr_auto] sm:items-end sm:p-5"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                Estimativa a partir de
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <strong className="font-mono text-2xl font-medium text-zinc-50 sm:text-3xl">
                  {formatBRL(priceBRL)}
                </strong>
                <span className="text-[11px] text-zinc-500">{formatUSD(priceUSD)}</span>
              </div>
              <p className="mt-1 text-[12px] text-zinc-400">Referência original em USD</p>
            </div>
            <Link
              to="/iphones#iphone-17-pro-max"
              className="group inline-flex items-center justify-between gap-3 text-[13px] font-medium text-zinc-200 transition-colors hover:text-white"
            >
              Configurar
              <ArrowRight
                size={15}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
