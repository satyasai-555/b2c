import type { Route } from "./+types/home";
import LandingPage from "../../features/landing/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "WelHire — Practice. Improve. Get Hired." },
    {
      name: "description",
      content:
        "Prepare for your next opportunity with AI CV analysis, mock interviews and skill feedback.",
    },
  ];
}

export function ServerComponent() {
  return <LandingPage />;
}