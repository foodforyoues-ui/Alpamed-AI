import prisma from './src/config/db.js';

// Limpia snapshots no-iniciales y los reemplaza con datos únicos por paciente
// También agrega citas (appointments) realistas

// Helper: fecha relativa
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function r(n) { return Math.round(n * 10) / 10; }
function ri(n) { return Math.round(n); }

// Cada paciente tiene su propio historial con tendencias y valores únicos
const patientData = [
  { // ID 6 - María García López - pérdida moderada, buena evolución
    profileId: 6,
    snapshots: [
      { w: 72.5, fat: 33.2, muscle: 41.0, bmi: 27.1, meta: 35, lost: 0,   daysAgo: 150, notes: 'Primer control: inicio de plan mediterráneo' },
      { w: 71.0, fat: 32.1, muscle: 41.8, bmi: 26.6, meta: 34, lost: 1.5, daysAgo: 120, notes: 'Bajó 1.5kg, refiere menos ansiedad nocturna' },
      { w: 69.8, fat: 30.9, muscle: 42.5, bmi: 26.1, meta: 33, lost: 2.7, daysAgo: 90,  notes: 'Excelente adherencia. Redujo carbohidratos simples' },
      { w: 68.3, fat: 29.5, muscle: 43.4, bmi: 25.5, meta: 32, lost: 4.2, daysAgo: 45,  notes: 'Se agrega proteína magra en cena. IMC en rango normal' },
      { w: 67.2, fat: 28.2, muscle: 44.1, bmi: 25.1, meta: 31, lost: 5.3, daysAgo: 15,  notes: 'Meta de 5kg alcanzada. Mantenimiento a partir de ahora' },
    ],
    appointments: [
      { reason: 'Control mensual de seguimiento', date: daysFromNow(8),  status: 'pendiente' },
      { reason: 'Revisión de metas de mantenimiento', date: daysFromNow(35), status: 'pendiente' },
    ]
  },
  { // ID 7 - Carlos Herrera Ruiz - obesidad + hipertensión, progreso lento
    profileId: 7,
    snapshots: [
      { w: 95.0, fat: 38.5, muscle: 37.2, bmi: 30.8, meta: 52, lost: 0,   daysAgo: 155, notes: 'Inicio de plan hipocalórico 1600 kcal. HTA controlada con medicación' },
      { w: 94.1, fat: 37.9, muscle: 37.5, bmi: 30.5, meta: 51, lost: 0.9, daysAgo: 120, notes: 'Progreso lento pero constante. Reporta menos sal en comidas' },
      { w: 93.0, fat: 37.1, muscle: 38.0, bmi: 30.1, meta: 50, lost: 2.0, daysAgo: 85,  notes: 'Ajuste: añade caminata 15 min diarios. Endocrinólogo revisó medicación' },
      { w: 91.5, fat: 36.0, muscle: 38.8, bmi: 29.6, meta: 49, lost: 3.5, daysAgo: 45,  notes: 'Primera vez bajo 30 de IMC. Presión arterial mejora notablemente' },
      { w: 90.2, fat: 35.1, muscle: 39.5, bmi: 29.2, meta: 48, lost: 4.8, daysAgo: 10,  notes: 'Continúa con plan. Objetivo próximo: 88kg' },
    ],
    appointments: [
      { reason: 'Evaluación cardiovascular + nutrición', date: daysFromNow(5),  status: 'pendiente' },
      { reason: 'Revisión trimestral con médico', date: daysFromNow(20),        status: 'pendiente' },
    ]
  },
  { // ID 8 - Sofía Martínez Vega - deportista, ganancia muscular limpia
    profileId: 8,
    snapshots: [
      { w: 61.0, fat: 24.1, muscle: 55.3, bmi: 23.4, meta: 26, lost: 0,    daysAgo: 148, notes: 'Inicio plan de rendimiento. Crossfit 4x/semana' },
      { w: 61.5, fat: 23.2, muscle: 56.9, bmi: 23.6, meta: 25, lost: -0.5, daysAgo: 115, notes: 'Gana músculo, sube 0.5kg. Grasa disminuye bien' },
      { w: 62.1, fat: 22.0, muscle: 58.5, bmi: 23.8, meta: 24, lost: -1.1, daysAgo: 80,  notes: 'Aumentó carga en WOD. Proteína ajustada a 130g/día' },
      { w: 62.8, fat: 20.9, muscle: 60.2, bmi: 24.1, meta: 23, lost: -1.8, daysAgo: 42,  notes: 'Composición corporal ideal para su categoría deportiva' },
      { w: 63.2, fat: 19.8, muscle: 61.8, bmi: 24.3, meta: 23, lost: -2.2, daysAgo: 8,   notes: 'Récord personal en press. Excelente progreso de recomposición' },
    ],
    appointments: [
      { reason: 'Preparación para torneo regional', date: daysFromNow(12), status: 'pendiente' },
      { reason: 'Revisión post-competencia', date: daysFromNow(40),        status: 'pendiente' },
    ]
  },
  { // ID 9 - Roberto Flores Jiménez - mantenimiento nadador, pocas variaciones
    profileId: 9,
    snapshots: [
      { w: 80.0, fat: 18.5, muscle: 62.0, bmi: 24.2, meta: 35, lost: 0,   daysAgo: 145, notes: 'Control inicial de mantenimiento. Rendimiento óptimo' },
      { w: 79.8, fat: 18.3, muscle: 62.2, bmi: 24.1, meta: 35, lost: 0.2, daysAgo: 115, notes: 'Sin cambios relevantes, sigue plan de hidratación' },
      { w: 80.2, fat: 18.1, muscle: 62.5, bmi: 24.3, meta: 34, lost: 0,   daysAgo: 82,  notes: 'Leve aumento por mejor hidratación muscular' },
      { w: 79.5, fat: 18.0, muscle: 62.8, bmi: 24.0, meta: 34, lost: 0.5, daysAgo: 40,  notes: 'Temporada de competencias. Ajuste de carbohidratos pre-nado' },
      { w: 80.1, fat: 17.8, muscle: 63.1, bmi: 24.3, meta: 34, lost: 0,   daysAgo: 7,   notes: 'Estable. Ganó músculo mientras se mantiene en peso. ✅' },
    ],
    appointments: [
      { reason: 'Evaluación de rendimiento para competencia estatal', date: daysFromNow(14), status: 'pendiente' },
    ]
  },
  { // ID 10 - Lucía Romero Castillo - diabetes t2, descenso consistente
    profileId: 10,
    snapshots: [
      { w: 78.3, fat: 36.7, muscle: 39.5, bmi: 28.9, meta: 57, lost: 0,   daysAgo: 160, notes: 'Diagnóstico DM2 reciente. Inicia plan con control glucémico' },
      { w: 77.0, fat: 35.5, muscle: 40.1, bmi: 28.4, meta: 56, lost: 1.3, daysAgo: 125, notes: 'Glucosa en ayunas bajó de 145 a 128. Buena respuesta' },
      { w: 75.6, fat: 34.2, muscle: 41.0, bmi: 27.8, meta: 55, lost: 2.7, daysAgo: 90,  notes: 'Agrega caminata post-comida. Glucosa posprandial mejora' },
      { w: 74.2, fat: 32.9, muscle: 41.8, bmi: 27.3, meta: 54, lost: 4.1, daysAgo: 48,  notes: 'Médico redujo metformina a la mitad por mejoría. Celebración 🎉' },
      { w: 72.9, fat: 31.5, muscle: 42.6, bmi: 26.8, meta: 52, lost: 5.4, daysAgo: 12,  notes: 'HbA1c bajó a 6.8%. Paciente muy motivada, refiere energía excelente' },
    ],
    appointments: [
      { reason: 'Control de glucosa + ajuste de plan', date: daysFromNow(6),  status: 'pendiente' },
      { reason: 'Seguimiento con endocrinólogo', date: daysFromNow(22),       status: 'pendiente' },
      { reason: 'Evaluación semestral', date: daysFromNow(60),                status: 'pendiente' },
    ]
  },
  { // ID 11 - Miguel Ángel Torres - volumen muscular, joven
    profileId: 11,
    snapshots: [
      { w: 68.0, fat: 14.2, muscle: 68.5, bmi: 21.9, meta: 20, lost: 0,    daysAgo: 152, notes: 'Inicio plan de hipertrofia. Entrena 5x/semana' },
      { w: 69.5, fat: 13.8, muscle: 70.1, bmi: 22.4, meta: 20, lost: -1.5, daysAgo: 118, notes: 'Gana 1.5kg limpio. Superávit ajustado a 350 kcal' },
      { w: 71.2, fat: 13.5, muscle: 71.8, bmi: 22.9, meta: 19, lost: -3.2, daysAgo: 85,  notes: 'Aumentó press banca 10kg. Recuperación muscular óptima' },
      { w: 72.8, fat: 13.2, muscle: 73.4, bmi: 23.5, meta: 19, lost: -4.8, daysAgo: 45,  notes: 'Ajuste de creatina + leucina post-entreno. Excelentes resultados' },
      { w: 74.5, fat: 13.0, muscle: 75.0, bmi: 24.0, meta: 18, lost: -6.5, daysAgo: 10,  notes: 'Meta de 75kg casi alcanzada. Definición progresiva para los siguientes 2 meses' },
    ],
    appointments: [
      { reason: 'Evaluación fase de definición', date: daysFromNow(18), status: 'pendiente' },
    ]
  },
  { // ID 12 - Ana Patricia Delgado - hipotiroidismo, pérdida muy lenta
    profileId: 12,
    snapshots: [
      { w: 88.0, fat: 42.3, muscle: 34.8, bmi: 32.1, meta: 50, lost: 0,   daysAgo: 158, notes: 'Inicio: hipotiroidismo controlado. Plan sin gluten ni soya' },
      { w: 87.5, fat: 42.0, muscle: 35.0, bmi: 31.9, meta: 50, lost: 0.5, daysAgo: 122, notes: 'Bajó solo 0.5kg. Normal con tiroides baja. Se ajusta timing de alimentos' },
      { w: 86.8, fat: 41.4, muscle: 35.4, bmi: 31.6, meta: 49, lost: 1.2, daysAgo: 90,  notes: 'Médico ajustó levotiroxina. Mejoría notable en energía' },
      { w: 85.9, fat: 40.5, muscle: 36.0, bmi: 31.3, meta: 48, lost: 2.1, daysAgo: 48,  notes: 'Comenzó caminata 20 min matutina. Metabolismo respondiendo mejor' },
      { w: 85.0, fat: 39.6, muscle: 36.7, bmi: 30.9, meta: 47, lost: 3.0, daysAgo: 12,  notes: 'TSH normalizada. Plan sin gluten mantenido, se siente mucho mejor' },
    ],
    appointments: [
      { reason: 'Revisión de TSH + nutrición', date: daysFromNow(10), status: 'pendiente' },
      { reason: 'Control mensual', date: daysFromNow(38),             status: 'pendiente' },
    ]
  },
  { // ID 13 - Jorge Eduardo Salinas - corredor, mantenimiento élite
    profileId: 13,
    snapshots: [
      { w: 70.0, fat: 12.5, muscle: 70.2, bmi: 22.1, meta: 25, lost: 0,   daysAgo: 150, notes: 'Runner semi-élite. Plan de temporada alta' },
      { w: 69.5, fat: 12.1, muscle: 70.8, bmi: 21.9, meta: 25, lost: 0.5, daysAgo: 115, notes: 'Leve bajada en pre-maratón. Carga de carbohidratos bien tolerada' },
      { w: 69.8, fat: 11.9, muscle: 71.2, bmi: 22.0, meta: 24, lost: 0.2, daysAgo: 80,  notes: 'Post-maratón: recuperación nutricional 2 semanas. Electrolitos ajustados' },
      { w: 70.2, fat: 11.8, muscle: 71.5, bmi: 22.2, meta: 24, lost: 0,   daysAgo: 42,  notes: 'Vuelve a rutina normal. Rendimiento VO2max: 62 ml/kg/min' },
      { w: 69.9, fat: 11.5, muscle: 72.0, bmi: 22.1, meta: 24, lost: 0.1, daysAgo: 9,   notes: 'Preparación para 10K. Todo en parámetros óptimos ✅' },
    ],
    appointments: [
      { reason: 'Preparación nutricional 10K próximo mes', date: daysFromNow(7), status: 'pendiente' },
    ]
  },
  { // ID 14 - Valentina Cruz Moreno - post-parto, pérdida y lactancia
    profileId: 14,
    snapshots: [
      { w: 76.0, fat: 35.1, muscle: 40.2, bmi: 27.8, meta: 37, lost: 0,   daysAgo: 153, notes: 'Post-parto 2 meses. Lactancia activa. Plan hipocalórico suave +500 kcal' },
      { w: 74.8, fat: 34.0, muscle: 40.8, bmi: 27.3, meta: 36, lost: 1.2, daysAgo: 120, notes: 'Buena producción de leche. Hierro suplementado, ferritina ok' },
      { w: 73.5, fat: 32.7, muscle: 41.5, bmi: 26.8, meta: 36, lost: 2.5, daysAgo: 85,  notes: 'Destete parcial. Ajuste calórico -200 kcal. Sigue bien' },
      { w: 72.0, fat: 31.2, muscle: 42.2, bmi: 26.3, meta: 35, lost: 4.0, daysAgo: 45,  notes: 'Inició pilates postparto. Suelo pélvico + core activado' },
      { w: 70.4, fat: 29.8, muscle: 43.0, bmi: 25.7, meta: 34, lost: 5.6, daysAgo: 11,  notes: 'Excelente progreso post-parto. Recuperación casi total' },
    ],
    appointments: [
      { reason: 'Revisión nutricional + ginecológica conjunta', date: daysFromNow(9),  status: 'pendiente' },
      { reason: 'Control 6 meses postparto', date: daysFromNow(28),                   status: 'pendiente' },
    ]
  },
  { // ID 15 - Fernando López Gutiérrez - colesterol alto, mayor
    profileId: 15,
    snapshots: [
      { w: 91.2, fat: 31.4, muscle: 45.1, bmi: 29.6, meta: 64, lost: 0,   daysAgo: 148, notes: 'Triglicéridos 340mg/dl, colesterol LDL 185. Inicia dieta cardioprotectora' },
      { w: 90.0, fat: 30.8, muscle: 45.5, bmi: 29.2, meta: 63, lost: 1.2, daysAgo: 115, notes: 'Avena diaria + omega-3. Refiere menos cansancio' },
      { w: 88.8, fat: 30.0, muscle: 46.0, bmi: 28.8, meta: 62, lost: 2.4, daysAgo: 82,  notes: 'Control lipídico: TG bajó a 240. Continúa bien' },
      { w: 87.5, fat: 29.2, muscle: 46.6, bmi: 28.4, meta: 61, lost: 3.7, daysAgo: 40,  notes: 'LDL 145, TG 195. Médico satisfecho. Sigue sin estatinas' },
      { w: 86.2, fat: 28.4, muscle: 47.2, bmi: 27.9, meta: 60, lost: 5.0, daysAgo: 8,   notes: 'LDL 128, TG 162. ¡Normalización sin fármacos! Mantener dieta' },
    ],
    appointments: [
      { reason: 'Perfil lipídico + consulta nutrición', date: daysFromNow(11), status: 'pendiente' },
      { reason: 'Seguimiento con cardiólogo', date: daysFromNow(30),           status: 'pendiente' },
    ]
  },
  { // ID 16 - Isabella Reyes Navarro - TCA en recuperación, muy delicada
    profileId: 16,
    snapshots: [
      { w: 52.0, fat: 22.0, muscle: 50.3, bmi: 19.1, meta: 19, lost: 0,    daysAgo: 160, notes: 'Inicio recuperación. Abordaje sin peso en báscula por 1 mes' },
      { w: 52.8, fat: 21.5, muscle: 51.0, bmi: 19.4, meta: 19, lost: -0.8, daysAgo: 125, notes: 'Ganó 800g. Psicóloga reporta avance positivo. Sin atracones esta semana' },
      { w: 53.5, fat: 21.0, muscle: 51.8, bmi: 19.7, meta: 19, lost: -1.5, daysAgo: 90,  notes: 'Come 3 comidas regulares. Reduce rituales alimentarios. Buen avance' },
      { w: 54.3, fat: 20.5, muscle: 52.6, bmi: 19.9, meta: 18, lost: -2.3, daysAgo: 48,  notes: 'Primera vez que refiere comer sin culpa un postre. Logro importante 💪' },
      { w: 55.0, fat: 20.2, muscle: 53.4, bmi: 20.2, meta: 18, lost: -3.0, daysAgo: 10,  notes: 'IMC ya en 20. Continúa terapia. Sigue plan sin restricciones ni prohibiciones' },
    ],
    appointments: [
      { reason: 'Sesión conjunta nutrición + psicología', date: daysFromNow(4),  status: 'pendiente' },
      { reason: 'Control quincenal', date: daysFromNow(18),                      status: 'pendiente' },
    ]
  },
  { // ID 17 - Raúl Mendoza Pérez - gota, pérdida sostenida
    profileId: 17,
    snapshots: [
      { w: 87.5, fat: 29.8, muscle: 48.9, bmi: 28.3, meta: 51, lost: 0,   daysAgo: 155, notes: 'Gota activa. Urato sérico 9.2 mg/dl. Inicia dieta baja en purinas' },
      { w: 86.2, fat: 29.0, muscle: 49.4, bmi: 27.9, meta: 50, lost: 1.3, daysAgo: 120, notes: 'Sin crisis de gota en este período. Urato bajó a 8.1' },
      { w: 85.0, fat: 28.2, muscle: 50.0, bmi: 27.5, meta: 50, lost: 2.5, daysAgo: 88,  notes: 'Eliminó alcohol completamente. Refiere menos dolor articular' },
      { w: 83.8, fat: 27.3, muscle: 50.7, bmi: 27.1, meta: 49, lost: 3.7, daysAgo: 48,  notes: 'Urato 6.8 — casi en rango normal. Sin crisis en 2 meses. Excelente' },
      { w: 82.5, fat: 26.5, muscle: 51.4, bmi: 26.7, meta: 48, lost: 5.0, daysAgo: 13,  notes: 'Urato 6.1 mg/dl. Médico evalúa reducir alopurinol. Gran resultado' },
    ],
    appointments: [
      { reason: 'Control de uricemia + nutrición', date: daysFromNow(7),  status: 'pendiente' },
    ]
  },
  { // ID 18 - Camila Ortega Vásquez - boxeadora, corte de peso
    profileId: 18,
    snapshots: [
      { w: 60.0, fat: 19.5, muscle: 58.7, bmi: 22.8, meta: 24, lost: 0,   daysAgo: 150, notes: 'Peso fuera de temporada. Objetivo: categoría 57kg para torneo' },
      { w: 59.1, fat: 18.9, muscle: 59.3, bmi: 22.5, meta: 23, lost: 0.9, daysAgo: 118, notes: 'Reducción gradual iniciada. Sin sacrificar músculo' },
      { w: 58.3, fat: 18.2, muscle: 59.9, bmi: 22.2, meta: 23, lost: 1.7, daysAgo: 85,  notes: 'Ajuste proteína a 2.2g/kg. Entrena box + sparring 6x/semana' },
      { w: 57.5, fat: 17.5, muscle: 60.5, bmi: 21.9, meta: 22, lost: 2.5, daysAgo: 45,  notes: 'A 500g del pesaje. Rehidratación post-pesaje planificada' },
      { w: 57.0, fat: 17.0, muscle: 61.0, bmi: 21.7, meta: 22, lost: 3.0, daysAgo: 9,   notes: 'Lista para torneo. ✅ Pesaje aprobado. Rehidratación ejecutada con éxito' },
    ],
    appointments: [
      { reason: 'Post-torneo: recuperación y evaluación', date: daysFromNow(3),  status: 'pendiente' },
      { reason: 'Planificación próxima temporada de pelea', date: daysFromNow(25), status: 'pendiente' },
    ]
  },
  { // ID 19 - Héctor Jiménez Sánchez - sarcopenia, adulto mayor
    profileId: 19,
    snapshots: [
      { w: 74.0, fat: 28.9, muscle: 41.8, bmi: 26.5, meta: 70, lost: 0,    daysAgo: 155, notes: 'Sarcopenia incipiente. Masa muscular baja para su edad. Inicia plan' },
      { w: 74.3, fat: 28.4, muscle: 42.5, bmi: 26.6, meta: 69, lost: -0.3, daysAgo: 120, notes: 'Ganó 700g musculo. Refiere más fuerza al levantarse de la silla' },
      { w: 74.7, fat: 27.9, muscle: 43.3, bmi: 26.8, meta: 68, lost: -0.7, daysAgo: 88,  notes: 'Fisioterapia 2x/semana sumada al plan. Gran sinergia' },
      { w: 75.0, fat: 27.3, muscle: 44.2, bmi: 26.9, meta: 67, lost: -1.0, daysAgo: 46,  notes: 'Subió escalerones sin cansarse. Vitamina D + calcio en rango óptimo' },
      { w: 75.3, fat: 26.8, muscle: 45.0, bmi: 27.0, meta: 66, lost: -1.3, daysAgo: 11,  notes: 'Masa muscular ganó 3.2kg en 5 meses. Sarcopenia revertida parcialmente' },
    ],
    appointments: [
      { reason: 'Evaluación densitometría ósea + nutrición', date: daysFromNow(15), status: 'pendiente' },
      { reason: 'Revisión con geriatra', date: daysFromNow(30),                    status: 'pendiente' },
    ]
  },
  { // ID 20 - Paola Guzmán Ríos - SOP, dieta antiinflamatoria
    profileId: 20,
    snapshots: [
      { w: 69.5, fat: 30.5, muscle: 44.3, bmi: 25.9, meta: 33, lost: 0,   daysAgo: 152, notes: 'SOP confirmado. Insulina elevada. Plan IG bajo + antiinflamatorio' },
      { w: 68.7, fat: 29.8, muscle: 44.9, bmi: 25.6, meta: 32, lost: 0.8, daysAgo: 118, notes: 'Ciclos menstruales más regulares. Menos hinchazón abdominal reportada' },
      { w: 67.9, fat: 29.0, muscle: 45.6, bmi: 25.3, meta: 32, lost: 1.6, daysAgo: 85,  notes: 'Insulina en ayunas mejoró de 18 a 12 μUI/ml' },
      { w: 67.0, fat: 28.1, muscle: 46.3, bmi: 25.0, meta: 31, lost: 2.5, daysAgo: 44,  notes: 'Bajó inflamación visible. Acné reducido. Ginecólogo conforme con evolución' },
      { w: 66.1, fat: 27.2, muscle: 47.1, bmi: 24.7, meta: 31, lost: 3.4, daysAgo: 9,   notes: 'Ciclos regulares por 3 meses consecutivos. IMC en rango normal ✅' },
    ],
    appointments: [
      { reason: 'Revisión nutricional SOP + perfil hormonal', date: daysFromNow(6),  status: 'pendiente' },
      { reason: 'Ginecología + nutrición integrada', date: daysFromNow(28),          status: 'pendiente' },
    ]
  },
  { // ID 21 - Andrés Castillo Heredia - deportista aficionado, mantenimiento
    profileId: 21,
    snapshots: [
      { w: 75.0, fat: 17.2, muscle: 60.5, bmi: 23.8, meta: 31, lost: 0,   daysAgo: 148, notes: 'Fútbol 2x/semana. Sin patologías. Optimización de rendimiento' },
      { w: 74.8, fat: 16.9, muscle: 60.9, bmi: 23.7, meta: 31, lost: 0.2, daysAgo: 115, notes: 'Prueba estrategia de carbohidratos 2h antes de partido. Buen rendimiento' },
      { w: 75.1, fat: 16.7, muscle: 61.3, bmi: 23.8, meta: 30, lost: 0,   daysAgo: 82,  notes: 'Temporada de torneos. Ajuste ligero en calorías en semanas sin partido' },
      { w: 74.9, fat: 16.5, muscle: 61.7, bmi: 23.8, meta: 30, lost: 0.1, daysAgo: 42,  notes: 'Muy estable. Mejoría en sprints según el coach del equipo' },
      { w: 75.0, fat: 16.3, muscle: 62.0, bmi: 23.9, meta: 30, lost: 0,   daysAgo: 7,   notes: 'Óptimo. Sin cambios necesarios. Seguimiento semestral ' },
    ],
    appointments: [
      { reason: 'Evaluación pre-temporada nueva', date: daysFromNow(45), status: 'pendiente' },
    ]
  },
  { // ID 22 - Diana Fuentes Mora - síndrome metabólico severo
    profileId: 22,
    snapshots: [
      { w: 98.5, fat: 44.1, muscle: 32.6, bmi: 34.2, meta: 58, lost: 0,   daysAgo: 160, notes: 'Síndrome metabólico: obesidad + TG alto + glucosa limítrofe. Intervención intensiva' },
      { w: 97.0, fat: 43.4, muscle: 33.0, bmi: 33.7, meta: 57, lost: 1.5, daysAgo: 122, notes: 'Eliminó refrescos. Comenzó caminata 20 min. Buen inicio para ella' },
      { w: 95.2, fat: 42.5, muscle: 33.6, bmi: 33.1, meta: 56, lost: 3.3, daysAgo: 90,  notes: 'TG bajó de 320 a 265. Glucosa en ayunas 108 (antes 128). Avance notable' },
      { w: 93.5, fat: 41.5, muscle: 34.3, bmi: 32.5, meta: 55, lost: 5.0, daysAgo: 48,  notes: 'Incorpora ejercicio de fuerza 2x/semana. Duerme mejor, menos fatiga' },
      { w: 91.8, fat: 40.4, muscle: 35.1, bmi: 31.9, meta: 54, lost: 6.7, daysAgo: 10,  notes: 'TG 198, glucosa 98. Médico muy satisfecho. Continuar plan sin modificaciones' },
    ],
    appointments: [
      { reason: 'Control metabólico completo + nutrición', date: daysFromNow(4),  status: 'pendiente' },
      { reason: 'Evaluación mensual', date: daysFromNow(32),                      status: 'pendiente' },
      { reason: 'Revisión semestral con internista', date: daysFromNow(90),       status: 'pendiente' },
    ]
  },
  { // ID 23 - Sebastián Vargas Luna - adolescente, crecimiento + deporte
    profileId: 23,
    snapshots: [
      { w: 65.0, fat: 13.8, muscle: 65.0, bmi: 20.5, meta: 17, lost: 0,    daysAgo: 148, notes: 'Adolescente en crecimiento activo. Basquetbol escolar. Sin restricciones' },
      { w: 66.2, fat: 13.5, muscle: 66.2, bmi: 20.8, meta: 17, lost: -1.2, daysAgo: 115, notes: 'Creció 1cm. Ganó 1.2kg de desarrollo normal. Muy buena ingesta' },
      { w: 67.5, fat: 13.2, muscle: 67.5, bmi: 21.1, meta: 17, lost: -2.5, daysAgo: 82,  notes: 'Temporada de torneos escolares. Rendimiento excelente en cancha' },
      { w: 68.8, fat: 13.0, muscle: 68.8, bmi: 21.4, meta: 16, lost: -3.8, daysAgo: 40,  notes: 'Creció 2cm total desde inicio. Pubertad en pleno desarrollo. Plan adecuado' },
      { w: 70.0, fat: 12.8, muscle: 70.0, bmi: 21.7, meta: 16, lost: -5.0, daysAgo: 8,   notes: 'Seleccionado estatal de basquetbol. Nutrición como ventaja competitiva ✅' },
    ],
    appointments: [
      { reason: 'Control nutricional pre-selección estatal', date: daysFromNow(5), status: 'pendiente' },
    ]
  },
  { // ID 24 - Gloria Pacheco Elizondo - menopausia, control hormonal
    profileId: 24,
    snapshots: [
      { w: 73.0, fat: 37.8, muscle: 38.9, bmi: 27.3, meta: 59, lost: 0,   daysAgo: 155, notes: 'Menopausia hace 1 año. Sofocos 4-5/día. Inicia dieta fitoestrogénica' },
      { w: 72.3, fat: 37.1, muscle: 39.4, bmi: 27.0, meta: 58, lost: 0.7, daysAgo: 122, notes: 'Sofocos reducidos a 2-3/día. Refiere mejor sueño con isoflavonas' },
      { w: 71.5, fat: 36.3, muscle: 40.0, bmi: 26.7, meta: 58, lost: 1.5, daysAgo: 88,  notes: 'Calcio 1200mg + D3 1000 UI diarios. Densitometría programada' },
      { w: 70.7, fat: 35.5, muscle: 40.7, bmi: 26.4, meta: 57, lost: 2.3, daysAgo: 46,  notes: 'Solo 1 sofoco/día. Reducción de cafeína ayudó. Ánimo mucho mejor' },
      { w: 69.9, fat: 34.7, muscle: 41.4, bmi: 26.1, meta: 56, lost: 3.1, daysAgo: 10,  notes: 'Sofocos controlados. Densitometría normal. Excelente evolución clínica ✅' },
    ],
    appointments: [
      { reason: 'Control ginecológico + nutrición menopausia', date: daysFromNow(8),  status: 'pendiente' },
      { reason: 'Seguimiento nutricional mensual', date: daysFromNow(35),            status: 'pendiente' },
    ]
  },
  { // ID 25 - Tomás Aguirre Solís - estrés crónico + atracones nocturnos
    profileId: 25,
    snapshots: [
      { w: 84.0, fat: 26.4, muscle: 49.2, bmi: 27.9, meta: 42, lost: 0,   daysAgo: 150, notes: 'Atracones 3-4x/semana. Trabajo >12h/día. Inicio de mindful eating' },
      { w: 83.5, fat: 26.1, muscle: 49.5, bmi: 27.7, meta: 42, lost: 0.5, daysAgo: 118, notes: 'Estableció horario fijo de comidas. Atracones reducidos a 1-2/semana' },
      { w: 82.9, fat: 25.7, muscle: 49.9, bmi: 27.5, meta: 41, lost: 1.1, daysAgo: 85,  notes: 'Psicólogo de estrés inició terapia cognitiva. Come sin celular en mesas' },
      { w: 82.1, fat: 25.2, muscle: 50.4, bmi: 27.2, meta: 41, lost: 1.9, daysAgo: 44,  notes: 'Semana sin atracones. Primera vez en meses. Celebró con colación sana' },
      { w: 81.4, fat: 24.7, muscle: 50.9, bmi: 27.0, meta: 40, lost: 2.6, daysAgo: 9,   notes: 'Cursa 3 semanas sin episodios de atracón. Relación con comida mejorando mucho' },
    ],
    appointments: [
      { reason: 'Sesión integrada nutrición + gestión de estrés', date: daysFromNow(6),  status: 'pendiente' },
      { reason: 'Revisión mensual', date: daysFromNow(34),                               status: 'pendiente' },
    ]
  }
];

