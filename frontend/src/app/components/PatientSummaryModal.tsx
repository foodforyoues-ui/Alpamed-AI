"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, TrendingUp, Activity, User, Target, Scale, Zap, Info, Calendar, Printer } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface Snapshot {
  id: number;
  weight: number | null;
  bmi: number | null;
  bodyFatPercentage: number | null;
  muscleMassPercentage: number | null;
  metabolicAge: number | null;
  lostWeight: number | null;
  recordedAt: string;
}

interface Profile {
  id: number;
  patientName: string;
  phone: string;
  realAge: number | null;
  doesExercise: boolean;
  exerciseType: string | null;
  sleepHours: number | null;
  dailySteps: number | null;
  generalRecommendation: string | null;
  specificRecommendations: string[];
  active: boolean;
  snapshots: Snapshot[];
}

interface PatientSummaryModalProps {
  profile: Profile;
  onClose: () => void;
}

export default function PatientSummaryModal({ profile, onClose }: PatientSummaryModalProps) {
  const [historyLimit, setHistoryLimit] = useState<number | 'all'>(5);

  const chartData = useMemo(() => {
    // Sort by date ascending for the chart
    const sorted = [...profile.snapshots].sort((a, b) => 
      new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );
    
    const limited = historyLimit === 'all' ? sorted : sorted.slice(-historyLimit);
    
    return limited.map(s => ({
      fecha: new Date(s.recordedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      peso: s.weight,
      grasa: s.bodyFatPercentage,
      musculo: s.muscleMassPercentage,
      edadMet: s.metabolicAge
    }));
  }, [profile.snapshots, historyLimit]);

  const latestSnapshot = profile.snapshots[0] || null;
  const initialSnapshot = profile.snapshots[profile.snapshots.length - 1] || null;

  const totalWeightLost = useMemo(() => {
    if (!latestSnapshot || !initialSnapshot) return 0;
    return (initialSnapshot.weight || 0) - (latestSnapshot.weight || 0);
  }, [latestSnapshot, initialSnapshot]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md print:hidden"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:bg-white print:m-0 print:absolute print:inset-0"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r /10 to-primary/10 no-print">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{profile.patientName}</h2>
                <div className="flex items-center gap-2">
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm flex items-center gap-1">
                    <Activity className="w-3 h-3 text-primary shrink-0" /> <span className="truncate">Expediente Activo</span>
                  </p>
                  {!profile.active && (
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Inactivo</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button 
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-all border border-slate-300 dark:border-slate-700 shadow-lg shadow-black/20"
              >
                <Printer className="w-4 h-4" /> <span className="hidden lg:inline">Imprimir Reporte</span><span className="lg:hidden">Imprimir</span>
              </button>
              <button 
                onClick={handlePrint}
                className="sm:hidden p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 dark:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Printable Content (Visible only during print) */}
          <div className="hidden print:block print-content p-8 text-slate-900 bg-white">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6 mt-2">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Reporte de Paciente</h1>
                <p className="text-sm font-bold text-slate-600 mt-1">Plataforma Alpamed — Seguimiento Profesional</p>
              </div>
              <div className="text-right text-sm text-slate-900">
                <p className="font-bold">Fecha:</p>
                <p>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6 text-slate-900">
              <div className="space-y-2">
                <h3 className="font-bold border-b border-slate-200 pb-1 uppercase text-[10px] tracking-wider text-slate-500">Datos Personales</h3>
                <div className="grid grid-cols-2 gap-x-2 text-xs">
                  <p className="font-bold">Nombre:</p> <p>{profile.patientName}</p>
                  <p className="font-bold">Teléfono:</p> <p>{profile.phone}</p>
                  <p className="font-bold">Edad:</p> <p>{profile.realAge} años</p>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold border-b border-slate-200 pb-1 uppercase text-[10px] tracking-wider text-slate-500">Hábitos</h3>
                <div className="grid grid-cols-2 gap-x-2 text-xs">
                  <p className="font-bold">Ejercicio:</p> <p>{profile.doesExercise ? profile.exerciseType : 'No realiza'}</p>
                  <p className="font-bold">Pasos Diarios:</p> <p>{profile.dailySteps?.toLocaleString() || '--'}</p>
                  <p className="font-bold">Sueño:</p> <p>{profile.sleepHours} h/promedio</p>
                </div>
              </div>
            </div>

            <div className="mb-6 text-slate-900">
              <h3 className="font-bold border-b border-slate-200 pb-1 mb-3 uppercase text-[10px] tracking-wider text-slate-500">Historial Reciente (Últimos 6 seguimientos)</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 uppercase text-[9px] tracking-widest font-black">
                    <th className="p-2 border border-slate-300">Fecha</th>
                    <th className="p-2 border border-slate-300">Peso (kg)</th>
                    <th className="p-2 border border-slate-300">Grasa (%)</th>
                    <th className="p-2 border border-slate-300">Músculo (%)</th>
                    <th className="p-2 border border-slate-300">Edad Met.</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.snapshots.slice(0, 6).map(s => (
                    <tr key={s.id} className="border-b">
                      <td className="p-2 border border-slate-300">{new Date(s.recordedAt).toLocaleDateString()}</td>
                      <td className="p-2 border border-slate-300 font-bold">{s.weight}</td>
                      <td className="p-2 border border-slate-300">{s.bodyFatPercentage || '--'}</td>
                      <td className="p-2 border border-slate-300">{s.muscleMassPercentage || '--'}</td>
                      <td className="p-2 border border-slate-300">{s.metabolicAge || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Chart */}
            <div className="mb-6 h-[220px] w-full text-slate-900 border border-slate-200 rounded-lg p-3">
              <h3 className="font-bold border-b border-slate-200 pb-1 mb-3 uppercase text-[10px] tracking-wider text-slate-500">Progreso Gráfico ({historyLimit === 'all' ? 'Todo' : historyLimit} registros)</h3>
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPesoP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2CB7B3" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2CB7B3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="fecha" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
                  <Area type="monotone" dataKey="peso" name="Peso (kg)" stroke="#2CB7B3" strokeWidth={2} fillOpacity={1} fill="url(#colorPesoP)" />
                  <Line type="monotone" dataKey="grasa" name="Grasa (%)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="musculo" name="Músculo (%)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="edadMet" name="Edad Met." stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {profile.generalRecommendation && (
              <div className="bg-slate-50 border border-slate-300 p-4 rounded-lg mb-6 text-slate-900">
                <h3 className="font-bold uppercase text-[9px] tracking-widest text-slate-500 mb-2">Recomendación General</h3>
                <p className="text-[11px] leading-relaxed italic text-slate-700">{profile.generalRecommendation}</p>
              </div>
            )}

            <div className="mt-8 pt-6 text-center text-[9px] text-slate-500 dark:text-slate-400 border-t border-slate-100 uppercase tracking-widest">
              Reporte clínico de uso interno — Generado por Plataforma Alpamed
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 no-print">
            {/* Main Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard 
                label="Peso Actual" 
                value={latestSnapshot?.weight ? `${latestSnapshot.weight} kg` : '--'} 
                icon={<Scale className="w-4 h-4 sm:w-5 sm:h-5" />}
                trend={totalWeightLost > 0 ? `-${totalWeightLost.toFixed(1)} kg total` : undefined}
                trendColor="text-emerald-400"
              />
              <MetricCard 
                label="IMC" 
                value={latestSnapshot?.bmi?.toFixed(1) || '--'} 
                icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
              />
              <MetricCard 
                label="Grasa Corporal" 
                value={latestSnapshot?.bodyFatPercentage ? `${latestSnapshot.bodyFatPercentage}%` : '--'} 
                icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}
              />
              <MetricCard 
                label="Masa Muscular" 
                value={latestSnapshot?.muscleMassPercentage ? `${latestSnapshot.muscleMassPercentage}%` : '--'} 
                icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
                trendColor="text-teal-400"
              />
            </div>

            {/* Chart Section */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                    <span className="truncate">Progreso y Tendencias</span>
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm truncate">Historial de mediciones</p>
                </div>
                <div className="flex w-full md:w-auto gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-700/50 overflow-x-auto whitespace-nowrap shrink-0 no-scrollbar">
                  {([5, 10, 'all'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setHistoryLimit(l)}
                      className={`flex-1 md:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        historyLimit === l ? "bg-primary text-slate-900 dark:text-white shadow-lg shadow-primary/20" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:bg-slate-800"
                      }`}
                    >
                      {l === 'all' ? 'Todo' : `${l} regs`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[250px] sm:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2CB7B3" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2CB7B3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="fecha" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="peso" 
                      name="Peso (kg)" 
                      stroke="#2CB7B3" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPeso)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="grasa" 
                      name="Grasa (%)" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#0f172a' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="musculo" 
                      name="Músculo (%)" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="edadMet" 
                      name="Edad Met." 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#0f172a' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-6">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6">
                <h4 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Detalles Complementarios
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-500">Edad Metabólica</p>
                    <p className="text-slate-900 dark:text-white font-medium">{latestSnapshot?.metabolicAge ? `${latestSnapshot.metabolicAge} años` : '--'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Pasos Diarios</p>
                    <p className="text-slate-900 dark:text-white font-medium">{profile.dailySteps ? `${profile.dailySteps.toLocaleString()}` : '--'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Horas de Sueño</p>
                    <p className="text-slate-900 dark:text-white font-medium">{profile.sleepHours ? `${profile.sleepHours}h` : '--'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Ejercicio</p>
                    <p className="text-slate-900 dark:text-white font-medium truncate">{profile.doesExercise ? (profile.exerciseType || "Sí") : 'No realiza'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                <Target className="absolute -bottom-4 -right-4 w-20 h-20 text-primary/5 rotate-12" />
                <h4 className="text-primary font-bold mb-3 uppercase text-[10px] tracking-widest">Recomendación General</h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed relative z-10 italic">
                  {profile.generalRecommendation || "Sin recomendación general definida aún."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 1.5cm;
            size: A4 portrait;
          }
          /* Ocultar todo por defecto usando visibilidad */
          body {
            visibility: hidden;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Mostrar SOLO el contenido del reporte y asegurar que se imprima compacto */
          .print-content, .print-content * {
            visibility: visible !important;
          }
          .print-content {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            page-break-after: avoid;
            page-break-before: avoid;
          }
          /* Prevenir saltos de pagina por elementos hijos */
          .print-content tr, .print-content div {
            page-break-inside: avoid;
          }
          /* Asegurar que nada más interfiera */
          .no-print, [role="dialog"] > div:not(.print-content), .fixed, aside, main, header, footer {
            display: none !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}

function MetricCard({ label, value, icon, trend, trendColor = 'text-slate-400' }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-300 dark:border-slate-700/50 hover:bg-slate-50 dark:bg-slate-800 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="p-1.5 sm:p-2 bg-white dark:bg-slate-900 rounded-lg text-primary">
          {icon}
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-medium mb-1 truncate">{label}</p>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
        <span className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white whitespace-nowrap">{value}</span>
        {trend && (
          <span className={`text-[9px] sm:text-[10px] ${trendColor} font-bold flex items-center gap-0.5 whitespace-nowrap`}>
            {trend.startsWith('-') ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
