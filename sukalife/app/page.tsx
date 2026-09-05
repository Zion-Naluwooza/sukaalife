// import Link from "next/link";

// export default function Home() {
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
// }


'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Heart, Languages, ArrowRight, CheckCircle2, Droplet, ArrowLeft } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Navigation Header */}
      <nav className="w-[90%] max-w-5xl mx-auto pt-6 pb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Back Button & Logo Container */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            type="button"
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-all shadow-sm flex items-center justify-center"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* sukaaLife Medical Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 px-5 py-2.5 bg-white border-2 border-teal-600/30 rounded-2xl shadow-md hover:border-teal-600 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-sm">
              <Droplet className="w-5 h-5 fill-cyan-300 text-cyan-300" />
            </div>

            <div className="text-2xl md:text-3xl font-black tracking-tight leading-none">
              <span className="text-teal-800">sukaa</span>
              <span className="text-cyan-600">Life</span>
            </div>
          </Link>
        </div>

        {/* CTA Button */}
        <Link 
          href="/patient" 
          className="w-full sm:w-auto text-center px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl text-sm transition shadow-md"
        >
          Open Patient App
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="w-[90%] max-w-4xl mx-auto py-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-100/70 border border-teal-300 text-teal-900 rounded-full text-xs font-black">
          <Sparkles className="w-4 h-4 text-teal-700" /> Diabetes & Blood Sugar Care
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Easily Manage Glucose, <br />
          <span className="text-teal-700">In Your Native Language</span>
        </h1>

        <p className="max-w-xl mx-auto text-base text-slate-600 font-medium leading-relaxed">
          Log blood sugar readings (mmol/L), track meals, set medication alerts, and receive voice guidance in Luganda, Kiswahili, Lusoga, Lugbara, Acholi, and Runyankole.
        </p>

        <div className="pt-2">
          <Link 
            href="/patient" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl text-base transition shadow-lg"
          >
            Start Tracking <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Key Feature Cards */}
      <section className="w-[90%] max-w-5xl mx-auto py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-800 mb-3">
            <Languages className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Local Language Support</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Get advice and guidance in the local language you feel most comfortable using.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-900 mb-3">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Glucose & Vital Logs</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Quickly save your sugar levels or blood pressure with simple entry forms.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-800 mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900">Medication Schedules</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Set easy medication and meal reminders so you never miss a routine step.
          </p>
        </div>
      </section>

      <footer className="w-[90%] max-w-5xl mx-auto py-8 text-center text-xs text-slate-400 border-t border-slate-200 mt-8">
        © 2026 sukaaLife. Simple and accessible diabetes care.
      </footer>

    </div>
  );
}