export type Hero3DState = "poster" | "loading" | "ready" | "error";

export type HeroChapterId =
  | "intro"
  | "camera-control"
  | "rear"
  | "camera-macro"
  | "action-side"
  | "front"
  | "outro";

export type HeroAnnotationId =
  | "unibody"
  | "action-button"
  | "camera-control"
  | "display"
  | "ceramic-shield"
  | "camera-system"
  | "lidar";

export type Vector3Tuple = readonly [number, number, number];

export type HeroCameraPreset = {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
};

export type HeroAnnotation = {
  id: HeroAnnotationId;
  anchor: `anchor_${string}`;
  title: string;
  body: string;
  position: Vector3Tuple;
  normal: Vector3Tuple;
  direction: "left" | "right";
  range: readonly [number, number];
  mobilePriority: number;
};

export const HERO_3D_ASSETS = {
  modelUrl: "/models/iphone-17-pro-max/apple-user-remastered-web.glb",
  posterUrl: "/models/iphone-17-pro-max/apple-user-poster.webp",
  mobilePosterUrl:
    "/models/iphone-17-pro-max/apple-user-poster-mobile.webp",
  environmentUrl:
    "/models/iphone-17-pro-max/studio_small_08_1k.hdr",
} as const;

export const HERO_3D_MANIFEST = {
  ...HERO_3D_ASSETS,
  description:
    "Modelo tridimensional não oficial do iPhone 17 Pro Max em laranja-cósmico. Role a página para conhecer a estrutura, os controles, as câmeras e a tela.",
  asset: {
    sha256:
      "9d401b6b32bc57a86cafa266245b107e6e597b86fc441e2287d4facd3aa2a8b8",
    bytes: 6_534_224,
    triangles: 76_426,
    meshes: 32,
    materials: 32,
    drawCalls: 32,
    decodedTextureBudgetBytes: 18_235_392,
    boundsMeters: [0.078980409, 0.162937731, 0.013179803] as Vector3Tuple,
    scale: 18,
  },
  cameras: {
    intro: {
      position: [1.71, 0.684, 5.4],
      target: [0, 0.09, 0],
      fov: 31,
    },
    "camera-control": {
      position: [5.67, 0.36, 0.36],
      target: [0, 0, 0],
      fov: 31.5,
    },
    rear: {
      position: [1.08, 0.756, -5.49],
      target: [0.09, 0.216, 0],
      fov: 31,
    },
    "camera-macro": {
      position: [1.26, 1.494, -2.97],
      target: [0.396, 1.008, -0.108],
      fov: 34,
    },
    "action-side": {
      position: [-5.67, 0.468, 0.324],
      target: [0, 0.144, 0],
      fov: 31.5,
    },
    front: {
      position: [-0.27, 0.36, 5.49],
      target: [0, 0, 0],
      fov: 31,
    },
    outro: {
      position: [-1.62, 0.612, 5.49],
      target: [0, 0.072, 0],
      fov: 32,
    },
  } satisfies Record<HeroChapterId, HeroCameraPreset>,
} as const;

export const HERO_CHAPTERS: ReadonlyArray<{
  id: HeroChapterId;
  start: number;
  end: number;
}> = [
  { id: "intro", start: 0, end: 0.12 },
  { id: "camera-control", start: 0.12, end: 0.28 },
  { id: "rear", start: 0.28, end: 0.48 },
  { id: "camera-macro", start: 0.48, end: 0.64 },
  { id: "action-side", start: 0.64, end: 0.8 },
  { id: "front", start: 0.8, end: 0.94 },
  { id: "outro", start: 0.94, end: 1 },
];

export const HERO_ANNOTATIONS: ReadonlyArray<HeroAnnotation> = [
  {
    id: "camera-control",
    anchor: "anchor_camera_control",
    title: "Controle da Câmera",
    body: "Exposição, zoom e mais.",
    position: [0.03948, -0.029711, 0.001109],
    normal: [1, 0, 0],
    direction: "right",
    range: [0.145, 0.28],
    mobilePriority: 1,
  },
  {
    id: "camera-system",
    anchor: "anchor_camera_system",
    title: "Sistema Fusion Pro",
    body: "Três câmeras Fusion de 48 MP.",
    position: [0.02468, 0.057289, -0.006691],
    normal: [0, 0, -1],
    direction: "right",
    range: [0.31, 0.5],
    mobilePriority: 1,
  },
  {
    id: "lidar",
    anchor: "anchor_lidar",
    title: "Scanner LiDAR",
    body: "Leitura de profundidade.",
    position: [-0.02522, 0.047389, -0.005091],
    normal: [0, 0, -1],
    direction: "left",
    range: [0.505, 0.64],
    mobilePriority: 1,
  },
  {
    id: "unibody",
    anchor: "anchor_unibody",
    title: "Alumínio unibody",
    body: "Estrutura única em alumínio.",
    position: [0.03948, 0.003289, 0.001109],
    normal: [1, 0, 0],
    direction: "right",
    range: [0.65, 0.735],
    mobilePriority: 1,
  },
  {
    id: "action-button",
    anchor: "anchor_action_button",
    title: "Botão de Ação",
    body: "Atalhos configuráveis.",
    position: [-0.03972, 0.047289, 0.001109],
    normal: [-1, 0, 0],
    direction: "left",
    range: [0.715, 0.8],
    mobilePriority: 2,
  },
  {
    id: "display",
    anchor: "anchor_display",
    title: "Super Retina XDR",
    body: "OLED de 6,9 polegadas.",
    position: [-0.00002, 0.013289, 0.006909],
    normal: [0, 0, 1],
    direction: "left",
    range: [0.815, 0.895],
    mobilePriority: 1,
  },
  {
    id: "ceramic-shield",
    anchor: "anchor_ceramic_shield",
    title: "Ceramic Shield 2",
    body: "Proteção na parte da frente.",
    position: [0.02398, 0.060289, 0.006909],
    normal: [0, 0, 1],
    direction: "right",
    range: [0.875, 0.94],
    mobilePriority: 2,
  },
];

export function clampHeroProgress(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function getHeroChapter(progressValue: number): HeroChapterId {
  const progress = clampHeroProgress(progressValue);
  return (
    HERO_CHAPTERS.find(
      (chapter, index) =>
        progress >= chapter.start &&
        (progress < chapter.end || index === HERO_CHAPTERS.length - 1),
    )?.id ?? "intro"
  );
}

export function getActiveHeroAnnotations(
  progressValue: number,
  mobile: boolean,
): HeroAnnotationId[] {
  const progress = clampHeroProgress(progressValue);
  const active = HERO_ANNOTATIONS.filter(
    (annotation) =>
      progress >= annotation.range[0] && progress < annotation.range[1],
  ).sort((left, right) => left.mobilePriority - right.mobilePriority);
  return active.slice(0, mobile ? 1 : 2).map((annotation) => annotation.id);
}
