import { useGLTF } from "@react-three/drei/core/Gltf";
import { Html } from "@react-three/drei/web/Html";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";
import {
  HERO_3D_MANIFEST,
  HERO_ANNOTATIONS,
  getActiveHeroAnnotations,
  getHeroChapter,
  type HeroAnnotation,
  type HeroAnnotationId,
  type Hero3DVisualState,
  type HeroCameraPreset,
  type Vector3Tuple,
} from "../data/hero3d";

export type Hero3DCanvasProps = {
  assetAttempt: number;
  scrollProgress: MotionValue<number>;
  renderedProgress: MotionValue<number>;
  dragYaw: MotionValue<number>;
  dragPitch: MotionValue<number>;
  isVisible: boolean;
  mobile: boolean;
  indicatorIds: readonly HeroAnnotationId[];
  onVisualState: (state: Hero3DVisualState) => void;
  onReady: () => void;
  onError: () => void;
};

type QualityPreset = {
  maximumDpr: number;
  anisotropy: 2 | 4;
};

type CameraScratch = {
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  fromOffset: THREE.Vector3;
  toOffset: THREE.Vector3;
  fullRotation: THREE.Quaternion;
  rotation: THREE.Quaternion;
};

type CameraStop = {
  at: number;
  camera: HeroCameraPreset;
  modelPosition: Vector3Tuple;
  modelScale: number;
  arc: number;
};

const INDICATOR_EXIT_DURATION_MS = 520;

const cameras = HERO_3D_MANIFEST.cameras;

const CAMERA_STOPS: readonly CameraStop[] = [
  {
    at: 0,
    camera: cameras.intro,
    modelPosition: [0, -0.38, 0],
    modelScale: 18,
    arc: 0,
  },
  {
    at: 0.12,
    camera: {
      position: [2.08, 0.68, 5.04],
      target: cameras.intro.target,
      fov: 30.2,
    },
    modelPosition: [0.08, -0.24, 0],
    modelScale: 18.12,
    arc: 0.12,
  },
  {
    at: 0.28,
    camera: cameras["camera-control"],
    modelPosition: [-0.12, 0, 0],
    modelScale: 18,
    arc: 0.2,
  },
  {
    at: 0.48,
    camera: cameras.rear,
    modelPosition: [-0.08, 0, 0],
    modelScale: 18,
    arc: 0.24,
  },
  {
    at: 0.64,
    camera: cameras["camera-macro"],
    modelPosition: [-0.16, -0.03, 0],
    modelScale: 18.08,
    arc: 0.42,
  },
  {
    at: 0.8,
    camera: cameras["action-side"],
    modelPosition: [0.13, 0, 0],
    modelScale: 18,
    arc: 0.28,
  },
  {
    at: 0.94,
    camera: cameras.front,
    modelPosition: [0, -0.01, 0],
    modelScale: 18,
    arc: 0.2,
  },
  {
    at: 1,
    camera: cameras.outro,
    modelPosition: [0, -0.04, 0],
    modelScale: 17.72,
    arc: 0.08,
  },
] as const;

function findStops(progressValue: number) {
  const progress = THREE.MathUtils.clamp(progressValue, 0, 1);
  for (let index = 0; index < CAMERA_STOPS.length - 1; index += 1) {
    const from = CAMERA_STOPS[index];
    const to = CAMERA_STOPS[index + 1];
    if (progress <= to.at) {
      return {
        from,
        to,
        // The scroll controller already smooths progress. Keeping this segment
        // linear avoids forcing velocity to zero at every chapter boundary.
        progress: THREE.MathUtils.clamp(
          (progress - from.at) / (to.at - from.at),
          0,
          1,
        ),
      };
    }
  }
  const last = CAMERA_STOPS[CAMERA_STOPS.length - 1];
  return { from: last, to: last, progress: 1 };
}

