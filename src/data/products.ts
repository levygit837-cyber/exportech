export const USD_BRL_RATE = 5.27;

export type StorageId = "128gb" | "256gb" | "512gb" | "1tb";

export type StorageOption = {
  id: StorageId;
  label: string;
};

export type ProductFinish = {
  id: string;
  name: string;
  hex: string;
  image: string;
  pricesUSD: Partial<Record<StorageId, number>>;
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  storages: StorageOption[];
  finishes: ProductFinish[];
  defaultStorage: StorageId;
  defaultFinish: string;
  mediaScale: number;
  label?: string;
};

const storage = (id: StorageId, label: string): StorageOption => ({ id, label });

export const products: Product[] = [
  {
    id: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    tagline: "Desempenho Pro. A maior bateria em um iPhone.",
    storages: [storage("256gb", "256 GB"), storage("512gb", "512 GB"), storage("1tb", "1 TB")],
    defaultStorage: "256gb",
    defaultFinish: "orange",
    mediaScale: 1.28,
    label: "Mais recente",
    finishes: [
      {
        id: "blue",
        name: "Azul Profundo",
        hex: "#334459",
        image: "/products/catalog/iphone-17-pro-max-blue.png",
        pricesUSD: { "256gb": 1175, "512gb": 1490, "1tb": 1750 },
      },
      {
        id: "orange",
        name: "Laranja Cósmico",
        hex: "#df7741",
        image: "/products/catalog/iphone-17-pro-max-orange.png",
        pricesUSD: { "256gb": 1155, "512gb": 1480, "1tb": 1710 },
      },
      {
        id: "silver",
        name: "Prateado",
        hex: "#d8d7d2",
        image: "/products/catalog/iphone-17-pro-max-silver.png",
        pricesUSD: { "256gb": 1205, "512gb": 1510, "1tb": 1760 },
      },
    ],
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    tagline: "Potência Pro em um novo design unibody.",
    storages: [storage("256gb", "256 GB"), storage("512gb", "512 GB")],
    defaultStorage: "256gb",
    defaultFinish: "orange",
    mediaScale: 1.32,
    label: "Lançamento",
    finishes: [
      {
        id: "blue",
        name: "Azul Profundo",
        hex: "#334459",
        image: "/products/catalog/iphone-17-pro-blue.png",
        pricesUSD: { "256gb": 1080, "512gb": 1370 },
      },
      {
        id: "orange",
        name: "Laranja Cósmico",
        hex: "#df7741",
        image: "/products/catalog/iphone-17-pro-orange.png",
        pricesUSD: { "256gb": 1080, "512gb": 1360 },
      },
      {
        id: "silver",
        name: "Prateado",
        hex: "#d8d7d2",
        image: "/products/catalog/iphone-17-pro-silver.png",
        pricesUSD: { "256gb": 1120, "512gb": 1380 },
      },
    ],
  },
  {
    id: "iphone-air",
    name: "iPhone Air",
    tagline: "O iPhone mais fino já feito.",
    storages: [storage("256gb", "256 GB")],
    defaultStorage: "256gb",
    defaultFinish: "white",
    mediaScale: 1.38,
    label: "Lançamento",
    finishes: [
      {
        id: "white",
        name: "Branco Nuvem",
        hex: "#ececea",
        image: "/products/catalog/iphone-air-white.png",
        pricesUSD: { "256gb": 935 },
      },
    ],
  },
  {
    id: "iphone-17",
    name: "iPhone 17",
    tagline: "ProMotion de 120 Hz. Mais resistente.",
    storages: [storage("256gb", "256 GB")],
    defaultStorage: "256gb",
    defaultFinish: "blue",
    mediaScale: 1.45,
    label: "Lançamento",
    finishes: [
      {
        id: "black",
        name: "Preto",
        hex: "#232426",
        image: "/products/catalog/iphone-17-black.png",
        pricesUSD: { "256gb": 865 },
      },
      {
        id: "blue",
        name: "Azul Névoa",
        hex: "#9fb8cf",
        image: "/products/catalog/iphone-17-blue.png",
        pricesUSD: { "256gb": 860 },
      },
      {
        id: "lavender",
        name: "Lavanda",
        hex: "#d3c6e6",
        image: "/products/catalog/iphone-17-lavender.png",
        pricesUSD: { "256gb": 865 },
      },
      {
        id: "sage",
        name: "Sálvia",
        hex: "#b2bea8",
        image: "/products/catalog/iphone-17-sage.png",
        pricesUSD: { "256gb": 860 },
      },
      {
        id: "white",
        name: "Branco",
        hex: "#eeeeda",
        image: "/products/catalog/iphone-17-white.png",
        pricesUSD: { "256gb": 865 },
      },
    ],
  },
  {
    id: "iphone-17e",
    name: "iPhone 17e",
    tagline: "Recursos essenciais. Excelente custo-benefício.",
    storages: [storage("256gb", "256 GB")],
    defaultStorage: "256gb",
    defaultFinish: "black",
    mediaScale: 1.25,
    label: "Novo",
    finishes: [
      {
        id: "black",
        name: "Preto",
        hex: "#292a2c",
        image: "/products/catalog/iphone-17e-black.png",
        pricesUSD: { "256gb": 600 },
      },
    ],
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    tagline: "Controle da Câmera. Chip A18.",
    storages: [storage("128gb", "128 GB")],
    defaultStorage: "128gb",
    defaultFinish: "black",
    mediaScale: 1,
    finishes: [
      {
        id: "black",
        name: "Preto",
        hex: "#252628",
        image: "/products/catalog/iphone-16-black.png",
        pricesUSD: { "128gb": 680 },
      },
      {
        id: "pink",
        name: "Rosa",
        hex: "#e9a8bb",
        image: "/products/catalog/iphone-16-pink.png",
        pricesUSD: { "128gb": 735 },
      },
      {
        id: "teal",
        name: "Verde-azulado",
        hex: "#76aaa8",
        image: "/products/catalog/iphone-16-teal.png",
        pricesUSD: { "128gb": 690 },
      },
      {
        id: "ultramarine",
        name: "Ultramarino",
        hex: "#667fd0",
        image: "/products/catalog/iphone-16-ultramarine.png",
        pricesUSD: { "128gb": 690 },
      },
      {
        id: "white",
        name: "Branco",
        hex: "#eeeeda",
        image: "/products/catalog/iphone-16-white.png",
        pricesUSD: { "128gb": 735 },
      },
    ],
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    tagline: "Vidro colorido. Dynamic Island.",
    storages: [storage("128gb", "128 GB")],
    defaultStorage: "128gb",
    defaultFinish: "black",
    mediaScale: 1,
    finishes: [
      {
        id: "black",
        name: "Preto",
        hex: "#282a2b",
        image: "/products/catalog/iphone-15-black.png",
        pricesUSD: { "128gb": 630 },
      },
    ],
  },
];

export const featuredProduct = products[0];

export function getPriceUSD(
  product: Product,
  finishId: string,
  storageId: StorageId,
) {
  const finish = product.finishes.find((item) => item.id === finishId);
  return finish?.pricesUSD[storageId] ?? 0;
}

export function convertUSDToBRL(valueUSD: number) {
  const converted = valueUSD * USD_BRL_RATE;
  return Math.ceil(converted / 100) * 100 - 1;
}

export function getStartingPriceUSD(product: Product) {
  return Math.min(
    ...product.finishes.flatMap((finish) =>
      Object.values(finish.pricesUSD).filter(
        (price): price is number => typeof price === "number",
      ),
    ),
  );
}

export const formatBRL = (value: number, cents = false) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(value);

export const formatUSD = (value: number) =>
  `US$ ${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
  }).format(value)}`;
