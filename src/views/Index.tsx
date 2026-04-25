"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { InstallPrompt } from "@/components/install-prompt";
import { useTheme } from "@/components/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Project } from "@/types/data";
import {
  Code2, Monitor, Server, Database, Wrench,
  Mail, Phone, User, MessageSquare, Send,
  ArrowRight, ExternalLink, ChevronRight,
  Globe, ShoppingCart, Scissors, Wind, UtensilsCrossed,
  Building2, LayoutDashboard, Menu, X, Sun, Moon
} from "lucide-react";

/* ───────────────────── Hook: scroll fade-in ───────────────────── */
function useScrollFadeIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-in-section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ───────────────────── Hook: active nav section ───────────────── */
function useActiveSection() {
  const [active, setActive] = useState("hero");
  useEffect(() => {
    const ids = ["hero", "about", "projects", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  return active;
}

/* ───────────────────── DATA ───────────────────── */
const NAV_ITEMS = [
  { label: "Ana Sayfa", href: "#hero" },
  { label: "Hakkımda", href: "#about" },
  { label: "Projeler", href: "#projects" },
  { label: "İletişim", href: "#contact" },
];

const TECH_BADGES = [
  "Next.js", "React", "TypeScript", "Tailwind CSS",
  "Node.js", "MongoDB", "PostgreSQL", "Prisma",
];

const STATS = [
  { value: "20+", label: "Tamamlanan Proje" },
  { value: "10+", label: "Memnun Müşteri" },
  { value: "2+", label: "Yıl Deneyim" },
  { value: "%100", label: "Memnuniyet" },
];

const SKILLS = [
  {
    icon: Monitor,
    title: "Frontend",
    tags: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    icon: Server,
    title: "Backend",
    tags: ["Node.js", "Express", "REST API", "Auth"],
  },
  {
    icon: Database,
    title: "Veritabanı",
    tags: ["MongoDB", "PostgreSQL", "Prisma", "Mongoose"],
  },
  {
    icon: Wrench,
    title: "Araçlar & Deploy",
    tags: ["Vercel", "Git", "Cloudflare", "Docker"],
  },
];

const FALLBACK_PROJECTS = [
  {
    id: "1", title: "Cep Dünyası", status: "Yayında",
    description: "Telefon ve aksesuar satışı için geliştirilmiş özel e-ticaret altyapısı.",
    long_description: "Ürün katalog sistemi, varyant yapısı, sepet, checkout, ödeme entegrasyonu, kullanıcı hesabı, favoriler, teknik servis modülü ve admin panel içerir.",
    tags: ["Next.js", "TypeScript", "MongoDB", "Tailwind", "Admin Panel"], icon: "ShoppingCart", link: null, display_order: 0,
  },
  {
    id: "2", title: "Güzellik Salonu", status: "Yayında",
    description: "Premium güzellik salonu için geliştirilen modern tanıtım ve randevu odaklı web sitesi.",
    long_description: "Mobil uyumlu, sade ve marka odaklı kullanıcı deneyimi sunar. Randevu formu ve galeri bölümü içerir.",
    tags: ["Next.js", "React", "Tailwind CSS", "Responsive"], icon: "Scissors", link: null, display_order: 1,
  },
  {
    id: "3", title: "Klima Teknik Servis", status: "Yayında",
    description: "Klima teknik servis ve bakım hizmetleri için hazırlanan güven veren kurumsal web sitesi.",
    long_description: "Hizmet sunumu, iletişim ve talep toplama odaklı yapı içerir.",
    tags: ["Next.js", "React", "Tailwind CSS", "Kurumsal"], icon: "Wind", link: null, display_order: 2,
  },
  {
    id: "4", title: "Restaurant Yönetim", status: "Yayında",
    description: "Restoran için online menü, masa rezervasyonu ve sipariş takip sistemi.",
    long_description: "QR menü, online sipariş, masa yönetimi, mutfak ekranı ve admin paneli içerir. Gerçek zamanlı sipariş takibi destekler.",
    tags: ["Next.js", "Node.js", "MongoDB", "Socket.io"], icon: "UtensilsCrossed", link: null, display_order: 3,
  },
  {
    id: "5", title: "Kurumsal Web Sitesi", status: "Yayında",
    description: "İnşaat ve mimarlık firması için modern, kurumsal tanıtım web sitesi.",
    long_description: "Proje portföyü, ekip tanıtımı, hizmet detayları ve iletişim formu içerir. SEO uyumlu ve mobil öncelikli tasarım.",
    tags: ["Next.js", "React", "Tailwind CSS", "SEO"], icon: "Building2", link: null, display_order: 4,
  },
  {
    id: "6", title: "Yönetim Paneli", status: "Yayında",
    description: "Çok kullanıcılı SaaS tipi yönetim paneli ve dashboard sistemi.",
    long_description: "Kullanıcı rolleri, analitik grafikler, veri yönetimi, bildirim sistemi ve raporlama modülleri içerir.",
    tags: ["React", "TypeScript", "PostgreSQL", "Prisma"], icon: "LayoutDashboard", link: null, display_order: 5,
  },
];

/* ───────────────────── COMPONENTS ───────────────────── */

/* ── Header ── */
function Header({ active }: { active: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-primary/20 shadow-[0_4px_30px_hsl(187_100%_50%/0.06)]"
          : "bg-background/40 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex min-h-[var(--header-row-height)] w-full max-w-[1440px] items-center justify-between gap-3 pb-2.5 pl-[max(env(safe-area-inset-left),1rem)] pr-[max(env(safe-area-inset-right),1rem)] pt-[calc(env(safe-area-inset-top)+0.625rem)] sm:pb-4 sm:pl-[max(env(safe-area-inset-left),1.5rem)] sm:pr-[max(env(safe-area-inset-right),1.5rem)] sm:pt-[calc(env(safe-area-inset-top)+1rem)] lg:pl-[max(env(safe-area-inset-left),2rem)] lg:pr-[max(env(safe-area-inset-right),2rem)]">
        <button onClick={() => scrollTo("#hero")} className="group flex min-w-0 items-center gap-1">
          <span className="text-primary font-mono text-base font-bold opacity-70 transition-opacity group-hover:opacity-100 sm:text-lg">&lt;</span>
          <span className="truncate text-[15px] font-bold tracking-tight text-foreground sm:text-lg">aisurix.web</span>
          <span className="text-primary font-mono text-base font-bold opacity-70 transition-opacity group-hover:opacity-100 sm:text-lg">/&gt;</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.replace("#", "");
            const isActive = active === sectionId;
            return (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors font-mono tracking-wide ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-primary transition-all duration-300 ${
                    isActive ? "w-3/4" : "w-0"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary sm:h-11 sm:w-11"
            aria-label="Tema değiştir"
          >
            <span className="block dark:hidden">
              <Moon size={18} />
            </span>
            <span className="hidden dark:block">
              <Sun size={18} />
            </span>
          </button>
          <button
            onClick={() => scrollTo("#contact")}
            className="hidden md:inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Projeni Anlat
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground sm:h-11 sm:w-11 md:hidden"
            aria-label="Menüyü aç"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[calc(100svh-var(--header-total-height))] overflow-y-auto border-t border-border bg-background/95 pb-[max(1.25rem,env(safe-area-inset-bottom))] pl-[max(env(safe-area-inset-left),1rem)] pr-[max(env(safe-area-inset-right),1rem)] pt-2 backdrop-blur-xl sm:pl-[max(env(safe-area-inset-left),1.5rem)] sm:pr-[max(env(safe-area-inset-right),1.5rem)] md:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollTo(item.href)}
              className="block w-full border-b border-border/50 py-3 text-left font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => scrollTo("#contact")}
            className="mt-4 w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            Projeni Anlat
          </button>
        </div>
      )}
    </header>
  );
}

/* ── Hero ── */
function Hero() {
  const isMobile = useIsMobile();
  const heroStack = isMobile ? TECH_BADGES.slice(0, 4) : TECH_BADGES;
  const heroFeatures = isMobile
    ? [
        "Mobil oncelikli ve hizli arayuzler",
        "Yonetilebilir panel odakli sistemler",
      ]
    : [
        "Mobil öncelikli, hızlı ve SEO uyumlu arayüzler",
        "Yönetim panelli, ölçeklenebilir iş odaklı sistemler",
        "Bakımı kolay, modern ve performans odaklı kod yapısı",
      ];
  const heroSummary = isMobile
    ? "Modern, hizli ve yonetilebilir cozumler"
    : "Modern, yönetilebilir ve hızlı çözümler";
  const heroStats = isMobile ? STATS.slice(0, 3) : STATS;

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100svh-var(--header-total-height))] scroll-mt-[var(--header-total-height)] items-center overflow-hidden pb-12 max-[400px]:pb-8 sm:pb-16 lg:pb-24"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] h-[280px] w-[280px] rounded-full bg-primary/8 blur-[90px] animate-float-slow sm:left-[8%] sm:h-[520px] sm:w-[520px] sm:blur-[120px]" />
        <div className="absolute bottom-[6%] right-[-12%] h-[240px] w-[240px] rounded-full bg-secondary/8 blur-[90px] animate-float-slow-reverse sm:right-[4%] sm:bottom-[10%] sm:h-[440px] sm:w-[440px] sm:blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 max-[400px]:gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-14 xl:gap-20">
          <div className="space-y-6 max-[400px]:space-y-4 sm:space-y-8 lg:space-y-10">
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/5 px-3 py-2 sm:px-5 sm:py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent-green animate-pulse-glow" />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-green sm:text-sm sm:tracking-[0.24em]">
                Projeler İçin Uygun
              </span>
            </div>

            <div className="space-y-4 max-[400px]:space-y-3 sm:space-y-6">
              <h1 className="max-w-5xl text-[clamp(2.6rem,11vw,4.4rem)] font-black leading-[0.98] tracking-tight max-[400px]:text-[2.3rem] max-[400px]:leading-[0.94] sm:text-6xl lg:text-7xl xl:text-[7.25rem]">
                Full-Stack Developer &{" "}
                <span className="bg-gradient-to-r from-primary via-accent-green to-primary bg-clip-text text-transparent">
                  Web Yazılım Uzmanı
                </span>
              </h1>

              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground max-[400px]:text-[13px] max-[400px]:leading-5 sm:text-lg lg:text-[1.35rem]">
                İşletmelere özel, yüksek performanslı web uygulamaları geliştiriyorum.
                React, Node.js, TypeScript ve bulut altyapıları konusunda uzmanım.
              </p>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm max-[400px]:hidden lg:max-w-4xl">
              <pre className="overflow-x-auto px-3 py-3 text-[11px] leading-5 sm:px-6 sm:py-6 sm:text-base sm:leading-8">
                <code>
                  <span className="syn-keyword">const</span> <span className="text-foreground">developer</span> <span className="text-muted-foreground">=</span> <span className="syn-bracket">{"{"}</span>{"\n"}
                  {"  "}<span className="syn-property">name</span><span className="text-muted-foreground">:</span> <span className="syn-string">&quot;Onur Turgut&quot;</span><span className="text-muted-foreground">,</span>{"\n"}
                  {"  "}<span className="syn-property">skills</span><span className="text-muted-foreground">:</span> <span className="syn-bracket">[</span><span className="syn-string">&quot;React&quot;</span><span className="text-muted-foreground">,</span> <span className="syn-string">&quot;Node.js&quot;</span><span className="text-muted-foreground">,</span> <span className="syn-string">&quot;TypeScript&quot;</span><span className="text-muted-foreground">,</span> <span className="syn-string">&quot;MongoDB&quot;</span><span className="syn-bracket">]</span><span className="text-muted-foreground">,</span>{"\n"}
                  {"  "}<span className="syn-property">experience</span><span className="text-muted-foreground">:</span> <span className="syn-string">&quot;2+ yıl&quot;</span><span className="text-muted-foreground">,</span>{"\n"}
                  {"  "}<span className="syn-property">status</span><span className="text-muted-foreground">:</span> <span className="syn-string">&quot;Yeni projelere açık&quot;</span>{"\n"}
                  <span className="syn-bracket">{"}"}</span><span className="text-muted-foreground">;</span>
                </code>
              </pre>
            </div>

            <div className="flex flex-col items-stretch gap-3 pt-1 max-[400px]:gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-md bg-gradient-to-r from-primary to-accent-green px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90 max-[400px]:min-h-10 max-[400px]:px-4 max-[400px]:py-2.5 max-[400px]:text-[10px] max-[400px]:tracking-[0.12em] sm:min-h-14 sm:w-auto sm:px-8 sm:py-4 sm:text-sm sm:tracking-wider"
              >
                Projelerimi İncele <ArrowRight size={18} />
              </button>
              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-primary/50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/10 max-[400px]:min-h-10 max-[400px]:px-4 max-[400px]:py-2.5 max-[400px]:text-[10px] max-[400px]:tracking-[0.12em] sm:min-h-14 sm:w-auto sm:px-8 sm:py-4 sm:text-sm sm:tracking-wider"
              >
                Benimle İletişime Geç
              </button>
              <InstallPrompt />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[34rem] lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[22px] border border-primary/20 bg-[#0f172fcc] shadow-[0_24px_80px_hsl(187_100%_50%/0.08)] backdrop-blur-xl max-[400px]:rounded-[18px] sm:rounded-[28px]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 max-[400px]:px-3 max-[400px]:py-2.5 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="ml-4 flex max-w-[calc(100%-5rem)] items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-primary/80 max-[400px]:ml-2 max-[400px]:gap-1 max-[400px]:px-2 max-[400px]:text-[9px] sm:text-[11px] sm:tracking-[0.2em]">
                  <Code2 size={14} />
                  <span className="truncate">profile.ts</span>
                </div>
              </div>

              <div className="overflow-auto px-4 py-4 max-[400px]:px-3 max-[400px]:py-3 sm:px-6 sm:py-6">
                <pre className="min-w-0 max-h-[18.5rem] text-[11px] leading-5 max-[400px]:max-h-[13.25rem] max-[400px]:text-[10px] max-[400px]:leading-4 sm:max-h-none sm:min-w-[300px] sm:text-[15px] sm:leading-8">
                  <code className="font-mono">
                    <span className="syn-keyword">export const</span>{" "}
                    <span className="text-foreground">developerProfile</span>{" "}
                    <span className="text-muted-foreground">=</span>{" "}
                    <span className="syn-bracket">{"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="syn-property">summary</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="syn-string">&quot;{heroSummary}&quot;</span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="syn-property">stats</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="syn-bracket">{"{"}</span>
                    {"\n"}
                    {heroStats.map((item, index) => (
                      <span key={item.label}>
                        {"    "}
                        <span className="syn-property">{item.label.toLowerCase().replaceAll(" ", "_")}</span>
                        <span className="text-muted-foreground">:</span>{" "}
                        <span className="syn-string">&quot;{item.value}&quot;</span>
                        <span className="text-muted-foreground">{index === STATS.length - 1 ? "" : ","}</span>
                        {"\n"}
                      </span>
                    ))}
                    {"  "}
                    <span className="syn-bracket">{"}"}</span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="syn-property">stack</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="syn-bracket">[</span>
                    {"\n"}
                    {heroStack.map((badge, index) => (
                      <span key={badge}>
                        {"    "}
                        <span className="syn-string">&quot;{badge}&quot;</span>
                        <span className="text-muted-foreground">{index === heroStack.length - 1 ? "" : ","}</span>
                        {"\n"}
                      </span>
                    ))}
                    {"  "}
                    <span className="syn-bracket">]</span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="syn-property">features</span>
                    <span className="text-muted-foreground">:</span>{" "}
                    <span className="syn-bracket">[</span>
                    {"\n"}
                    {heroFeatures.map((item, index, array) => (
                      <span key={item}>
                        {"    "}
                        <span className="syn-string">&quot;{item}&quot;</span>
                        <span className="text-muted-foreground">{index === array.length - 1 ? "" : ","}</span>
                        {"\n"}
                      </span>
                    ))}
                    {"  "}
                    <span className="syn-bracket">]</span>
                    {"\n"}
                    <span className="syn-bracket">{"}"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── About ── */
function About() {
  return (
    <section id="about" className="relative scroll-mt-[var(--header-total-height)] py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-16 fade-in-section">
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-4">
            Hakkımda
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">Ben Kimim</h2>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: text + stats */}
          <div className="space-y-6 fade-in-section sm:space-y-8">
            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              <p>
                Ben <span className="text-foreground font-semibold">Onur Turgut</span>.
                İşletmelere özel web tabanlı yazılım çözümleri geliştiren bir full-stack geliştiriciyim.
              </p>
              <p>
                Hazır kalıplar yerine, iş modeline uygun modern ve yönetilebilir altyapılar kurmaya odaklanıyorum.
                Kurumsal web siteleri, e-ticaret sistemleri, yönetim panelli projeler, mobil uyumlu modern arayüzler ve
                performans odaklı çözümler üzerinde çalışıyorum.
              </p>
              <p>
                Amacım sadece güzel görünen siteler yapmak değil; işletmeye gerçekten fayda sağlayan,
                geliştirilebilir ve ölçeklenebilir sistemler kurmak.
              </p>
            </div>
          </div>

          {/* Right: skill cards */}
          <div className="grid grid-cols-1 gap-4 fade-in-section sm:grid-cols-2">
            {SKILLS.map((skill) => {
              const Icon = skill.icon;
              return (
                <div
                  key={skill.title}
                  className="group p-5 rounded-lg border border-border bg-card/60 hover:border-primary/40 hover:glow-cyan transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">{skill.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-[11px] font-mono rounded border border-border bg-muted/40 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary/80 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  ShoppingCart, Scissors, Wind, UtensilsCrossed, Building2, LayoutDashboard, Globe, Monitor, Server, Database,
};

/* ── Project Detail Modal ── */
function ProjectModal({ project, onClose }: { project: typeof FALLBACK_PROJECTS[0]; onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    if (closeTimeoutRef.current) return;
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null;
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    };
  }, [handleClose]);

  return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5 transition-all duration-300 ${
          isClosing ? "bg-background/0 backdrop-blur-0" : "bg-background/80 backdrop-blur-sm"
        }`}
      style={{ animation: isClosing ? undefined : "modalOverlayIn 0.3s ease-out" }}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border bg-card p-4 sm:max-h-[85vh] sm:rounded-lg sm:p-8 space-y-5 max-h-[85svh] overflow-y-auto shadow-[0_20px_60px_hsl(187_100%_50%/0.1),0_0_40px_hsl(0_0%_0%/0.3)] ${
          isClosing
            ? "border-border animate-[modalContentOut_0.25s_ease-in_forwards]"
            : "border-primary/20 animate-[modalContentIn_0.35s_ease-out]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {(() => {
              const Icon = ICON_MAP[project.icon || "Globe"] || Globe;
              return (
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
              );
            })()}
            <div className="min-w-0">
              <h2 className="text-lg font-bold sm:text-xl">{project.title}</h2>
              <span className={`inline-block mt-1 px-2.5 py-0.5 text-[10px] font-mono rounded-full border ${
                project.status === "Yayında"
                  ? "border-accent-green/30 text-accent-green bg-accent-green/5"
                  : "border-primary/30 text-primary bg-primary/5"
              }`}>
                {project.status}
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted/50 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-muted-foreground leading-relaxed">{project.description}</p>

        {project.long_description && (
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-sm mb-2">Proje Detayları</h3>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{project.long_description}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {(project.tags || []).map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-[11px] font-mono rounded border border-border bg-muted/40 text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:w-auto"
          >
            Siteyi Ziyaret Et <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Projects ── */
function Projects() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      const response = await fetch("/api/projects", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as Project[];
      if (!cancelled && data.length > 0) {
        setProjects(data);
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="projects" className="relative scroll-mt-[var(--header-total-height)] py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in-section">
          <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-4">
            Portfolyo
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">Öne Çıkan Projeler</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project, i) => {
            const Icon = ICON_MAP[project.icon || "Globe"] || Globe;
            return (
              <div
                key={project.id}
                className="fade-in-section group relative rounded-lg border border-border bg-card/60 overflow-hidden hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_8px_40px_hsl(187_100%_50%/0.12),0_0_20px_hsl(187_100%_50%/0.06)] transition-all duration-500 cursor-pointer"
                style={{ transitionDelay: `${i * 80}ms` }}
                onClick={() => setSelectedProject(project)}
              >
                {/* Top glow line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Corner glow */}
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                {/* Bottom shimmer */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-5 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                      <Icon size={20} className="text-primary group-hover:drop-shadow-[0_0_6px_hsl(187_100%_50%/0.5)] transition-all duration-300" />
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full border transition-colors duration-300 ${
                      project.status === "Yayında"
                        ? "border-accent-green/30 text-accent-green bg-accent-green/5 group-hover:border-accent-green/60 group-hover:bg-accent-green/10"
                        : "border-primary/30 text-primary bg-primary/5 group-hover:border-primary/60 group-hover:bg-primary/10"
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-3">{project.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {(project.tags || []).slice(0, 4).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] font-mono rounded border border-border bg-muted/40 text-muted-foreground group-hover:border-primary/20 group-hover:text-primary/70 transition-colors duration-300">
                        {tag}
                      </span>
                    ))}
                    {(project.tags || []).length > 4 && (
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded border border-border bg-muted/40 text-muted-foreground">
                        +{(project.tags || []).length - 4}
                      </span>
                    )}
                  </div>

                  <div className="pt-1 sm:pt-2">
                    <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium group-hover:gap-3 transition-all duration-300">
                      İncele <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
}

/* ── Contact ── */
function Contact() {
  const [formState, setFormState] = useState({ name: "", email: "", type: "", detail: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formState.name,
        email: formState.email,
        type: formState.type || null,
        detail: formState.detail,
      }),
    });
    setSending(false);
    if (!response.ok) {
      alert("Mesaj gönderilemedi, lütfen tekrar deneyin.");
      return;
    }
    alert("Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağım.");
    setFormState({ name: "", email: "", type: "", detail: "" });
  };

  const inputClass =
    "w-full px-4 py-3 rounded-md bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors";

  return (
    <section id="contact" className="relative scroll-mt-[var(--header-total-height)] py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left info */}
          <div className="space-y-8 fade-in-section">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-4">
                İletişim
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Birlikte Çalışalım</h2>
              <p className="text-muted-foreground leading-relaxed">
                Yeni bir web sitesi, özel yazılım altyapısı ya da mevcut projenizi
                geliştirmek için benimle iletişime geçebilirsiniz. Projenizin detaylarını
                gönderin, size en kısa sürede dönüş yapayım.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: User, label: "Onur Turgut" },
                { icon: Phone, label: "0533 599 47 36" },
                { icon: Mail, label: "onurturgut603@gmail.com" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 rounded-lg border border-border bg-card/60 p-4 transition-colors hover:border-primary/30 sm:items-center"
                  >
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="break-words text-sm text-foreground">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right form */}
          <div className="fade-in-section">
            <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-card/60 p-5 sm:p-8">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Adınız ve soyadınız"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">E-posta</label>
                <input
                  type="email"
                  required
                  placeholder="ornek@email.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Proje Türü</label>
                <select
                  required
                  value={formState.type}
                  onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Proje türünü seçin</option>
                  <option value="eticaret">E-Ticaret Sitesi</option>
                  <option value="kurumsal">Kurumsal Web Sitesi</option>
                  <option value="admin">Admin Panel / Yönetim Sistemi</option>
                  <option value="ozel">Özel Yazılım Projesi</option>
                  <option value="diger">Diğer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Proje Detayı</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Projeniz hakkında kısa bilgi verin..."
                  value={formState.detail}
                  onChange={(e) => setFormState({ ...formState, detail: e.target.value })}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                {sending ? "Gönderiliyor..." : "Mesaj Gönder"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-card/30 py-16">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              <span className="text-primary font-mono font-bold opacity-70">&lt;</span>
              <span className="text-foreground font-bold tracking-tight">aisurix.web</span>
              <span className="text-primary font-mono font-bold opacity-70">/&gt;</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Modern web teknolojileri ile işletmelere özel yazılım çözümleri geliştiriyorum.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Navigasyon</h4>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => scrollTo(item.href)}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Hizmetler</h4>
            <ul className="space-y-2.5 text-muted-foreground text-sm">
              <li>E-Ticaret Geliştirme</li>
              <li>Kurumsal Web Sitesi</li>
              <li>Admin Panel & Yönetim</li>
              <li>Özel Yazılım Çözümleri</li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Kaynaklar</h4>
            <ul className="space-y-2.5 text-muted-foreground text-sm">
              <li>Next.js</li>
              <li>React</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 space-y-2 text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Onur Turgut. Tüm hakları saklıdır.
          </p>
          <p className="text-muted-foreground/60 text-xs">
            Next.js, React ve modern web teknolojileri ile geliştirildi.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── WhatsApp FAB ── */
function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/905335994736"
      target="_blank"
      rel="noopener noreferrer"
      className="safe-fab fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110 sm:h-14 sm:w-14"
      aria-label="WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 sm:h-7 sm:w-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

/* ───────────────────── PAGE ───────────────────── */
const Index = () => {
  useScrollFadeIn();
  const active = useActiveSection();

  return (
    <div className="min-h-screen bg-background grid-pattern relative overflow-x-hidden">
      <div className="motif-dots" />
      <Header active={active} />
      <main className="pt-[var(--header-total-height)]">
        <Hero />
        <About />
        <Projects />
        <Contact />
        <Footer />
      </main>
      <WhatsAppButton />
    </div>
  );
};

export default Index;

