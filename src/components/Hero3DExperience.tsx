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
  useLayoutEffect,
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
  getHeroChapter,
  type HeroAnnotationId,
  type Hero3DVisualState,
  type Hero3DState,
} from "../data/hero3d";

const DRAG_YAW_LIMIT = (18 * Math.PI) / 180;
const DRAG_PITCH_LIMIT = (8 * Math.PI) / 180;
const NARRATIVE_SETTLE_DELAY_MS = 180;
let webGLSupport: boolean | null = null;
let hero3DCanvasModule: Promise<typeof import("./Hero3DCanvas")> | null = null;

function loadHero3DCanvas() {
  hero3DCanvasModule ??= import("./Hero3DCanvas");
  return hero3DCanvasModule;
}

const LazyHero3DCanvas = lazy(loadHero3DCanvas);

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

function sameAnnotationIds(
  current: readonly string[],
  next: readonly string[],
) {
  return (
    current.length === next.length &&
    current.every((id, index) => id === next[index])
  );
}

function retainAnnotationIds(
  progress: number,
  mobile: boolean,
  current: HeroAnnotationId[],
): HeroAnnotationId[] {
  const active = getActiveHeroAnnotations(progress, mobile);
  if (active.length > 0) return active;

  const firstRangeStart = HERO_ANNOTATIONS[0]?.range[0] ?? 0;
  const lastRangeEnd = HERO_ANNOTATIONS.at(-1)?.range[1] ?? 1;
  const insideNarrative =
    progress >= firstRangeStart && progress < lastRangeEnd;

  // Small gaps between detail ranges are camera hand-offs, not moments where
  // the interface should flash empty. Hold the previous callout until the
  // next anchored detail is ready to replace it.
  return insideNarrative ? current : [];
}

