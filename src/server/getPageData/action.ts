import { action, redirect } from "@solidjs/router";
import { validateURL } from "~/lib/validation/url";
import { getPageData } from ".";
import { validateResolution } from "~/lib/validation/resolution";
import { Resolution } from "~/lib/constants";

export const getPageDataAction = action(async (form: FormData) => {
  "use server";
  const url = validateURL(form.get("url") ?? "");
  const resolution = validateResolution(
    parseInt(form.get("resolution")?.toString() ?? "0"),
  );

  if (url) {
    const pageData = await getPageData(url, resolution as Resolution);
    if (pageData) {
      return redirect(
        `/?url=${encodeURIComponent(url)}&resolution=${resolution}`,
      );
    }
  }
  return new Error("Invalid URL!");
});
