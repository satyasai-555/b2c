import type { Route } from "./+types/cv-analysis";
import CvAnalysisFlow from "../../features/cv/CvAnalysisFlowPixel";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Analyze your CV | WelHire" }, { name: "description", content: "Upload your CV and discover your strengths." }];
}

export default function CvAnalysisRoute() {
  return <CvAnalysisFlow />;
}