function supportsWebGL() {
  if (webGLSupport !== null) return webGLSupport;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
    webGLSupport = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return webGLSupport;
  } catch {
    webGLSupport = false;
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

export default function Hero3DExperience({
  scrollProgress,
  reduceMotion,
}: Hero3DExperienceProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pointerSessionRef = useRef<PointerSession | null>(null);
  const keyboardTimerRef = useRef<number | null>(null);
  const narrativeTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const shouldLoadRef = useRef(false);
  const mobile = useMobileViewport();

  const [experienceState, setExperienceState] =
    useState<Hero3DState>("poster");
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [requiresPageReload, setRequiresPageReload] = useState(false);
  const [narrativeMoving, setNarrativeMoving] = useState(false);
  const [visualState, setVisualState] = useState<Hero3DVisualState>(() => {
    const progress = scrollProgress.get();
    return {
      progress,
      chapter: getHeroChapter(progress),
      annotationIds: getActiveHeroAnnotations(progress, mobile),
      settled: true,
    };
  });
  const [indicatorIds, setIndicatorIds] = useState(
    () => visualState.annotationIds,
  );

  const dragYawTarget = useMotionValue(0);
  const dragPitchTarget = useMotionValue(0);
  const renderedProgress = useMotionValue(scrollProgress.get());
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
    renderedProgress,
    [0, 0.09, 0.14],
    [1, 0.72, 0],
  );
  const introY = useTransform(renderedProgress, [0, 0.14], [0, -18]);

  const resetDrag = useCallback(() => {
    if (dragYawTarget.get() !== 0) dragYawTarget.set(0);
    if (dragPitchTarget.get() !== 0) dragPitchTarget.set(0);
  }, [dragPitchTarget, dragYawTarget]);

  const failExperience = useCallback((error?: unknown) => {
    if (!mountedRef.current) return;
    if (
      error instanceof Error &&
      /dynamically imported module|loading (?:css )?chunk|module script failed/i.test(
        error.message,
      )
    ) {
      setRequiresPageReload(true);
    }
    shouldLoadRef.current = false;
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
    // Start fetching the renderer chunk before React reaches the lazy boundary.
    // The guarded loader preserves the static-only reduced-motion path.
    void loadHero3DCanvas();
    shouldLoadRef.current = true;
    setExperienceState("loading");
    setShouldLoad(true);
  }, [failExperience, reduceMotion]);

  useLayoutEffect(() => {
    if (reduceMotion || shouldLoad || experienceState !== "poster") return;
    // This prototype hero is the first section of the page. Starting the
    // renderer chunk in the layout phase removes an avoidable observer/paint
    // waterfall while the eager poster continues to cover preparation.
    startExperience();
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
    // Keep the static poster interactive on genuinely slow/software WebGL
    // devices instead of tearing down a renderer that is still compiling.
    // Production hardware normally finishes far sooner; this is a safety cap.
    const timeout = window.setTimeout(failExperience, 20_000);
    return () => window.clearTimeout(timeout);
  }, [experienceState, failExperience, shouldLoad]);

  useEffect(() => {
    if (!reduceMotion) return;
    shouldLoadRef.current = false;
    setShouldLoad(false);
    setExperienceState("poster");
    resetDrag();
  }, [reduceMotion, resetDrag]);

  useMotionValueEvent(scrollProgress, "change", () => {
    pointerSessionRef.current = null;
    resetDrag();
  });

  useMotionValueEvent(renderedProgress, "change", (progress) => {
    setIndicatorIds((current) => {
      const next = retainAnnotationIds(progress, mobile, current);
      return sameAnnotationIds(current, next) ? current : next;
    });
  });

  useEffect(() => {
    const next = getActiveHeroAnnotations(renderedProgress.get(), mobile);
    setIndicatorIds((current) =>
      sameAnnotationIds(current, next) ? current : next,
    );
  }, [mobile, renderedProgress]);

  const handleVisualState = useCallback((next: Hero3DVisualState) => {
    if (narrativeTimerRef.current !== null) {
      window.clearTimeout(narrativeTimerRef.current);
      narrativeTimerRef.current = null;
    }

    if (!next.settled) {
      // Keep the last stable explanation on screen while the camera moves.
      // Replacing it with transient chapters is what caused fast-scroll text
      // flashes; hiding it entirely made the narrative appear to be missing.
      setNarrativeMoving(true);
      return;
    }

    narrativeTimerRef.current = window.setTimeout(() => {
      setVisualState(next);
      setNarrativeMoving(false);
      narrativeTimerRef.current = null;
    }, NARRATIVE_SETTLE_DELAY_MS);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (keyboardTimerRef.current !== null) {
        window.clearTimeout(keyboardTimerRef.current);
      }
      if (narrativeTimerRef.current !== null) {
        window.clearTimeout(narrativeTimerRef.current);
      }
    };
  }, []);

  const handleReady = useCallback(() => {
    if (!mountedRef.current || !shouldLoadRef.current || reduceMotion) return;
    setExperienceState((current) => {
      if (current !== "loading") return current;
      setRequiresPageReload(false);
      return "ready";
    });
  }, [reduceMotion]);

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
    shouldLoadRef.current = true;
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
  const visibleAnnotations = visualState.annotationIds
    .map((id) => HERO_ANNOTATIONS.find((annotation) => annotation.id === id))
    .filter((annotation) => annotation !== undefined);
  const detailAnnotation = visibleAnnotations[0];
  const narrativeVisible =
    experienceState === "ready" && !reduceMotion;

  return (
    <div
      ref={hostRef}
      className="hero-3d-experience relative h-full w-full"
      data-hero-3d-state={experienceState}
      aria-label={HERO_3D_MANIFEST.description}
    >
      <motion.div
        className="hero-3d-stage absolute inset-0"
        role={reduceMotion ? "img" : "group"}
        aria-label={
          reduceMotion
            ? "Imagem estática do iPhone 17 Pro Max"
            : "Visualização 3D interativa"
        }
        tabIndex={
          experienceState === "ready" && !reduceMotion ? 0 : undefined
        }
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
                renderedProgress={renderedProgress}
                dragYaw={dragYaw}
                dragPitch={dragPitch}
                isVisible={isVisible}
                mobile={mobile}
                indicatorIds={indicatorIds}
                onVisualState={handleVisualState}
                onReady={handleReady}
                onError={failExperience}
              />
            </Suspense>
          </PrototypeBoundary>
        ) : null}

        {experienceState === "loading" ? (
          <div className="hero-3d-loading" role="status">
            <span aria-hidden="true" />
            Preparando experiência 3D
          </div>
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
        className="hero-3d-intro pointer-events-none absolute z-20"
        style={reduceMotion ? undefined : { opacity: introOpacity, y: introY }}
      >
        <p>iPhone 17 Pro Max</p>
        <span>Laranja-cósmico</span>
      </motion.div>

      {!reduceMotion ? (
        <aside
          className={`hero-3d-narrative ${narrativeVisible ? "is-visible" : ""} ${narrativeMoving ? "is-moving" : ""}`}
          data-hero-3d-narrative={visualState.chapter}
          aria-hidden="true"
        >
          <div className="hero-3d-detail-summary">
            <strong>
              {detailAnnotation?.title ??
                (visualState.chapter === "intro"
                  ? "iPhone 17 Pro Max"
                  : visualState.chapter === "outro"
                    ? "Pronto para escolher o seu?"
                    : "Continue explorando")}
            </strong>
            <small>
              {detailAnnotation?.body ??
                (visualState.chapter === "intro"
                  ? "Conheça cada detalhe em uma sequência contínua."
                  : visualState.chapter === "outro"
                    ? "Continue para comparar toda a linha de iPhones."
                    : "O próximo detalhe aparece quando o enquadramento estabilizar.")}
            </small>
          </div>
        </aside>
      ) : null}

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

      {!reduceMotion ? (
        <ul className="sr-only">
          {HERO_ANNOTATIONS.map((annotation) => (
            <li key={annotation.id}>
              {annotation.title}: {annotation.body}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {stateMessage}
      </p>
    </div>
  );
}
