import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Flame,
  Target,
  Rocket,
} from 'lucide-react';

/* ───────────────────── animation keyframes (injected once) ───────────────────── */
const injectStyles = () => {
  if (document.getElementById('landing-animations')) return;
  const style = document.createElement('style');
  style.id = 'landing-animations';
  style.textContent = `
    /* ── float blobs ── */
    @keyframes blob-1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }
    @keyframes blob-2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(-40px, 30px) scale(1.15); }
      66% { transform: translate(25px, -35px) scale(0.85); }
    }
    @keyframes blob-3 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(20px, 40px) scale(0.95); }
      66% { transform: translate(-30px, -25px) scale(1.05); }
    }
    .blob-1 { animation: blob-1 8s ease-in-out infinite; }
    .blob-2 { animation: blob-2 10s ease-in-out infinite; }
    .blob-3 { animation: blob-3 12s ease-in-out infinite; }

    /* ── fade up on scroll ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(40px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-up {
      opacity: 0;
      animation: fadeUp 0.7s ease-out forwards;
    }
    .delay-100 { animation-delay: .1s; }
    .delay-200 { animation-delay: .2s; }
    .delay-300 { animation-delay: .3s; }
    .delay-400 { animation-delay: .4s; }
    .delay-500 { animation-delay: .5s; }
    .delay-600 { animation-delay: .6s; }

    /* ── pulse glow on CTA ── */
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.25); }
      50%      { box-shadow: 0 0 40px rgba(99,102,241,0.45); }
    }
    .pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }

    /* ── grid pattern (light) ── */
    .grid-pattern {
      background-image:
        linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    /* ── glass card (light) ── */
    .glass-card {
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 4px 24px rgba(0,0,0,0.04);
      transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
    }
    .glass-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.08);
      border-color: rgba(0,0,0,0.1);
    }

    /* ── smooth scroll ── */
    html { scroll-behavior: smooth; }

    /* ── floating icon ping ── */
    @keyframes float-icon {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-8px); }
    }
    .float-icon { animation: float-icon 3s ease-in-out infinite; }

    /* ── streak fire flicker ── */
    @keyframes flicker {
      0%,100% { opacity:1; transform:scale(1); }
      50%     { opacity:.75; transform:scale(1.15); }
    }
    .flicker { animation: flicker 1.2s ease-in-out infinite; }

    /* ── scroll indicator bounce ── */
    @keyframes bounce-slow {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(8px); }
    }
    .bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

    /* ── landing page scrollbar ── */
    .landing-scroll::-webkit-scrollbar { width: 6px; }
    .landing-scroll::-webkit-scrollbar-track { background: transparent; }
    .landing-scroll::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.12);
      border-radius: 3px;
    }
  `;
  document.head.appendChild(style);
};

/* ───────────────────── data ───────────────────── */
const FEATURES = [
  {
    icon: Brain,
    title: 'AI Task Mentor',
    accent: 'from-violet-500 to-indigo-500',
    description:
      'Adaptive learning roadmaps powered by Llama 3.3. Get personalized 4‑week curricula with daily task limits to prevent burnout.',
    bullets: ['Goal‑oriented onboarding', 'Auto‑generated checklists', 'Smart burnout limiter'],
  },
  {
    icon: FileText,
    title: 'Smart Notes & Tasks',
    accent: 'from-cyan-500 to-blue-500',
    description:
      'Rich note editor with AI summaries, tone enhancements, cloud media storage, and routine scheduling on interactive calendars.',
    bullets: ['AI markdown summaries', 'Cloudinary attachments', 'Priority & category tags'],
  },
  {
    icon: Users,
    title: 'Flat Manager',
    accent: 'from-emerald-500 to-teal-500',
    description:
      'Shared household control center — chore rotation, expense ledger with smart settle‑up, and invite‑code collaboration.',
    bullets: ['Multi‑household groups', 'Split‑billing ledger', 'Automated duty rotation'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Streaks',
    accent: 'from-orange-500 to-rose-500',
    description:
      'Dynamic Recharts dashboards, daily fire‑streak tracking, and a floating Pomodoro timer for deep‑focus sessions.',
    bullets: ['Visual progress charts', 'Fire streak motivation', 'Pomodoro focus timer'],
  },
];

const STEPS = [
  {
    num: '01',
    icon: Rocket,
    title: 'Sign Up Instantly',
    description: 'Passwordless OTP login — enter your email, verify in seconds, and jump right in.',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    num: '02',
    icon: Target,
    title: 'Organize Everything',
    description: 'Create notes, schedule tasks, set routines, manage household chores — all in one place.',
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    num: '03',
    icon: Flame,
    title: 'Achieve & Grow',
    description: 'Track streaks, gain AI mentorship, view analytics, and watch your productivity soar.',
    accent: 'from-orange-500 to-rose-500',
  },
];

/* ───────────────────── intersection observer hook ───────────────────── */
const useReveal = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('animate-fade-up');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
};

