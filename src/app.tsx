// @refresh reload
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { Suspense } from "solid-js";
import "./root.css";
import { createAutoAnimate } from "@formkit/auto-animate/solid";
import { MetaProvider, Title } from "@solidjs/meta";
import { SITE_NAME } from "./lib/constants";

export default function App() {
  const [parent] = createAutoAnimate();
  return (
    <div ref={(element) => parent(element)}>
      {/* TODO add fallback */}
      <Router
        root={(props) => (
          <MetaProvider>
            <Title>{SITE_NAME}</Title>
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </div>
  );
}
