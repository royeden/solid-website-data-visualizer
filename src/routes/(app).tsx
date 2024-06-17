import { RouteSectionProps } from "@solidjs/router";
import Nav from "~/components/nav";

export default function AppLayout(props: RouteSectionProps) {
  return (
    <>
      <Nav />
      {props.children}
    </>
  );
}