async function run() {
  console.log('🗑️  Limpiando snapshots anteriores (no-iniciales)...');
  const profileIds = patientData.map(p => p.profileId);
  const deleted = await prisma.profileSnapshot.deleteMany({
    where: { profileId: { in: profileIds }, isInitialRecord: false }
  });
  console.log(`   Eliminados: ${deleted.count} snapshots\n`);

  console.log('📋 Insertando snapshots únicos y citas por paciente...\n');

  for (const patient of patientData) {
    // Insert snapshots
    for (const s of patient.snapshots) {
      await prisma.profileSnapshot.create({
        data: {
          profileId: patient.profileId,
          weight: s.w,
          bmi: s.bmi,
          bodyFatPercentage: s.fat,
          muscleMassPercentage: s.muscle,
          metabolicAge: s.meta,
          lostWeight: s.lost,
          isInitialRecord: false,
          notes: s.notes,
          recordedAt: daysAgo(s.daysAgo),
        }
      });
    }

    // Insert appointments
    for (const apt of patient.appointments) {
      await prisma.appointment.create({
        data: {
          profileId: patient.profileId,
          reason: apt.reason,
          date: apt.date,
          status: apt.status,
        }
      });
    }

    const totalApts = patient.appointments.length;
    console.log(`✅ ID ${patient.profileId} — ${patient.snapshots.length} snapshots + ${totalApts} cita(s)`);
  }

  console.log('\n🎉 ¡Listo! Datos únicos, realistas y variados insertados.');
  console.log(`   Total: ${patientData.length * 5} snapshots + ${patientData.flatMap(p => p.appointments).length} citas`);
  await prisma.$disconnect();
}

run();
