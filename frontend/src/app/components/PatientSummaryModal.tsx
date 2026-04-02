"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, TrendingUp, Activity, User, Target, Scale, Zap, Info, Calendar } from 'lucide-react';
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
      imc: s.bmi
    }));
  }, [profile.snapshots, historyLimit]);

  const latestSnapshot = profile.snapshots[0] || null;
  const initialSnapshot = profile.snapshots[profile.snapshots.length - 1] || null;

  const totalWeightLost = useMemo(() => {
    if (!latestSnapshot || !initialSnapshot) return 0;
    return (initialSnapshot.weight || 0) - (latestSnapshot.weight || 0);
  }, [latestSnapshot, initialSnapshot]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.patientName}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" /> Expediente Nutricional Activo
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Main Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                label="Peso Actual" 
                value={latestSnapshot?.weight ? `${latestSnapshot.weight} kg` : '--'} 
                icon={<Scale className="w-5 h-5" />}
                trend={totalWeightLost > 0 ? `-${totalWeightLost.toFixed(1)} kg total` : undefined}
                trendColor="text-emerald-400"
              />
              <MetricCard 
                label="IMC" 
                value={latestSnapshot?.bmi?.toFixed(1) || '--'} 
                icon={<Zap className="w-5 h-5" />}
                badge={getIMCCategory(latestSnapshot?.bmi || 0)}
              />
              <MetricCard 
                label="Grasa Corporal" 
                value={latestSnapshot?.bodyFatPercentage ? `${latestSnapshot.bodyFatPercentage}%` : '--'} 
                icon={<Target className="w-5 h-5" />}
                trend={latestSnapshot?.bodyFatPercentage ? "Optimizable" : undefined}
              />
              <MetricCard 
                label="Masa Muscular" 
                value={latestSnapshot?.muscleMassPercentage ? `${latestSnapshot.muscleMassPercentage}%` : '--'} 
                icon={<Activity className="w-5 h-5" />}
                trendColor="text-teal-400"
              />
            </div>

            {/* Chart Section */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Progreso y Tendencias
                  </h3>
                  <p className="text-slate-500 text-sm">Visualización del historial de mediciones</p>
                </div>
                <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700/50">
                  {([5, 10, 'all'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setHistoryLimit(l)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        historyLimit === l ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {l === 'all' ? 'Todo' : `Últimos ${l}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="fecha" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ fontSize: '13px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="peso" 
                      name="Peso (kg)" 
                      stroke="#10b981" 
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
                      dot={{ r: 6, fill: '#f43f5e', strokeWidth: 2, stroke: '#0f172a' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" /> Detalles Complementarios
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-500">Edad Metabólica</p>
                    <p className="text-white font-medium">{latestSnapshot?.metabolicAge ? `${latestSnapshot.metabolicAge} años` : '--'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Pasos Diarios</p>
                    <p className="text-white font-medium">{profile.dailySteps ? `${profile.dailySteps.toLocaleString()}` : '--'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Horas de Sueño</p>
                    <p className="text-white font-medium">{profile.sleepHours ? `${profile.sleepHours}h` : '--'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Ejercicio</p>
                    <p className="text-white font-medium">{profile.doesExercise ? profile.exerciseType : 'No realiza'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                <Target className="absolute -bottom-4 -right-4 w-24 h-24 text-emerald-500/5 rotate-12" />
                <h4 className="text-emerald-400 font-bold mb-3">Recomendación General</h4>
                <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                  {profile.generalRecommendation || "Sin recomendación general definida aún por el nutricionista."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function MetricCard({ label, value, icon, trend, trendColor = 'text-slate-400', badge }: any) {
  return (
    <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-all hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-slate-900 rounded-lg text-emerald-400">
          {icon}
        </div>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`text-[10px] ${trendColor} font-bold flex items-center gap-0.5`}>
            {trend.startsWith('-') ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function getIMCCategory(bmi: number) {
  if (bmi === 0) return null;
  if (bmi < 18.5) return 'Bajo Peso';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}
