import { useState } from "react";
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

const referral = {
  link: "welhire.ai/r/priya-7k2q",
  credits: 3,
  invited: 3,
  joined: 1,
  earned: 1,
  friends: [
    {
      initials: "RM",
      name: "Rohan Mehta",
      status: "Joined",
      credit: "+1 credit",
    },
    { initials: "AI", name: "Ananya Iyer", status: "Invited", credit: "—" },
    { initials: "KS", name: "Karan Shah", status: "Invited", credit: "—" },
  ],
};

const referralStats: { icon: string; value: number | string; label: string }[] =
  [
    { icon: "/images/users.svg", value: referral.invited, label: "Invited" },
    { icon: "/images/user-check.svg", value: referral.joined, label: "Joined" },
    {
      icon: "/images/GiftIcon.svg",
      value: `+${referral.earned}`,
      label: "Credits earned",
    },
  ];

export default function ReferralPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const handleAction = (action: string) => {
    if (action === "Refer & earn") return;
    if (action === "Analyze My CV") navigate("/cv-analysis");
  };
  const copyLink = async () => {
    await navigator.clipboard?.writeText(`https://${referral.link}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="min-h-screen bg-white text-[#192457]">
      <Header onAction={handleAction} />
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
              <div className="flex min-h-14 flex-1 items-center gap-4 rounded-xl border border-[#d8e1f0] bg-[#f7f9fd] px-5 text-lg">
                <Link2 className="text-[#7182a7]" />
                {referral.link}
              </div>
              <button
                onClick={copyLink}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#5754bd] px-7 text-lg font-semibold text-white"
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
            <div className="mt-9 border-t border-[#e5eaf3] pt-8">
              <h3 className="text-xl font-bold">How it works</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {[
                  ["1", "Share your link", "Invite friends to WelHire."],
                  ["2", "Your friend logs in", "They join through your link."],
                  ["3", "Earn +1 credit", "For every friend who logs in."],
                ].map(([number, title, text]) => (
                  <div key={number} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cyan-50 text-sm font-bold text-[#5060b8]">
                      {number}
                    </span>
                    <div>
                      <b>{title}</b>
                      <p className="mt-1 text-sm text-[#7182a7]">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <aside className="space-y-4">
            <section className="rounded-3xl bg-[#292861] p-8 text-white">
              <div className="flex items-center justify-between text-lg font-semibold text-indigo-100">
                INTERVIEW CREDITS <Zap className="text-cyan-300" />
              </div>
              <div className="mt-8 flex items-end gap-3">
                <strong className="text-6xl leading-none text-cyan-300">
                  {referral.credits}
                </strong>
                <span className="mb-1 text-xl">credits left</span>
              </div>
              <p className="mt-5 text-indigo-100">Your current balance</p>
              <p className="mt-9 text-indigo-100">
                Keep building confidence with your next AI interview.
              </p>
              <button className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[#6155ca] px-5 py-4 text-md font-bold">
                <ArrowRight />
                Take an AI Interview
              </button>
            </section>
            <section className="flex gap-5 rounded-3xl border border-[#dce4f3] p-7">
              <span className="grid h-15 w-15 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-[#5754bd]">
                <Gift size={27} />
              </span>
              <div>
                <h2 className="text-md font-bold">
                  More friends. More practice.
                </h2>
                <p className="mt-2 leading-7 text-[#7182a7]">
                  There’s no limit to the interview credits you can earn.
                </p>
              </div>
            </section>
          </aside>
        </div>
        <section className="mt-9 rounded-3xl border border-[#dce4f3] p-7 sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row">
            <div>
              <h2 className="text-2xl font-bold">Your referrals</h2>
              <p className="mt-2 text-[#7182a7]">A little progress, shared.</p>
            </div>
            <div className="referral-stats grid grid-cols-3 gap-6">
              {referralStats.map(({ icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="grid h-13 w-13 place-items-center rounded-2xl bg-indigo-50 text-[#5754bd]">
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
            <table className="referral-table w-full min-w-[650px] text-left">
              <thead className="border-b border-[#e5eaf3] text-sm text-[#465273]">
                <tr>
                  <th className="pb-5">Friend</th>
                  <th className="pb-5">Status</th>
                  <th className="pb-5 text-right">Credits earned</th>
                </tr>
              </thead>
              <tbody>
                {referral.friends.map((friend) => (
                  <tr
                    key={friend.name}
                    className="border-b border-[#e5eaf3] last:border-0"
                  >
                    <td className="py-5">
                      <span className="mr-4 inline-grid h-10 w-10 place-items-center rounded-full bg-[#f5f7fb] text-sm font-semibold">
                        {friend.initials}
                      </span>
                      <b>{friend.name}</b>
                    </td>
                    <td>
                      <span
                        className={
                          friend.status === "Joined"
                            ? "rounded-full bg-emerald-50 px-3 py-2 text-emerald-700"
                            : "rounded-full bg-slate-50 px-3 py-2 text-[#7182a7]"
                        }
                      >
                        {friend.status === "Joined" && (
                          <Check className="mr-1 inline" size={16} />
                        )}
                        {friend.status}
                      </span>
                    </td>
                    <td className="text-right font-semibold text-[#5754bd]">
                      {friend.credit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer onAction={handleAction} />
    </div>
  );
}
