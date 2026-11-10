import type { Route } from "./+types/cv-questions";
import CvQuestions from "../../features/cv/CvQuestions";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Quick questions | WelHire" }];
}

export default function CvQuestionsRoute() {
  return <CvQuestions />;
}
