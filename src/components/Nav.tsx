import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

const links = [
  { label: "iPhones", to: "/iphones", route: true },
  { label: "Destaques", to: "/#destaques", route: false },
  { label: "Como escolher", to: "/#escolha", route: false },
] as const;

const baseDesktopLinkClass =
  "rounded-full px-3 py-2 text-[13px] font-normal transition-colors duration-300";

export default function Nav() {
  const { scrollY } = useScroll();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    const focusFrame = window.requestAnimationFrame(() => {
      firstMobileLinkRef.current?.focus();
    });

    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4 md:top-6"
      >
        <nav
          aria-label="Navegação principal"
          className={
            "pointer-events-auto flex w-full max-w-[1240px] items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-500 md:px-6 md:py-3 " +
            (scrolled || mobileOpen
              ? "border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(17,19,24,0.58))] shadow-[0_14px_40px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.16)]"
              : "border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),rgba(17,19,24,0.32))] shadow-[0_10px_30px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.14)]")
          }
          style={{
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          }}
        >
          <Link
            to="/"
            className="flex h-11 items-center rounded-full px-1.5 transition-opacity hover:opacity-85"
            aria-label="Exportech, voltar ao início"
          >
            <img
              src="/brand/exportech-mark.png"
              alt=""
              className="h-8 w-auto object-contain"
            />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link.to}>
                {link.route ? (
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `${baseDesktopLinkClass} ${
                        isActive
                          ? "bg-white/[0.07] text-zinc-50"
                          : "text-zinc-300 hover:text-zinc-50"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ) : (
                  <Link
                    to={link.to}
                    className={`${baseDesktopLinkClass} text-zinc-300 hover:text-zinc-50`}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="hidden h-11 w-11 md:block" aria-hidden />

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="relative h-11 w-11 rounded-full border border-white/10 bg-white/5 md:hidden"
          >
            <span
              className="absolute left-1/2 top-1/2 block h-px w-4 bg-zinc-50 transition-transform duration-300"
              style={{
                transform: mobileOpen
                  ? "translate(-50%, -50%) rotate(45deg)"
                  : "translate(-50%, -6px)",
              }}
            />
            <span
              className="absolute left-1/2 top-1/2 block h-px w-4 bg-zinc-50 transition-transform duration-300"
              style={{
                transform: mobileOpen
                  ? "translate(-50%, -50%) rotate(-45deg)"
                  : "translate(-50%, 6px)",
              }}
            />
          </button>
        </nav>
      </motion.header>

      <motion.div
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!mobileOpen}
        initial={false}
        animate={{
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-30 bg-[#0a0a0a]/96 backdrop-blur-3xl md:hidden"
      >
        <ul className="mt-32 flex flex-col items-center gap-4 px-8">
          {links.map((link, index) => (
            <motion.li
              key={link.to}
              initial={false}
              animate={
                mobileOpen
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 12 }
              }
              transition={{
                duration: 0.34,
                delay: mobileOpen ? 0.05 + index * 0.04 : 0,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              {link.route ? (
                <NavLink
                  ref={index === 0 ? firstMobileLinkRef : undefined}
                  to={link.to}
                  onClick={closeMobileMenu}
                  tabIndex={mobileOpen ? undefined : -1}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center px-3 text-3xl font-medium tracking-tight transition-colors ${
                      isActive ? "text-[color:var(--color-accent-soft)]" : "text-zinc-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ) : (
                <Link
                  ref={index === 0 ? firstMobileLinkRef : undefined}
                  to={link.to}
                  onClick={closeMobileMenu}
                  tabIndex={mobileOpen ? undefined : -1}
                  className="flex min-h-11 items-center px-3 text-3xl font-medium tracking-tight text-zinc-50"
                >
                  {link.label}
                </Link>
              )}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </>
  );
}