function sphericalCameraPosition(
  from: HeroCameraPreset,
  to: HeroCameraPreset,
  progress: number,
  arc: number,
  output: THREE.Vector3,
  targetOutput: THREE.Vector3,
  scratch: CameraScratch,
) {
  scratch.fromPosition.fromArray(from.position);
  scratch.toPosition.fromArray(to.position);
  scratch.fromTarget.fromArray(from.target);
  scratch.toTarget.fromArray(to.target);
  targetOutput.lerpVectors(scratch.fromTarget, scratch.toTarget, progress);

  scratch.fromOffset.copy(scratch.fromPosition).sub(scratch.fromTarget);
  scratch.toOffset.copy(scratch.toPosition).sub(scratch.toTarget);
  const fromRadius = scratch.fromOffset.length();
  const toRadius = scratch.toOffset.length();
  scratch.fromOffset.normalize();
  scratch.toOffset.normalize();
  scratch.fullRotation.setFromUnitVectors(
    scratch.fromOffset,
    scratch.toOffset,
  );
  scratch.rotation.identity().slerp(scratch.fullRotation, progress);
  const radius = THREE.MathUtils.lerp(fromRadius, toRadius, progress);

  output
    .copy(scratch.fromOffset)
    .applyQuaternion(scratch.rotation)
    .multiplyScalar(radius)
    .add(targetOutput);
  // Squaring the arc envelope gives it a zero derivative at both ends, so
  // chapter boundaries do not introduce a vertical velocity discontinuity.
  const arcEnvelope = Math.sin(Math.PI * progress);
  output.y += arcEnvelope * arcEnvelope * arc;
}

function tupleToVector(tuple: Vector3Tuple) {
  return new THREE.Vector3(tuple[0], tuple[1], tuple[2]);
}

function ContextLossGuard({ onError }: { onError: () => void }) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, { once: true });
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [gl, onError]);

  return null;
}

