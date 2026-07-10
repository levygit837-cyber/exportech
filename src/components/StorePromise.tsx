import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { blurReveal, stagger } from "../lib/motion";

const stats = [
  { value: "24", suffix: "x", label: "Parcelas sem juros no cartão" },
  { value: "0", suffix: "%", label: "De juros no pagamento flexível" },
  { value: "30", suffix: " dias", label: "Para devolver se não gostar" },
];

export default function StorePromise() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25, once: true });

  return (
    <section
      id="promessa"
      ref={ref}
      className="relative border-t border-white/[0.06] py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <motion.div
          variants={stagger(0.08)}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8"
        >
          <div className="md:col-span-5">
            <motion.h2
              variants={blurReveal}
              className="text-fluid-h2 text-zinc-50"
              style={{ textWrap: "balance" }}
            >
              A experiência que você merece.
            </motion.h2>
            <motion.p
              variants={blurReveal}
              className="mt-4 max-w-[42ch] text-[15.5px] leading-relaxed text-zinc-400"
            >
              Somos especialistas em iPhone no Brasil. Estoque lacrado,
              nota fiscal eletrônica, garantia oficial Apple e suporte
              humano de verdade.
            </motion.p>
          </div>

          <div className="md:col-span-7">
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] sm:grid-cols-3">
              {stats.map((s, i) => (
                <motion.li
                  key={s.label}
                  variants={blurReveal}
                  custom={i}
                  className="bg-[#0A0A0A] p-6 md:p-8"
                >
                  <p className="flex items-baseline gap-1 font-mono text-4xl tracking-tight text-zinc-50 md:text-5xl">
                    {s.value}
                    <span className="text-[18px] text-zinc-500 md:text-[22px]">
                      {s.suffix}
                    </span>
                  </p>
                  <p className="mt-3 max-w-[24ch] text-[13px] leading-relaxed text-zinc-400">
                    {s.label}
                  </p>
                </motion.li>
              ))}
            </ul>

            <motion.div
              variants={blurReveal}
              className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:flex-row sm:items-center md:p-7"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              <div>
                <p className="text-[14px] font-medium text-zinc-100">
                  Precisa de ajuda para escolher?
                </p>
                <p className="mt-1 text-[13px] text-zinc-400">
                  Converse com um especialista em iPhone.
                </p>
              </div>
              <a
                href="#suporte"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] font-medium text-zinc-100 transition-all hover:bg-white/[0.08]"
              >
                Falar com especialista
                <span aria-hidden>→</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
