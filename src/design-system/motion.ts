import type { Transition, Variants } from "framer-motion";

export const auroraEase = [0.22, 1, 0.36, 1] as const;

export const auroraTransition: Transition = {
  duration: 0.32,
  ease: auroraEase,
};

export const auroraFadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: auroraTransition },
};

export const auroraScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: auroraTransition },
};

export const auroraPress = { scale: 0.975 };
