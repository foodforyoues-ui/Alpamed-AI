import prisma from './src/config/db.js';

// 20 pacientes ficticios con métricas realistas - tú asignarás los teléfonos desde el front
const patients = [
  {
    patientName: "María García López",
    phone: "5210000000001",
    realAge: 32,
    doesExercise: true,
    exerciseType: "Caminata y cardio",
    sleepHours: 7,
    dailySteps: 8500,
    generalRecommendation: "Reducción de carbohidratos simples, aumentar proteína magra. Dieta mediterránea adaptada.",
    specificRecommendations: ["Desayuno: avena con frutas", "Evitar pan blanco", "2L de agua diaria"],
    snapshot: { weight: 72.5, bmi: 27.1, bodyFatPercentage: 33.2, muscleMassPercentage: 41.0, metabolicAge: 35, lostWeight: 3.5 }
  },
  {
    patientName: "Carlos Herrera Ruiz",
    phone: "5210000000002",
    realAge: 45,
    doesExercise: false,
    exerciseType: null,
    sleepHours: 6,
    dailySteps: 4000,
    generalRecommendation: "Plan hipocalórico con control de sodio por antecedentes de hipertensión.",
    specificRecommendations: ["Reducir sal", "Incluir verduras en todas las comidas", "No saltarse el desayuno"],
    snapshot: { weight: 95.0, bmi: 30.8, bodyFatPercentage: 38.5, muscleMassPercentage: 37.2, metabolicAge: 52, lostWeight: 0 }
  },
  {
    patientName: "Sofía Martínez Vega",
    phone: "5210000000003",
    realAge: 28,
    doesExercise: true,
    exerciseType: "Crossfit 4x semana",
    sleepHours: 8,
    dailySteps: 12000,
    generalRecommendation: "Alto en proteínas para soporte muscular. Control de insulina por resistencia leve.",
    specificRecommendations: ["Proteína post-entreno", "Evitar azúcar refinada", "Cena antes de las 8pm"],
    snapshot: { weight: 61.0, bmi: 23.4, bodyFatPercentage: 24.1, muscleMassPercentage: 55.3, metabolicAge: 26, lostWeight: 1.5 }
  },
  {
    patientName: "Roberto Flores Jiménez",
    phone: "5210000000004",
    realAge: 38,
    doesExercise: true,
    exerciseType: "Natación 3x semana",
    sleepHours: 7.5,
    dailySteps: 9000,
    generalRecommendation: "Mantenimiento de peso. Optimizar energía para rendimiento deportivo.",
    specificRecommendations: ["Carbohidratos complejos antes del entreno", "Hidratación cada 2 horas", "Colación de frutas"],
    snapshot: { weight: 80.0, bmi: 24.2, bodyFatPercentage: 18.5, muscleMassPercentage: 62.0, metabolicAge: 35, lostWeight: 2.0 }
  },
  {
    patientName: "Lucía Romero Castillo",
    phone: "5210000000005",
    realAge: 52,
    doesExercise: true,
    exerciseType: "Yoga y pilates",
    sleepHours: 6.5,
    dailySteps: 6000,
    generalRecommendation: "Plan de control de glucosa. Diabetes tipo 2 en etapa inicial.",
    specificRecommendations: ["Sin azúcar agregada", "Fraccionar en 5 comidas", "Caminar 30 min tras cada comida principal"],
    snapshot: { weight: 78.3, bmi: 28.9, bodyFatPercentage: 36.7, muscleMassPercentage: 39.5, metabolicAge: 57, lostWeight: 4.2 }
  },
  {
    patientName: "Miguel Ángel Torres",
    phone: "5210000000006",
    realAge: 22,
    doesExercise: true,
    exerciseType: "Gimnasio - hipertrofia",
    sleepHours: 7,
    dailySteps: 10000,
    generalRecommendation: "Dieta de volumen limpio. Meta: ganar masa muscular sin exceso de grasa.",
    specificRecommendations: ["2g proteína por kg", "Superávit calórico de 300 kcal", "Creatina 5g diaria"],
    snapshot: { weight: 68.0, bmi: 21.9, bodyFatPercentage: 14.2, muscleMassPercentage: 68.5, metabolicAge: 20, lostWeight: -2.0 }
  },
  {
    patientName: "Ana Patricia Delgado",
    phone: "5210000000007",
    realAge: 41,
    doesExercise: false,
    exerciseType: null,
    sleepHours: 5.5,
    dailySteps: 3500,
    generalRecommendation: "Tiroides hipofuncional. Plan adaptado con alimentos que no interfieran con medicación.",
    specificRecommendations: ["Evitar soya y crucíferas en exceso", "Desayuno antes de 9am", "Sin gluten por sensibilidad"],
    snapshot: { weight: 88.0, bmi: 32.1, bodyFatPercentage: 42.3, muscleMassPercentage: 34.8, metabolicAge: 50, lostWeight: 1.0 }
  },
  {
    patientName: "Jorge Eduardo Salinas",
    phone: "5210000000008",
    realAge: 29,
    doesExercise: true,
    exerciseType: "Running 5k diario",
    sleepHours: 8,
    dailySteps: 15000,
    generalRecommendation: "Dieta para rendimiento de resistencia. Carga de carbohidratos estratégica.",
    specificRecommendations: ["Pasta integral los días de carrera larga", "Gel de glucosa en entrenamientos +45min", "Recuperación con plátano + proteína"],
    snapshot: { weight: 70.0, bmi: 22.1, bodyFatPercentage: 12.5, muscleMassPercentage: 70.2, metabolicAge: 25, lostWeight: 0 }
  },
  {
    patientName: "Valentina Cruz Moreno",
    phone: "5210000000009",
    realAge: 35,
    doesExercise: true,
    exerciseType: "Zumba 2x semana",
    sleepHours: 7,
    dailySteps: 7500,
    generalRecommendation: "Post-parto (8 meses). Recuperación nutricional y reducción de peso ganado en embarazo.",
    specificRecommendations: ["Lactancia: +500 kcal extra", "Hierro y calcio prioritarios", "Evitar dietas muy restrictivas"],
    snapshot: { weight: 76.0, bmi: 27.8, bodyFatPercentage: 35.1, muscleMassPercentage: 40.2, metabolicAge: 37, lostWeight: 6.0 }
  },
  {
    patientName: "Fernando López Gutiérrez",
    phone: "5210000000010",
    realAge: 58,
    doesExercise: true,
    exerciseType: "Caminata y bicicleta estática",
    sleepHours: 7,
    dailySteps: 5500,
    generalRecommendation: "Control de colesterol y triglicéridos elevados. Dieta cardioprotectora.",
    specificRecommendations: ["Omega-3 en alimentos (salmón, linaza)", "Reducir grasas saturadas", "Avena diaria"],
    snapshot: { weight: 91.2, bmi: 29.6, bodyFatPercentage: 31.4, muscleMassPercentage: 45.1, metabolicAge: 64, lostWeight: 3.8 }
  },
  {
    patientName: "Isabella Reyes Navarro",
    phone: "5210000000011",
    realAge: 19,
    doesExercise: false,
    exerciseType: null,
    sleepHours: 9,
    dailySteps: 5000,
    generalRecommendation: "Trastorno alimentario en recuperación. Plan flexible y sin restricciones extremas.",
    specificRecommendations: ["3 comidas principales + 2 colaciones", "Ningún alimento está prohibido", "Registro emocional de comidas"],
    snapshot: { weight: 52.0, bmi: 19.1, bodyFatPercentage: 22.0, muscleMassPercentage: 50.3, metabolicAge: 19, lostWeight: 0 }
  },
  {
    patientName: "Raúl Mendoza Pérez",
    phone: "5210000000012",
    realAge: 47,
    doesExercise: true,
    exerciseType: "Pesas 3x semana",
    sleepHours: 6,
    dailySteps: 8000,
    generalRecommendation: "Gota activa. Dieta baja en purinas y sin alcohol.",
    specificRecommendations: ["Evitar vísceras y mariscos", "Sin alcohol", "2.5L agua diaria"],
    snapshot: { weight: 87.5, bmi: 28.3, bodyFatPercentage: 29.8, muscleMassPercentage: 48.9, metabolicAge: 51, lostWeight: 2.5 }
  },
  {
    patientName: "Camila Ortega Vásquez",
    phone: "5210000000013",
    realAge: 26,
    doesExercise: true,
    exerciseType: "Box / artes marciales",
    sleepHours: 7.5,
    dailySteps: 11000,
    generalRecommendation: "Dieta alta en proteínas para deportista de combate. Control de peso para categoría.",
    specificRecommendations: ["Peso objetivo: 57kg", "Pollo, atún, huevo como fuentes principales", "Hidratación crítica en cortes de peso"],
    snapshot: { weight: 60.0, bmi: 22.8, bodyFatPercentage: 19.5, muscleMassPercentage: 58.7, metabolicAge: 24, lostWeight: 3.0 }
  },
  {
    patientName: "Héctor Jiménez Sánchez",
    phone: "5210000000014",
    realAge: 63,
    doesExercise: false,
    exerciseType: null,
    sleepHours: 6,
    dailySteps: 3000,
    generalRecommendation: "Sarcopenia incipiente. Aumentar proteína y estimular masa muscular.",
    specificRecommendations: ["25-30g proteína por comida", "Leucina como amino prioritario", "Supl: vitamina D + calcio"],
    snapshot: { weight: 74.0, bmi: 26.5, bodyFatPercentage: 28.9, muscleMassPercentage: 41.8, metabolicAge: 70, lostWeight: 0 }
  },
  {
    patientName: "Paola Guzmán Ríos",
    phone: "5210000000015",
    realAge: 31,
    doesExercise: true,
    exerciseType: "HIIT y yoga",
    sleepHours: 8,
    dailySteps: 9500,
    generalRecommendation: "SOP (Síndrome de Ovario Poliquístico). Dieta anti-inflamatoria y baja en índice glucémico.",
    specificRecommendations: ["Sin azúcar refinada", "Grasas saludables: aguacate, aceite oliva", "Canela en alimentos"],
    snapshot: { weight: 69.5, bmi: 25.9, bodyFatPercentage: 30.5, muscleMassPercentage: 44.3, metabolicAge: 33, lostWeight: 2.8 }
  },
  {
    patientName: "Andrés Castillo Heredia",
    phone: "5210000000016",
    realAge: 34,
    doesExercise: true,
    exerciseType: "Fútbol amateur",
    sleepHours: 7,
    dailySteps: 10500,
    generalRecommendation: "Mantenimiento y optimización de rendimiento. Sin patologías.",
    specificRecommendations: ["Carbohidratos antes de partido", "Recuperación con proteína + carbohidrato simple", "Evitar comida chatarra"],
    snapshot: { weight: 75.0, bmi: 23.8, bodyFatPercentage: 17.2, muscleMassPercentage: 60.5, metabolicAge: 31, lostWeight: 0 }
  },
  {
    patientName: "Diana Fuentes Mora",
    phone: "5210000000017",
    realAge: 44,
    doesExercise: false,
    exerciseType: null,
    sleepHours: 5,
    dailySteps: 4500,
    generalRecommendation: "Síndrome metabólico. Intervención intensiva en hábitos y dieta.",
    specificRecommendations: ["Ayuno intermitente 16/8 gradual", "Eliminar refrescos", "Comenzar con caminata 20 min/día"],
    snapshot: { weight: 98.5, bmi: 34.2, bodyFatPercentage: 44.1, muscleMassPercentage: 32.6, metabolicAge: 58, lostWeight: 0 }
  },
  {
    patientName: "Sebastián Vargas Luna",
    phone: "5210000000018",
    realAge: 17,
    doesExercise: true,
    exerciseType: "Basquetbol escolar",
    sleepHours: 8.5,
    dailySteps: 12000,
    generalRecommendation: "Adolescente en crecimiento activo. Plan para soporte de talla y desarrollo muscular.",
    specificRecommendations: ["No restricción calórica", "Calcio y vitamina D esenciales", "4 comidas y 2 colaciones"],
    snapshot: { weight: 65.0, bmi: 20.5, bodyFatPercentage: 13.8, muscleMassPercentage: 65.0, metabolicAge: 17, lostWeight: 0 }
  },
  {
    patientName: "Gloria Pacheco Elizondo",
    phone: "5210000000019",
    realAge: 56,
    doesExercise: true,
    exerciseType: "Aqua aerobic",
    sleepHours: 7,
    dailySteps: 6500,
    generalRecommendation: "Menopausia. Dieta para reducir sofocos y control de ganancia de peso hormonal.",
    specificRecommendations: ["Fitoestrógenos naturales: soya, linaza", "Calcio 1200mg/día", "Reducir cafeína y alcohol"],
    snapshot: { weight: 73.0, bmi: 27.3, bodyFatPercentage: 37.8, muscleMassPercentage: 38.9, metabolicAge: 59, lostWeight: 1.5 }
  },
  {
    patientName: "Tomás Aguirre Solís",
    phone: "5210000000020",
    realAge: 39,
    doesExercise: false,
    exerciseType: null,
    sleepHours: 6.5,
    dailySteps: 5000,
    generalRecommendation: "Estrés crónico laboral con atracones nocturnos. Educación nutricional y mindful eating.",
    specificRecommendations: ["Horario de comidas fijo", "Sin tecnología durante comidas", "Colación nocturna permitida: yogur natural"],
    snapshot: { weight: 84.0, bmi: 27.9, bodyFatPercentage: 26.4, muscleMassPercentage: 49.2, metabolicAge: 42, lostWeight: 0 }
  }
];

async function seedPatients() {
  console.log('🌱 Iniciando ingesta de 20 pacientes...\n');

  for (const p of patients) {
    try {
      const { snapshot, ...profileData } = p;

      // Check not duplicate
      const exists = await prisma.profile.findUnique({ where: { phone: profileData.phone } });
      if (exists) {
        console.log(`⚠️  Ya existe: ${profileData.patientName} — omitido`);
        continue;
      }

      const profile = await prisma.profile.create({ data: profileData });

      await prisma.profileSnapshot.create({
        data: {
          profileId: profile.id,
          ...snapshot,
          isInitialRecord: true,
          notes: 'Registro inicial — ingesta de datos de demostración',
        }
      });

      console.log(`✅ ${profileData.patientName} (ID: ${profile.id}) — IMC: ${snapshot.bmi}`);
    } catch (err) {
      console.error(`❌ Error con ${p.patientName}:`, err.message);
    }
  }

  console.log('\n🎉 Ingesta completada. Asigna los números de teléfono desde el front.');
  await prisma.$disconnect();
}

seedPatients();