function ProductIndicator({
  annotation,
  modelRef,
  active,
  mobile,
}: {
  annotation: HeroAnnotation;
  modelRef: RefObject<THREE.Group>;
  active: boolean;
  mobile: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const directionCorrectionFrameRef = useRef<number | null>(null);
  const screenShiftRef = useRef(0);
  const facingRef = useRef(false);
  const hiddenDurationRef = useRef(0);
  const [facing, setFacing] = useState(false);
  const [direction, setDirection] = useState(annotation.direction);
  const localPosition = useMemo(
    () => tupleToVector(annotation.position),
    [annotation.position],
  );
  const localNormal = useMemo(
    () => tupleToVector(annotation.normal),
    [annotation.normal],
  );
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const worldNormal = useMemo(() => new THREE.Vector3(), []);
  const viewDirection = useMemo(() => new THREE.Vector3(), []);
  const projectedPosition = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!mobile) {
      setDirection(annotation.direction);
      invalidate();
    }
  }, [annotation.direction, invalidate, mobile]);

  useEffect(
    () => () => {
      if (directionCorrectionFrameRef.current !== null) {
        window.cancelAnimationFrame(directionCorrectionFrameRef.current);
      }
    },
    [],
  );

  useFrame(({ camera }, delta) => {
    const model = modelRef.current;
    if (!model) return;
    model.updateWorldMatrix(true, false);
    worldPosition.copy(localPosition).applyMatrix4(model.matrixWorld);
    worldNormal.copy(localNormal).transformDirection(model.matrixWorld);

    if (mobile) {
      projectedPosition.copy(worldPosition).project(camera);
      let nextDirection = direction;
      if (direction === "right" && projectedPosition.x > 0.02) {
        nextDirection = "left";
      } else if (direction === "left" && projectedPosition.x < -0.02) {
        nextDirection = "right";
      }
      const indicatorBounds = indicatorRef.current?.getBoundingClientRect();
      if (indicatorBounds) {
        const safeInset = 8;
        const viewportWidth = document.documentElement.clientWidth;
        if (indicatorBounds.right > viewportWidth - safeInset) {
          nextDirection = "left";
        } else if (indicatorBounds.left < safeInset) {
          nextDirection = "right";
        }
      }
      if (nextDirection !== direction) {
        setDirection(nextDirection);
        invalidate();
      }

      if (directionCorrectionFrameRef.current === null) {
        directionCorrectionFrameRef.current = window.requestAnimationFrame(() => {
          directionCorrectionFrameRef.current = null;
          const bounds = indicatorRef.current?.getBoundingClientRect();
          if (!bounds) return;
          const safeInset = 8;
          const viewportWidth = document.documentElement.clientWidth;
          const baseLeft = bounds.left - screenShiftRef.current;
          const baseRight = bounds.right - screenShiftRef.current;
          const nextShift =
            baseRight > viewportWidth - safeInset
              ? viewportWidth - safeInset - baseRight
              : baseLeft < safeInset
                ? safeInset - baseLeft
                : 0;
          if (Math.abs(nextShift - screenShiftRef.current) > 0.5) {
            screenShiftRef.current = nextShift;
            indicatorRef.current?.style.setProperty(
              "--hero-indicator-screen-shift",
              `${nextShift}px`,
            );
          }
          const correctedDirection =
            bounds.right > viewportWidth - safeInset
              ? "left"
              : bounds.left < safeInset
                ? "right"
                : null;
          if (correctedDirection && correctedDirection !== direction) {
            setDirection(correctedDirection);
            invalidate();
          }
        });
      }
    }

    viewDirection.copy(camera.position).sub(worldPosition).normalize();
    const facingScore = worldNormal.dot(viewDirection);
    if (facingScore > 0.02) {
      hiddenDurationRef.current = 0;
      if (!facingRef.current) {
        facingRef.current = true;
        setFacing(true);
        invalidate();
      }
      return;
    }

    // Once a callout has entered on a visible surface, keep it visible for the
    // remainder of its active interval. Camera motion can briefly rotate the
    // normal past the threshold; toggling the label in that instant reads as a
    // flash even though the same product detail is still being narrated.
    if (active && facingRef.current) {
      hiddenDurationRef.current = 0;
      return;
    }

    if (facingScore < -0.34) {
      hiddenDurationRef.current += Math.min(delta, 1 / 30);
      if (facingRef.current && hiddenDurationRef.current >= 0.24) {
        facingRef.current = false;
        setFacing(false);
        invalidate();
      }
    } else {
      hiddenDurationRef.current = 0;
    }
  });

  return (
    <Html
      position={annotation.position}
      zIndexRange={[18, 0]}
      className="hero-3d-indicator-anchor"
      aria-hidden="true"
    >
      <div
        ref={indicatorRef}
        className={`hero-3d-indicator is-${direction} ${active ? "is-active" : "is-exiting"} ${facing ? "is-facing" : ""}`}
      >
        <span className="hero-3d-indicator-line" aria-hidden="true" />
        <strong>{annotation.title}</strong>
      </div>
    </Html>
  );
}

