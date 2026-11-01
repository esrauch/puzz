/** Shared numbers: the audio mixer's levels (game tuning will join them). */
export const tuning = {
  audio: {
    /** Bus levels (0..1). */
    master: 0.9,
    music: 0.65,
    sfx: 0.8,
    ui: 0.5,
  },
} as const;
