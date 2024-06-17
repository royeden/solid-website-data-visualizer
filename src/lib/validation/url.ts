import * as v from "valibot";

const URLSchema = v.string([v.regex(/^https?:\/\/.+/), v.url()]);

export const validateURL = (url: unknown) => v.parse(URLSchema, url);
export const safeValidateURL = (url: unknown) => v.safeParse(URLSchema, url);