/* helper: wrap a section with scroll‑reveal */
const RevealSection = ({ children, className = '', delay = '' }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className={`opacity-0 ${delay} ${className}`}>
      {children}
    </div>
  );
};

/* ───────────────────── LANDING PAGE ───────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    injectStyles();
  }, []);

  const goLogin = () => navigate('/login');

  return (
    <div className="landing-scroll min-h-screen overflow-y-auto bg-slate-50 text-gray-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900">

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OmniFlow" className="h-9 w-9 object-contain invert" />
            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              OmniFlow
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
          </div>
          <button
            onClick={goLogin}
            className="px-5 py-2 text-sm font-medium rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-sm"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative flex items-center justify-center overflow-hidden grid-pattern pt-28 pb-16">
        {/* blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob-1 absolute top-[10%] left-[15%] w-125 h-125 rounded-full bg-indigo-400/15 blur-[120px]" />
          <div className="blob-2 absolute bottom-[10%] right-[10%] w-112.5 h-112.5 rounded-full bg-cyan-400/15 blur-[100px]" />
          <div className="blob-3 absolute top-[50%] left-[50%] w-87.5 h-87.5 rounded-full bg-violet-400/10 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          {/* badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            Powered by Llama 3.3 AI
          </div>

          <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900">
            Your All‑in‑One{' '}
            <span className="bg-linear-to-r from-indigo-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
              Productivity
            </span>{' '}
            Ecosystem
          </h1>

          <p className="animate-fade-up delay-200 mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Notes, tasks, routines, roommate chores, expense splitting, AI mentoring,
            streaks & Pomodoro focus — unified in one stunning interface.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={goLogin}
              className="pulse-glow group flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-full bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all shadow-lg"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 text-base font-medium rounded-full border border-gray-300 hover:bg-gray-100 transition-all text-gray-600"
            >
              Explore Features
            </a>
          </div>

          {/* stats */}
          <div className="animate-fade-up delay-400 mt-10 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              ['6+', 'Core Modules'],
              ['AI', 'Powered'],
              ['100%', 'Free'],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  {val}
                </div>
                <div className="text-xs text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="relative py-6 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <RevealSection className="text-center mb-10">
            <p className="text-indigo-500 font-semibold text-sm tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Everything you need,{' '}
              <span className="bg-linear-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                nothing you don't
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Six powerful modules working together so you can ditch scattered tools and reclaim your focus.
            </p>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <RevealSection key={f.title} delay={`delay-${(i + 1) * 100}`}>
                <div className="group glass-card rounded-2xl p-8 h-full flex flex-col">
                  {/* icon */}
                  <div
                    className={`float-icon w-12 h-12 rounded-xl bg-linear-to-br ${f.accent} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <f.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{f.description}</p>

                  <ul className="mt-auto space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="relative py-10 px-6 border-t border-gray-100 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="text-center mb-10">
            <p className="text-cyan-500 font-semibold text-sm tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Three steps to{' '}
              <span className="bg-linear-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                peak productivity
              </span>
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <RevealSection key={s.num} delay={`delay-${(i + 1) * 200}`}>
                <div className="relative glass-card rounded-2xl p-8 text-center">
                  {/* step number watermark */}
                  <span className="absolute top-4 right-5 text-6xl font-black text-gray-900/3 select-none">
                    {s.num}
                  </span>

                  <div
                    className={`mx-auto w-14 h-14 rounded-2xl bg-linear-to-br ${s.accent} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <s.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>

                  {/* connector line on desktop */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-gray-300" />
                  )}
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="relative py-10 px-6 overflow-hidden bg-white">
        {/* background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-indigo-400/10 rounded-full blur-[140px]" />
        </div>

        <RevealSection className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-amber-500">
            <Flame className="h-5 w-5 flicker" />
            <span className="text-sm font-semibold">Start your streak today</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-gray-900">
            Ready to take control of your{' '}
            <span className="bg-linear-to-r from-indigo-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
              productivity
            </span>
            ?
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto">
            Join OmniFlow — free, no credit card, passwordless sign‑up in seconds.
          </p>
          <button
            onClick={goLogin}
            className="pulse-glow group inline-flex items-center gap-2 px-10 py-4 text-lg font-semibold rounded-full bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all shadow-lg"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </RevealSection>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-gray-200 py-8 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="OmniFlow" className="h-6 w-6 object-contain invert" />
            <span className="font-semibold text-gray-600">OmniFlow</span>
          </div>
          <p>© {new Date().getFullYear()} OmniFlow. Built with ❤️ for productivity.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
