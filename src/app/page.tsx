"use client";

import Link from "next/link";
import { motion } from "motion/react";

const stages = [
  { label: "10 min", color: "from-red-500 to-orange-500" },
  { label: "1 day", color: "from-orange-500 to-amber-500" },
  { label: "7 days", color: "from-amber-500 to-yellow-500" },
  { label: "1 month", color: "from-yellow-500 to-lime-500" },
  { label: "3 months", color: "from-lime-500 to-emerald-500" },
  { label: "1 year", color: "from-emerald-500 to-teal-500" },
  { label: "2 years", color: "from-teal-500 to-cyan-500" },
  { label: "5 years", color: "from-cyan-500 to-sky-500" },
  { label: "Mastered", color: "from-sky-500 to-amber-400" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex flex-col">
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-1/4 w-[400px] h-[400px] rounded-full bg-amber-600/[0.03] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20">
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm tracking-[0.2em] uppercase text-amber-400/80 font-medium mb-6"
        >
          Spaced Repetition System
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-[family-name:var(--font-sora)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center leading-[1.1] tracking-tight max-w-3xl"
        >
          Knowledge that
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            lasts forever
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-6 text-neutral-400 text-base sm:text-lg text-center max-w-lg leading-relaxed"
        >
          Review what you learn on a scientifically-proven schedule.
          <br className="hidden sm:block" />
          From 10 minutes to 5 years — until it&apos;s truly yours.
        </motion.p>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 w-full max-w-3xl"
        >
          {/* Desktop timeline */}
          <div className="hidden sm:block">
            {/* Stage nodes */}
            <div className="relative flex justify-between items-start">
              {/* Track line behind dots */}
              <div className="absolute top-[5px] left-[calc(100%/18)] right-[calc(100%/18)] h-px bg-neutral-800" />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.4, delay: 0.8, ease: "easeOut" }}
                className="absolute top-[5px] left-[calc(100%/18)] right-[calc(100%/18)] h-px bg-gradient-to-r from-amber-500/80 via-emerald-500/60 to-amber-400/80 origin-left"
              />
              {stages.map((stage, i) => (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.8 + i * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${stage.color} ring-2 ring-neutral-950 shadow-lg`}
                  />
                  <span className="mt-3 text-[11px] text-neutral-500 font-medium whitespace-nowrap">
                    {stage.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile timeline (vertical) */}
          <div className="sm:hidden relative mx-auto w-fit">
            {/* Vertical track line through dots */}
            <div className="absolute left-[5px] top-[13px] bottom-[13px] w-px bg-neutral-800" />
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
              className="absolute left-[5px] top-[13px] bottom-[13px] w-px bg-gradient-to-b from-amber-500/80 via-emerald-500/60 to-amber-400/80 origin-top"
            />
            <div className="relative flex flex-col">
              {stages.map((stage, i) => (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.8 + i * 0.08,
                  }}
                  className="flex items-center gap-4 py-2"
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${stage.color} shrink-0 ring-2 ring-neutral-950 shadow-lg`}
                  />
                  <span className="text-sm text-neutral-400 font-medium">
                    {stage.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-14 flex gap-4"
        >
          <Link
            href="/sign-up"
            className="bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 font-semibold px-8 py-3 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 text-sm tracking-wide"
          >
            Sign Up
          </Link>
          <Link
            href="/sign-in"
            className="border border-neutral-700 text-neutral-300 font-medium px-8 py-3 rounded-lg hover:bg-neutral-900 hover:text-white hover:border-neutral-600 transition-all text-sm tracking-wide"
          >
            Login
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="relative z-10 pb-8 text-center"
      >
        <p className="text-xs text-neutral-600 tracking-wide">
          Built on the science of spaced repetition
        </p>
      </motion.footer>
    </main>
  );
}
