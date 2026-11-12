import type { Route } from "./+types/refer";
import ReferralPage from "../../features/referral/ReferralPage";
import "../../features/referral/referral.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Refer & earn | WelHire" },
    {
      name: "description",
      content: "Invite friends and earn interview credits.",
    },
  ];
}

export default function ReferRoute() {
  return <ReferralPage />;
}
