"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Droplet, Heart, Languages, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 font-sans text-zinc-900">
//       <main className="flex w-full max-w-sm flex-col items-center text-center">
//         {/* Illustration placeholder */}
//         <div className="mb-8 flex items-center justify-center">
//           <div className="relative h-64 w-64 rounded-full bg-purple-50 flex items-center justify-center">
//             {/* illustration image */}
//             <span className="text-sm font-medium text-purple-400">Illustration Placeholder</span>
//           </div>
//         </div>

//         {/* Brand Name */}
//         <h1 className="text-4xl font-extrabold tracking-wider text-[#6b21a8] mb-3">
//           sukalife
//         </h1>

//         {/* Tagline */}
//         <p className="text-lg font-medium text-zinc-700 leading-snug mb-10">
//           Manage your diabetes.<br />
//           Live a healthier life.
//         </p>

//         {/* Get Started Button */}
//         <Link
//           href="/signup"
//           className="flex h-14 w-full items-center justify-center rounded-xl bg-[#6b21a8] text-lg font-semibold text-white shadow-md transition-colors hover:bg-[#581c87]"
//         >
//           Get Started
//         </Link>

//         {/* Login Link */}
//         <div className="mt-6">
//           <Link
//             href="/login"
//             className="text-sm font-medium text-[#6b21a8] hover:underline"
//           >
//             I already have an account
//           </Link>
//         </div>
//       </main>
//     </div>
//   );
  return (
    <div className="rounded-[20px] bg-secondary px-6 pb-16 pt-6">
      <nav className="flex flex-col items-center justify-between gap-4 px-4 pb-6 sm:flex-row">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple text-purple" aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple text-white"><Droplet className="h-5 w-5 fill-secondary text-secondary" /></span>
            <span className="whitespace-nowrap font-serif text-3xl font-medium text-foreground">Sukaa<span className="italic text-purple">life</span></span>
          </Link>
        </div>
        <div className="flex gap-2.5">
          <button className="h-9 rounded-lg border border-purple px-4 text-[13px] font-medium text-purple">Login</button>
          <button className="h-9 rounded-lg bg-purple px-4 text-[13px] font-medium text-white">Sign up</button>
          <Link href="/patient" className="hidden h-9 items-center rounded-lg bg-purple px-4 text-[13px] font-medium text-white sm:flex">Open Patient App</Link>
        </div>
      </nav>

      <section className="relative flex min-h-[620px] flex-col items-center gap-10 overflow-visible rounded-[20px] bg-purple px-6 py-12 lg:flex-row lg:px-10">
        <div className="relative z-[2] flex-1 pb-4 lg:pb-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-xs font-bold text-white"><Sparkles className="h-4 w-4" /> Diabetes & Blood Sugar Care</div>
          <h1 className="mb-4 max-w-[380px] text-[40px] font-medium leading-[1.15] text-white">Take control of your <span className="font-bold">diabetes</span> journey</h1>
          <p className="mb-7 max-w-[360px] text-[15px] leading-relaxed text-white/80">Track glucose, meals and medication in one place, built around how you actually live.</p>
          <Link href="/patient" className="inline-flex h-[46px] items-center gap-2 rounded-[10px] bg-white px-7 text-sm font-medium text-purple">Get started <ArrowRight className="h-4 w-4" /></Link>
          <div className="mt-10 flex gap-8">
            <div><div className="text-xl font-medium text-white">24/7</div><div className="text-xs text-white/70">Glucose tracking</div></div>
            <div><div className="text-xl font-medium text-white">10k+</div><div className="text-xs text-white/70">Active users</div></div>
            <div><div className="text-xl font-medium text-white">4.8</div><div className="text-xs text-white/70">App rating</div></div>
          </div>
        </div>
        <div className="relative flex w-full flex-1 justify-center">
          <div className="absolute bottom-0 h-60 w-60 rounded-full bg-green/40" />
          <div className="relative z-[3] grid w-full max-w-[560px] grid-cols-2 gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src="/diabetes1.jpeg" alt="Person checking glucose levels" fill className="object-cover" /></div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src="/diabetes2.jpeg" alt="Diabetes care" fill className="object-cover" /></div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src="/Diabetes3.jpeg" alt="Diabetes support" fill className="object-cover" /></div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src="/Diabetes4.jpeg" alt="Diabetes wellness" fill className="object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[90%] max-w-4xl space-y-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple/20 bg-white/50 px-4 py-1.5 text-xs font-bold text-foreground">
          <Sparkles className="h-4 w-4" /> Diabetes & Blood Sugar Care
        </div>
        <h2 className="text-4xl font-black leading-tight text-foreground md:text-5xl">
          Easily Manage Glucose,<br />
          <span className="text-purple">In Your Native Language</span>
        </h2>
        <p className="mx-auto max-w-xl text-base font-medium leading-relaxed text-foreground/70">
          Log blood sugar readings (mmol/L), track meals, set medication alerts, and receive voice guidance in Luganda, Kiswahili, Lusoga, Lugbara, Acholi, and Runyankole.
        </p>
        <Link href="/patient" className="inline-flex items-center gap-2 rounded-2xl bg-purple px-8 py-4 text-base font-black text-white shadow-lg">
          Start Tracking <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <section className="mx-auto grid w-[90%] max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
        <div className="space-y-2 rounded-3xl border border-purple/10 bg-white p-6 shadow-sm"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-purple"><Languages className="h-5 w-5" /></div><h2 className="text-lg font-black text-foreground">Local Language Support</h2><p className="text-xs leading-relaxed text-foreground/70">Get advice and guidance in the local language you feel most comfortable using.</p></div>
        <div className="space-y-2 rounded-3xl border border-purple/10 bg-white p-6 shadow-sm"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-purple"><Heart className="h-5 w-5" /></div><h2 className="text-lg font-black text-foreground">Glucose & Vital Logs</h2><p className="text-xs leading-relaxed text-foreground/70">Quickly save your sugar levels or blood pressure with simple entry forms.</p></div>
        <div className="space-y-2 rounded-3xl border border-purple/10 bg-white p-6 shadow-sm"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-purple"><CheckCircle2 className="h-5 w-5" /></div><h2 className="text-lg font-black text-foreground">Medication Schedules</h2><p className="text-xs leading-relaxed text-foreground/70">Set easy medication and meal reminders so you never miss a routine step.</p></div>
      </section>
      <footer className="mx-auto w-[90%] max-w-5xl border-t border-purple/20 py-8 text-center text-xs text-foreground/60">© 2026 sukaaLife. Simple and accessible diabetes care.</footer>
    </div>
  );
}