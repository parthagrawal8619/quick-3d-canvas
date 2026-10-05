import { createFileRoute } from "@tanstack/react-router";
import { MissionExperience } from "../components/MissionExperience";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MISSION: MARS — Interactive Exploration" },
      { name: "description", content: "Enter an immersive 3D Mars mission control, explore the planet, and command the ARES-01 rover." },
      { property: "og:title", content: "MISSION: MARS — Interactive Exploration" },
      { property: "og:description", content: "Explore Mars through an immersive 3D mission control experience." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionExperience,
});
