import InterviewReadyPage from "../../features/interview/InterviewReadyPage";


export function meta() {
  return [
    { title: "Get Ready | WelHire" },
    {
      name: "description",
      content: "Choose your answer mode and test your microphone.",
    },
  ];
}

export default function InterviewReadyRoute() {
  return <InterviewReadyPage />;
}
