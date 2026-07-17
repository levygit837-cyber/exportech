import { Environment, Html, PerformanceMonitor, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import * as THREE from "three";
import {
  HERO_3D_MANIFEST,
  HERO_ANNOTATIONS,
  type HeroAnnotation,
  type HeroAnnotationId,
  type HeroCameraPreset,
  type Vector3Tuple,
} from "../data/hero3d";

export type Hero3DCanvasProps = {
  assetAttempt: number;
  scrollProgress: MotionValue<number>;
  dragYaw: MotionValue<number>;
  dragPitch: MotionValue<number>;
  activeAnnotationIds: HeroAnnotationId[];
  isVisible: boolean;
  mobile: boolean;
  onReady: () => void;
  onError: () => void;
};

type QualityPreset = {
  maximumDpr: number;
  shadowMapSize: 512 | 1024;
  anisotropy: 4 | 8;
};

type CameraStop = {
  at: number;
  camera: HeroCameraPreset;
  modelPosition: Vector3Tuple;
  modelScale: number;
  arc: number;
};

const cameras = HERO_3D_MANIFEST.cameras;

const CAMERA_STOPS: readonly CameraStop[] = [
  {
    at: 0,
    camera: cameras.intro,
    modelPosition: [0, 0, 0],
    modelScale: 18,
    arc: 0,
  },
  {
    at: 0.12,
    camera: {
      position: [1.63, 0.67, 5.16],
      target: cameras.intro.target,
      fov: 30.4,
    },
    modelPosition: [0.08, -0.01, 0],
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

function smootherstep(value: number) {
  const progress = THREE.MathUtils.clamp(value, 0, 1);
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

function tupleToVector(tuple: Vector3Tuple) {
  return new THREE.Vector3(tuple[0], tuple[1], tuple[2]);
}

function findStops(progressValue: number) {
  const progress = THREE.MathUtils.clamp(progressValue, 0, 1);
  for (let index = 0; index < CAMERA_STOPS.length - 1; index += 1) {
    const from = CAMERA_STOPS[index];
    const to = CAMERA_STOPS[index + 1];
    if (progress <= to.at) {
      return {
        from,
        to,
        progress: smootherstep((progress - from.at) / (to.at - from.at)),
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
) {
  const fromPosition = tupleToVector(from.position);
  const toPosition = tupleToVector(to.position);
  const fromTarget = tupleToVector(from.target);
  const toTarget = tupleToVector(to.target);
  targetOutput.lerpVectors(fromTarget, toTarget, progress);

  const fromOffset = fromPosition.sub(fromTarget);
  const toOffset = toPosition.sub(toTarget);
  const fromRadius = fromOffset.length();
  const toRadius = toOffset.length();
  const fromDirection = fromOffset.normalize();
  const toDirection = toOffset.normalize();
  const fullRotation = new THREE.Quaternion().setFromUnitVectors(
    fromDirection,
    toDirection,
  );
  const partialRotation = new THREE.Quaternion().slerp(fullRotation, progress);
  const radius = THREE.MathUtils.lerp(fromRadius, toRadius, progress);

  output
    .copy(fromDirection)
    .applyQuaternion(partialRotation)
    .multiplyScalar(radius)
    .add(targetOutput);
  output.y += Math.sin(Math.PI * progress) * arc;
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

function ProductCallout({
  annotation,
  active,
  modelRef,
}: {
  annotation: HeroAnnotation;
  active: boolean;
  modelRef: RefObject<THREE.Group>;
}) {
  const facingRef = useRef(false);
  const [facing, setFacing] = useState(false);
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

  useFrame(({ camera }) => {
    const model = modelRef.current;
    if (!model) return;
    model.updateWorldMatrix(true, false);
    worldPosition.copy(localPosition).applyMatrix4(model.matrixWorld);
    worldNormal.copy(localNormal).transformDirection(model.matrixWorld);
    viewDirection.copy(camera.position).sub(worldPosition).normalize();
    const facingScore = worldNormal.dot(viewDirection);
    const nextFacing = facingRef.current ? facingScore > -0.08 : facingScore > 0.1;
    if (nextFacing !== facingRef.current) {
      facingRef.current = nextFacing;
      setFacing(nextFacing);
    }
  });

  return (
    <Html
      position={annotation.position}
      occlude={[modelRef]}
      zIndexRange={[18, 0]}
      className="hero-3d-callout-anchor"
      aria-hidden="true"
    >
      <div
        aria-hidden="true"
        className={`hero-3d-callout is-${annotation.direction} ${active ? "is-active" : ""} ${facing ? "is-facing" : ""}`}
      >
        <span className="hero-3d-callout-line" />
        <span className="hero-3d-callout-copy">
          <strong>{annotation.title}</strong>
          <small>{annotation.body}</small>
        </span>
      </div>
    </Html>
  );
}

function ProductScene({
  assetAttempt,
  scrollProgress,
  dragYaw,
  dragPitch,
  activeAnnotationIds,
  anisotropy,
  isVisible,
  onReady,
}: Omit<Hero3DCanvasProps, "mobile" | "onError"> & {
  anisotropy: number;
}) {
  const modelUrl =
    assetAttempt === 0
      ? HERO_3D_MANIFEST.modelUrl
      : `${HERO_3D_MANIFEST.modelUrl}?retry=${assetAttempt}`;
  const gltf = useGLTF(modelUrl);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const modelRef = useRef<THREE.Group>(null!);
  const readySentRef = useRef(false);
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

  useEffect(() => {
    const maximum = Math.min(anisotropy, maximumAnisotropy);
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = false;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) {
            value.anisotropy = maximum;
            value.generateMipmaps = true;
            value.needsUpdate = true;
          }
        }
      }
    });
    invalidate();
  }, [anisotropy, invalidate, maximumAnisotropy, model]);

  useEffect(() => {
    const subscriptions = [
      scrollProgress.on("change", invalidate),
      dragYaw.on("change", invalidate),
      dragPitch.on("change", invalidate),
    ];
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [dragPitch, dragYaw, invalidate, scrollProgress]);

  useEffect(() => {
    if (isVisible) invalidate();
  }, [invalidate, isVisible]);

  useFrame((_state, delta) => {
    const group = modelRef.current;
    if (!group) return;
    const progress = scrollProgress.get();
    const segment = findStops(progress);
    sphericalCameraPosition(
      segment.from.camera,
      segment.to.camera,
      segment.progress,
      THREE.MathUtils.lerp(segment.from.arc, segment.to.arc, segment.progress),
      desiredPosition,
      desiredTarget,
    );
    desiredModelPosition.lerpVectors(
      tupleToVector(segment.from.modelPosition),
      tupleToVector(segment.to.modelPosition),
      segment.progress,
    );
    const desiredScale = THREE.MathUtils.lerp(
      segment.from.modelScale,
      segment.to.modelScale,
      segment.progress,
    );
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

    const damping = 8.4;
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      desiredPosition.x,
      damping,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      desiredPosition.y,
      damping,
      delta,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      desiredPosition.z,
      damping,
      delta,
    );
    camera.quaternion.slerp(desiredQuaternion, 1 - Math.exp(-damping * delta));
    camera.fov = THREE.MathUtils.damp(camera.fov, desiredFov, damping, delta);
    camera.updateProjectionMatrix();

    group.position.x = THREE.MathUtils.damp(
      group.position.x,
      desiredModelPosition.x,
      damping,
      delta,
    );
    group.position.y = THREE.MathUtils.damp(
      group.position.y,
      desiredModelPosition.y,
      damping,
      delta,
    );
    group.position.z = THREE.MathUtils.damp(
      group.position.z,
      desiredModelPosition.z,
      damping,
      delta,
    );
    const scale = THREE.MathUtils.damp(group.scale.x, desiredScale, damping, delta);
    group.scale.setScalar(scale);
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      dragYaw.get(),
      10,
      delta,
    );
    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      dragPitch.get(),
      10,
      delta,
    );

    if (!readySentRef.current) {
      readySentRef.current = true;
      window.requestAnimationFrame(onReady);
    }

    const cameraSettled = camera.position.distanceToSquared(desiredPosition) < 0.000004;
    const quaternionSettled = camera.quaternion.angleTo(desiredQuaternion) < 0.0008;
    const modelSettled =
      group.position.distanceToSquared(desiredModelPosition) < 0.000004 &&
      Math.abs(group.scale.x - desiredScale) < 0.0008 &&
      Math.abs(group.rotation.y - dragYaw.get()) < 0.0004 &&
      Math.abs(group.rotation.x - dragPitch.get()) < 0.0004;
    if (isVisible && (!cameraSettled || !quaternionSettled || !modelSettled)) {
      invalidate();
    }
  });

  return (
    <group ref={modelRef} scale={HERO_3D_MANIFEST.asset.scale}>
      <primitive object={model} dispose={null} />
      {HERO_ANNOTATIONS.map((annotation) => (
        <ProductCallout
          key={annotation.id}
          annotation={annotation}
          active={activeAnnotationIds.includes(annotation.id)}
          modelRef={modelRef}
        />
      ))}
    </group>
  );
}

function SceneLighting({
  assetAttempt,
  shadowMapSize,
}: {
  assetAttempt: number;
  shadowMapSize: 512 | 1024;
}) {
  const environmentUrl =
    assetAttempt === 0
      ? HERO_3D_MANIFEST.environmentUrl
      : `${HERO_3D_MANIFEST.environmentUrl}?retry=${assetAttempt}`;

  return (
    <>
      <Environment
        files={environmentUrl}
        background={false}
        environmentIntensity={0.72}
      />
      <spotLight
        position={[-3.8, 5.6, 4.2]}
        intensity={52}
        angle={0.62}
        penumbra={1}
        decay={2}
        distance={16}
        color="#ffe5d2"
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-bias={-0.00008}
      />
      <rectAreaLight
        position={[4.2, 1.4, 3.2]}
        rotation={[0, -0.82, 0]}
        intensity={7.5}
        width={4.4}
        height={5.2}
        color="#bad8ff"
      />
      <rectAreaLight
        position={[-1.2, 3.6, -4.8]}
        rotation={[0.3, 0.28, 0]}
        intensity={8.5}
        width={3.4}
        height={5.4}
        color="#d8e7ff"
      />
    </>
  );
}

export default function Hero3DCanvas({
  assetAttempt,
  scrollProgress,
  dragYaw,
  dragPitch,
  activeAnnotationIds,
  isVisible,
  mobile,
  onReady,
  onError,
}: Hero3DCanvasProps) {
  const highQuality = useMemo<QualityPreset>(
    () => ({
      maximumDpr: mobile ? 1.5 : 2,
      shadowMapSize: 1024,
      anisotropy: 8,
    }),
    [mobile],
  );
  const lowQuality = useMemo<QualityPreset>(
    () => ({
      maximumDpr: mobile ? 1 : 1.35,
      shadowMapSize: 512,
      anisotropy: 4,
    }),
    [mobile],
  );
  const [quality, setQuality] = useState<QualityPreset>(() =>
    mobile ? lowQuality : highQuality,
  );

  useEffect(() => {
    setQuality(mobile ? lowQuality : highQuality);
  }, [highQuality, lowQuality, mobile]);

  return (
    <div className="hero-3d-canvas absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={isVisible ? "demand" : "never"}
        dpr={[1, quality.maximumDpr]}
        shadows="percentage"
        camera={{
          position: [...HERO_3D_MANIFEST.cameras.intro.position],
          fov: HERO_3D_MANIFEST.cameras.intro.fov,
          near: 0.08,
          far: 30,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <ContextLossGuard onError={onError} />
        <PerformanceMonitor
          flipflops={3}
          onIncline={() => setQuality(highQuality)}
          onDecline={() => setQuality(lowQuality)}
          onFallback={() => setQuality(lowQuality)}
        />
        <Suspense fallback={null}>
          <SceneLighting
            assetAttempt={assetAttempt}
            shadowMapSize={quality.shadowMapSize}
          />
          <ProductScene
            assetAttempt={assetAttempt}
            scrollProgress={scrollProgress}
            dragYaw={dragYaw}
            dragPitch={dragPitch}
            activeAnnotationIds={activeAnnotationIds}
            isVisible={isVisible}
            onReady={onReady}
            anisotropy={quality.anisotropy}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
