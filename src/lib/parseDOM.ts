import * as cheerio from "cheerio/lib/slim";
import { noCORSGetText } from "./noCors";
import { safeValidateURL } from "./validation/url";

class $ResourceMissingUrlError extends Error {
  constructor(
    element: cheerio.Cheerio<cheerio.AnyNode>,
    attribute: string,
    options?: ErrorOptions
  ) {
    super(`${element.prop("outerHTML")} is missing \`${attribute}\``, options);
  }
}

class $ResourceHasInvalidTypeError extends Error {
  constructor(
    element: cheerio.Cheerio<cheerio.AnyNode>,
    options?: ErrorOptions
  ) {
    super(`${element.prop("outerHTML")} has an invalid type!`, options);
  }
}

type $Extractor = (
  element: cheerio.Cheerio<cheerio.AnyNode>,
  url: string
) => Promise<string>;

const CSSLinkAttributes = {
  rel: "stylesheet",
  type: "text/css",
} as const;
type CSSLinkAttribute = keyof typeof CSSLinkAttributes;
const $extractCSS: $Extractor = (link, url) => {
  (Object.keys(CSSLinkAttributes) as Array<CSSLinkAttribute>).forEach(
    (attribute) => {
      if (link.attr(attribute) !== CSSLinkAttributes[attribute]) {
        new $ResourceMissingUrlError(link, attribute);
      }
    }
  );
  const href = link.attr("href");
  if (!href) {
    return Promise.reject(new $ResourceMissingUrlError(link, "href"));
  }

  const uri = new URL(href, safeValidateURL(href).success ? href : url);
  if (!uri.pathname.endsWith(".css")) {
    return Promise.reject(new $ResourceHasInvalidTypeError(link));
  }

  return noCORSGetText(uri.href);
};

const ScriptAttributes = {
  rel: "stylesheet",
  type: "text/css",
} as const;
type Script = keyof typeof ScriptAttributes;
const $extractScript: $Extractor = (script, url) => {
  (Object.keys(ScriptAttributes) as Array<Script>).forEach((attribute) => {
    if (script.attr(attribute) !== CSSLinkAttributes[attribute]) {
      new $ResourceMissingUrlError(script, attribute);
    }
  });

  if (script.prop("innerHTML")) {
    return Promise.resolve(script.prop("innerHTML") ?? "");
  }
  const src = script.attr("src");
  if (!src) {
    return Promise.reject(new $ResourceMissingUrlError(script, "src"));
  }

  const uri = new URL(src, safeValidateURL(src).success ? src : url);
  if (!uri.pathname.endsWith(".js") && !uri.pathname.endsWith(".mjs")) {
    return Promise.reject(new $ResourceHasInvalidTypeError(script));
  }

  return noCORSGetText(uri.href);
};

const VOID_TAGS = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
] as const;
export async function processAssets(url: string) {
  const text = await noCORSGetText(url);
  const $ = cheerio.load(text);

  const tags = [
    ...$("*").map((_, el) => {
      const node = $(el);
      const tag = $(node).prop("tagName")?.toLowerCase();
      const attributes = $(node)
        .prop("attributes")
        .map((attribute) => `${attribute.name}=${attribute.value}`)
        .join(" ");
      return (
        `<${tag}${attributes ? " " : ""}${attributes}>` +
        (VOID_TAGS.includes(tag as (typeof VOID_TAGS)[number])
          ? ""
          : `</${tag}>`)
      );
    }),
  ];
  const $links = $("link");
  const $scripts = $("script");
  const $resources = await Promise.allSettled([
    ...$links.map((_, el) => $extractCSS($(el), url)),
    ...$scripts.map((_, el) => $extractScript($(el), url)),
  ]);
  const css = $resources
    .slice(0, $links.length)
    .reduce((fullfilled, result) => {
      if (result.status === "fulfilled") {
        fullfilled.push(result.value);
      }
      return fullfilled;
    }, [] as Array<string>);
  const js = $resources.slice(-$scripts.length).reduce((fullfilled, result) => {
    if (result.status === "fulfilled") {
      fullfilled.push(result.value);
    }
    return fullfilled;
  }, [] as Array<string>);
  const styles = $("style")
    .map((_, el) => $(el).prop("textContent"))
    .slice();
  const body = $("body").not("script").not("link").prop("textContent");

  return {
    body,
    css: [...css, ...styles],
    html: body ? [...tags, body] : tags,
    js,
    parsedDOM: $,
    tags,
    text,
  };
}
