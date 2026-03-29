"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";

export default function NewProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patientName: "", phone: "", realAge: "",
    doesExercise: false, exerciseType: "", sleepHours: "", dailySteps: "",
    generalRecommendation: "",
  });
  const [specificRecommendations, setSpecificRecommendations] = useState<string[]>([""]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.patientName || !form.phone) { setError("El nombre y el teléfono son obligatorios."); return; }
    setSaving(true);
    const body = {
      ...form,
      realAge: form.realAge ? parseInt(form.realAge) : null,
      sleepHours: form.sleepHours ? parseFloat(form.sleepHours) : null,
      dailySteps: form.dailySteps ? parseInt(form.dailySteps) : null,
      specificRecommendations: specificRecommendations.filter(r => r.trim()),
    };
    try {
      const res = await fetch("http://localhost:3001/api/profiles", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Error al crear perfil"); }
      const created = await res.json();
      // Redirigir al perfil creado para que pueda registrar la primera medición
      router.push(`/profiles/${created.id}?tab=progress`);
    } catch (e: any) { setError(e.message); setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Nuevo Perfil</h1>
            <p className="text-slate-400 text-sm">Crea el expediente del paciente. Podrás registrar mediciones después.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Datos Básicos" icon="👤">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre del Paciente *" name="patientName" value={form.patientName} onChange={handleChange} placeholder="Ej: María García" />
              <Field label="Teléfono WhatsApp *" name="phone" value={form.phone} onChange={handleChange} placeholder="Ej: 50371234567" hint="Con código de país, sin +" />
              <Field label="Edad Real" name="realAge" value={form.realAge} onChange={handleChange} type="number" placeholder="Ej: 32" />
            </div>
          </Section>

          <Section title="Hábitos" icon="🏃">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="doesExercise" checked={form.doesExercise} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-checked:bg-emerald-500 rounded-full transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-slate-300 font-medium text-sm">¿Realiza ejercicio?</span>
              </label>
              {form.doesExercise && (
                <Field label="Tipo de ejercicio" name="exerciseType" value={form.exerciseType} onChange={handleChange} placeholder="Ej: Natación, Basketball..." />
              )}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Horas de Sueño" name="sleepHours" value={form.sleepHours} onChange={handleChange} type="number" step="0.5" placeholder="7.5" hint="hrs/noche" />
                <Field label="Pasos Diarios" name="dailySteps" value={form.dailySteps} onChange={handleChange} type="number" placeholder="10000" />
              </div>
            </div>
          </Section>

          <Section title="Blueprint para la IA" icon="🧠">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Recomendación General</label>
                <textarea name="generalRecommendation" value={form.generalRecommendation} onChange={handleChange}
                  placeholder="Contexto general del paciente para que la IA lo use como guía base..." rows={3}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500 resize-none text-sm" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-300">Recomendaciones Específicas</label>
                  <button type="button" onClick={() => setSpecificRecommendations(p => [...p, ""])}
                    className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all"
                  ><Plus className="w-3 h-3" /> Añadir</button>
                </div>
                <div className="space-y-2">
                  {specificRecommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <span className="text-xs text-slate-500 w-5 text-right flex-shrink-0">{i + 1}.</span>
                      <input type="text" value={rec} onChange={e => setSpecificRecommendations(p => p.map((r, j) => j === i ? e.target.value : r))}
                        placeholder="Ej: Aumentar proteínas a 1.5g por kg de peso"
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500 text-sm" />
                      {specificRecommendations.length > 1 && (
                        <button type="button" onClick={() => setSpecificRecommendations(p => p.filter((_, j) => j !== i))}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-300 text-sm">
              💡 <strong>Siguiente paso:</strong> Después de crear el perfil, podrás registrar la primera medición de bioimpedancia en la pestaña <strong>Seguimiento</strong>.
            </p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"><p className="text-red-400 text-sm">{error}</p></div>}

          <div className="flex gap-3 pb-8">
            <Link href="/" className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-all">Cancelar</Link>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
            >{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}{saving ? "Creando..." : "Crear Perfil"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><span>{icon}</span> {title}</h3>
      {children}
    </div>
  );
}
function Field({ label, name, value, onChange, type = "text", placeholder = "", hint = "", step }: {
  label: string; name: string; value: string; onChange: any; type?: string; placeholder?: string; hint?: string; step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} step={step}
        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-500 text-sm" />
      {hint && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}
