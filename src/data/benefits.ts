export type Benefit = {
  id: string;
  title: string;
  description: string;
  variant: "wide" | "narrow";
  tone: "neutral" | "tint";
};

export const benefits: Benefit[] = [
  {
    id: "payment",
    title: "Pagamento Flexível",
    description: "A partir de R$ 416,63 em 24 vezes com 0% de juros no cartão.",
    variant: "wide",
    tone: "tint",
  },
  {
    id: "trade-in",
    title: "Trade-In",
    description: "Crédito de até R$ 4.500 na troca do seu iPhone antigo.",
    variant: "narrow",
    tone: "neutral",
  },
  {
    id: "warranty",
    title: "AppleCare+",
    description: "Suporte especializado e cobertura estendida por 24 meses.",
    variant: "narrow",
    tone: "neutral",
  },
  {
    id: "checkout",
    title: "Checkout Seguro",
    description: "Seus dados protegidos com criptografia de padrão bancário.",
    variant: "narrow",
    tone: "neutral",
  },
];
