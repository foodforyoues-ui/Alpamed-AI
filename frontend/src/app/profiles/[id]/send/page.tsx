"use client";

import { apiFetch as fetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";
import { ArrowLeft, Send, Loader2, CheckCircle, XCircle, ShieldCheck, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Profile {
  id: number;
  patientName: string;
  phone: string;
}

export default function SendMessagePage() {
  const params = useParams();
  const id = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [waStatus, setWaStatus] = useState<"idle" | "loading" | "qr" | "connected">("idle");
  const [qrCode, setQrCode] = useState("");
  const [sendStatus, setSendStatus] = useState<{ loading: boolean; success?: boolean; msg?: string }>({ loading: false });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/profiles/${id}`)
      .then(r => r.json())
      .then(setProfile)
      .catch(console.error);

    const s = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
      extraHeaders: { "ngrok-skip-browser-warning": "69420" }
    });
    setSocket(s);

    s.on("qr", (qr: string) => { setQrCode(qr); setWaStatus("qr"); });
    s.on("loading", () => setWaStatus("loading"));
    s.on("ready", () => setWaStatus("connected"));
    s.on("disconnected", () => { setWaStatus("idle"); setQrCode(""); });
    s.on("message_sent", (data: any) => {
      setSendStatus({
        loading: false,
        success: data.success,
        msg: data.success ? "✅ Mensaje enviado exitosamente por WhatsApp" : `❌ ${data.error}`
      });
      setTimeout(() => setSendStatus({ loading: false }), 6000);
    });

    return () => { s.disconnect(); };
  }, [id]);

  const handleSend = () => {
    if (!socket || !profile) return;
    setSendStatus({ loading: true });
    socket.emit("send_message", { profileId: profile.id });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Enviar Mensaje</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{profile?.patientName} • +{profile?.phone}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/60 backdrop-blur border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-primary p-5 text-center">
            <p className="text-white/80 text-sm">La IA generará un mensaje usando el expediente completo de</p>
            <p className="text-white font-bold text-xl mt-1">{profile?.patientName}</p>
          </div>

          <div className="p-6">
            {/* WhatsApp Not Connected */}
            {waStatus === "idle" && (
              <div className="text-center space-y-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm">Primero conecta WhatsApp para enviar el mensaje.</p>
                <button
                  onClick={() => { setWaStatus("loading"); socket?.emit("start-connection"); }}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
                >
                  <QrCode className="w-5 h-5" /> Conectar WhatsApp
                </button>
              </div>
            )}

            {waStatus === "loading" && (
              <div className="flex flex-col items-center py-6 gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-700 dark:text-slate-300 text-sm animate-pulse">Iniciando WhatsApp...</p>
              </div>
            )}

            {waStatus === "qr" && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-slate-700 dark:text-slate-300 text-sm text-center">Escanea este código desde WhatsApp → Dispositivos vinculados</p>
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
                  <QRCodeSVG value={qrCode} size={200} level="H" />
                </div>
              </div>
            )}

            {waStatus === "connected" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl p-3">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-primary text-sm font-medium">WhatsApp conectado — Listo para enviar</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p className="font-medium text-slate-900 dark:text-slate-300 mb-2">¿Qué pasará al enviar?</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Azure OpenAI leerá el expediente completo</li>
                    <li>Generará un mensaje personalizado con <img src="/ALPAMED-nobg.png" alt="Alpamed" className="w-5 h-5 inline object-contain align-text-bottom" /></li>
                    <li>Lo enviará al +{profile?.phone} de {profile?.patientName}</li>
                    <li>Guardará el mensaje en el historial del perfil</li>
                  </ul>
                </div>

                <button
                  onClick={handleSend}
                  disabled={sendStatus.loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-600 dark:disabled:text-slate-400 text-white font-semibold py-4 rounded-xl transition-all shadow-lg text-lg"
                >
                  {sendStatus.loading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Generando mensaje...</>
                    : <><Send className="w-5 h-5" /> Enviar Mensaje IA</>
                  }
                </button>

                {sendStatus.msg && (
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${sendStatus.success ? "bg-primary/10 border-primary/30" : "bg-red-500/10 border-red-500/30"}`}>
                    {sendStatus.success
                      ? <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    }
                    <p className={`text-sm ${sendStatus.success ? "text-primary font-medium" : "text-red-500 font-medium"}`}>
                      {sendStatus.msg}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
