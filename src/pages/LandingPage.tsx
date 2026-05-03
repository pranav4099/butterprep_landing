import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap, BarChart3, Eye, Clock, TrendingUp, AlertTriangle, Users,
  GraduationCap, BookOpen, UserCheck, School, ArrowRight,
  Mail, Phone, Globe, Menu, X, Quote, FileText, Shield,
  CheckCircle2, Sparkles
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import logoHorizontal from '@/assets/butterprep-logo-horizontal.png';

/* ── Animated counter ── */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return { count, ref };
}

/* ── Brand palette ── */
const brand = {
  orange: '#F5920A',
  orangeLight: '#F9A825',
  amber: '#FBBC04',
  skyBlue: '#4AADE8',
  mediumBlue: '#2B7CC9',
  deepBlue: '#1B3A6B',
  royalBlue: '#1E3D7B',
  navyDark: '#0F1D3A',
};

/* ── Brand Swirl Decorations — flowing ribbon waves inspired by the ButterPrep logo ── */
const SwirlTopRight: React.FC<{ className?: string; opacity?: number }> = ({ className = '', opacity = 1 }) => (
  <svg className={`pointer-events-none absolute ${className}`} viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }} preserveAspectRatio="xMaxYMin meet">
    <defs>
      <linearGradient id="swirlTR-navy" x1="500" y1="0" x2="200" y2="500" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0F1D3A" />
        <stop offset="1" stopColor="#1B3A6B" />
      </linearGradient>
      <linearGradient id="swirlTR-blue" x1="500" y1="40" x2="220" y2="480" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#2B7CC9" />
        <stop offset="1" stopColor="#4AADE8" />
      </linearGradient>
      <linearGradient id="swirlTR-orange" x1="500" y1="0" x2="240" y2="500" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#F5920A" />
        <stop offset="1" stopColor="#FBBC04" />
      </linearGradient>
    </defs>
    {/* Deep navy ribbon — broadest base wave */}
    <path d="M 500,-20 C 360,40 280,140 270,235 C 262,320 305,395 420,470 C 460,495 490,505 520,510 L 520,-20 Z" fill="url(#swirlTR-navy)" opacity="0.95" />
    {/* Royal blue mid ribbon */}
    <path d="M 500,30 C 380,80 310,170 305,250 C 302,325 345,395 445,460 L 510,485 L 510,30 Z" fill="url(#swirlTR-blue)" opacity="0.55" />
    {/* Sky-blue inner highlight ribbon */}
    <path d="M 500,75 C 410,115 355,195 352,265 C 350,330 385,390 470,445" stroke="#7CC1EE" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
    {/* Orange flowing ribbon — the signature butter-stroke */}
    <path d="M 495,-5 C 380,55 305,150 290,245 C 278,335 320,410 425,475" stroke="url(#swirlTR-orange)" strokeWidth="11" strokeLinecap="round" fill="none" />
    {/* Amber whisper ribbon */}
    <path d="M 500,18 C 395,80 325,170 312,260 C 302,345 340,415 435,475" stroke="#FBBC04" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
    {/* Tiny inner cream accent */}
    <path d="M 500,55 C 425,110 365,190 355,270" stroke="#FFE9B8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);

const SwirlBottomLeft: React.FC<{ className?: string; opacity?: number }> = ({ className = '', opacity = 1 }) => (
  <svg className={`pointer-events-none absolute ${className}`} viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity }} preserveAspectRatio="xMinYMax meet">
    <defs>
      <linearGradient id="swirlBL-navy" x1="0" y1="500" x2="300" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0F1D3A" />
        <stop offset="1" stopColor="#1B3A6B" />
      </linearGradient>
      <linearGradient id="swirlBL-blue" x1="0" y1="460" x2="280" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#2B7CC9" />
        <stop offset="1" stopColor="#4AADE8" />
      </linearGradient>
      <linearGradient id="swirlBL-orange" x1="0" y1="500" x2="260" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#F5920A" />
        <stop offset="1" stopColor="#FBBC04" />
      </linearGradient>
    </defs>
    <path d="M -20,520 C 40,460 140,420 230,265 C 295,165 245,80 80,30 C 40,15 10,5 -20,0 L -20,520 Z" fill="url(#swirlBL-navy)" opacity="0.95" />
    <path d="M -10,470 C 60,420 150,360 195,250 C 230,165 185,90 55,45 L -10,25 L -10,470 Z" fill="url(#swirlBL-blue)" opacity="0.55" />
    <path d="M -5,425 C 70,395 130,330 165,235 C 195,160 160,100 55,60" stroke="#7CC1EE" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" />
    <path d="M 5,505 C 100,440 175,355 210,260 C 245,165 200,80 75,25" stroke="url(#swirlBL-orange)" strokeWidth="11" strokeLinecap="round" fill="none" />
    <path d="M -10,480 C 80,420 160,340 188,250 C 218,160 175,90 65,45" stroke="#FBBC04" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
    <path d="M -5,440 C 70,390 145,310 165,225" stroke="#FFE9B8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);

