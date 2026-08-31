export const motionSpring = {
  press: { type: 'spring' as const, stiffness: 360, damping: 30, mass: .62 },
  state: { type: 'spring' as const, stiffness: 210, damping: 27, mass: .82 },
  reveal: { type: 'spring' as const, stiffness: 105, damping: 22, mass: 1.02 },
  depth: { type: 'spring' as const, stiffness: 78, damping: 20, mass: 1.18 },
};

export const STAGGER = 0.07;