function ProductScene({
  assetAttempt,
  scrollProgress,
  renderedProgress,
  dragYaw,
  dragPitch,
  anisotropy,
  isVisible,
  mobile,
  indicatorIds,
  onFrameState,
}: Omit<
  Hero3DCanvasProps,
  "onError" | "onReady" | "onVisualState"
> & {
  anisotropy: number;
  onFrameState: (state: Hero3DVisualState) => void;
}) {
  const modelUrl =
    assetAttempt === 0
      ? HERO_3D_MANIFEST.modelUrl
      : `${HERO_3D_MANIFEST.modelUrl}?retry=${assetAttempt}`;
  const gltf = useGLTF(modelUrl);
  const preparedModel = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const replacements = new Map<THREE.Material, THREE.Material>();
    const ownedMaterials = new Set<THREE.Material>();

    const simplify = (source: THREE.Material) => {
      if (!(source instanceof THREE.MeshStandardMaterial)) return source;
      const cached = replacements.get(source);
      if (cached) return cached;

      // A scroll-sized product does not justify the physically based shader's
      // compile cost on first entry. Phong keeps the source color, image,
      // emissive and normal detail plus crisp product highlights, while using
      // a materially smaller shader on desktop and software WebGL.
      const material = new THREE.MeshPhongMaterial({
        color: source.color,
        map: source.map,
        emissive: source.emissive,
        emissiveMap: source.emissiveMap,
        emissiveIntensity: source.emissiveIntensity,
        normalMap: source.normalMap,
        normalScale: source.normalScale,
        bumpMap: source.bumpMap,
        bumpScale: source.bumpScale,
        displacementMap: source.displacementMap,
        displacementScale: source.displacementScale,
        displacementBias: source.displacementBias,
        alphaMap: source.alphaMap,
        aoMap: source.aoMap,
        aoMapIntensity: source.aoMapIntensity,
        opacity: source.opacity,
        transparent: source.transparent,
        alphaTest: source.alphaTest,
        side: source.side,
        vertexColors: source.vertexColors,
        specular: source.metalness > 0.45 ? "#8c8c8c" : "#3e3e3e",
        shininess: THREE.MathUtils.clamp((1 - source.roughness) * 92, 12, 82),
      });
      material.name = source.name;
      material.depthTest = source.depthTest;
      material.depthWrite = source.depthWrite;
      material.colorWrite = source.colorWrite;
      material.toneMapped = source.toneMapped;
      replacements.set(source, material);
      ownedMaterials.add(material);
      return material;
    };

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = Array.isArray(object.material)
        ? object.material.map(simplify)
        : simplify(object.material);
    });

    return { scene, ownedMaterials };
  }, [gltf.scene]);
  const model = preparedModel.scene;
  const modelRef = useRef<THREE.Group>(null!);
  const [renderedIndicators, setRenderedIndicators] = useState<
    Array<{ id: HeroAnnotationId; active: boolean }>
  >(() => indicatorIds.map((id) => ({ id, active: true })));
  const previousIndicatorIdsRef = useRef<readonly HeroAnnotationId[]>(
    indicatorIds,
  );
  const indicatorExitTimersRef = useRef(
    new Map<HeroAnnotationId, number>(),
  );
  const indicatorEnterFramesRef = useRef(
    new Map<HeroAnnotationId, number>(),
  );
  const renderedProgressRef = useRef(scrollProgress.get());
  const settledRef = useRef(true);
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const invalidate = useThree((state) => state.invalidate);
  const maximumAnisotropy = useThree((state) =>
    state.gl.capabilities.getMaxAnisotropy(),
  );
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const desiredModelPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const lookAtMatrix = useMemo(() => new THREE.Matrix4(), []);
  const cameraUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const modelPositionTo = useMemo(() => new THREE.Vector3(), []);
  const cameraScratch = useMemo<CameraScratch>(
    () => ({
      fromPosition: new THREE.Vector3(),
      toPosition: new THREE.Vector3(),
      fromTarget: new THREE.Vector3(),
      toTarget: new THREE.Vector3(),
      fromOffset: new THREE.Vector3(),
      toOffset: new THREE.Vector3(),
      fullRotation: new THREE.Quaternion(),
      rotation: new THREE.Quaternion(),
    }),
    [],
  );

  useEffect(
    () => () => {
      preparedModel.ownedMaterials.forEach((material) => material.dispose());
    },
    [preparedModel],
  );

  useLayoutEffect(() => {
    const maximum = Math.min(anisotropy, maximumAnisotropy);
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = false;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        if (material instanceof THREE.MeshPhongMaterial) {
          if (material.name === "EX_Unibody_Orange") {
            material.color.set("#ff6424");
            material.specular.set("#b86c4f");
            material.shininess = 68;
          } else if (material.name === "EX_Rear_Glass") {
            material.color.set("#ef6228");
            material.shininess = 54;
          } else if (material.name === "EX_Front_Glass") {
            material.shininess = 74;
          } else if (material.name === "EX_Display") {
            material.shininess = 38;
          } else if (
            material.name === "EX_Flash_Diffuser" ||
            material.name === "EX_Flash_Emitter"
          ) {
            material.emissiveIntensity = 0.08;
          }
        }
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) {
            value.anisotropy = maximum;
          }
        }
      }
    });
    invalidate();
  }, [anisotropy, invalidate, maximumAnisotropy, model]);

  useEffect(() => {
    const markMoving = () => {
      if (settledRef.current) {
        settledRef.current = false;
        onFrameState({
          progress: renderedProgressRef.current,
          chapter: getHeroChapter(renderedProgressRef.current),
          annotationIds: [],
          settled: false,
        });
      }
      invalidate();
    };
    const subscriptions = [
      scrollProgress.on("change", markMoving),
      dragYaw.on("change", invalidate),
      dragPitch.on("change", invalidate),
    ];
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [dragPitch, dragYaw, invalidate, onFrameState, scrollProgress]);

  useEffect(() => {
    if (isVisible) invalidate();
  }, [invalidate, isVisible]);

  useEffect(() => {
    const nextIds = [...indicatorIds];
    const nextSet = new Set(nextIds);
    const previousIds = previousIndicatorIdsRef.current;
    const previousSet = new Set(previousIds);
    const enteringIds = nextIds.filter((id) => !previousSet.has(id));
    const enteringSet = new Set(enteringIds);

    for (const id of nextIds) {
      const timer = indicatorExitTimersRef.current.get(id);
      if (timer !== undefined) {
        window.clearTimeout(timer);
        indicatorExitTimersRef.current.delete(id);
      }
    }

    indicatorEnterFramesRef.current.forEach((frame, id) => {
      if (nextSet.has(id)) return;
      window.cancelAnimationFrame(frame);
      indicatorEnterFramesRef.current.delete(id);
    });

    setRenderedIndicators((current) => {
      const currentById = new Map(current.map((item) => [item.id, item]));
      const nextItems = current.map((item) => ({
        ...item,
        active: nextSet.has(item.id) && !enteringSet.has(item.id),
      }));
      for (const id of nextIds) {
        if (!currentById.has(id)) {
          nextItems.push({ id, active: !enteringSet.has(id) });
        }
      }
      return nextItems;
    });

    // A newly mounted Html node can otherwise arrive at opacity: 1 on its
    // first paint (especially on mobile, where its facing state is already
    // known). Give it one rendered frame at opacity: 0 before activating it,
    // so every chapter change uses the same crossfade in both directions.
    for (const id of enteringIds) {
      const pendingFrame = indicatorEnterFramesRef.current.get(id);
      if (pendingFrame !== undefined) {
        window.cancelAnimationFrame(pendingFrame);
      }
      const frame = window.requestAnimationFrame(() => {
        const activationFrame = window.requestAnimationFrame(() => {
          indicatorEnterFramesRef.current.delete(id);
          if (!previousIndicatorIdsRef.current.includes(id)) return;
          setRenderedIndicators((current) =>
            current.map((item) =>
              item.id === id ? { ...item, active: true } : item,
            ),
          );
        });
        indicatorEnterFramesRef.current.set(id, activationFrame);
      });
      indicatorEnterFramesRef.current.set(id, frame);
    }

    for (const id of previousIds) {
      if (nextSet.has(id) || indicatorExitTimersRef.current.has(id)) continue;
      const timer = window.setTimeout(() => {
        indicatorExitTimersRef.current.delete(id);
        setRenderedIndicators((current) =>
          current.filter((item) => item.id !== id),
        );
      }, INDICATOR_EXIT_DURATION_MS);
      indicatorExitTimersRef.current.set(id, timer);
    }

    previousIndicatorIdsRef.current = nextIds;
  }, [indicatorIds]);

  useEffect(
    () => () => {
      indicatorExitTimersRef.current.forEach((timer) => {
        window.clearTimeout(timer);
      });
      indicatorExitTimersRef.current.clear();
      indicatorEnterFramesRef.current.forEach((frame) => {
        window.cancelAnimationFrame(frame);
      });
      indicatorEnterFramesRef.current.clear();
    },
    [],
  );

  useFrame((_state, delta) => {
    const group = modelRef.current;
    if (!group) return;

    const frameDelta = Math.min(delta, 1 / 30);
    const targetProgress = THREE.MathUtils.clamp(scrollProgress.get(), 0, 1);
    const currentProgress = renderedProgressRef.current;
    const targetDelta = Math.abs(targetProgress - currentProgress);
    const dampedProgress = THREE.MathUtils.damp(
      currentProgress,
      targetProgress,
      18,
      frameDelta,
    );
    // A direct scrollbar jump, PageDown or strong synthetic scroll must land
    // on its destination instead of replaying every intermediate chapter over
    // several expensive WebGL frames. Normal wheel/touch deltas stay damped.
    const progress =
      targetDelta > 0.14 || targetDelta < 0.0008
        ? targetProgress
        : THREE.MathUtils.clamp(dampedProgress, 0, 1);
    renderedProgressRef.current = progress;
    if (Math.abs(renderedProgress.get() - progress) > 0.0001) {
      renderedProgress.set(progress);
    }

    const segment = findStops(progress);
    sphericalCameraPosition(
      segment.from.camera,
      segment.to.camera,
      segment.progress,
      THREE.MathUtils.lerp(segment.from.arc, segment.to.arc, segment.progress),
      desiredPosition,
      desiredTarget,
      cameraScratch,
    );
    desiredPosition
      .sub(desiredTarget)
      .multiplyScalar(mobile ? 1.38 : 1.24)
      .add(desiredTarget);
    desiredModelPosition
      .fromArray(segment.from.modelPosition)
      .lerp(modelPositionTo.fromArray(segment.to.modelPosition), segment.progress);
    let desiredScale = THREE.MathUtils.lerp(
      segment.from.modelScale,
      segment.to.modelScale,
      segment.progress,
    );
    desiredModelPosition.y -= mobile ? 0.1 : 0.06;
    if (!mobile && progress < 0.28) {
      const introBlend = 1 - progress / 0.28;
      desiredModelPosition.x += 0.68 * introBlend;
      desiredModelPosition.y += 0.2 * introBlend;
      desiredScale *= 0.95 - 0.13 * introBlend;
    } else if (mobile && progress < 0.28) {
      const introBlend = 1 - progress / 0.28;
      desiredScale *= 0.9 - 0.04 * introBlend;
    } else {
      desiredScale *= mobile ? 0.9 : 0.95;
    }
    const desiredFov = THREE.MathUtils.lerp(
      segment.from.camera.fov,
      segment.to.camera.fov,
      segment.progress,
    );

    // Matrix4.lookAt uses camera semantics: local -Z points at the target.
    // A generic Object3D uses the opposite convention and would turn the
    // camera away from the product.
    lookAtMatrix.lookAt(desiredPosition, desiredTarget, cameraUp);
    desiredQuaternion.setFromRotationMatrix(lookAtMatrix);

    camera.position.copy(desiredPosition);
    camera.quaternion.copy(desiredQuaternion);
    if (Math.abs(camera.fov - desiredFov) > 0.001) {
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
    }

    group.position.copy(desiredModelPosition);
    group.scale.setScalar(desiredScale);
    group.rotation.y = dragYaw.get();
    group.rotation.x = dragPitch.get();

    const progressSettled = Math.abs(targetProgress - progress) < 0.0008;
    settledRef.current = progressSettled;

    // Indicators follow the same rendered progress as the phone, even while
    // the camera is still damping toward the scroll target. Tying them to the
    // settled state made every callout disappear during a continuous gesture
    // and only appear after the user stopped scrolling.
    const annotationIds = getActiveHeroAnnotations(progress, mobile);
    onFrameState({
      progress,
      chapter: getHeroChapter(progress),
      annotationIds,
      settled: progressSettled,
    });

    if (isVisible && !progressSettled) {
      invalidate();
    }
  }, -1);

  return (
    <group ref={modelRef} scale={HERO_3D_MANIFEST.asset.scale}>
      <primitive object={model} dispose={null} />
      {renderedIndicators.map(({ id, active }) => {
        const annotation = HERO_ANNOTATIONS.find((item) => item.id === id);
        return annotation ? (
          <ProductIndicator
            key={annotation.id}
            annotation={annotation}
            modelRef={modelRef}
            active={active}
            mobile={mobile}
          />
        ) : null;
      })}
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <hemisphereLight args={["#fffaf6", "#152237", 0.62]} />
      <directionalLight
        position={[-3.8, 5.6, 4.2]}
        intensity={3.4}
        color="#ffe5d2"
      />
      <directionalLight
        position={[4.2, 1.4, 3.2]}
        intensity={1.8}
        color="#bad8ff"
      />
      <directionalLight
        position={[-1.2, 3.6, -4.8]}
        intensity={2.2}
        color="#d8e7ff"
      />
    </>
  );
}

