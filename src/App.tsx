import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router";
import { lazy, Suspense, useEffect } from "react";
import type { HeroMode } from "./components/Hero";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import HomePage from "./pages/HomePage";
import IphonesPage from "./pages/IphonesPage";
import NotFoundPage from "./pages/NotFoundPage";

const IphoneDetailPage = lazy(() => import("./pages/IphoneDetailPage"));

function DetailPageFallback() {
  return (
    <section
      aria-label="Carregando detalhes do iPhone"
      className="min-h-[75dvh] pb-20 pt-32 md:pt-40"
    >
      <div className="mx-auto grid w-full max-w-[1240px] animate-pulse gap-8 px-5 md:px-8 lg:grid-cols-[1.55fr_0.85fr]">
        <div className="aspect-[5/4] rounded-3xl bg-white/[0.04]" />
        <div className="grid content-start gap-4 pt-4">
          <div className="h-14 w-3/4 rounded-xl bg-white/[0.06]" />
          <div className="h-4 w-full rounded bg-white/[0.04]" />
          <div className="h-4 w-2/3 rounded bg-white/[0.04]" />
        </div>
      </div>
    </section>
  );
}

function RouteEffects() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (location.hash) {
      let secondFrame = 0;
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          const target = document.getElementById(location.hash.slice(1));
          target?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
        });
      });

      return () => {
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
      };
    }

    if (navigationType !== "POP") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.hash, location.pathname, navigationType, reduceMotion]);

  return null;
}

function RoutedContent({ heroMode }: { heroMode: HeroMode }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.main
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -3 }}
        transition={{
          duration: reduceMotion ? 0 : 0.18,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage heroMode={heroMode} />} />
          <Route path="/iphones" element={<IphonesPage />} />
          <Route
            path="/iphones/:slug"
            element={
              <Suspense fallback={<DetailPageFallback />}>
                <IphoneDetailPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  const heroMode: HeroMode = "prototype-3d";

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-[#0A0A0A] text-zinc-50">
      <RouteEffects />
      <Nav />
      <RoutedContent heroMode={heroMode} />
      <Footer />
    </div>
  );
}
