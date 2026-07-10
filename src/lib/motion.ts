import type { Variants } from "motion/react";

export const easeFluid = [0.32, 0.72, 0, 1] as const;
export const easeSpring = [0.34, 1.56, 0.64, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: easeFluid },
  },
};

export const stagger = (delay = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: delay, delayChildren: 0.05 },
  },
});

export const blurReveal: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, delay: i * 0.06, ease: easeFluid },
  }),
};
