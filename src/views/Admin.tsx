"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@/types/auth";
import type { ContactMessage, Project } from "@/types/data";
import {
  Plus, Pencil, Trash2, LogOut, ArrowLeft, Save, X,
  Mail, MailOpen, Eye, MessageSquare
} from "lucide-react";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/")} className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-1">
              <span className="text-primary font-mono font-bold opacity-70">&lt;</span>
              <span className="text-foreground font-bold tracking-tight">ONUR</span>
              <span className="text-primary font-mono font-bold opacity-70">/&gt;</span>
            </div>
            <span className="text-muted-foreground text-sm font-mono">/ Admin Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors text-sm"
          >
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-5 pt-6">
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setTab("projects")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "projects" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Projeler
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-2 ${tab === "messages" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <MessageSquare size={16} /> Mesajlar
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">
        {tab === "projects" ? <ProjectsTab /> : <MessagesTab />}
      </div>
    </div>
  );
}

/* ── Projects Tab ── */
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

  // Initial data load is async and intentionally runs once on mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchProjects(); }, []);

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
      alert("Proje kaydedilemedi. Lütfen tekrar deneyin.");
      return;
    }

    setEditingProject(null);
    setIsNew(false);
    await fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;
    const response = await fetch(`/api/projects/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Proje silinemedi. Lütfen tekrar deneyin.");
      return;
    }

    await fetchProjects();
  };

  const inputClass = "w-full px-4 py-3 rounded-md bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors";

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Projeler</h1>
          <p className="text-muted-foreground text-sm mt-1">Portfolyonuzdaki projeleri yönetin</p>
        </div>
        <button
          onClick={() => {
            setEditingProject({ title: "", description: "", long_description: "", status: "Yayında", tags: [], icon: "Globe", link: "", display_order: projects.length });
            setIsNew(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} /> Yeni Proje
        </button>
      </div>

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-5">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{isNew ? "Yeni Proje Ekle" : "Proje Düzenle"}</h2>
              <button onClick={() => { setEditingProject(null); setIsNew(false); }} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Proje Adı *</label>
                <input className={inputClass} placeholder="Proje başlığı" value={editingProject.title || ""} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Kısa Açıklama *</label>
                <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Kart üzerinde görünecek kısa açıklama" value={editingProject.description || ""} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Detaylı Açıklama</label>
                <textarea className={`${inputClass} resize-none`} rows={5} placeholder="Detaylı açıklama" value={editingProject.long_description || ""} onChange={(e) => setEditingProject({ ...editingProject, long_description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Durum</label>
                  <select className={inputClass} value={editingProject.status || "Yayında"} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })}>
                    <option value="Yayında">Yayında</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Geliştiriliyor">Geliştiriliyor</option>
                    <option value="Yakında">Yakında</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Sıralama</label>
                  <input type="number" className={inputClass} value={editingProject.display_order ?? 0} onChange={(e) => setEditingProject({ ...editingProject, display_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Etiketler (virgülle ayırın)</label>
                <input className={inputClass} placeholder="Next.js, React, Tailwind CSS" value={(editingProject.tags || []).join(", ")} onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Proje Linki</label>
                <input className={inputClass} placeholder="https://example.com" value={editingProject.link || ""} onChange={(e) => setEditingProject({ ...editingProject, link: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark transition-colors">
                <Save size={16} /> Kaydet
              </button>
              <button onClick={() => { setEditingProject(null); setIsNew(false); }} className="px-6 py-3 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors text-sm">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">Henüz proje eklenmemiş</p>
          <p className="text-sm">Yukarıdaki &quot;Yeni Proje&quot; butonuna tıklayarak başlayın</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card/60 hover:border-primary/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  <span className={`shrink-0 px-2 py-0.5 text-[10px] font-mono rounded-full border ${project.status === "Yayında" ? "border-accent-green/30 text-accent-green bg-accent-green/5" : "border-primary/30 text-primary bg-primary/5"}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm truncate mt-1">{project.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-[10px] font-mono rounded border border-border bg-muted/40 text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditingProject(project); setIsNew(false); }} className="p-2 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(project.id)} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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

/* ── Messages Tab ── */
function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  async function fetchMessages() {
    const response = await fetch("/api/messages", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as ContactMessage[];
    setMessages(data);
  }

  // Initial data load is async and intentionally runs once on mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMessages(); }, []);

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
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
      }
    }
    setSelectedMsg({ ...msg, is_read: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    const response = await fetch(`/api/messages/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Mesaj silinemedi. Lütfen tekrar deneyin.");
      return;
    }

    if (selectedMsg?.id === id) setSelectedMsg(null);
    await fetchMessages();
  };

  const typeLabels: Record<string, string> = {
    eticaret: "E-Ticaret Sitesi",
    kurumsal: "Kurumsal Web Sitesi",
    admin: "Admin Panel / Yönetim Sistemi",
    ozel: "Özel Yazılım Projesi",
    diger: "Diğer",
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mesajlar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          İletişim formundan gelen mesajlar {unreadCount > 0 && <span className="text-primary font-semibold">({unreadCount} okunmamış)</span>}
        </p>
      </div>

      {/* Message Detail Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-5">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{selectedMsg.name}</h2>
              <button onClick={() => setSelectedMsg(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0">E-posta:</span>
                <a href={`mailto:${selectedMsg.email}`} className="text-primary hover:underline">{selectedMsg.email}</a>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0">Tür:</span>
                <span>{selectedMsg.type ? (typeLabels[selectedMsg.type] || selectedMsg.type) : "Belirtilmemiş"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20 shrink-0">Tarih:</span>
                <span>{new Date(selectedMsg.created_at).toLocaleString("tr-TR")}</span>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-muted-foreground text-xs mb-2">Mesaj:</p>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{selectedMsg.detail}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href={`mailto:${selectedMsg.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark transition-colors"
              >
                <Mail size={16} /> Yanıtla
              </a>
              <button onClick={() => setSelectedMsg(null)} className="px-6 py-3 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors text-sm">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg mb-2">Henüz mesaj yok</p>
          <p className="text-sm">İletişim formundan gelen mesajlar burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                msg.is_read
                  ? "border-border bg-card/40 hover:border-primary/20"
                  : "border-primary/30 bg-primary/5 hover:border-primary/50"
              }`}
              onClick={() => markAsRead(msg)}
            >
              <div className="mt-0.5">
                {msg.is_read ? <MailOpen size={18} className="text-muted-foreground" /> : <Mail size={18} className="text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className={`font-semibold truncate ${!msg.is_read ? "text-foreground" : ""}`}>{msg.name}</h3>
                  {!msg.is_read && <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />}
                  <span className="text-muted-foreground text-xs ml-auto shrink-0">
                    {new Date(msg.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-0.5">{msg.email}</p>
                <p className="text-muted-foreground text-sm truncate mt-1">{msg.detail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={(e) => { e.stopPropagation(); markAsRead(msg); }} className="p-2 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Eye size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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