function SceneWarmup({
  enabled,
  onComplete,
  onError,
}: {
  enabled: boolean;
  onComplete: () => void;
  onError: () => void;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let frame = 0;

    const warm = async () => {
      const textures = new Set<THREE.Texture>();
      const frustumState: Array<[THREE.Mesh, boolean]> = [];

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        frustumState.push([object, object.frustumCulled]);
        object.frustumCulled = false;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) textures.add(value);
          }
        }
      });
      if (scene.environment instanceof THREE.Texture) {
        textures.add(scene.environment);
      }

      try {
        const compileTask =
          typeof gl.compileAsync === "function"
            ? gl.compileAsync(scene, camera)
            : Promise.resolve(gl.compile(scene, camera));
        const textureList = [...textures];
        for (let index = 0; index < textureList.length; index += 1) {
          gl.initTexture(textureList[index]);
          // Spread GPU uploads across short slices so loading cannot swallow a
          // scroll or tap in one long main-thread task.
          if ((index + 1) % 3 === 0 && index < textureList.length - 1) {
            await new Promise<void>((resolve) => {
              frame = window.requestAnimationFrame(() => resolve());
            });
            if (cancelled) return;
          }
        }
        await compileTask;
      } finally {
        for (const [mesh, frustumCulled] of frustumState) {
          mesh.frustumCulled = frustumCulled;
        }
      }

      if (cancelled) return;
      onComplete();
      invalidate();
    };

    // Allow material/layout effects from the loaded scene to commit before the
    // renderer is warmed. The poster remains visible throughout this step.
    frame = window.requestAnimationFrame(() => {
      void warm().catch(() => {
        if (!cancelled) onError();
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [camera, enabled, gl, invalidate, onComplete, onError, scene]);

  return null;
}

function ReadyGate({
  enabled,
  onFirstFrame,
}: {
  enabled: boolean;
  onFirstFrame: () => void;
}) {
  const invalidate = useThree((state) => state.invalidate);
  const sentRef = useRef(false);
  const readyFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (enabled && !sentRef.current) invalidate();
    return () => {
      if (readyFrameRef.current !== null) {
        window.cancelAnimationFrame(readyFrameRef.current);
      }
    };
  }, [enabled, invalidate]);

  useFrame(() => {
    if (!enabled || sentRef.current) return;
    sentRef.current = true;
    // useFrame runs immediately before gl.render. The next browser frame can
    // only fire after that render has completed, making ready a real pixel gate.
    readyFrameRef.current = window.requestAnimationFrame(() => {
      readyFrameRef.current = null;
      onFirstFrame();
    });
  });

  return null;
}

