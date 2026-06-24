import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Satto",
    short_name: "Satto",
    description: "A noughts & crosses skill bet on Stacks.",
    start_url: "/",
    display: "standalone",
    background_color: "#07070b",
    theme_color: "#07070b",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
