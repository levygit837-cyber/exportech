import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Truck, Shield, ArrowsCounterClockwise } from "@phosphor-icons/react";
import { blurReveal, stagger } from "../lib/motion";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  return (
    <section
      ref={ref}
      className="relative pt-32 pb-20 md:pt-40 md:pb-28"
    >
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-12 px-5 md:grid-cols-12 md:gap-8 md:px-8">
        {/* Copy column */}
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
          className="md:col-span-6 lg:col-span-5"
        >
          <motion.span
            variants={blurReveal}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium tracking-[0.14em] text-zinc-300 uppercase"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
            Novo
          </motion.span>

          <motion.h1
            variants={blurReveal}
            className="text-fluid-display mt-5 text-zinc-50"
            style={{ textWrap: "balance" }}
          >
            iPhone 17 Pro.
          </motion.h1>

          <motion.p
            variants={blurReveal}
            className="mt-4 max-w-[34ch] text-[17px] leading-relaxed text-zinc-400"
          >
            Titânio. Mais leve. Mais Pro. A câmera mais avançada já feita em um
            iPhone, com chip A19 Pro e bateria para o dia todo.
          </motion.p>

          <motion.div variants={blurReveal} className="mt-8 flex items-center gap-3">
            <PrimaryButton label="Comprar agora" />
            <GhostButton label="Saiba mais" />
          </motion.div>

          {/* Trust row */}
          <motion.ul
            variants={blurReveal}
            className="mt-12 grid grid-cols-3 gap-4 text-zinc-400"
          >
            <TrustItem
              icon={<Truck size={18} weight="regular" />}
              title="Frete grátis"
              sub="Todo o Brasil"
            />
            <TrustItem
              icon={<Shield size={18} weight="regular" />}
              title="Garantia"
              sub="AppleCare+ incluso"
            />
            <TrustItem
              icon={<ArrowsCounterClockwise size={18} weight="regular" />}
              title="Devolução"
              sub="30 dias"
            />
          </motion.ul>
        </motion.div>

        {/* Product visual */}
        <div className="relative md:col-span-6 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
            style={{ y: phoneY, scale: phoneScale }}
            className="relative mx-auto aspect-[4/5] w-full max-w-[640px] overflow-hidden rounded-[32px] md:rounded-[40px]"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,0.06), transparent 70%)",
              }}
            />
            <motion.img
              src="/products/iphone-17-pro-hero.jpg"
              alt="iPhone 17 Pro"
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ scale: 1.06, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
            />
            {/* Soft vignette to embed the photo in the page */}
            <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_50%,transparent_55%,rgba(10,10,10,0.55)_100%)]" />
            {/* Price pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="absolute bottom-5 left-5 right-5 flex items-end justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:bottom-6 md:left-6 md:right-auto md:p-5"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
            >
              <div>
                <p className="text-[11px] tracking-[0.14em] text-zinc-400 uppercase">
                  A partir de
                </p>
                <p className="mt-1 font-mono text-2xl text-zinc-50">
                  R$ 11.999
                </p>
                <p className="mt-1 text-[12px] text-zinc-400">
                  ou 24x de R$ 499,96 sem juros
                </p>
              </div>
              <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-200 md:inline-flex">
                Em estoque
              </span>
            </motion.div>
          </motion.div>

          {/* Color dots floating */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl md:flex"
          >
            {[
              { name: "Laranja Cósmico", hex: "#cc7a3d" },
              { name: "Azul Profundo", hex: "#3a4a5e" },
              { name: "Prata", hex: "#cfcdc9" },
            ].map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="block h-3 w-3 rounded-full ring-1 ring-white/10"
                style={{ background: c.hex }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PrimaryButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="group relative inline-flex items-center gap-1 rounded-full bg-zinc-50 px-5 py-3 text-[14px] font-medium text-zinc-950 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] active:scale-[0.98]"
    >
      <span>{label}</span>
      <span className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
          <path
            d="M2 9L9 2M9 2H4M9 2V7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

function GhostButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="group relative inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.03] px-5 py-3 text-[14px] font-medium text-zinc-50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/25 hover:bg-white/[0.06] active:scale-[0.98]"
    >
      <span>{label}</span>
      <span className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path
            d="M1 5H9M9 5L5.5 1.5M9 5L5.5 8.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}

function TrustItem({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-zinc-300">{icon}</span>
      <div className="leading-tight">
        <p className="text-[12px] font-medium text-zinc-100">{title}</p>
        <p className="mt-0.5 text-[11px] text-zinc-500">{sub}</p>
      </div>
    </li>
  );
}
