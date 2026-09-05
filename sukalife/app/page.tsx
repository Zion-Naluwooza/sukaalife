import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 font-sans text-zinc-900">
      <main className="flex w-full max-w-sm flex-col items-center text-center">
        {/* Illustration placeholder */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative h-64 w-64 rounded-full bg-purple-50 flex items-center justify-center">
            {/* illustration image */}
            <span className="text-sm font-medium text-purple-400">Illustration Placeholder</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-extrabold tracking-wider text-[#6b21a8] mb-3">
          sukalife
        </h1>

        {/* Tagline */}
        <p className="text-lg font-medium text-zinc-700 leading-snug mb-10">
          Manage your diabetes.<br />
          Live a healthier life.
        </p>

        {/* Get Started Button */}
        <Link
          href="/signup"
          className="flex h-14 w-full items-center justify-center rounded-xl bg-[#6b21a8] text-lg font-semibold text-white shadow-md transition-colors hover:bg-[#581c87]"
        >
          Get Started
        </Link>

        {/* Login Link */}
        <div className="mt-6">
          <Link
            href="/login"
            className="text-sm font-medium text-[#6b21a8] hover:underline"
          >
            I already have an account
          </Link>
        </div>
      </main>
    </div>
  );
}