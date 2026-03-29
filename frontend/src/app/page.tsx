"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Smartphone, Plus, Trash2, Edit3, MessageSquare, Activity, ChevronRight } from "lucide-react";

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
  const [view, setView] = useState<"dashboard" | "whatsapp">("dashboard");
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProfiles = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/profiles");
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
      await fetch(`http://localhost:3001/api/profiles/${id}`, { method: "DELETE" });
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert("Error al eliminar el perfil.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <div className="flex h-screen">
        <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col backdrop-blur-sm">
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
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setView("dashboard")}
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
              onClick={() => setView("whatsapp")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                view === "whatsapp"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">WhatsApp</span>
            </button>
          </nav>

          {/* Stats */}
          <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs">Total Pacientes</p>
              <p className="text-white text-2xl font-bold">{profiles.length}</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {view === "dashboard" && (
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
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
                      <div className="flex gap-2 pt-3 border-t border-slate-700/50">
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
        </main>
      </div>
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
  const [broadcastStatus, setBroadcastStatus] = useState<{ 
    isBroadcasting: boolean; 
    current?: number; 
    total?: number; 
    latest?: any;
    complete?: boolean;
  }>({ isBroadcasting: false });

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
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

    // Eventos de Broadcast
    newSocket.on("broadcast_progress", (data) => {
      setBroadcastStatus({ 
        isBroadcasting: true, 
        current: data.current, 
        total: data.total, 
        latest: data.latest 
      });
    });

    newSocket.on("broadcast_complete", (data) => {
      setBroadcastStatus(prev => ({ ...prev, isBroadcasting: false, complete: true }));
      setTimeout(() => setBroadcastStatus({ isBroadcasting: false }), 10000);
    });

    fetch("http://localhost:3001/api/profiles")
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

  const handleBroadcast = async () => {
    if (confirm("Se enviará un mensaje personalizado CON IA a todos los pacientes registrados. ¿Continuar?")) {
      setBroadcastStatus({ isBroadcasting: true, current: 0, total: profiles.length });
      try {
        await fetch("http://localhost:3001/api/messages/broadcast", { method: "POST" });
      } catch (e) {
        alert("Error al iniciar broadcast.");
        setBroadcastStatus({ isBroadcasting: false });
      }
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

                {/* Broadcast Section */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-white font-medium flex items-center gap-2">🚀 Envío Masivo</h5>
                      <p className="text-slate-500 text-xs">Mensaje personalizado diario para todos</p>
                    </div>
                  </div>

                  {!broadcastStatus.isBroadcasting ? (
                    <button
                      onClick={handleBroadcast}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold py-3 rounded-xl transition-all border border-emerald-500/30"
                    >
                      <Users className="w-5 h-5" /> Enviar mensaje diario a todos
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
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
                        <p className="text-[10px] text-slate-500 italic truncate">
                          Último: {broadcastStatus.latest.patientName} - {broadcastStatus.latest.status === 'sent' ? '✅' : '❌'}
                        </p>
                      )}
                    </div>
                  )}

                  {broadcastStatus.complete && (
                    <p className="text-emerald-400 text-xs text-center font-medium animate-bounce">
                      ✨ Envío masivo completado
                    </p>
                  )}
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
