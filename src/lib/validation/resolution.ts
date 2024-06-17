import * as v from "valibot";
import { RESOLUTIONS, Resolution } from "../constants";

const resolutionSchema = v.number([
  v.custom((resolution) => RESOLUTIONS.includes(resolution as Resolution)),
]);
export const validateResolution = (resolution: unknown) =>
  v.parse(resolutionSchema, resolution);
export const safeValidateResolution = (resolution: unknown) =>
  v.safeParse(resolutionSchema, resolution);
