export const motionSpring = {
  press: { type: 'spring' as const, stiffness: 420, damping: 32, mass: .55 },
  state: { type: 'spring' as const, stiffness: 300, damping: 30, mass: .7 },
  reveal: { type: 'spring' as const, stiffness: 180, damping: 27, mass: .85 },
  depth: { type: 'spring' as const, stiffness: 105, damping: 24, mass: 1 },
};

export const STAGGER = 0.05;
