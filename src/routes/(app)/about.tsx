import { Title } from "@solidjs/meta";
import { Balancer } from "solid-wrap-balancer";
import { h1Style, pStyle } from "~/components/design-system";
import { buttonVariants } from "~/components/ui/button";
import { SITE_NAME } from "~/lib/constants";
import { cn } from "~/lib/utils";

export default function About() {
  return (
    <main class="flex flex-col items-center gap-y-6 p-4 h-full">
      <Title>{`${SITE_NAME} | About`}</Title>
      <h1 class={cn(h1Style, "text-center max-w-3xl")}>
        <Balancer>This is a small Solid Start experiment</Balancer>
      </h1>
      <p class={cn(pStyle, "max-w-3xl")}>
        <Balancer>
          It wouldn't be possible without{" "}
          <a
            class={buttonVariants({ variant: "link", size: null })}
            href="https://docs.solidjs.com/solid-start"
            rel="noopener noreferrer"
            target="_blank"
          >
            Solid Start
          </a>
          ,{" "}
          <a
            class={buttonVariants({ variant: "link", size: null })}
            href="https://www.solid-ui.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Solid UI
          </a>
          ,{" "}
          <a
            class={buttonVariants({ variant: "link", size: null })}
            href="https://kobalte.dev/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Kobalte
          </a>
          ,{" "}
          <a
            class={buttonVariants({ variant: "link", size: null })}
            href="https://solid-wrap-balancer.vercel.app/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Solid Wrap Balancer
          </a>
          ,{" "}
          <a
            class={buttonVariants({ variant: "link", size: null })}
            href="https://auto-animate.formkit.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Formkit Auto Animate
          </a>
          ,{" "}
          <a
            class={buttonVariants({ variant: "link", size: null })}
            href="https://ui.shadcn.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Shadcn UI
          </a>{" "}
          and{" "}
          <a
            class={buttonVariants({ variant: "link", size: null })}
            href="https://tailwindcss.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            TailwindCSS
          </a>
        </Balancer>
      </p>
    </main>
  );
}
