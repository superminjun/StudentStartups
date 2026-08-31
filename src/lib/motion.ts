export const motionSpring = {
  press: { type: 'spring' as const, stiffness: 520, damping: 34, mass: 0.55 },
  state: { type: 'spring' as const, stiffness: 320, damping: 30, mass: 0.72 },
  reveal: { type: 'spring' as const, stiffness: 150, damping: 22, mass: 0.9 },
  depth: { type: 'spring' as const, stiffness: 120, damping: 24, mass: 1 },
};

export const STAGGER = 0.055;
