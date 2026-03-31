"use client";

import { apiFetch as fetch } from "@/lib/api";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Users, Smartphone, Plus, Trash2, Edit3, MessageSquare, Activity, ChevronRight, Calendar, Clock, MapPin, MoreVertical, X, CheckCircle, XCircle, ChevronLeft, CalendarDays, Bell, Send, LogOut, Menu } from "lucide-react";

interface Profile {
  id: number;
  patientName: string;
  phone: string;
  doesExercise: boolean;
  exerciseType: string | null;
  currentWeight: number | null;
  bmi: number | null;
  metabolicAge: number | null;
  realAge: number | null;
  createdAt: string;
  _count?: { messages: number };
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "whatsapp" | "messages" | "appointments" | "calendar">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [highlightedAppointmentId, setHighlightedAppointmentId] = useState<number | null>(null);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/profiles`);
      const data = await res.json();
      setProfiles(data);
    } catch (e) {
      console.error("Error al obtener perfiles:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el perfil de ${name}? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/profiles/${id}`, { method: "DELETE" });
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("Error al eliminar el perfil.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🥑</span>
          </div>
          <h1 className="text-white font-bold text-lg leading-tight">Nutria</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay para móviles */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-slate-900 md:bg-slate-900/80 border-r border-slate-800 flex flex-col backdrop-blur-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white text-xl">🥑</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-tight">Nutria</h1>
                <p className="text-emerald-400 text-xs">Plataforma Nutrición</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <button
              onClick={() => { setView("dashboard"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                view === "dashboard"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Perfiles</span>
            </button>
            <button
              onClick={() => { setView("whatsapp"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                view === "whatsapp"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">WhatsApp</span>
            </button>
            <button
              onClick={() => { setView("messages"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                view === "messages"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">Mensajes</span>
            </button>
            <button
              onClick={() => { setView("appointments"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                view === "appointments"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Citas</span>
            </button>
            <button
              onClick={() => { setView("calendar"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                view === "calendar"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              <span className="font-medium">Calendario</span>
            </button>
          </nav>

          {/* Stats & Actions */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs">Total Pacientes</p>
              <p className="text-white text-2xl font-bold">{profiles.length}</p>
            </div>
            
            <button
              onClick={() => {
                Cookies.remove("token");
                window.location.href = "/login";
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-2.5 rounded-xl transition-all border border-red-500/20 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {view === "dashboard" && (
            <div className="p-4 md:p-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white">Perfiles de Pacientes</h2>
                  <p className="text-slate-400 mt-1">Gestiona expedientes y envía mensajes personalizados con IA</p>
                </div>
                <Link
                  href="/profiles/new"
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Perfil
                </Link>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-24">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Empty */}
              {!loading && profiles.length === 0 && (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-slate-600" />
                  </div>
                  <p className="text-slate-400 text-lg font-medium">Sin perfiles aún</p>
                  <p className="text-slate-600 mt-2 mb-6">Crea el primer expediente de paciente para comenzar.</p>
                  <Link
                    href="/profiles/new"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" /> Crear primer perfil
                  </Link>
                </div>
              )}

              {/* Grid */}
              {!loading && profiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all group"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <span className="text-white text-xl font-bold">
                              {profile.patientName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{profile.patientName}</h3>
                            <p className="text-slate-400 text-sm">+{profile.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {profile.realAge && (
                          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                            <p className="text-emerald-400 font-bold text-lg">{profile.realAge}</p>
                            <p className="text-slate-500 text-xs">Edad</p>
                          </div>
                        )}
                        {profile.currentWeight && (
                          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                            <p className="text-emerald-400 font-bold text-lg">{profile.currentWeight}</p>
                            <p className="text-slate-500 text-xs">Peso kg</p>
                          </div>
                        )}
                        {profile.bmi && (
                          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
                            <p className="text-emerald-400 font-bold text-lg">{profile.bmi}</p>
                            <p className="text-slate-500 text-xs">IMC</p>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${profile.doesExercise ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'}`}>
                          {profile.doesExercise ? `💪 ${profile.exerciseType || "Hace ejercicio"}` : "Sin ejercicio"}
                        </span>
                        {profile._count && (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-400 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {profile._count.messages} mensajes
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-700/50">
                        <Link
                          href={`/profiles/${profile.id}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium py-2 rounded-lg transition-all border border-emerald-500/20 hover:border-emerald-500/40"
                        >
                          <Edit3 className="w-4 h-4" />
                          Editar
                        </Link>
                        <Link
                          href={`/profiles/${profile.id}/send`}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium py-2 rounded-lg transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Mensaje
                        </Link>
                        <button
                          onClick={() => handleDelete(profile.id, profile.patientName)}
                          disabled={deleting === profile.id}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                        >
                          {deleting === profile.id
                            ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === "whatsapp" && (
            <WhatsAppSection />
          )}

          {view === "messages" && (
            <MessagesSection />
          )}

          {view === "appointments" && (
            <AppointmentsSection 
              highlightId={highlightedAppointmentId} 
              onClearHighlight={() => setHighlightedAppointmentId(null)} 
            />
          )}

          {view === "calendar" && (
            <CalendarSection onGoToAppointment={(id) => {
              setHighlightedAppointmentId(id);
              setView("appointments");
            }} />
          )}
        </main>
    </div>
  );
}

// ============================================================
// COMPONENTE WHATSAPP (separado del dashboard)
// ============================================================
import { io, Socket } from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Loader2, ShieldCheck } from "lucide-react";

function WhatsAppSection() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [qrCode, setQrCode] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "qr" | "connected" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [sendMessageStatus, setSendMessageStatus] = useState<{ loading: boolean; success?: boolean; msg?: string }>({ loading: false });


  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const newSocket = io(apiUrl, {
      extraHeaders: { "ngrok-skip-browser-warning": "69420" }
    });
    setSocket(newSocket);

    newSocket.on("qr", (qr: string) => { setQrCode(qr); setStatus("qr"); });
    newSocket.on("loading", () => setStatus("loading"));
    newSocket.on("ready", () => setStatus("connected"));
    newSocket.on("auth_failure", (data) => { setStatus("error"); setErrorMessage("Fallo la autenticación. Intenta de nuevo."); });
    newSocket.on("disconnected", () => { setStatus("idle"); setQrCode(""); });
    newSocket.on("message_sent", (data) => {
      setSendMessageStatus({ loading: false, success: data.success, msg: data.success ? "✅ Mensaje enviado exitosamente" : `❌ ${data.error}` });
      setTimeout(() => setSendMessageStatus({ loading: false }), 5000);
    });



    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/profiles`)
      .then(r => r.json())
      .then(setProfiles)
      .catch(console.error);

    return () => { newSocket.disconnect(); };
  }, []);

  const handleSendMessage = () => {
    if (socket && selectedProfileId) {
      setSendMessageStatus({ loading: true });
      socket.emit("send_message", { profileId: parseInt(selectedProfileId) });
    }
  };



  return (
    <div className="p-8 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">WhatsApp</h2>
          <p className="text-slate-400 mt-1">Vincula tu cuenta y envía mensajes personalizados con IA</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Nutria Bot</h3>
            <p className="text-emerald-100 text-sm mt-1">Mensajería automática por IA</p>
          </div>

          <div className="p-6">
            {status === "idle" && (
              <div className="text-center space-y-4">
                <p className="text-slate-400">Conecta tu cuenta de WhatsApp para enviar recomendaciones automáticas.</p>
                <button
                  onClick={() => { setStatus("loading"); socket?.emit("start-connection"); }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
                >
                  Vincular Dispositivo
                </button>
              </div>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center py-8 space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                <p className="text-slate-300 font-medium animate-pulse">Generando código QR...</p>
              </div>
            )}

            {status === "qr" && (
              <div className="flex flex-col items-center space-y-4">
                <p className="text-slate-300 text-sm text-center">Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo</p>
                <div className="p-4 bg-white rounded-2xl shadow-lg relative group">
                  <QRCodeSVG value={qrCode} size={220} level="H" includeMargin={false} className="rounded-lg" />
                  <button
                    onClick={() => { navigator.clipboard.writeText(qrCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-lg shadow border border-slate-200 text-slate-600 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {status === "connected" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800" />
                  </div>
                  <h4 className="text-white font-semibold">¡Conexión Exitosa!</h4>
                  <p className="text-slate-400 text-sm mt-1">El bot está listo para enviar mensajes.</p>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4 space-y-3">
                  <label className="block text-sm font-medium text-slate-300">Seleccionar Paciente</label>
                  <select
                    value={selectedProfileId}
                    onChange={e => setSelectedProfileId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Selecciona un paciente --</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.patientName} (+{p.phone})</option>
                    ))}
                  </select>
                  <button
                    onClick={handleSendMessage}
                    disabled={!selectedProfileId || sendMessageStatus.loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {sendMessageStatus.loading ? "Generando y enviando..." : "🤖 Enviar Mensaje con IA"}
                  </button>
                  {sendMessageStatus.msg && (
                    <p className={`text-sm text-center ${sendMessageStatus.success ? "text-emerald-400" : "text-red-400"}`}>
                      {sendMessageStatus.msg}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => { setStatus("loading"); socket?.emit("logout"); }}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3 rounded-xl transition-all border border-red-500/30 shadow-sm"
                  >
                    <LogOut className="w-5 h-5" /> Desvincular WhatsApp
                  </button>
                </div>



                <button
                  onClick={() => socket?.emit("logout")}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-medium py-2.5 px-6 rounded-xl transition-all"
                >
                  Cerrar Sesión de WhatsApp
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                  <p className="font-medium">{errorMessage}</p>
                </div>
                <button onClick={() => setStatus("idle")} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-all">
                  Intentar Nuevamente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE DE MENSAJES AUTOMÁTICOS
// ============================================================

function MessagesSection() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [broadcastStatus, setBroadcastStatus] = useState<{ 
    isBroadcasting: boolean; 
    current?: number; 
    total?: number; 
    latest?: any;
    complete?: boolean;
  }>({ isBroadcasting: false });

  const [reminderStatus, setReminderStatus] = useState({
    isSending: false,
    current: 0,
    total: 0,
    lastPatient: "",
    complete: false
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/profiles`)
      .then(r => r.json())
      .then(setProfiles)
      .catch(console.error);

    const apiUrl2 = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const socket = io(apiUrl2, {
      extraHeaders: { "ngrok-skip-browser-warning": "69420" }
    });

    const handleBroadcastProgress = (data: any) => {
      setBroadcastStatus({ 
        isBroadcasting: true, 
        current: data.current, 
        total: data.total, 
        latest: data.latest 
      });
    };

    const handleBroadcastComplete = (data: any) => {
      setBroadcastStatus(prev => ({ ...prev, isBroadcasting: false, complete: true }));
      setTimeout(() => setBroadcastStatus({ isBroadcasting: false }), 10000);
    };

    const handleReminderProgress = (data: any) => {
      setReminderStatus(prev => ({
        ...prev,
        isSending: true,
        current: data.current,
        total: data.total,
        lastPatient: data.lastPatient
      }));
    };

    const handleReminderComplete = (data: any) => {
      setReminderStatus(prev => ({ ...prev, isSending: false, complete: true }));
      setTimeout(() => setReminderStatus(p => ({ ...p, complete: false })), 5000);
    };

    socket.on("broadcast_progress", handleBroadcastProgress);
    socket.on("broadcast_complete", handleBroadcastComplete);
    socket.on('appointment_reminder_progress', handleReminderProgress);
    socket.on('appointment_reminder_complete', handleReminderComplete);

    return () => {
      socket.off("broadcast_progress", handleBroadcastProgress);
      socket.off("broadcast_complete", handleBroadcastComplete);
      socket.off('appointment_reminder_progress', handleReminderProgress);
      socket.off('appointment_reminder_complete', handleReminderComplete);
      socket.disconnect();
    };
  }, []);

  const handleBroadcast = async () => {
    if (confirm("Se enviará un mensaje personalizado CON IA a todos los pacientes registrados. ¿Continuar?")) {
      setBroadcastStatus({ isBroadcasting: true, current: 0, total: profiles.length });
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/messages/broadcast`, { method: "POST" });
      } catch (e) {
        alert("Error al iniciar broadcast.");
        setBroadcastStatus({ isBroadcasting: false });
      }
    }
  };

  const handleSendReminders = async () => {
    if (!confirm("Se enviará un recordatorio por WhatsApp a todos los pacientes con citas PENDIENTES. ¿Continuar?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/appointments/reminders`, { method: "POST" });
      const data = await res.json();
      
      if (res.status === 200 && data.message === "No hay citas pendientes para recordar") {
        alert("No hay citas pendientes agendadas para enviar recordatorios.");
        return;
      }

      if (res.ok) {
        setReminderStatus({ isSending: true, current: 0, total: data.total, lastPatient: "", complete: false });
      } else if (res.status === 503) {
        alert("⚠️ WhatsApp no está conectado. Por favor, ve a la pestaña de 'WhatsApp', escanea el código QR y espera a que el estado sea 'Conectado' antes de enviar recordatorios.");
      } else {
        alert(data.error || "Error al iniciar recordatorios");
      }
    } catch (e) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Central de Mensajes</h2>
        <p className="text-slate-400 mt-1">Envía recordatorios de citas y recomendaciones masivas a tus pacientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recordatorios de Citas */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recordatorios de Citas</h3>
              <p className="text-slate-400 text-sm">Citas pendientes en agenda</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-6">Esta acción enviará un mensaje recordatorio automático a todos los pacientes que tienen una cita programada y en estado "pendiente".</p>
          
          <button
            onClick={handleSendReminders}
            disabled={reminderStatus.isSending}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
          >
            <Bell className="w-5 h-5" /> Enviar Recordatorios
          </button>

          {reminderStatus.isSending && (
            <div className="mt-4 bg-slate-900/50 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Enviando a: <span className="text-emerald-400">{reminderStatus.lastPatient}</span></span>
                <span className="font-bold">{reminderStatus.current} / {reminderStatus.total}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${(reminderStatus.current / (reminderStatus.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {reminderStatus.complete && (
            <p className="mt-4 text-emerald-400 text-sm text-center font-medium animate-bounce">
              ✨ ¡Recordatorios enviados con éxito!
            </p>
          )}
        </div>

        {/* Envío Masivo */}
        <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recomendación Diaria</h3>
              <p className="text-slate-400 text-sm">Envío masivo con IA</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-6">La Inteligencia Artificial redactará una recomendación personalizada única para cada paciente basándose en sus hábitos actuales.</p>
          
          <button
            onClick={handleBroadcast}
            disabled={broadcastStatus.isBroadcasting}
            className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
          >
            <MessageSquare className="w-5 h-5" /> Enviar a Todos
          </button>

          {broadcastStatus.isBroadcasting && (
            <div className="mt-4 bg-slate-900/50 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Procesando envíos...</span>
                <span className="font-bold">{broadcastStatus.current} / {broadcastStatus.total}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${((broadcastStatus.current || 0) / (broadcastStatus.total || 1)) * 100}%` }}
                />
              </div>
              {broadcastStatus.latest && (
                <p className="text-[10px] text-slate-500 italic truncate mt-2">
                  Último: {broadcastStatus.latest.patientName} - {broadcastStatus.latest.status === 'sent' ? '✅' : '❌'}
                </p>
              )}
            </div>
          )}

          {broadcastStatus.complete && (
            <p className="mt-4 text-emerald-400 text-sm text-center font-medium animate-bounce">
              ✨ Envío masivo completado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE CITAS (CRUD)
// ============================================================

interface Appointment {
  id: number;
  profileId: number;
  date: string;
  reason: string;
  status: string;
  notes: string | null;
  profile: Profile;
}

function AppointmentsSection({ highlightId, onClearHighlight }: { highlightId: number | null; onClearHighlight: () => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  


  const [form, setForm] = useState({
    profileId: "",
    date: "",
    reason: "",
    notes: "",
    status: "pendiente"
  });

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/appointments`);
      const data = await res.json();
      setAppointments(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/profiles`);
      const data = await res.json();
      setProfiles(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchAppointments();
    fetchProfiles();


  }, []);

  useEffect(() => {
    if (highlightId && !loading && appointments.length > 0) {
      // Pequeño delay para asegurar que el DOM esté listo
      setTimeout(() => {
        const el = document.getElementById(`appointment-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Desvanecer el resaltado después de 3 segundos
        setTimeout(() => onClearHighlight(), 3000);
      }, 300);
    }
  }, [highlightId, loading, appointments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.profileId || !form.date || !form.reason) return alert("Completa los campos obligatorios");
    
    setSaving(true);
    try {
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/appointments/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/appointments`;
      
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        fetchAppointments();
        resetForm();
      }
    } catch (e) { alert("Error al guardar la cita"); }
    finally { setSaving(false); }
  };

  const resetForm = () => {
    setForm({ profileId: "", date: "", reason: "", notes: "", status: "pendiente" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (app: Appointment) => {
    setForm({
      profileId: app.profileId.toString(),
      date: new Date(app.date).toISOString().slice(0, 16),
      reason: app.reason,
      notes: app.notes || "",
      status: app.status
    });
    setEditingId(app.id);
    setShowForm(true);
  };



  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
      }
    } catch (e) { alert("Error al actualizar estado"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta cita?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/appointments/${id}`, { method: "DELETE" });
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (e) { alert("Error al eliminar"); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Citas</h2>
          <p className="text-slate-400 mt-1">Programa y organiza las consultas de tus pacientes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
          >
            <Plus className="w-5 h-5" /> Nueva Cita
          </button>
        </div>
      </div>



      {showForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{editingId ? "Editar Cita" : "Nueva Cita"}</h3>
              <button onClick={resetForm} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Paciente *</label>
                <select
                  value={form.profileId}
                  onChange={e => setForm(p => ({ ...p, profileId: e.target.value }))}
                  disabled={!!editingId}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  <option value="">-- Selecciona un paciente --</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.patientName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Motivo *</label>
                <input
                  type="text"
                  placeholder="Ej: Evaluación inicial, Seguimiento quincenal"
                  value={form.reason}
                  onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Estado</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="caducada" disabled>Caducada (Auto)</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notas adicionales</label>
                <textarea
                  placeholder="Instrucciones previas o recordatorios..."
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-all">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                  {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-24 bg-slate-800/40 rounded-3xl border border-slate-700/50">
          <Calendar className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg font-medium">No hay citas programadas</p>
          <p className="text-slate-600 mt-2">Personaliza tu agenda agendando la primera cita.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {appointments.map((app) => (
            <div 
              key={app.id} 
              id={`appointment-${app.id}`}
              className={`bg-slate-800/60 backdrop-blur border rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-500 ${
                highlightId === app.id 
                ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02] bg-emerald-500/10 shadow-2xl shadow-emerald-500/20' 
                : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex flex-col items-center justify-center text-emerald-400 font-bold border border-slate-600">
                    <span className="text-[10px] uppercase leading-none opacity-60">{new Date(app.date).toLocaleString('es-ES', { month: 'short' })}</span>
                    <span className="text-xl leading-none">{new Date(app.date).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold leading-tight">{app.profile.patientName}</h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(app.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="bg-slate-900/50 rounded-xl p-3 mb-4">
                <p className="text-slate-300 text-sm font-medium">Motivo:</p>
                <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{app.reason}</p>
              </div>

              {app.notes && (
                <p className="text-[11px] text-slate-500 italic mb-4 line-clamp-2">📝 {app.notes}</p>
              )}

              <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                <button
                  onClick={() => handleEdit(app)}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs font-medium py-2 rounded-lg transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                
                {app.status === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'completada')}
                      title="Marcar como completada"
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all border border-emerald-500/20"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'cancelada')}
                      title="Cancelar cita"
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {app.status !== 'pendiente' && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'pendiente')}
                    title="Re-abrir cita"
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-all border border-amber-500/20"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                )}

                {app.status === 'caducada' && (
                  <div className="flex-1 text-center py-2 bg-slate-700/20 text-slate-500 text-[10px] uppercase font-bold rounded-lg border border-slate-700/50">
                    Cita Caducada
                  </div>
                )}

                <button
                  onClick={() => handleDelete(app.id)}
                  className="p-2 bg-slate-700/30 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all border border-slate-700/50 hover:border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pendiente: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    completada: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    cancelada: "bg-red-500/20 text-red-500 border-red-500/30",
    caducada: "bg-slate-500/20 text-slate-500 border-slate-500/30",
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${styles[status]}`}>
      {status === 'caducada' ? 'caducada' : status}
    </span>
  );
}

// ============================================================
// COMPONENTE CALENDARIO (VISTA MENSUAL)
// ============================================================

function CalendarSection({ onGoToAppointment }: { onGoToAppointment: (id: number) => void }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedDayApps, setSelectedDayApps] = useState<Appointment[] | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/appointments`)
      .then(r => r.json())
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Lógica del Calendario
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Ajustar para que Lunes sea 0 (JS por defecto: Domingo=0)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(currentDate);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const years = [];
  const startYear = 2000;
  const endYear = new Date().getFullYear() + 10;
  for (let y = startYear; y <= endYear; y++) years.push(y);

  const handleMonthChange = (m: number) => setCurrentDate(new Date(year, m, 1));
  const handleYearChange = (y: number) => setCurrentDate(new Date(y, month, 1));

  const days = [];
  // Espacios vacíos para el inicio del mes
  for (let i = 0; i < startingDay; i++) days.push(null);
  // Días del mes
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  const getAppsForDay = (date: Date) => {
    return appointments.filter(a => {
      const aDate = new Date(a.date);
      return aDate.getDate() === date.getDate() &&
             aDate.getMonth() === date.getMonth() &&
             aDate.getFullYear() === date.getFullYear();
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header del Calendario */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <select 
                value={month}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="bg-transparent text-2xl font-bold text-white capitalize outline-none cursor-pointer hover:text-emerald-400 transition-colors appearance-none"
              >
                {months.map((m, i) => (
                  <option key={m} value={i} className="bg-slate-900 text-base">{m}</option>
                ))}
              </select>
              <select 
                value={year}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="bg-transparent text-2xl font-medium text-slate-500 outline-none cursor-pointer hover:text-emerald-400 transition-colors appearance-none"
              >
                {years.map(y => (
                  <option key={y} value={y} className="bg-slate-900 text-base">{y}</option>
                ))}
              </select>
            </div>
            <p className="text-slate-400 text-sm">Navega rápidamente por tu agenda</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 shadow-inner">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={goToToday} className="px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all">HOY</button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Grid del Calendario */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/30">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] uppercase font-bold tracking-widest text-slate-500">{d}</div>
          ))}
        </div>

        {/* Celdas */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} className="border-b border-r border-slate-800/50 bg-slate-950/20" />;
            
            const isToday = date.toDateString() === new Date().toDateString();
            const dayApps = getAppsForDay(date);

            return (
              <div 
                key={date.toISOString()} 
                onClick={() => dayApps.length > 0 && setSelectedDayApps(dayApps)}
                className={`border-b border-r border-slate-800 p-2 transition-all hover:bg-emerald-500/5 group cursor-pointer relative ${isToday ? 'bg-emerald-500/5' : ''}`}
              >
                <span className={`text-xs font-bold ${isToday ? 'text-emerald-400 bg-emerald-500/20 w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {date.getDate()}
                </span>
                
                <div className="mt-1 space-y-1 overflow-hidden h-[calc(100%-24px)] flex flex-col justify-start">
                  {dayApps.map(app => (
                    <div key={app.id} className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 truncate ${
                      app.status === 'completada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      app.status === 'cancelada' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      app.status === 'caducada' ? 'bg-slate-700/50 text-slate-500 border-slate-700/50 opacity-60' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      <span className="font-bold opacity-70">
                        {new Date(app.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {app.profile.patientName}
                    </div>
                  ))}
                  {dayApps.length > 4 && (
                    <div className="text-[8px] text-slate-500 text-center font-medium">+{dayApps.length - 4} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalle de Día */}
      {selectedDayApps && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
              <div>
                <h3 className="text-white font-bold text-lg">Citas del Día</h3>
                <p className="text-slate-400 text-sm">{new Date(selectedDayApps[0].date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <button onClick={() => setSelectedDayApps(null)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
              {selectedDayApps.map(app => (
                <div 
                  key={app.id} 
                  onClick={() => onGoToAppointment(app.id)}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded text-xs border border-emerald-500/20 group-hover:bg-emerald-500/20">
                      {new Date(app.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">{app.profile.patientName}</h4>
                      <p className="text-slate-500 text-xs">{app.reason}</p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-800/30 text-center">
              <button 
                onClick={() => setSelectedDayApps(null)}
                className="text-slate-400 hover:text-white text-sm font-medium"
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-emerald-400 font-bold text-lg leading-tight">{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, unit = "", highlight = false }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className="bg-slate-700/40 rounded-lg p-2 text-center">
      <p className={`font-bold text-base leading-tight ${highlight ? "text-emerald-400" : "text-slate-200"}`}>{value}{value !== "—" ? unit : ""}</p>
      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}
