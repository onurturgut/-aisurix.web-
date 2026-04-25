"use client";

import { Download, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setMounted(true);

    const handleDisplayModeChange = () => {
      const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const navigatorStandalone =
        "standalone" in window.navigator &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setIsStandalone(displayModeStandalone || navigatorStandalone);
    };
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    setIsIos(/iPad|iPhone|iPod/.test(window.navigator.userAgent));
    handleDisplayModeChange();

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (!mounted) return null;

  if (isStandalone) return null;

  if (deferredPrompt) {
    return (
      <button
        onClick={() => void handleInstall()}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 max-[400px]:min-h-10 max-[400px]:px-4 max-[400px]:py-2.5 max-[400px]:text-[11px] sm:w-auto"
      >
        <Download size={16} className="text-primary" />
        Uygulamayi Yukle
      </button>
    );
  }

  if (isIos) {
    return (
      <div className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-muted-foreground max-[400px]:min-h-10 max-[400px]:px-3 max-[400px]:py-2.5 max-[400px]:text-[11px] sm:w-auto">
        <Share2 size={16} className="shrink-0 text-primary" />
        <span>iPhone’da Paylaş menüsünden “Ana Ekrana Ekle” ile yükleyebilirsin.</span>
      </div>
    );
  }

  return null;
}
