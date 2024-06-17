export const SITE_NAME = "Solid.js Page Data Visualizer";

export const RESOLUTIONS = [0, 64, 128, 256, 512, 1024, 2048] as const;
export type Resolution = (typeof RESOLUTIONS)[number];
