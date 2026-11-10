import InterviewSetupPage from "../../features/interview/InterviewSetupPage";


export function meta() {
  return [
    { title: "Interview Setup | WelHire" },
    {
      name: "description",
      content: "Configure your role-based or job-description-based interview.",
    },
  ];
}

export function ServerComponent() {
  return <InterviewSetupPage />;
}