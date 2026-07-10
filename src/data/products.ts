export type Product = {
  id: string;
  name: string;
  tagline: string;
  priceBRL: number;
  priceMonthlyBRL: number;
  image: string;
  colors: { name: string; hex: string }[];
  badge?: string;
};

export const products: Product[] = [
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    tagline: "Titânio. Mais leve. Mais Pro.",
    priceBRL: 11999,
    priceMonthlyBRL: 499.96,
    image: "/products/iphone-17-pro-hero.jpg",
    colors: [
      { name: "Laranja Cósmico", hex: "#cc7a3d" },
      { name: "Azul Profundo", hex: "#3a4a5e" },
      { name: "Prata", hex: "#cfcdc9" },
    ],
    badge: "Novo",
  },
  {
    id: "iphone-17",
    name: "iPhone 17",
    tagline: "ProMotion de 120 Hz em toda a linha.",
    priceBRL: 7999,
    priceMonthlyBRL: 333.29,
    image: "/products/iphone-17-color-lineup.jpg",
    colors: [
      { name: "Lavanda", hex: "#c9b8e0" },
      { name: "Azul Névoa", hex: "#8aa9c0" },
      { name: "Sálvia", hex: "#a8b59e" },
      { name: "Branco", hex: "#ecebe6" },
      { name: "Preto", hex: "#1d1d1f" },
    ],
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    tagline: "Controle da Câmera. Inteligência no seu bolso.",
    priceBRL: 6999,
    priceMonthlyBRL: 291.63,
    image: "/products/iphone-16-finish-lineup.jpg",
    colors: [
      { name: "Ultramarino", hex: "#627ea7" },
      { name: "Verde-azulado", hex: "#94c4c1" },
      { name: "Rosa", hex: "#f5b6c5" },
      { name: "Branco", hex: "#ecebe6" },
      { name: "Preto", hex: "#1d1d1f" },
    ],
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    tagline: "Vidro colorido infundido. Dynamic Island.",
    priceBRL: 5499,
    priceMonthlyBRL: 229.13,
    image: "/products/iphone-15-color-lineup.jpg",
    colors: [
      { name: "Rosa", hex: "#f3c1c4" },
      { name: "Amarelo", hex: "#f3e1b3" },
      { name: "Verde", hex: "#c4d3b8" },
      { name: "Azul", hex: "#b9c7d8" },
      { name: "Preto", hex: "#1d1d1f" },
    ],
  },
];

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
