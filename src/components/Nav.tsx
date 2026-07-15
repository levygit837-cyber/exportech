import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { MagnifyingGlass, User, ShoppingBag } from "@phosphor-icons/react";

const links = [
  { label: "Loja", href: "#loja" },
  { label: "iPhone", href: "#iphone" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Escolha", href: "#escolha" },
  { label: "Suporte", href: "#suporte" },
];

export default function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4 md:top-6"
      >
        <nav
          className={
            "pointer-events-auto flex w-full max-w-[1240px] items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-500 md:px-6 md:py-3 " +
            (scrolled
              ? "border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
              : "border-transparent bg-transparent")
          }
          style={{
            backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          }}
        >
          {/* Brand */}
          <a
            href="#"
            className="flex h-9 items-center rounded-full px-1.5 transition-opacity hover:opacity-85"
            aria-label="Exportech, voltar ao início"
          >
            <img
              src="/brand/exportech-mark.png"
              alt=""
              className="h-8 w-auto object-contain"
            />
          </a>

          {/* Center links */}
          <ul className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-full px-3 py-1.5 text-[13px] font-normal text-zinc-300 transition-colors duration-300 hover:text-zinc-50"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button
              aria-label="Buscar"
              className="rounded-full p-2 text-zinc-300 transition-colors hover:bg-white/5 hover:text-zinc-50"
            >
              <MagnifyingGlass size={18} weight="regular" />
            </button>
            <button
              aria-label="Conta"
              className="hidden rounded-full p-2 text-zinc-300 transition-colors hover:bg-white/5 hover:text-zinc-50 md:block"
            >
              <User size={18} weight="regular" />
            </button>
            <button
              aria-label="Sacola"
              className="rounded-full p-2 text-zinc-300 transition-colors hover:bg-white/5 hover:text-zinc-50"
            >
              <ShoppingBag size={18} weight="regular" />
            </button>
            <button
              aria-label="Menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="relative ml-1 h-9 w-9 rounded-full border border-white/10 bg-white/5 md:hidden"
            >
              <span
                className={
                  "absolute left-1/2 top-1/2 block h-px w-4 -translate-x-1/2 bg-zinc-50 transition-transform duration-500 " +
                  (mobileOpen ? "rotate-45" : "-translate-y-[4px]")
                }
                style={{ transform: mobileOpen ? "translate(-50%, -50%) rotate(45deg)" : "translate(-50%, -6px)" }}
              />
              <span
                className={
                  "absolute left-1/2 top-1/2 block h-px w-4 -translate-x-1/2 bg-zinc-50 transition-transform duration-500 " +
                  (mobileOpen ? "-rotate-45" : "translate-y-[4px]")
                }
                style={{
                  transform: mobileOpen
                    ? "translate(-50%, -50%) rotate(-45deg)"
                    : "translate(-50%, 6px)",
                }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <motion.div
        initial={false}
        animate={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-30 backdrop-blur-3xl md:hidden"
        style={{
          background: mobileOpen ? "rgba(10,10,10,0.92)" : "rgba(10,10,10,0)",
        }}
      >
        <ul className="mt-32 flex flex-col items-center gap-6 px-8">
          {links.map((l, i) => (
            <motion.li
              key={l.href}
              initial={{ opacity: 0, y: 16 }}
              animate={mobileOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{
                duration: 0.5,
                delay: mobileOpen ? 0.1 + i * 0.06 : 0,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              <a
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-3xl font-medium tracking-tight text-zinc-50"
              >
                {l.label}
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}
