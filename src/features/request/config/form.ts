export const MAX_FILES_PER_FIELD = 3

export const SIZE_OPTIONS = ["small", "medium", "large", "extra-large"] as const

export const COLOR_OPTIONS = ["black", "color", "mixed"] as const

export const PLACEMENT_OPTIONS = [
  "arm",
  "leg",
  "back",
  "chest",
  "ribs",
  "neck",
  "hand",
  "foot",
  "other",
] as const

export type SizeOption = (typeof SIZE_OPTIONS)[number]
export type ColorOption = (typeof COLOR_OPTIONS)[number]
export type PlacementOption = (typeof PLACEMENT_OPTIONS)[number]
