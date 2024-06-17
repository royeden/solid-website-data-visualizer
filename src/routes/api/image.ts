import { type APIEvent } from "@solidjs/start/server";
import { type Resolution } from "~/lib/constants";
import { getPageData } from "~/server/getPageData";

export async function GET({ request }: APIEvent) {
  const searchParams = new URLSearchParams(new URL(request.url).search);
  if (searchParams.get("url")) {
    const { base64 } =
      (await getPageData(
        searchParams.get("url") as string,
        parseInt(searchParams.get("resolution") || "0") as Resolution,
        searchParams.get("light") === "true"
      )) ?? {};
    if (base64) {
      const decoded = base64.replace("data:image/png;base64,", "");
      return new Response(Buffer.from(decoded, "base64"), {
        headers: {},
        status: 200,
      });
    }
  }
  return new Response("Couldn't generate image!", {
    status: 404,
  });
}
