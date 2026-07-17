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
    title: "Preço transparente",
    description: "Estimativa em BRL com a cotação configurada e referência original em USD.",
    variant: "wide",
    tone: "tint",
  },
  {
    id: "trade-in",
    title: "Escolha objetiva",
    description: "Compare armazenamento, acabamento e preço no mesmo card, sem perder o contexto.",
    variant: "narrow",
    tone: "neutral",
  },
  {
    id: "warranty",
    title: "Escolha com confiança",
    description: "Compare com calma e confirme disponibilidade antes de decidir.",
    variant: "narrow",
    tone: "neutral",
  },
  {
    id: "checkout",
    title: "Referência preservada",
    description: "A estimativa em BRL permanece acompanhada do preço original em USD.",
    variant: "narrow",
    tone: "neutral",
  },
];
