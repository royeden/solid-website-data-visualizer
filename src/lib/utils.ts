import { cx } from "class-variance-authority";
// import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof cx>) {
  return cx(inputs);
  // return twMerge(cx(inputs));
}
