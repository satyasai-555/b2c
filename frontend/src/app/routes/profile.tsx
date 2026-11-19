import type { Route } from "./+types/profile";
import ProfilePage from "../../features/profile/ProfilePage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Profile | WelHire" },
    { name: "description", content: "Candidate profile overview." },
  ];
}

export default function ProfileRoute() {
  return <ProfilePage />;
}
