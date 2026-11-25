import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Gift,
  Link2,
  Mail,
  QrCode,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import Header from "../landing/LandingComponents/Header";
import Footer from "../landing/LandingComponents/Footer";
import {
  candidateApi,
  type ReferralAggregate,
} from "../../services/candidateApi";
import { useCandidateSession } from "../../hooks/useCandidateSession";

export default function ReferralPageDynamic() {
  const navigate = useNavigate();
  const { user } = useCandidateSession();
  const [referral, setReferral] = useState<ReferralAggregate | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (user?.candidateId)
      candidateApi
        .getReferrals(user.candidateId)
        .then(setReferral)
        .catch(() => setReferral(null));
  }, [user?.candidateId]);
  const link = referral?.link
    ? `https://${referral.link}`
    : "Referral link unavailable";
  const copyLink = async () => {
    if (!referral?.link) return;
    await navigator.clipboard?.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  const action = (value: string) => {
    if (value === "Analyze My CV") navigate("/cv-analysis");
  };
  const stats: Array<[string, number | string, string]> = [
    ["/images/users.svg", referral?.invited ?? "—", "Invited"],
    ["/images/user-check.svg", referral?.joined ?? "—", "Joined"],
    [
      "/images/GiftIcon.svg",
      referral ? `+${referral.earned}` : "—",
      "Credits earned",
    ],
  ];
  return (
    <div className="min-h-screen bg-white text-[#192457]">
      <Header onAction={action} />
      <main className="referral-page mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Refer &amp; earn
          </h1>
          <p className="mt-3 text-lg text-[#7182a7]">
            Help friends take their next career step. Earn credits for yours.
          </p>
        </header>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(330px,.8fr)]">
          <section className="rounded-3xl border border-[#dce4f3] bg-white p-6 shadow-sm sm:p-9">
            <div className="flex items-center gap-4 text-lg font-semibold text-[#5754bd]">
              <span className="grid h-13 w-13 place-items-center rounded-2xl bg-indigo-50">
                <Gift size={25} />
              </span>
              A little more practice, together
            </div>
            <h2 className="mt-7 text-3xl font-bold sm:text-4xl">
              Invite friends, earn interview credits
            </h2>
            <p className="mt-4 text-lg text-[#7182a7]">
              When a referred friend logs in, you earn{" "}
              <b className="text-[#5754bd]">+1 interview credit.</b> No limit.
            </p>
            <label className="mt-10 block font-semibold">
              Your referral link
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-14 flex-1 items-center gap-4 truncate rounded-xl border border-[#d8e1f0] bg-[#f7f9fd] px-5 text-lg">
                <Link2 className="shrink-0 text-[#7182a7]" />
                <span className="truncate" title={link}>
                  {link}
                </span>
              </div>
              <button
                onClick={copyLink}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#5754bd] px-7 text-lg font-semibold text-white"
              >
                <img
                  src="/images/copy.svg"
                  alt=""
                  className="h-5 w-5 object-contain"
                />
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <button className="ref-share">
                <img
                  src="/images/whatsapImage.svg"
                  alt=""
                  className="h-5 w-5 object-contain"
                />
                WhatsApp
              </button>
              <button className="ref-share">
                <Mail size={22} />
                Email
              </button>
              <button className="ref-share">
                <QrCode size={22} />
                QR Code
              </button>
            </div>
          </section>
          <aside className="space-y-4">
            <section className="rounded-3xl bg-[#292861] p-8 text-white">
              <div className="flex items-center justify-between text-lg font-semibold text-indigo-100">
                INTERVIEW CREDITS
                <Zap className="text-cyan-300" />
              </div>
              <div className="mt-7 flex items-end gap-3">
                <strong className="text-5xl leading-none text-cyan-300">
                  {referral?.credits ?? "—"}
                </strong>
                <span className="mb-1 text-xl">credits left</span>
              </div>
              <p className="mt-5 text-indigo-100">Your current balance</p>
              <button
                onClick={() => navigate("/interview/setup")}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#6155ca] px-5 py-4 font-bold"
              >
                <ArrowRight />
                Take an AI Interview
              </button>
            </section>
          </aside>
        </div>
        <section className="mt-9 rounded-3xl border border-[#dce4f3] p-7 sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row">
            <div>
              <h2 className="text-2xl font-bold">Your referrals</h2>
              <p className="mt-2 text-[#7182a7]">A little progress, shared.</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {stats.map(([icon, value, label]) => (
                <div key={String(label)} className="flex items-center gap-3">
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-indigo-50">
                    <img src={icon} alt="" className="h-5 w-5 object-contain" />
                  </span>
                  <div>
                    <b className="text-2xl">{value}</b>
                    <p className="text-[#7182a7]">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="border-b border-[#e5eaf3] text-sm">
                <tr>
                  <th className="pb-5">Friend</th>
                  <th className="pb-5">Status</th>
                  <th className="pb-5 text-right">Credits earned</th>
                </tr>
              </thead>
              <tbody>
                {referral?.friends.length ? (
                  referral.friends.map((friend) => (
                    <tr key={friend.name} className="border-b border-[#e5eaf3]">
                      <td className="py-5">
                        <span className="mr-4 inline-grid h-10 w-10 place-items-center rounded-full bg-[#f5f7fb] text-sm font-semibold">
                          {friend.initials}
                        </span>
                        <b>{friend.name}</b>
                      </td>
                      <td>
                        <span className="rounded-full bg-slate-50 px-3 py-2 text-[#7182a7]">
                          {friend.status === "Joined" && (
                            <Check className="mr-1 inline" size={16} />
                          )}{" "}
                          {friend.status}
                        </span>
                      </td>
                      <td className="text-right font-semibold text-[#5754bd]">
                        {friend.credit}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-sm text-[#7182a7]"
                    >
                      No referrals have been recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer onAction={action} />
    </div>
  );
}