export default function Hero3DCanvas({
  assetAttempt,
  scrollProgress,
  renderedProgress,
  dragYaw,
  dragPitch,
  isVisible,
  mobile,
  indicatorIds,
  onVisualState,
  onReady,
  onError,
}: Hero3DCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const readySentRef = useRef(false);
  const lastVisualKeyRef = useRef("");
  const initialVisualStateRef = useRef<Hero3DVisualState>({
    progress: scrollProgress.get(),
    chapter: getHeroChapter(scrollProgress.get()),
    annotationIds: [],
    settled: false,
  });
  const [warmupComplete, setWarmupComplete] = useState(false);
  const quality = useMemo<QualityPreset>(
    () => ({
      maximumDpr: mobile ? 1 : 1.2,
      anisotropy: mobile ? 2 : 4,
    }),
    [mobile],
  );

  const handleFrameState = useCallback(
    (state: Hero3DVisualState) => {
      const host = hostRef.current;
      if (host) {
        const attributes = {
          "data-hero-3d-progress": state.progress.toFixed(4),
          "data-hero-3d-chapter": state.chapter,
          "data-hero-3d-settled": String(state.settled),
          "data-hero-3d-callouts": state.annotationIds.join(","),
        } as const;
        for (const [name, value] of Object.entries(attributes)) {
          if (host.getAttribute(name) !== value) host.setAttribute(name, value);
        }
      }

      const visualKey = `${state.settled}:${state.chapter}:${state.annotationIds.join(",")}`;
      if (visualKey !== lastVisualKeyRef.current) {
        lastVisualKeyRef.current = visualKey;
        onVisualState(state);
      }
    },
    [onVisualState],
  );

  const handleWarmupComplete = useCallback(() => {
    setWarmupComplete(true);
  }, []);

  const handleFirstFrame = useCallback(() => {
    if (readySentRef.current) return;
    readySentRef.current = true;
    hostRef.current?.setAttribute("data-hero-3d-first-frame", "true");
    onReady();
  }, [onReady]);

  return (
    <div
      ref={hostRef}
      className="hero-3d-canvas absolute inset-0"
      data-hero-3d-progress={initialVisualStateRef.current.progress.toFixed(4)}
      data-hero-3d-chapter={initialVisualStateRef.current.chapter}
      data-hero-3d-settled={String(initialVisualStateRef.current.settled)}
      data-hero-3d-callouts=""
      data-hero-3d-first-frame="false"
      aria-hidden="true"
    >
      <Canvas
        frameloop={warmupComplete && isVisible ? "demand" : "never"}
        dpr={[mobile ? 0.85 : 1, quality.maximumDpr]}
        camera={{
          position: [...HERO_3D_MANIFEST.cameras.intro.position],
          fov: HERO_3D_MANIFEST.cameras.intro.fov,
          near: 0.08,
          far: 30,
        }}
        gl={{
          alpha: true,
          // Native MSAA adds a large first-frame/render-target cost. At the
          // capped DPR and product scale, the outline remains clean without it.
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          gl.shadowMap.enabled = false;
          gl.transmissionResolutionScale = 0.5;
        }}
      >
        <ContextLossGuard onError={onError} />
        <Suspense fallback={null}>
          <SceneLighting />
          <ProductScene
            assetAttempt={assetAttempt}
            scrollProgress={scrollProgress}
            renderedProgress={renderedProgress}
            dragYaw={dragYaw}
            dragPitch={dragPitch}
            isVisible={isVisible}
            mobile={mobile}
            indicatorIds={indicatorIds}
            anisotropy={quality.anisotropy}
            onFrameState={handleFrameState}
          />
          <SceneWarmup
            enabled={!warmupComplete}
            onComplete={handleWarmupComplete}
            onError={onError}
          />
          <ReadyGate
            enabled={warmupComplete}
            onFirstFrame={handleFirstFrame}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
