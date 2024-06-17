import { A, Location, useLocation, useSearchParams } from "@solidjs/router";
import { Input } from "./ui/input";
import { Button, buttonVariants } from "./ui/button";
import { ComponentProps, For, createUniqueId } from "solid-js";
import { getPageDataAction } from "~/server/getPageData/action";
import { RESOLUTIONS } from "~/lib/constants";

type NavLinkProps = ComponentProps<"a"> & {
  href: string;
  location: Location<unknown>;
};
function NavLink(props: NavLinkProps) {
  const isActive = () => props.href === props.location.pathname;
  return (
    <A
      class={buttonVariants({
        class: isActive() ? "underline" : "",
        size: "sm",
        variant: "link",
      })}
      {...props}
    />
  );
}

export default function Nav() {
  const location = useLocation();
  const [searchParams] = useSearchParams<{
    resolution: string;
    url: string;
  }>();
  const datalistId = createUniqueId();

  return (
    <header class="sticky top-0 z-40 flex w-full items-center border-b bg-background/90 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:h-14">
      <div class="container grid grid-cols-4 items-center gap-x-4 gap-y-1 max-sm:flex max-sm:flex-col">
        <nav class="flex items-center gap-x-3 max-md:col-span-2">
          <NavLink href={`/`} location={location}>
            Home
          </NavLink>
          <NavLink href={`/about`} location={location}>
            About
          </NavLink>
        </nav>
        <search class="col-span-2 flex w-full justify-center justify-self-center">
          <form
            class="flex w-full max-w-md"
            action={getPageDataAction}
            method="post"
          >
            <Input
              class="rounded-r-none border-r-0 focus-visible:ring-offset-0"
              list={datalistId}
              name="url"
              type="url"
              placeholder="Enter a URL..."
              required
              value={searchParams.url ?? ""}
            />
            <datalist id={datalistId}>
              <option value="http://" />
              <option value="https://" />
            </datalist>
            <select
              class="flex h-10 border border-input bg-transparent px-3 py-2 text-sm ring-offset-background transition file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              name="resolution"
              value={searchParams.resolution}
            >
              <For each={RESOLUTIONS}>
                {(resolution) => (
                  <option class="bg-background font-bold" value={resolution}>
                    {resolution ? `${resolution}x${resolution}px` : "Raw size"}
                  </option>
                )}
              </For>
            </select>
            <Button class="rounded-l-none focus-visible:ring-offset-0">
              Search
            </Button>
          </form>
        </search>
      </div>
    </header>
  );
}