/* ── FadeIn wrapper ── */
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ── Book a Demo Modal ── */
const BookDemoModal: React.FC<{ open: boolean; onClose: () => void; brand: typeof brand }> = ({ open, onClose, brand: b }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', school: '', role: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', phone: '', school: '', role: '', message: '' });
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.school.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(15,29,58,0.55)', backdropFilter: 'blur(6px)' }} onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 transition-colors hover:bg-gray-100"
          style={{ color: b.navyDark }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="px-8 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${brand.orange}15` }}>
              <CheckCircle2 size={36} style={{ color: brand.orange }} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: b.navyDark }}>Thank you!</h3>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: '#52697F' }}>
              We've received your request. Our sales team will get in touch with you shortly to schedule your personalised demo.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${b.deepBlue}, ${b.royalBlue})` }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="px-7 pt-7 pb-5" style={{ background: `linear-gradient(135deg, ${b.deepBlue}, ${b.royalBlue})` }}>
              <h3 className="text-xl font-bold text-white">Book a Demo</h3>
              <p className="mt-1.5 text-sm text-white/75">
                Share your details and our sales team will get in touch with you.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: b.navyDark }}>Full Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2B7CC9]"
                    style={{ borderColor: '#D8E2EE', color: b.navyDark }} placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: b.navyDark }}>Role</label>
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2B7CC9]"
                    style={{ borderColor: '#D8E2EE', color: b.navyDark }} placeholder="Principal, Admin..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: b.navyDark }}>School / Institution *</label>
                <input required value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2B7CC9]"
                  style={{ borderColor: '#D8E2EE', color: b.navyDark }} placeholder="Your school name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: b.navyDark }}>Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2B7CC9]"
                    style={{ borderColor: '#D8E2EE', color: b.navyDark }} placeholder="you@school.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: b.navyDark }}>Phone *</label>
                  <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2B7CC9]"
                    style={{ borderColor: '#D8E2EE', color: b.navyDark }} placeholder="+91 98xxxxxxxx" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: b.navyDark }}>Message (optional)</label>
                <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#2B7CC9] resize-none"
                  style={{ borderColor: '#D8E2EE', color: b.navyDark }} placeholder="Tell us about your needs..." />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                style={{
                  background: `linear-gradient(135deg, ${b.orange}, #E07A00)`,
                  boxShadow: `0 4px 20px ${b.orange}40`,
                }}>
                {submitting ? 'Submitting...' : 'Request Demo'}
              </button>
              <p className="text-center text-xs" style={{ color: '#8A9BB5' }}>
                Our sales team will reach out within 1 business day.
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'About', id: 'about' },
    { label: 'Benefits', id: 'benefits' },
    { label: 'Reports', id: 'reports' },
    { label: 'Contact', id: 'contact' },
  ];

  const stat1 = useCounter(3, 1800);
  const stat2 = useCounter(85, 2000);
  const stat3 = useCounter(10, 1600);

  return (
    <div className="min-h-screen antialiased" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ══════════ NAVBAR ══════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b shadow-[0_1px_24px_rgba(15,29,58,0.07)]'
            : ''
        }`}
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          borderColor: scrolled ? '#E2EAF4' : 'transparent',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-10">
          <img src={logoHorizontal} alt="ButterPrep" className="h-9 w-auto sm:h-10" />

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="relative text-[13px] font-semibold tracking-wide uppercase transition-colors duration-200"
                style={{ color: '#4A5E7A', letterSpacing: '0.04em' }}
                onMouseEnter={e => (e.currentTarget.style.color = brand.deepBlue)}
                onMouseLeave={e => (e.currentTarget.style.color = '#4A5E7A')}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoOpen(true)}
              className="hidden rounded-full px-6 py-2.5 text-sm font-bold tracking-wide text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97] sm:inline-flex"
              style={{
                background: `linear-gradient(135deg, ${brand.orange}, #E07A00)`,
                boxShadow: `0 4px 20px ${brand.orange}40, 0 1px 3px rgba(0,0,0,0.08)`,
              }}
            >
              Book a Demo
            </button>
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: brand.deepBlue }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t bg-white px-5 pb-4 pt-2 md:hidden" style={{ borderColor: '#E8EEF6' }}>
            {navLinks.map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="block w-full py-3 text-left text-sm font-semibold"
                style={{ color: brand.deepBlue }}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setDemoOpen(true);
              }}
              className="mt-2 w-full rounded-xl px-5 py-3 text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${brand.orange}, #E07A00)` }}
            >
              Book a Demo
            </button>
          </div>
        )}
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden pt-28 pb-6 md:pt-36 md:pb-10">
        {/* Premium brand gradient bg */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(165deg, #FFFAEC 0%, #FFF1D2 14%, #F5EBD8 30%, #E6EFFA 58%, #DCE9F7 80%, #EEF3FA 100%)`
        }} />
        {/* Refined glow accents */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-[0.22] blur-[120px]" style={{ background: brand.orange }} />
        <div className="absolute top-1/3 -left-48 h-[520px] w-[520px] rounded-full opacity-[0.18] blur-[120px]" style={{ background: brand.skyBlue }} />
        <div className="absolute bottom-10 right-1/4 h-[280px] w-[280px] rounded-full opacity-[0.12] blur-[100px]" style={{ background: brand.amber }} />
        <div className="absolute top-20 left-1/3 h-[240px] w-[240px] rounded-full opacity-[0.10] blur-[100px]" style={{ background: brand.mediumBlue }} />

        {/* Premium brand swirl decorations */}
        <SwirlTopRight className="top-0 right-0 h-[340px] w-[340px] md:h-[440px] md:w-[440px]" opacity={0.85} />
        <SwirlBottomLeft className="bottom-16 left-0 h-[260px] w-[260px] md:h-[360px] md:w-[360px]" opacity={0.75} />


        <div className="relative mx-auto max-w-7xl px-5 lg:px-10">

          <div className="mx-auto max-w-3xl text-center">
            <FadeIn delay={0.05}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{ background: `${brand.deepBlue}0C`, color: brand.deepBlue, border: `1px solid ${brand.deepBlue}15` }}>
                <Sparkles size={13} />
                AI-Powered Academic Intelligence
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]"
                style={{ color: brand.navyDark }}>
                From Answer Sheets
                <br />
                to{' '}
                <span style={{ color: brand.mediumBlue }}>Academic</span>{' '}
                <span style={{ color: brand.orange }}>Intelligence</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.18}>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed sm:text-[17px]" style={{ color: '#52697F' }}>
                ButterPrep helps schools digitize exam workflows, accelerate evaluation, and generate meaningful academic insights for teachers, management, students, and parents.
              </p>
            </FadeIn>

            <FadeIn delay={0.26}>
              <div className="mt-8 flex flex-wrap gap-3.5 justify-center">
                <button
                  onClick={() => setDemoOpen(true)}
                  className="group rounded-xl px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${brand.deepBlue}, ${brand.royalBlue})`,
                    boxShadow: `0 4px 24px ${brand.deepBlue}30, 0 1px 3px rgba(0,0,0,0.06)`
                  }}>
                  Book a Demo
                  <ArrowRight size={15} className="ml-2 inline transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => scrollTo('about')}
                  className="rounded-xl border-2 px-8 py-3.5 text-sm font-bold transition-all duration-200 hover:bg-[#F0F4FA]"
                  style={{ borderColor: '#C8D6E8', color: brand.deepBlue }}>
                  Learn More
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.34}>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                {[
                  { icon: Zap, text: 'Faster Evaluation', color: brand.orange },
                  { icon: BarChart3, text: 'Smarter Reports', color: brand.mediumBlue },
                  { icon: Eye, text: 'Better Academic Visibility', color: brand.skyBlue },
                ].map(chip => (
                  <span
                    key={chip.text}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
                    style={{ background: `${chip.color}0D`, color: chip.color }}
                  >
                    <chip.icon size={13} />
                    {chip.text}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" className="w-full" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d="M0,50 C360,80 720,20 1080,50 C1260,65 1380,35 1440,45 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      <section className="relative" style={{ background: 'white' }}>
        <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { ref: stat1.ref, val: `${stat1.count}x`, label: 'Faster Consolidation', color: brand.orange, bg: '#FFF4E0' },
              { ref: stat2.ref, val: `${stat2.count}%`, label: 'Less Manual Work', color: brand.mediumBlue, bg: '#E4F0FB' },
              { ref: stat3.ref, val: `${stat3.count}+`, label: 'Actionable Insights', color: brand.skyBlue, bg: '#DDEEFB' },
            ].map(s => (
              <div key={s.label} ref={s.ref} className="text-center rounded-2xl py-7 px-4 transition-transform hover:-translate-y-1"
                style={{
                  background: `linear-gradient(160deg, ${s.bg} 0%, #FFFFFF 100%)`,
                  border: `1px solid ${s.color}25`,
                  boxShadow: `0 4px 18px ${s.color}15`,
                }}>
                <p className="text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: s.color }}>
                  {s.val}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: brand.deepBlue }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WHY BUTTERPREP ══════════ */}
      <section id="about" className="relative py-20 md:py-28" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F8FC 100%)' }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `${brand.orange}12`, color: brand.orange, border: `1px solid ${brand.orange}25` }}>
                The Problem
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-[2.25rem]" style={{ color: brand.navyDark, letterSpacing: '-0.02em' }}>
                Why Schools Need Better Exam Intelligence
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: '#52697F' }}>
                Most schools are sitting on rich exam data — but extracting meaningful insight remains slow, manual, and fragmented.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock, title: 'Long Evaluation Hours', desc: 'Teachers spend excessive time manually evaluating papers.', color: brand.orange, bg: '#FFF1DE' },
              { icon: TrendingUp, title: 'Slow Consolidation', desc: 'Result consolidation across classes takes too long.', color: brand.mediumBlue, bg: '#E2EEFB' },
              { icon: AlertTriangle, title: 'Hidden Academic Gaps', desc: 'Academic gaps are difficult to spot and address early.', color: brand.amber, bg: '#FFF6D9' },
              { icon: FileText, title: 'Limited Parent Insight', desc: 'Parents receive marks but lack meaningful context.', color: brand.skyBlue, bg: '#DCEEFB' },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl bg-white p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    border: '1px solid #E4ECF5',
                    boxShadow: '0 1px 4px rgba(15,29,58,0.03), 0 4px 16px rgba(15,29,58,0.03)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 32px ${card.color}25`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,29,58,0.03), 0 4px 16px rgba(15,29,58,0.03)')}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: card.bg, color: card.color }}>
                    <card.icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold" style={{ color: brand.navyDark }}>{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#6B7F9A' }}>{card.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.35}>
            <div className="mx-auto mt-12 max-w-xl text-center">
              <div className="inline-block rounded-2xl px-8 py-5" style={{ background: `${brand.deepBlue}06` }}>
                <Quote size={20} style={{ color: brand.skyBlue, opacity: 0.5 }} className="mx-auto mb-2" />
                <p className="text-base font-medium leading-relaxed" style={{ color: brand.navyDark }}>
                  Exams generate valuable academic data —{' '}
                  <span className="font-bold" style={{ color: brand.orange }}>but most of it remains underused.</span>
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ WHAT BUTTERPREP DELIVERS ══════════ */}
      <section id="benefits" className="relative py-20 md:py-28" style={{ background: 'linear-gradient(180deg, #FBF6EA 0%, #F8EFD8 100%)' }}>
        <div className="absolute -top-32 right-10 h-[320px] w-[320px] rounded-full opacity-[0.10] blur-[100px]" style={{ background: brand.orange }} />
        <div className="absolute bottom-10 -left-10 h-[280px] w-[280px] rounded-full opacity-[0.08] blur-[100px]" style={{ background: brand.amber }} />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-10">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `${brand.mediumBlue}12`, color: brand.mediumBlue, border: `1px solid ${brand.mediumBlue}25` }}>
                Benefits
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-[2.25rem]" style={{ color: brand.navyDark, letterSpacing: '-0.02em' }}>
                What ButterPrep Delivers
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: '#52697F' }}>
                A single, intelligent layer over your existing exam workflow — built to save time and surface what matters.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: School, title: 'School-Wide Visibility', desc: 'Academic performance across classes, sections, and subjects at a glance.', from: brand.deepBlue, to: brand.mediumBlue, bg: '#EEF4FC' },
              { icon: Zap, title: 'Faster Post-Exam Reporting', desc: 'From evaluation to reports in a fraction of the usual time.', from: brand.orange, to: '#E07A00', bg: '#FFF4E0' },
              { icon: Users, title: 'Parent-Ready Reports', desc: 'Structured performance reports for meaningful parent communication.', from: brand.skyBlue, to: brand.mediumBlue, bg: '#E0EEFB' },
              { icon: Shield, title: 'Better Decision-Making', desc: 'Data-driven academic insights for smarter institutional planning.', from: brand.amber, to: brand.orange, bg: '#FFF6D9' },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(160deg, ${card.bg} 0%, #FFFFFF 100%)`,
                    border: `1px solid ${card.from}30`,
                    boxShadow: `0 4px 16px ${card.from}12`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = `0 10px 32px ${card.from}25`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,29,58,0.02)';
                  }}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${card.from}, ${card.to})`, boxShadow: `0 6px 16px ${card.from}40` }}>
                    <card.icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold" style={{ color: brand.navyDark }}>{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#6B7F9A' }}>{card.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ STAKEHOLDER IMPACT ══════════ */}
      <section className="relative py-20 md:py-28" style={{ background: 'linear-gradient(180deg, #EEF4FB 0%, #E2ECF7 100%)' }}>
        <div className="absolute -top-20 -left-10 h-[320px] w-[320px] rounded-full opacity-[0.12] blur-[100px]" style={{ background: brand.skyBlue }} />
        <div className="absolute bottom-0 right-10 h-[280px] w-[280px] rounded-full opacity-[0.10] blur-[100px]" style={{ background: brand.mediumBlue }} />
        <SwirlTopRight className="top-0 right-0 h-[260px] w-[260px] md:h-[340px] md:w-[340px]" opacity={0.55} />
        <SwirlBottomLeft className="bottom-0 left-0 h-[220px] w-[220px] md:h-[300px] md:w-[300px]" opacity={0.5} />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-10">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `${brand.orange}12`, color: brand.orange, border: `1px solid ${brand.orange}25` }}>
                For Everyone
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-[2.25rem]" style={{ color: brand.navyDark, letterSpacing: '-0.02em' }}>
                Built for the Entire School Ecosystem
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: '#52697F' }}>
                One platform — tailored experiences for management, teachers, students, and parents.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: School, role: 'Management', desc: 'Clear school-wide visibility for better academic planning.', accent: brand.deepBlue },
              { icon: BookOpen, role: 'Teachers', desc: 'Less manual effort and smoother evaluation workflows.', accent: brand.mediumBlue },
              { icon: GraduationCap, role: 'Students', desc: 'Better feedback on strengths, gaps, and progress.', accent: brand.orange },
              { icon: UserCheck, role: 'Parents', desc: 'Easy access to clear performance reports.', accent: brand.skyBlue },
            ].map((card, i) => (
              <FadeIn key={card.role} delay={i * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-2xl bg-white p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    border: '1px solid #E4ECF5',
                    boxShadow: '0 1px 4px rgba(15,29,58,0.03), 0 4px 16px rgba(15,29,58,0.03)',
                  }}>
                  {/* Top accent line */}
                  <div className="absolute inset-x-0 top-0 h-[3px] transition-all duration-200 group-hover:h-1"
                    style={{ background: card.accent }} />
                  <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl text-white"
                    style={{ background: card.accent }}>
                    <card.icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-[15px] font-bold" style={{ color: brand.navyDark }}>{card.role}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: '#6B7F9A' }}>{card.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PARENT REPORTS ══════════ */}
      <section id="reports" className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(145deg, ${brand.navyDark} 0%, #162D55 40%, ${brand.deepBlue} 100%)`
        }} />
        {/* Subtle geometric lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg viewBox="0 0 1440 400" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,200 C240,280 480,120 720,200 C960,280 1200,120 1440,200" fill="none" stroke="white" strokeWidth="1.5" />
            <path d="M0,240 C300,160 600,320 900,220 C1100,160 1300,280 1440,240" fill="none" stroke="white" strokeWidth="1" />
            <path d="M0,280 C360,340 720,200 1080,280 C1260,320 1380,260 1440,280" fill="none" stroke="white" strokeWidth="0.7" />
          </svg>
        </div>
        {/* Glow accents */}
        <div className="absolute -top-32 right-0 h-[400px] w-[400px] rounded-full opacity-[0.08] blur-[80px]" style={{ background: brand.orange }} />
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full opacity-[0.06] blur-[80px]" style={{ background: brand.skyBlue }} />

        <div className="relative mx-auto max-w-3xl px-5 text-center lg:px-10">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"
              style={{ background: `${brand.orange}22`, color: brand.orangeLight, border: `1px solid ${brand.orange}20` }}>
              <FileText size={13} /> Signature Feature
            </span>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Parent Reports That Go Beyond Marks
            </h2>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p className="mt-4 text-base leading-relaxed sm:text-lg" style={{ color: '#94B3D4' }}>
              ButterPrep helps schools share clear, structured performance reports that make parent communication more meaningful and actionable.
            </p>
          </FadeIn>
          <FadeIn delay={0.26}>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Subject-wise breakdown', 'Strengths & improvement areas', 'Comparative analysis'].map(item => (
                <span key={item} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                  }}>
                  <CheckCircle2 size={13} style={{ color: brand.orangeLight }} />
                  {item}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="relative py-20 md:py-24" style={{ background: 'linear-gradient(180deg, #FBF6EA 0%, #F8EFD8 100%)' }}>
        <div className="absolute -top-16 right-1/4 h-[260px] w-[260px] rounded-full opacity-[0.10] blur-[100px]" style={{ background: brand.orange }} />
        <div className="relative mx-auto max-w-5xl px-5 lg:px-10">
          <FadeIn>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ background: `${brand.mediumBlue}12`, color: brand.mediumBlue, border: `1px solid ${brand.mediumBlue}25` }}>
                Testimonials
              </span>
              <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: brand.navyDark, letterSpacing: '-0.02em' }}>
                Trusted by School Leaders
              </h3>
            </div>
          </FadeIn>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { quote: 'ButterPrep transformed how we look at exam data. Our academic reviews are now data-driven and actionable.', name: 'Dr. Meena Sharma', role: 'Principal, Delhi Public School' },
              { quote: "The parent reports alone have changed how families engage with their child's progress. Truly remarkable.", name: 'Rajesh Nair', role: 'Academic Coordinator, Greenfield International' },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.12}>
                <div className="h-full rounded-2xl bg-white p-7"
                  style={{
                    border: '1px solid #E4ECF5',
                    boxShadow: '0 1px 4px rgba(15,29,58,0.03), 0 4px 20px rgba(15,29,58,0.04)',
                  }}>
                  <Quote size={24} style={{ color: `${brand.orange}35` }} />
                  <p className="mt-4 text-[15px] leading-relaxed" style={{ color: '#3A5170' }}>
                    "{t.quote}"
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${brand.deepBlue}, ${brand.mediumBlue})` }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: brand.navyDark }}>{t.name}</p>
                      <p className="text-xs font-medium" style={{ color: '#8A9BB5' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section id="contact" className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, ${brand.deepBlue} 0%, ${brand.mediumBlue} 40%, ${brand.skyBlue} 100%)`
        }} />
        <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-white/[0.06] blur-[80px]" />
        <div className="absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full opacity-[0.08] blur-[80px]" style={{ background: brand.orange }} />
        {/* Brand swirl accents on dark CTA */}
        <svg className="pointer-events-none absolute top-0 right-0 h-[280px] w-[280px] md:h-[360px] md:w-[360px]" viewBox="0 0 400 400" fill="none">
          <path d="M 380,0 Q 300,80 270,180 Q 250,270 310,340" stroke="#F5920A" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M 395,10 Q 320,90 290,190 Q 270,275 325,345" stroke="#FBBC04" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
        </svg>
        <svg className="pointer-events-none absolute bottom-0 left-0 h-[240px] w-[240px] md:h-[320px] md:w-[320px]" viewBox="0 0 400 400" fill="none">
          <path d="M 20,400 Q 100,320 130,220 Q 150,130 90,60" stroke="#F5920A" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M 5,390 Q 80,310 110,210 Q 130,125 75,55" stroke="#FBBC04" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.65" />
        </svg>

        <div className="relative mx-auto max-w-3xl px-5 text-center lg:px-10">
          <FadeIn>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.8rem]">
              Make Every Exam More Meaningful
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-4 text-base text-white/75 sm:text-lg">
              Bring faster evaluation, smarter reporting, and better academic visibility to your school.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setDemoOpen(true)}
                className="group rounded-xl px-8 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${brand.orange}, #E07A00)`,
                  color: 'white',
                  boxShadow: `0 4px 24px ${brand.orange}40`,
                }}>
                Book a Demo
                <ArrowRight size={15} className="ml-2 inline transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setDemoOpen(true)}
                className="rounded-xl border-2 border-white/20 bg-white/[0.08] px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15">
                Contact Us
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(180deg, #F7F5EF 0%, #EFEAD8 100%)`,
        }}>
        {/* Top hairline accent — bridges from CTA section */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${brand.orange}88 30%, ${brand.royalBlue}88 70%, transparent 100%)`,
          }}
        />
        {/* Subtle ambient glow */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[60%] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${brand.orange}10` }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-12 lg:px-10 lg:py-14">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-left">
              <img src={logoHorizontal} alt="ButterPrep" className="mx-auto h-10 w-auto md:mx-0" />
              <p className="mt-3 text-sm font-semibold tracking-wide" style={{ color: brand.navyDark }}>
                Smooth Exams. Smarter Results.
              </p>
              <p className="mt-2 text-xs" style={{ color: `${brand.navyDark}99` }}>
                Exam intelligence for forward-thinking schools.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 text-sm md:items-end">
              <a
                href="https://www.butterprep.com"
                className="group flex items-center gap-2.5 py-1 transition-colors"
                style={{ color: `${brand.navyDark}CC` }}>
                <Globe size={13} style={{ color: brand.royalBlue }} />
                www.butterprep.com
              </a>
              <a
                href="mailto:hello@butterprep.com"
                className="group flex items-center gap-2.5 py-1 transition-colors"
                style={{ color: `${brand.navyDark}CC` }}>
                <Mail size={13} style={{ color: brand.royalBlue }} />
                hello@butterprep.com
              </a>
              <a
                href="tel:+919844149801"
                className="group flex items-center gap-2.5 py-1 transition-colors"
                style={{ color: `${brand.navyDark}CC` }}>
                <Phone size={13} style={{ color: brand.orange }} />
                +91-9844149801
              </a>
            </div>
          </div>
          <div
            className="mt-10 flex flex-col items-center justify-between gap-3 pt-6 text-xs md:flex-row"
            style={{ borderTop: `1px solid ${brand.navyDark}1A`, color: `${brand.navyDark}99` }}>
            <p>© {new Date().getFullYear()} ButterPrep. All rights reserved.</p>
            <p className="tracking-wide" style={{ color: `${brand.navyDark}80` }}>Crafted for schools in India 🇮🇳</p>
          </div>
        </div>
      </footer>

      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} brand={brand} />
    </div>
  );
};

export default LandingPage;
