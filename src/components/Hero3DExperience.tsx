import type { MotionValue } from "motion/react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  HERO_3D_MANIFEST,
  HERO_ANNOTATIONS,
  getActiveHeroAnnotations,
  type Hero3DState,
  type HeroAnnotationId,
} from "../data/hero3d";

const DRAG_YAW_LIMIT = (18 * Math.PI) / 180;
const DRAG_PITCH_LIMIT = (8 * Math.PI) / 180;

type Hero3DExperienceProps = {
  scrollProgress: MotionValue<number>;
  reduceMotion: boolean;
};

type PointerSession = {
  pointerId: number;
  startX: number;
  startY: number;
  horizontal: boolean;
};

type PrototypeBoundaryProps = {
  children: ReactNode;
  onError: (error: Error) => void;
  resetKey: number;
};

type PrototypeBoundaryState = {
  failed: boolean;
};

class PrototypeBoundary extends Component<
  PrototypeBoundaryProps,
  PrototypeBoundaryState
> {
  state: PrototypeBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  componentDidUpdate(previous: PrototypeBoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

function useMobileViewport() {
  const [mobile, setMobile] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return mobile;
}

function sameAnnotations(
  left: readonly HeroAnnotationId[],
  right: readonly HeroAnnotationId[],
) {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export default function Hero3DExperience({
  scrollProgress,
  reduceMotion,
}: Hero3DExperienceProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pointerSessionRef = useRef<PointerSession | null>(null);
  const annotationTimerRef = useRef<number | null>(null);
  const keyboardTimerRef = useRef<number | null>(null);
  const mobile = useMobileViewport();

  const [experienceState, setExperienceState] =
    useState<Hero3DState>("poster");
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [requiresPageReload, setRequiresPageReload] = useState(false);
  const [activeAnnotationIds, setActiveAnnotationIds] = useState<
    HeroAnnotationId[]
  >(() => getActiveHeroAnnotations(scrollProgress.get(), mobile));

  const dragYawTarget = useMotionValue(0);
  const dragPitchTarget = useMotionValue(0);
  const dragYaw = useSpring(dragYawTarget, {
    stiffness: 210,
    damping: 28,
    mass: 0.72,
  });
  const dragPitch = useSpring(dragPitchTarget, {
    stiffness: 210,
    damping: 28,
    mass: 0.72,
  });
  const introOpacity = useTransform(
    scrollProgress,
    [0, 0.09, 0.14],
    [1, 0.72, 0],
  );
  const introY = useTransform(scrollProgress, [0, 0.14], [0, -18]);
  const stageOpacity = useTransform(
    scrollProgress,
    [0, 0.94, 1],
    [1, 1, 0],
  );

  const LazyHero3DCanvas = useMemo(
    () => lazy(() => import("./Hero3DCanvas")),
    [attempt],
  );

  const resetDrag = useCallback(() => {
    dragYawTarget.set(0);
    dragPitchTarget.set(0);
  }, [dragPitchTarget, dragYawTarget]);

  const failExperience = useCallback((error?: unknown) => {
    if (
      error instanceof Error &&
      /dynamically imported module|loading (?:css )?chunk|module script failed/i.test(
        error.message,
      )
    ) {
      setRequiresPageReload(true);
    }
    setShouldLoad(false);
    setExperienceState("error");
    resetDrag();
  }, [resetDrag]);

  const startExperience = useCallback(() => {
    if (reduceMotion) return;
    if (!supportsWebGL()) {
      failExperience();
      return;
    }
    setExperienceState("loading");
    setShouldLoad(true);
  }, [failExperience, reduceMotion]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reduceMotion || shouldLoad || experienceState !== "poster") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        startExperience();
      },
      { rootMargin: "600px 0px", threshold: 0 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [experienceState, reduceMotion, shouldLoad, startExperience]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "0px", threshold: 0.01 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || experienceState !== "loading") return;
    const timeout = window.setTimeout(failExperience, 12_000);
    return () => window.clearTimeout(timeout);
  }, [experienceState, failExperience, shouldLoad]);

  useEffect(() => {
    if (!reduceMotion) return;
    setShouldLoad(false);
    setExperienceState("poster");
    resetDrag();
  }, [reduceMotion, resetDrag]);

  useEffect(() => {
    const next = getActiveHeroAnnotations(scrollProgress.get(), mobile);
    setActiveAnnotationIds((current) =>
      sameAnnotations(current, next) ? current : next,
    );
  }, [mobile, scrollProgress]);

  useMotionValueEvent(scrollProgress, "change", (progress) => {
    resetDrag();
    const next = getActiveHeroAnnotations(progress, mobile);
    if (sameAnnotations(activeAnnotationIds, next)) return;
    if (annotationTimerRef.current !== null) {
      window.clearTimeout(annotationTimerRef.current);
    }
    annotationTimerRef.current = window.setTimeout(() => {
      setActiveAnnotationIds(next);
      annotationTimerRef.current = null;
    }, 120);
  });

  useEffect(
    () => () => {
      if (annotationTimerRef.current !== null) {
        window.clearTimeout(annotationTimerRef.current);
      }
      if (keyboardTimerRef.current !== null) {
        window.clearTimeout(keyboardTimerRef.current);
      }
    },
    [],
  );

  const handleReady = useCallback(() => {
    window.requestAnimationFrame(() => {
      setRequiresPageReload(false);
      setExperienceState("ready");
    });
  }, []);

  const handleRetry = () => {
    if (requiresPageReload) {
      window.location.reload();
      return;
    }
    setAttempt((value) => value + 1);
    if (!supportsWebGL()) {
      failExperience();
      return;
    }
    setExperienceState("loading");
    setShouldLoad(true);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (experienceState !== "ready" || reduceMotion) return;
    pointerSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      horizontal: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - session.startX;
    const deltaY = event.clientY - session.startY;
    if (!session.horizontal) {
      if (Math.hypot(deltaX, deltaY) < 8) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        pointerSessionRef.current = null;
        resetDrag();
        return;
      }
      session.horizontal = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    dragYawTarget.set(
      clamp((deltaX / Math.max(bounds.width, 1)) * 0.72, -DRAG_YAW_LIMIT, DRAG_YAW_LIMIT),
    );
    dragPitchTarget.set(
      clamp((-deltaY / Math.max(bounds.height, 1)) * 0.32, -DRAG_PITCH_LIMIT, DRAG_PITCH_LIMIT),
    );
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerSessionRef.current = null;
    resetDrag();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (experienceState !== "ready" || reduceMotion) return;
    const step = (4 * Math.PI) / 180;
    if (event.key === "Escape") {
      event.preventDefault();
      resetDrag();
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      dragYawTarget.set(
        clamp(
          dragYawTarget.get() + (event.key === "ArrowLeft" ? -step : step),
          -DRAG_YAW_LIMIT,
          DRAG_YAW_LIMIT,
        ),
      );
    } else {
      dragPitchTarget.set(
        clamp(
          dragPitchTarget.get() + (event.key === "ArrowUp" ? step : -step),
          -DRAG_PITCH_LIMIT,
          DRAG_PITCH_LIMIT,
        ),
      );
    }
    if (keyboardTimerRef.current !== null) {
      window.clearTimeout(keyboardTimerRef.current);
    }
    keyboardTimerRef.current = window.setTimeout(resetDrag, 720);
  };

  const posterHidden = experienceState === "ready" && !reduceMotion;
  const stateMessage =
    experienceState === "loading"
      ? "Carregando visualização 3D."
      : experienceState === "ready"
        ? "Visualização 3D pronta. Role a página para conhecer os detalhes."
        : experienceState === "error"
          ? "Visualização 3D indisponível. A imagem estática permanece disponível."
          : "Imagem estática do iPhone 17 Pro Max em laranja-cósmico.";

  return (
    <div
      ref={hostRef}
      className="hero-3d-experience relative h-full w-full"
      data-hero-3d-state={experienceState}
      aria-label={HERO_3D_MANIFEST.description}
    >
      <motion.div
        className="hero-3d-stage absolute inset-0"
        style={reduceMotion ? undefined : { opacity: stageOpacity }}
        role="group"
        aria-label="Visualização 3D interativa"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onLostPointerCapture={finishPointer}
      >
        <picture
          className={`hero-3d-poster absolute inset-0 ${posterHidden ? "is-hidden" : ""}`}
        >
          <source
            media="(max-width: 767px)"
            srcSet={HERO_3D_MANIFEST.mobilePosterUrl}
          />
          <img
            src={HERO_3D_MANIFEST.posterUrl}
            alt={posterHidden ? "" : "iPhone 17 Pro Max em laranja-cósmico"}
            aria-hidden={posterHidden}
            loading="eager"
            fetchPriority="high"
            draggable={false}
          />
        </picture>

        {shouldLoad ? (
          <PrototypeBoundary
            onError={failExperience}
            resetKey={attempt}
          >
            <Suspense fallback={null}>
              <LazyHero3DCanvas
                key={attempt}
                assetAttempt={attempt}
                scrollProgress={scrollProgress}
                dragYaw={dragYaw}
                dragPitch={dragPitch}
                activeAnnotationIds={activeAnnotationIds}
                isVisible={isVisible}
                mobile={mobile}
                onReady={handleReady}
                onError={failExperience}
              />
            </Suspense>
          </PrototypeBoundary>
        ) : null}

        {experienceState === "loading" ? (
          <p className="hero-3d-loading" role="status">
            Preparando visualização 3D
          </p>
        ) : null}

        {experienceState === "error" ? (
          <div className="hero-3d-error" role="status">
            <p>Visualização 3D indisponível</p>
            <button type="button" onClick={handleRetry}>
              Tentar novamente
            </button>
          </div>
        ) : null}
      </motion.div>

      <motion.div
        className="hero-3d-intro pointer-events-none absolute inset-x-0 top-[18svh] z-20 px-5 text-center md:top-[16svh] md:px-8"
        style={reduceMotion ? undefined : { opacity: introOpacity, y: introY }}
      >
        <p>iPhone 17 Pro Max</p>
        <span>Laranja-cósmico</span>
      </motion.div>

      {reduceMotion ? (
        <div className="hero-3d-reduced-details">
          <p>Detalhes do produto</p>
          <ul>
            {HERO_ANNOTATIONS.map((annotation) => (
              <li key={annotation.id}>
                <strong>{annotation.title}</strong>
                <span>{annotation.body}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul className="sr-only">
        {HERO_ANNOTATIONS.map((annotation) => (
          <li key={annotation.id}>
            {annotation.title}: {annotation.body}
          </li>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {stateMessage}
      </p>
    </div>
  );
}
