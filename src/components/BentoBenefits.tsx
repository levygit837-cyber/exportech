import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  CreditCard,
  ArrowsClockwise,
  ShieldCheck,
  Lock,
  ArrowRight,
} from "@phosphor-icons/react";
import { benefits } from "../data/benefits";
import { blurReveal, stagger } from "../lib/motion";

const iconMap: Record<string, React.ReactNode> = {
  payment: <CreditCard size={20} weight="regular" />,
  "trade-in": <ArrowsClockwise size={20} weight="regular" />,
  warranty: <ShieldCheck size={20} weight="regular" />,
  checkout: <Lock size={20} weight="regular" />,
};

export default function BentoBenefits() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, once: true });

  return (
    <section
      id="beneficios"
      ref={ref}
      className="border-t border-white/[0.06] py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <h2 className="text-fluid-h2 max-w-[18ch] text-zinc-50">
          Compra pensada nos detalhes.
        </h2>

        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5"
        >
          {benefits.map((b, i) => (
            <BenefitCell
              key={b.id}
              variant={b.variant}
              tone={b.tone}
              icon={iconMap[b.id]}
              title={b.title}
              description={b.description}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BenefitCell({
  variant,
  tone,
  icon,
  title,
  description,
  index,
}: {
  variant: "wide" | "narrow";
  tone: "neutral" | "tint";
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  const span = variant === "wide" ? "md:col-span-7" : "md:col-span-5";
  const isTint = tone === "tint";

  return (
    <motion.article
      variants={blurReveal}
      className={
        "group relative overflow-hidden rounded-3xl border p-6 md:p-7 " +
        span +
        " " +
        (isTint
          ? "border-white/10 bg-gradient-to-br from-[rgba(10,132,255,0.12)] via-white/[0.04] to-white/[0.02]"
          : "border-white/[0.08] bg-white/[0.02]")
      }
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
    >
      {/* Inner core (double-bezel) */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-2 text-zinc-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
            {icon}
          </span>
          {index === 0 && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] tracking-[0.14em] text-zinc-400 uppercase">
              Destaque
            </span>
          )}
        </div>

        <h3 className="mt-6 text-[20px] font-medium tracking-tight text-zinc-50 md:text-[22px]">
          {title}
        </h3>
        <p className="mt-1.5 max-w-[40ch] text-[13.5px] leading-relaxed text-zinc-400">
          {description}
        </p>

        {variant === "wide" && (
          <div className="mt-auto pt-8">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
              <div>
                <p className="font-mono text-3xl text-zinc-50 md:text-4xl">
                  24x
                </p>
                <p className="mt-1 text-[12px] text-zinc-500">sem juros</p>
              </div>
              <div>
                <p className="font-mono text-3xl text-zinc-50 md:text-4xl">
                  0%
                </p>
                <p className="mt-1 text-[12px] text-zinc-500">de juros</p>
              </div>
              <div className="ml-auto">
                <a
                  href="#suporte"
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[12px] text-zinc-100 transition-all hover:bg-white/[0.08]"
                >
                  Consultar condições
                  <ArrowRight size={13} weight="bold" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tint accent (only first cell) */}
      {isTint && (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(10,132,255,0.35), transparent 70%)",
          }}
        />
      )}
    </motion.article>
  );
}
