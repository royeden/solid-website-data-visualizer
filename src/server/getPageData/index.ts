"use server";
import { cache, json } from "@solidjs/router";
import { PNG } from "pngjs";
import { processAssets } from "~/lib/parseDOM";
import { pageDataToHexArray } from "~/lib/pageDataToHexArray";
import { validateURL } from "~/lib/validation/url";
import sharp from "sharp";
import { Resolution } from "~/lib/constants";
import { validateResolution } from "~/lib/validation/resolution";

function getMinutesInSeconds(minutes: number) {
  return minutes * 60;
}

function getHoursInMilliseconds(hours: number) {
  return getMinutesInSeconds(hours * 60);
}

export const getPageData = cache(
  async (url: string, resolution: Resolution, light = false) => {
    if (!url) {
      return undefined;
    }

    try {
      validateURL(url);
      validateResolution(resolution);

      const { body, css, html, js, tags, text, parsedDOM } =
        await processAssets(url);

      const red = pageDataToHexArray(text);
      const green = pageDataToHexArray(js.join(""));
      const blue = pageDataToHexArray(css.join(""));

      const length = Math.max(red.length, green.length, blue.length);
      const side = Math.ceil(Math.sqrt(length));
      const buffer = Buffer.alloc(side ** 2 * 8);
      const bitmap = new Uint8Array(buffer.buffer);

      // TODO make this a mix of the colors in a nicer fashion?
      for (let i = 0; i < side; i++) {
        for (let j = 0; j < side; j++) {
          const position = i * side + j;
          const r =
            position < red.length ? red[position % (red.length - 1)] : 0;
          const g =
            position < green.length ? green[position % (green.length - 1)] : 0;
          const b =
            position < blue.length ? blue[position % (blue.length - 1)] : 0;
          bitmap[position * 4] = light ? -r : r;
          bitmap[position * 4 + 1] = light ? -g : g;
          bitmap[position * 4 + 2] = light ? -b : b;
          bitmap[position * 4 + 3] = position > length ? 0 : 255;
        }
      }

      const png = new PNG({
        width: side,
        height: side,
        bitDepth: 8,
        colorType: 6,
        filterType: 4,
        inputColorType: 6,
        inputHasAlpha: true,
      });
      png.data = buffer;
      const name = new URL(url).host.replaceAll(".", "-");
      // import.meta.env.DEV && png.pack().pipe(createWriteStream(name));

      const pngBuffer = PNG.sync.write(png, {
        bitDepth: 8,
        colorType: 6,
        filterType: 4,
        inputHasAlpha: true,
      });

      return json(
        {
          base64:
            "data:image/png;base64," +
            (resolution
              ? await sharp(pngBuffer)
                  .resize(resolution, resolution, {
                    fit: "contain",
                  })
                  .toBuffer()
              : pngBuffer
            ).toString("base64"),
          red,
          blue,
          green,
          css,
          js,
          name,
          tags,
          url,
        },
        {
          headers: {
            "cache-control": `max-age=${getHoursInMilliseconds(1)}, stale-while-revalidate=${getHoursInMilliseconds(1) + getMinutesInSeconds(10)}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  },
  "page-data"
);
