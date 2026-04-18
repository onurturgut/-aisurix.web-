"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  LogOut,
  Mail,
  MailOpen,
  MessageSquare,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AuthSession } from "@/types/auth";
import type { ContactMessage, Project } from "@/types/data";

export default function Admin({ initialSession }: { initialSession?: AuthSession | null }) {
  const { session, loading, isAdmin, signOut } = useAuth(initialSession);
  const router = useRouter();
  const [tab, setTab] = useState<"projects" | "messages">("projects");

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [isAdmin, loading, router, session]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (loading || !session || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <button onClick={() => router.push("/")} className="text-muted-foreground transition-colors hover:text-primary">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-primary opacity-70">&lt;</span>
              <span className="font-bold tracking-tight text-foreground">ONUR</span>
              <span className="font-mono font-bold text-primary opacity-70">/&gt;</span>
            </div>
            <span className="min-w-0 text-sm font-mono text-muted-foreground">/ Admin Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive sm:w-auto"
          >
            <LogOut size={16} /> Cikis Yap
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-5 sm:pt-6">
        <div className="-mx-1 overflow-x-auto border-b border-border">
          <div className="flex min-w-max gap-1 px-1">
            <button
              onClick={() => setTab("projects")}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors sm:px-5 ${
                tab === "projects" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Projeler
            </button>
            <button
              onClick={() => setTab("messages")}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors sm:px-5 ${
                tab === "messages" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare size={16} /> Mesajlar
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-5 sm:py-8">
        {tab === "projects" ? <ProjectsTab /> : <MessagesTab />}
      </div>
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNew, setIsNew] = useState(false);

  async function fetchProjects() {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Project[];
    setProjects(data);
  }

  useEffect(() => {
    void fetchProjects();
  }, []);

  const handleSave = async () => {
    if (!editingProject?.title || !editingProject?.description) return;

    const payload = {
      title: editingProject.title,
      description: editingProject.description,
      long_description: editingProject.long_description || null,
      status: editingProject.status || "Yayında",
      tags: editingProject.tags || [],
      icon: editingProject.icon || "Globe",
      link: editingProject.link || null,
      display_order: editingProject.display_order || 0,
    };

    const response = await fetch(isNew ? "/api/projects" : `/api/projects/${editingProject.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert("Proje kaydedilemedi. Lutfen tekrar deneyin.");
      return;
    }

    setEditingProject(null);
    setIsNew(false);
    await fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu projeyi silmek istediginize emin misiniz?")) return;

    const response = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Proje silinemedi. Lutfen tekrar deneyin.");
      return;
    }

    await fetchProjects();
  };

  const inputClass =
    "w-full rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30";

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projeler</h1>
          <p className="mt-1 text-sm text-muted-foreground">Portfolyonuzdaki projeleri yonetin</p>
        </div>
        <button
          onClick={() => {
            setEditingProject({
              title: "",
              description: "",
              long_description: "",
              status: "Yayında",
              tags: [],
              icon: "Globe",
              link: "",
              display_order: projects.length,
            });
            setIsNew(true);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark sm:w-auto"
        >
          <Plus size={16} /> Yeni Proje
        </button>
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="max-h-[94svh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-t-2xl border border-border bg-card p-4 sm:max-h-[90vh] sm:rounded-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{isNew ? "Yeni Proje Ekle" : "Proje Duzenle"}</h2>
              <button onClick={() => { setEditingProject(null); setIsNew(false); }} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Proje Adi *</label>
                <input
                  className={inputClass}
                  placeholder="Proje basligi"
                  value={editingProject.title || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Kisa Aciklama *</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  placeholder="Kart uzerinde gorunecek kisa aciklama"
                  value={editingProject.description || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Detayli Aciklama</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={5}
                  placeholder="Detayli aciklama"
                  value={editingProject.long_description || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, long_description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Durum</label>
                  <select
                    className={inputClass}
                    value={editingProject.status || "Yayında"}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}
                  >
                    <option value="Yayında">Yayında</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Geliştiriliyor">Geliştiriliyor</option>
                    <option value="Yakında">Yakında</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Siralama</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={editingProject.display_order ?? 0}
                    onChange={(e) => setEditingProject({ ...editingProject, display_order: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Etiketler (virgulle ayirin)</label>
                <input
                  className={inputClass}
                  placeholder="Next.js, React, Tailwind CSS"
                  value={(editingProject.tags || []).join(", ")}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Proje Linki</label>
                <input
                  className={inputClass}
                  placeholder="https://example.com"
                  value={editingProject.link || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                <Save size={16} /> Kaydet
              </button>
              <button
                onClick={() => { setEditingProject(null); setIsNew(false); }}
                className="rounded-md border border-border px-6 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Iptal
              </button>
            </div>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="mb-2 text-lg">Henuz proje eklenmemis</p>
          <p className="text-sm">Yukaridaki "Yeni Proje" butonuna tiklayarak baslayin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card/60 p-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h3 className="truncate font-semibold">{project.title}</h3>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono ${
                      project.status === "Yayında"
                        ? "border-accent-green/30 bg-accent-green/5 text-accent-green"
                        : "border-primary/30 bg-primary/5 text-primary"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{project.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="rounded border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 self-end shrink-0 sm:self-auto">
                <button onClick={() => { setEditingProject(project); setIsNew(false); }} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(project.id)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  async function fetchMessages() {
    const response = await fetch("/api/messages", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as ContactMessage[];
    setMessages(data);
  }

  useEffect(() => {
    void fetchMessages();
  }, []);

  const markAsRead = async (msg: ContactMessage) => {
    if (!msg.is_read) {
      const response = await fetch(`/api/messages/${msg.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        setMessages((prev) => prev.map((item) => (item.id === msg.id ? { ...item, is_read: true } : item)));
      }
    }

    setSelectedMsg({ ...msg, is_read: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu mesaji silmek istediginize emin misiniz?")) return;

    const response = await fetch(`/api/messages/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Mesaj silinemedi. Lutfen tekrar deneyin.");
      return;
    }

    if (selectedMsg?.id === id) setSelectedMsg(null);
    await fetchMessages();
  };

  const typeLabels: Record<string, string> = {
    eticaret: "E-Ticaret Sitesi",
    kurumsal: "Kurumsal Web Sitesi",
    admin: "Admin Panel / Yonetim Sistemi",
    ozel: "Ozel Yazilim Projesi",
    diger: "Diger",
  };

  const unreadCount = messages.filter((message) => !message.is_read).length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mesajlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Iletisim formundan gelen mesajlar{" "}
          {unreadCount > 0 && <span className="font-semibold text-primary">({unreadCount} okunmamis)</span>}
        </p>
      </div>

      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="max-h-[94svh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-t-2xl border border-border bg-card p-4 sm:max-h-[90vh] sm:rounded-lg sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{selectedMsg.name}</h2>
              <button onClick={() => setSelectedMsg(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                <span className="w-20 shrink-0 text-muted-foreground">E-posta:</span>
                <a href={`mailto:${selectedMsg.email}`} className="break-all text-primary hover:underline">
                  {selectedMsg.email}
                </a>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                <span className="w-20 shrink-0 text-muted-foreground">Tur:</span>
                <span>{selectedMsg.type ? (typeLabels[selectedMsg.type] || selectedMsg.type) : "Belirtilmemis"}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                <span className="w-20 shrink-0 text-muted-foreground">Tarih:</span>
                <span>{new Date(selectedMsg.created_at).toLocaleString("tr-TR")}</span>
              </div>
              <div className="border-t border-border pt-3">
                <p className="mb-2 text-xs text-muted-foreground">Mesaj:</p>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">{selectedMsg.detail}</p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <a
                href={`mailto:${selectedMsg.email}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
              >
                <Mail size={16} /> Yanitla
              </a>
              <button
                onClick={() => setSelectedMsg(null)}
                className="rounded-md border border-border px-6 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <MessageSquare size={40} className="mx-auto mb-4 opacity-40" />
          <p className="mb-2 text-lg">Henuz mesaj yok</p>
          <p className="text-sm">Iletisim formundan gelen mesajlar burada gorunecek</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                msg.is_read ? "border-border bg-card/40 hover:border-primary/20" : "border-primary/30 bg-primary/5 hover:border-primary/50"
              }`}
              onClick={() => markAsRead(msg)}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="mt-0.5">
                  {msg.is_read ? <MailOpen size={18} className="text-muted-foreground" /> : <Mail size={18} className="text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h3 className={`truncate font-semibold ${!msg.is_read ? "text-foreground" : ""}`}>{msg.name}</h3>
                    {!msg.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <span className="w-full shrink-0 text-xs text-muted-foreground sm:ml-auto sm:w-auto">
                      {new Date(msg.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <p className="mt-0.5 break-all text-xs text-muted-foreground sm:break-normal">{msg.email}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{msg.detail}</p>
                </div>
                <div className="flex items-center gap-2 self-end shrink-0 sm:self-auto">
                  <button onClick={(e) => { e.stopPropagation(); markAsRead(msg); }} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                    <Eye size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
