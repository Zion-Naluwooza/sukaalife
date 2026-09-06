"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplet,
  Heart,
  Languages,
  Stethoscope,
  HeartHandshake,
  User,
  ShieldCheck,
  BookOpen,
  ArrowUpRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="rounded-[20px] bg-secondary px-6 pb-16 pt-6 min-h-screen">
      {/* Top Navbar */}
      <nav className="flex flex-col items-center justify-between gap-4 px-4 pb-6 sm:flex-row">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple text-white shadow-sm">
              <Droplet className="h-5 w-5 fill-secondary text-secondary" />
            </span>
            <span className="whitespace-nowrap font-serif text-3xl font-medium text-foreground">
              Sukaa<span className="italic text-purple">life</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="h-10 items-center rounded-xl bg-purple px-6 text-xs font-black text-white shadow-md hover:bg-purple/90 flex gap-2 transition cursor-pointer"
          >
            <span>Go to Portal</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-[580px] flex-col items-center gap-10 overflow-visible rounded-[24px] bg-purple px-6 py-12 lg:flex-row lg:px-12 text-white shadow-xl">
        <div className="relative z-[2] flex-1 pb-4 lg:pb-8 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 border border-white/15 px-4 py-1.5 text-xs font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-secondary" /> Comprehensive Diabetes Care & Clinical Triage
          </div>

          <h1 className="max-w-[460px] text-4xl sm:text-5xl font-black leading-[1.12] text-white">
            Take control of your <span className="text-secondary italic">diabetes</span> journey
          </h1>

          <p className="max-w-[420px] text-sm sm:text-base leading-relaxed text-white/85">
            Track glucose, meals and medication in one unified portal with live test strip photo verification, specialist doctor Q&A, and caregiver support in 7 Ugandan languages.
          </p>

          <div className="pt-2">
            <Link
              href="/patient"
              className="inline-flex h-[52px] items-center gap-2.5 rounded-2xl bg-white px-8 text-sm font-black text-purple shadow-xl hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Go to Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/15 max-w-md">
            <div>
              <div className="text-2xl font-black text-secondary">24/7</div>
              <div className="text-xs text-white/70">Glucose Tracking</div>
            </div>
            <div>
              <div className="text-2xl font-black text-secondary">7 Native</div>
              <div className="text-xs text-white/70">Ugandan Languages</div>
            </div>
            <div>
              <div className="text-2xl font-black text-secondary">3 Roles</div>
              <div className="text-xs text-white/70">Unified in Portal</div>
            </div>
          </div>
        </div>

        {/* Hero Gallery */}
        <div className="relative flex w-full flex-1 justify-center">
          <div className="absolute bottom-0 h-64 w-64 rounded-full bg-secondary/30 blur-2xl" />
          <div className="relative z-[3] grid w-full max-w-[540px] grid-cols-2 gap-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image src="/diabetes1.jpeg" alt="Person checking glucose levels" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image src="/diabetes2.jpeg" alt="Diabetes care" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image src="/Diabetes3.jpeg" alt="Diabetes support" fill className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/20 shadow-lg">
              <Image src="/Diabetes4.jpeg" alt="Diabetes wellness" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Unified Multi-Role Portal Overview Section */}
      <section className="mx-auto w-[92%] max-w-5xl py-14 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple/20 bg-white/70 px-4 py-1.5 text-xs font-black text-foreground">
            <ShieldCheck className="h-4 w-4 text-purple" /> Unified Sukaalife Portal
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            One Single Portal for Patients, Doctors & Families
          </h2>
          <p className="text-sm text-foreground/80 max-w-xl mx-auto">
            Toggle seamlessly between your role directly inside the portal onboarding form.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Feature Card */}
          <div className="p-6 rounded-3xl bg-white border border-purple/15 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple text-white flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground">
                Patients
              </h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Log blood sugar with live strip verification, dynamic daily checklists, health goals, and native language consultation.
              </p>
            </div>
            <div className="pt-3 text-[11px] font-bold text-purple flex items-center gap-1">
              <span>Included in Portal</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-purple" />
            </div>
          </div>

          {/* Specialist Feature Card */}
          <div className="p-6 rounded-3xl bg-white border border-purple/15 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple text-white flex items-center justify-center">
                <Stethoscope className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground">
             Specialists
              </h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Endocrinologists and nutritionists triage clinical inquiries, publish educational guides, and review Time in Range reports.
              </p>
            </div>
            <div className="pt-3 text-[11px] font-bold text-purple flex items-center gap-1">
              <span>Included in Portal</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-purple" />
            </div>
          </div>

          {/* Caregiver Feature Card */}
          <div className="p-6 rounded-3xl bg-white border border-purple/15 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-purple text-white flex items-center justify-center">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-foreground">
              Caregivers
              </h3>
              <p className="text-xs text-foreground/70 leading-relaxed">
                Connect with parents or dependents using secure 6-digit codes. Log vitals on their behalf and track routine adherence.
              </p>
            </div>
            <div className="pt-3 text-[11px] font-bold text-purple flex items-center gap-1">
              <span>Included in Portal</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-purple" />
            </div>
          </div>
        </div>

        {/* Central CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-purple via-purple/95 to-purple text-white shadow-xl text-center space-y-4">
          <h3 className="text-2xl font-black">Ready to get started?</h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto">
            Launch the unified Sukaalife Portal, choose your role, and begin managing your diabetes health.
          </p>
          <div className="pt-2">
            <Link
              href="/patient"
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-8 text-sm font-black text-purple shadow-lg hover:bg-zinc-100 transition cursor-pointer"
            >
              <span>Open Sukaalife Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="mx-auto grid w-[92%] max-w-5xl grid-cols-1 gap-6 py-6 md:grid-cols-3">
        <div className="space-y-2 rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-purple">
            <Languages className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black text-foreground">7 Native Languages</h2>
          <p className="text-xs leading-relaxed text-foreground/70">
            Full support for English, Luganda, Kiswahili, Lusoga, Lugbara, Acholi, and Runyankole.
          </p>
        </div>

        <div className="space-y-2 rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-purple">
            <Heart className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black text-foreground">Live Strip Verification</h2>
          <p className="text-xs leading-relaxed text-foreground/70">
            Real-time in-app camera capture for test strips and glucometer displays to ensure verified logs.
          </p>
        </div>

        <div className="space-y-2 rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-purple">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black text-foreground">Dynamic Daily Checklist</h2>
          <p className="text-xs leading-relaxed text-foreground/70">
            Automatic aggregation of medication times, active goals, and fasting glucose routines with live progress score.
          </p>
        </div>
      </section>

      <footer className="mx-auto w-[92%] max-w-5xl border-t border-purple/20 py-8 text-center text-xs text-foreground/60">
        © 2026 Sukaalife. Digital diabetes care, native education & clinical questions
      </footer>
    </div>
  );
}