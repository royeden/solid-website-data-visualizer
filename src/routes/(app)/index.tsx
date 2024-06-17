import {
  A,
  RouteDefinition,
  createAsync,
  useSubmission,
  useSearchParams,
} from "@solidjs/router";
import { Balancer } from "solid-wrap-balancer";
import { Title } from "@solidjs/meta";
import { For, Show, createEffect, createSignal } from "solid-js";
import { getPageData } from "~/server/getPageData";
import { createAutoAnimate } from "@formkit/auto-animate/solid";
import { getPageDataAction } from "~/server/getPageData/action";
import { cn } from "~/lib/utils";
import {
  focusVisibleStyle,
  h1Style,
  h2Style,
  pStyle,
  smallStyle,
} from "~/components/design-system";
import { Resolution, SITE_NAME } from "~/lib/constants";
import styles from "./cube.module.css";

const formatter = new Intl.NumberFormat("en-us", {
  style: "decimal",
});

export const route = {
  load: ({ location }) => {
    const searchParams = new URLSearchParams(location.search);
    void getPageData(
      searchParams.get("url") ?? "",
      parseInt(searchParams.get("resolution") ?? "0") as Resolution
    );
  },
} satisfies RouteDefinition;

type Entry = {
  url: string;
  size: number;
};

export default function Home() {
  const [searched, setSearched] = createSignal(new Set<string>());
  const [max, setMax] = createSignal<Entry>();
  const [min, setMin] = createSignal<Entry>();
  const [searchParams] = useSearchParams<{
    light: string;
    url: string;
    resolution: string;
  }>();
  const getPageDataSubmission = useSubmission(getPageDataAction);
  const pageData = createAsync(
    () =>
      getPageData(
        searchParams.url ?? "",
        parseInt(searchParams?.resolution ?? "0") as Resolution,
        searchParams.light === "true"
      ),
    {
      deferStream: true,
    }
  );
  const [current] = createAutoAnimate();

  createEffect(() => {
    // untrack to avoid reading too many times
    const data = pageData();
    const maxEntry = max();
    const minEntry = min();
    if (data && searchParams.url && !searched().has(searchParams.url)) {
      setSearched((set) => new Set(set.add(searchParams.url as string)));
      const size = Math.max(
        data.red.length,
        data.green.length,
        data.blue.length
      );
      if ((maxEntry?.size ?? 0) < size) {
        setMax({
          size,
          url: searchParams.url as string,
        });
      }
      if ((minEntry?.size ?? Number.MAX_SAFE_INTEGER) > size) {
        setMin({
          size,
          url: searchParams.url as string,
        });
      }
    }
  });

  return (
    <main class="flex flex-col items-center gap-y-6 p-4">
      <Title>{`${SITE_NAME}${searchParams.url ? `| ${searchParams.url}` : ""}`}</Title>
      <h1 class={h1Style}>
        <Balancer class="text-center">{SITE_NAME}</Balancer>
      </h1>
      <section
        ref={current} // TODO remove this from here in favor of making 2 auto animate references (one for the details and one for the image itself)
        class="flex w-full flex-col items-center justify-center gap-y-5"
      >
        <Show when={getPageDataSubmission.result} keyed>
          {(error) => <p class="text-destructive">{error.message}</p>}
        </Show>
        {/* TODO unkey this */}
        <Show
          when={pageData()}
          fallback={
            <p class={pStyle}>Please search for a site using the navbar</p>
          }
          keyed
        >
          {(data) => (
            <>
              <article class="grid w-full grid-cols-1 items-start justify-center gap-6 md:grid-cols-2">
                <img
                  class={cn(
                    "w-full shrink object-contain",
                    getPageDataSubmission.pending && "animate-pulse"
                  )}
                  src={data.base64}
                  alt={`Visualization of ${searchParams.url}'s data in a ${searchParams.resolution ?? "full"}${searchParams.resolution && "px"} resolution`}
                />
                <section class="flex flex-col gap-y-4 py-4 md:w-full">
                  <header>
                    <h2 class={h2Style}>
                      Data for{" "}
                      <a
                        class={cn(
                          focusVisibleStyle,
                          "text-primary underline hover:text-primary/90"
                        )}
                        href={searchParams.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {searchParams.url}
                      </a>
                    </h2>
                  </header>
                  <div class="flex items-start">
                    <div class="w-full">
                      <p class={pStyle}>Details:</p>
                      <div class="flex items-center gap-x-2">
                        <div class="h-4 w-4 bg-red-800" />
                        <p class={smallStyle}>
                          HTML {formatter.format(data.red.length * 8)} bytes
                        </p>
                      </div>
                      <div class="flex items-center gap-x-2">
                        <div class="h-4 w-4 bg-green-800" />
                        <p class={smallStyle}>
                          JS {formatter.format(data.green.length * 8)} bytes
                        </p>
                      </div>
                      <div class="flex items-center gap-x-2">
                        <div class="h-4 w-4 bg-blue-800" />
                        <p class={smallStyle}>
                          CSS {formatter.format(data.blue.length * 8)} bytes
                        </p>
                      </div>
                    </div>
                    <div
                      class={cn(
                        "w-full h-full aspect-square motion-reduce:hidden",
                        styles.container
                      )}
                    >
                      <div class={cn("w-1/3 h-1/3 relative", styles.cube)}>
                        {[
                          { y: 0 },
                          { y: 90 },
                          { y: 180 },
                          { y: -90 },
                          { x: -90 },
                          { x: 90 },
                        ].map(({ x, y }) => (
                          <div
                            class="absolute w-full h-full"
                            style={{
                              transform: `rotateX(${x ?? 0}deg) rotateY(${y ?? 0}deg) rotateY(-90deg) translateX(50%) rotateY(90deg) `,
                            }}
                          >
                            <img
                              class="w-full h-full"
                              src={data.base64}
                              alt={`Visualization of ${searchParams.url}'s data in a ${searchParams.resolution ?? "full"}${searchParams.resolution && "px"} resolution`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p class={pStyle}>Previously visited:</p>
                  <div class="flex w-full flex-wrap gap-4">
                    <For each={Array.from(searched())}>
                      {(url) => (
                        <A
                          class="text-primary hover:underline"
                          href={`/?url=${url}&resolution=${searchParams.resolution ?? 0}`}
                        >
                          {url}
                        </A>
                      )}
                    </For>
                  </div>
                </section>
              </article>
            </>
          )}
        </Show>
      </section>
      {/* TODO add preview list
      <div ref={list} class="w-full">
        <For each={[]}>{() => null}</For>
      </div> */}

      <p class={pStyle}>
        Visit{" "}
        <a
          href="https://solidjs.com"
          target="_blank"
          class="text-primary hover:underline"
        >
          solidjs.com
        </a>{" "}
        to learn how to build Solid apps.
      </p>
    </main>
  );
}
