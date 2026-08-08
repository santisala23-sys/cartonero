import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "politica-events.json");

const d = (id, titulo, texto, opciones, peso = 12, condiciones = []) => ({
  id: "pol_" + id,
  titulo,
  texto,
  peso,
  condiciones,
  opciones,
});
const opt = (id, label, efectos) => ({ id, label, efectos });
const delta = (m, a) => ({ type: "delta", metric: m, amount: a });
const flag = (v) => ({ type: "add_flag", value: v });
const unflag = (v) => ({ type: "remove_flag", value: v });
const risk = (c, effects) => ({ type: "risk", chance: c, effects });
const setJob = (job_id) => ({ type: "set_job", job_id });
const cred = (v) => ({ type: "add_credential", value: v });

const politico = [{ type: "job_tag", value: "politico" }];
const militante = [{ type: "job_id", value: "militante_barrial" }];
const operador = [{ type: "job_id", value: "operador_territorial" }];
const concejal = [{ type: "job_id", value: "concejal" }];
const intendente = [{ type: "job_id", value: "intendente" }];
const gobernador = [{ type: "job_id", value: "gobernador" }];
const militanteOrFlag = [
  { type: "job_tags_any", values: ["politico", "territorio"] },
];
const avanzada = [
  { type: "job_tag", value: "politico" },
  { type: "influencia_gte", value: 55 },
];
const elite = [
  { type: "job_tag", value: "politico" },
  { type: "influencia_gte", value: 75 },
];

const events = [];

// =============================================================================
// ENTRADA A MILITANCIA (desde interés / barrio)
// =============================================================================
events.push(
  d(
    "oferta_militante",
    "Te ofrecen el chaleco",
    "El referente del barrio te reconoce: 'dejá el carrito un rato y labujá con nosotros'. Hay vianda, un mango y la puerta a otra vida.",
    [
      opt("aceptar", "Aceptar y militar", [
        delta("influencia", 5),
        delta("capital_social", 6),
        delta("estres", 6),
        flag("interes_militancia"),
        setJob("militante_barrial"),
      ]),
      opt("mitad", "Ayudar sin dejar el laburo", [
        delta("capital_social", 5),
        delta("influencia", 3),
        delta("estres", 4),
        flag("militancia_parcial"),
      ]),
      opt("no", "Seguir con lo tuyo", [delta("bienestar", 2)]),
    ],
    14,
    [
      { type: "has_flag", value: "interes_militancia" },
      { type: "missing_flag", value: "worked_militante_barrial" },
      { type: "metric_gte", metric: "capital_social", value: 12 },
    ],
  ),
);

// =============================================================================
// MISIONES MILITANTE
// =============================================================================
events.push(
  d(
    "mision_urna",
    "Misión: la urna blanda",
    "El puntero te llama de madrugada. Hay que 'cuidar' una urna en el barrio. Plata chica, riesgo grande, y la promesa de que 'después hay más'.",
    [
      opt("aceptar", "Aceptar la misión", [
        delta("dinero", 45000),
        delta("influencia", 6),
        delta("capital_social", -4),
        delta("estres", 12),
        flag("mision_urna"),
        flag("tranza_electoral"),
      ]),
      opt("rechazar", "Rechazar", [
        delta("capital_social", 4),
        delta("influencia", -3),
        delta("bienestar", 2),
      ]),
    ],
    14,
    militante,
  ),
);

events.push(
  d(
    "mision_olla",
    "Misión: olla y foto",
    "Hay que armar una olla popular... y que salga linda en la foto con el candidato. Comida real o staging: vos decidís.",
    [
      opt("olla_posta", "Olla posta para el barrio", [
        delta("dinero", -15000),
        delta("capital_social", 12),
        delta("influencia", 5),
        delta("bienestar", 4),
        flag("olla_real"),
      ]),
      opt("staging", "Staging para la cámara", [
        delta("dinero", 20000),
        delta("influencia", 8),
        delta("capital_social", -6),
        delta("estres", 6),
        flag("militancia_de_foto"),
      ]),
    ],
    13,
    militanteOrFlag,
  ),
);

events.push(
  d(
    "mision_comerciante",
    "Misión: el comerciante díscolo",
    "Un almacenero no quiere colgar el afiche. El referente dice: 'andá a convencerlo'. Puede ser mate... o presión.",
    [
      opt("mate", "Mate y persuasión", [
        delta("capital_social", 8),
        delta("influencia", 4),
        delta("estres", 4),
      ]),
      opt("presion", "Presión con gente", [
        delta("dinero", 25000),
        delta("influencia", 7),
        delta("capital_social", -10),
        delta("estres", 10),
        flag("metodo_pesado"),
      ]),
    ],
    13,
    militante,
  ),
);

events.push(
  d(
    "mision_padron",
    "Misión: el padrón hinchado",
    "Hay que 'actualizar' el padrón del centro comunitario. Nombres de gente que se mudó... o que nunca existió.",
    [
      opt("hinchar", "Hinchar el padrón", [
        delta("dinero", 55000),
        delta("influencia", 8),
        delta("capital_social", -11),
        delta("estres", 13),
        flag("padron_trucho"),
      ]),
      opt("limpio", "Padrón limpio", [
        delta("capital_social", 7),
        delta("influencia", 2),
        delta("estres", 4),
      ]),
    ],
    14,
    militante,
  ),
);

events.push(
  d(
    "mision_bondi_militante",
    "Misión: el bondi a la plaza",
    "Hay que llenar la plaza. Te dan un bondi, vianda y la orden: que no se vea vacío en la tele.",
    [
      opt("llenar", "Llenar la plaza", [
        delta("dinero", 35000),
        delta("influencia", 7),
        delta("capital_social", 5),
        delta("estres", 9),
        flag("lleno_plaza"),
      ]),
      opt("fallar", "Fallar a propósito", [
        delta("influencia", -6),
        delta("capital_social", 3),
        delta("bienestar", 2),
      ]),
    ],
    13,
    militanteOrFlag,
  ),
);

events.push(
  d(
    "mision_volanteada",
    "Misión: volanteada hasta las 2",
    "Hay que tapizar el barrio antes del acto. Lluvia fina, pies mojados y la promesa de 'mañana te anotan'.",
    [
      opt("full", "Volantear hasta que no quede papel", [
        delta("influencia", 6),
        delta("capital_social", 5),
        delta("salud", -4),
        delta("estres", 8),
        flag("volanteada_heroica"),
        risk(0.3, [cred("aptitud_gestion_territorial")]),
      ]),
      opt("zafarte", "Distribuir la mitad y decir que listo", [
        delta("dinero", 8000),
        delta("influencia", 2),
        delta("capital_social", -3),
        flag("militancia_vaga"),
      ]),
    ],
    13,
    militante,
  ),
);

events.push(
  d(
    "mision_caja_social",
    "Misión: la caja 'social'",
    "Te dan cajas de comida para repartir. El referente se queda con un tercio 'para gastos'. Te mira esperando que entiendas.",
    [
      opt("repartir_todo", "Repartir todo al barrio", [
        delta("capital_social", 14),
        delta("influencia", 3),
        delta("estres", 7),
        flag("caja_limpia"),
        risk(0.35, [delta("influencia", -8), flag("marcado_por_puntero")]),
      ]),
      opt("entender", "Entender el sistema", [
        delta("dinero", 40000),
        delta("influencia", 8),
        delta("capital_social", -9),
        delta("estres", 10),
        flag("caja_trucha"),
        flag("tranza_social"),
      ]),
    ],
    14,
    militante,
  ),
);

events.push(
  d(
    "mision_local_pelea",
    "Misión: pelea por el local",
    "Otra unidad básica quiere el mismo local. Hay mate, gritos y la chance de que termine a las piñas.",
    [
      opt("negociar", "Negociar turno y cartel compartido", [
        delta("capital_social", 9),
        delta("influencia", 5),
        delta("estres", 6),
        flag("pacto_unidades"),
      ]),
      opt("quedarse", "Quedarte el local a la fuerza", [
        delta("influencia", 9),
        delta("capital_social", -8),
        delta("estres", 12),
        flag("guerra_interna"),
        risk(0.25, [delta("salud", -12)]),
      ]),
    ],
    12,
    militante,
  ),
);

events.push(
  d(
    "mision_reclutar",
    "Misión: sumar pibes",
    "Hay que reclutar veinte voluntarios para el acto. Algunos vienen por la causa; otros por la vianda y el bondi.",
    [
      opt("discurso", "Discurso y mate en la esquina", [
        delta("capital_social", 10),
        delta("influencia", 6),
        delta("estres", 5),
        flag("reclutador_barrial"),
        risk(0.25, [cred("aptitud_oratoria")]),
      ]),
      opt("plata", "Prometer changas y un mango", [
        delta("dinero", -25000),
        delta("influencia", 9),
        delta("capital_social", -4),
        delta("estres", 7),
        flag("clientelismo_activo"),
      ]),
    ],
    13,
    militante,
  ),
);

// =============================================================================
// OFERTAS / POLÍTICOS (entrada y mid-game)
// =============================================================================
events.push(
  d(
    "massa_te_ofrece",
    "Massa te mide",
    "Aparece un operador cercano a Massa. Si 'resolvés' tres manzanas de votos blandos, hay laburo en la estructura y un sobre para gastos.",
    [
      opt("resolver", "Resolver las manzanas", [
        delta("dinero", 80000),
        delta("influencia", 10),
        delta("capital_social", 4),
        delta("estres", 11),
        flag("operador_massa"),
        risk(0.45, [setJob("operador_territorial")]),
      ]),
      opt("no", "Decir que no bancás eso", [
        delta("capital_social", 5),
        delta("influencia", -4),
      ]),
    ],
    12,
    [...militanteOrFlag, { type: "influencia_gte", value: 18 }],
  ),
);

events.push(
  d(
    "grabois_movimiento",
    "Grabois y el movimiento",
    "Juan Grabois arma una movida territorial. Te ofrecen militar con discurso social... o solo aparecer en la marcha.",
    [
      opt("militar", "Militar en serio", [
        delta("capital_social", 11),
        delta("influencia", 6),
        delta("estres", 8),
        delta("dinero", -5000),
        flag("movimiento_grabois"),
      ]),
      opt("foto", "Solo la marcha y la foto", [
        delta("influencia", 3),
        delta("capital_social", 2),
        delta("bienestar", 2),
      ]),
    ],
    11,
    [
      { type: "metric_gte", metric: "capital_social", value: 12 },
      { type: "missing_flag", value: "movimiento_grabois" },
    ],
  ),
);

events.push(
  d(
    "macri_fundacion",
    "Órbita Macri",
    "Una fundación cercana a Macri busca 'jóvenes con ganas'. Hay coffee break, LinkedIn y la pregunta: ¿estás dispuesto a hacer puerta a puerta en zona norte?",
    [
      opt("entrar", "Entrar a la órbita", [
        delta("influencia", 8),
        delta("capital_social", 6),
        delta("estres", 6),
        delta("dinero", 30000),
        flag("orbita_macri"),
      ]),
      opt("no", "No es tu mundo", [delta("bienestar", 2)]),
    ],
    10,
    [
      { type: "has_credential", value: "secundaria" },
      { type: "influencia_gte", value: 15 },
    ],
  ),
);

events.push(
  d(
    "bullrich_seguridad",
    "Bullrich y la línea dura",
    "Patricia Bullrich necesita gente de territorio para un mensaje de seguridad. Te piden una anécdota 'fuerte' del barrio... aunque haya que exagerar.",
    [
      opt("exagerar", "Entregar el relato picante", [
        delta("dinero", 50000),
        delta("influencia", 9),
        delta("capital_social", -8),
        delta("estres", 9),
        flag("relato_seguridad"),
      ]),
      opt("verdad", "Contar la verdad noma", [
        delta("capital_social", 6),
        delta("influencia", 3),
        delta("bienestar", 2),
      ]),
    ],
    11,
    politico,
  ),
);

events.push(
  d(
    "kicillof_gestion",
    "Kicillof te cita",
    "Desde la Provincia te ofrecen una pasantía de gestión: planillas, municipios y la frase 'el Estado presente'. No es glam, es poder administrativo.",
    [
      opt("aceptar", "Aceptar", [
        delta("dinero", 70000),
        delta("influencia", 7),
        delta("capital_social", 5),
        delta("estres", 8),
        flag("gestion_pba"),
      ]),
      opt("no", "Seguir en la calle", [delta("capital_social", 2)]),
    ],
    11,
    [...politico, { type: "has_credential", value: "secundaria" }],
  ),
);

events.push(
  d(
    "larreta_eco",
    "Larreta y la ciudad jardín",
    "Horacio te invita a un evento de 'ciudad verde'. Hay canapés, bicis eléctricas y un pedido: sumar voluntarios para una recorrida.",
    [
      opt("sumar", "Sumar voluntarios", [
        delta("influencia", 6),
        delta("capital_social", 7),
        delta("estres", 5),
        delta("dinero", 20000),
        flag("orbita_larreta"),
      ]),
      opt("pasarla", "Solo comer canapés", [
        delta("bienestar", 4),
        delta("capital_social", 2),
      ]),
    ],
    10,
    [{ type: "influencia_gte", value: 20 }],
  ),
);

events.push(
  d(
    "cristina_doctrina",
    "Doctrina Cristina",
    "En un local militan con la V de Cristina. Te piden lealtad visible: remera, historia y no chistar en público.",
    [
      opt("lealtad", "Bancarla a muerte", [
        delta("influencia", 10),
        delta("capital_social", 8),
        delta("estres", 7),
        flag("cristinista"),
      ]),
      opt("critico", "Militar con matices", [
        delta("influencia", 4),
        delta("capital_social", 3),
        delta("estres", 5),
        risk(0.4, [delta("influencia", -6), flag("discolo")]),
      ]),
    ],
    12,
    politico,
  ),
);

events.push(
  d(
    "caputo_whatsapp",
    "WhatsApp de Caputo",
    "Santiago Caputo (o alguien que dice serlo) te manda un audio: hay que 'ordenar el relato' en redes del barrio. Memes, bots y cero sueño.",
    [
      opt("ordenar", "Ordenar el relato", [
        delta("dinero", 60000),
        delta("influencia", 11),
        delta("estres", 14),
        delta("capital_social", -3),
        flag("guerra_redes"),
        flag("orbita_caputo"),
      ]),
      opt("no", "Apagar el celular", [
        delta("bienestar", 4),
        delta("estres", -4),
      ]),
    ],
    12,
    [...politico, { type: "influencia_gte", value: 30 }],
  ),
);

events.push(
  d(
    "karina_filtro",
    "El filtro Karina",
    "Karina Milei mira todo. Te citan a una reunión corta: o entrás al círculo de confianza... o quedás afuera para siempre.",
    [
      opt("perfil", "Perfil bajo y útil", [
        delta("influencia", 12),
        delta("capital_social", 4),
        delta("estres", 10),
        flag("circulo_karina"),
      ]),
      opt("lucirte", "Intentar lucirte", [
        risk(0.35, [
          delta("influencia", 16),
          delta("capital_social", 8),
          flag("circulo_karina"),
        ]),
        risk(0.65, [
          delta("influencia", -10),
          delta("estres", 12),
          flag("quemado_libertad"),
        ]),
      ]),
    ],
    13,
    avanzada,
  ),
);

events.push(
  d(
    "milei_elon_motosierra",
    "Milei + Elon + motosierra",
    "Estás tan adentro que Milei te invita a un evento con Elon Musk. El dress code es surreal: traje de lobo y motosierra (de utilería... ¿o no?). Después, dice el productor, 'puede llamar Susana'.",
    [
      opt("ir_lobo", "Ir de lobo con motosierra", [
        delta("influencia", 18),
        delta("capital_social", 14),
        delta("estres", 16),
        delta("dinero", -40000),
        flag("evento_milei_elon"),
        flag("traje_lobo"),
        risk(0.7, [flag("llamado_susana_pendiente")]),
      ]),
      opt("serio", "Ir de traje normal (aburrido)", [
        delta("influencia", 8),
        delta("capital_social", 5),
        delta("estres", 6),
        flag("evento_milei_elon"),
      ]),
      opt("rajarse", "Inventar una gastroenteritis", [
        delta("influencia", -8),
        delta("bienestar", 3),
      ]),
    ],
    16,
    [...elite, { type: "missing_flag", value: "evento_milei_elon" }],
  ),
);

events.push(
  d(
    "susana_te_llama",
    "Te llama Susana",
    "El teléfono vibra. Es producción de Susana Giménez. Vieron lo del lobo y la motosierra. Quieren 'la nota'. La tele nacional te espera con sonrisa de tiburón.",
    [
      opt("ir", "Ir al living de Susana", [
        delta("capital_social", 20),
        delta("influencia", 15),
        delta("estres", 14),
        flag("salio_en_susana"),
        risk(0.3, [delta("capital_social", -12), flag("escandalo_susana")]),
      ]),
      opt("no", "Declinar con elegancia", [
        delta("influencia", 3),
        delta("bienestar", 4),
        delta("capital_social", 2),
      ]),
    ],
    18,
    [
      { type: "has_flag", value: "llamado_susana_pendiente" },
      { type: "missing_flag", value: "salio_en_susana" },
    ],
  ),
);

events.push(
  d(
    "scioli_consejo",
    "Consejo Scioli",
    "Daniel Scioli te da un consejo en un pasillo: 'en política hay que sonreír siempre'. Después te pide un favor chiquito que no es chiquito.",
    [
      opt("favor", "Hacer el favor", [
        delta("influencia", 7),
        delta("dinero", 40000),
        delta("estres", 7),
        flag("favor_scioli"),
      ]),
      opt("sonreir", "Sonreír y no comprometerte", [
        delta("capital_social", 3),
        delta("bienestar", 2),
      ]),
    ],
    10,
    politico,
  ),
);

events.push(
  d(
    "pichetto_realpolitik",
    "Realpolitik Pichetto",
    "Miguel Ángel Pichetto habla sin filtro. Te ofrece un mapa de alianzas imposibles: 'hoy con este, mañana con el otro'.",
    [
      opt("aprender", "Anotar y aplicar", [
        delta("influencia", 9),
        delta("capital_social", 4),
        delta("estres", 5),
        flag("realpolitik"),
      ]),
      opt("idealista", "Quedarte idealista", [
        delta("capital_social", 6),
        delta("influencia", -2),
        delta("bienestar", 3),
      ]),
    ],
    10,
    [...politico, { type: "influencia_gte", value: 25 }],
  ),
);

events.push(
  d(
    "maximo_unidad",
    "Máximo y la unidad",
    "Máximo Kirchner manda a decir que 'la unidad no se discute'. Te piden bajar un conflicto interno... o inventar uno útil contra el rival.",
    [
      opt("bajar", "Bajar el conflicto", [
        delta("capital_social", 8),
        delta("influencia", 6),
        delta("estres", 6),
        flag("unidad_maximo"),
      ]),
      opt("inventar", "Inventar el rival perfecto", [
        delta("influencia", 10),
        delta("capital_social", -7),
        delta("estres", 11),
        flag("operacion_interna"),
      ]),
    ],
    11,
    [...politico, { type: "influencia_gte", value: 28 }],
  ),
);

events.push(
  d(
    "wado_interior",
    "Wado y el Interior",
    "Wado de Pedro necesita alguien que 'entienda el Interior'. Hay viaje, hotel mediocre y la chance de volver con una red de intendentes amigos.",
    [
      opt("viajar", "Armar la red", [
        delta("dinero", 55000),
        delta("influencia", 11),
        delta("capital_social", 7),
        delta("estres", 10),
        flag("red_interior"),
      ]),
      opt("no", "Quedarte en el conurbano", [delta("bienestar", 2)]),
    ],
    11,
    [...politico, { type: "influencia_gte", value: 32 }],
  ),
);

events.push(
  d(
    "villarruel_senado",
    "Villarruel te mide",
    "Victoria Villarruel quiere perfiles 'firmes' para un discurso de memoria y seguridad. Te preguntan si bancás la línea sin temblar.",
    [
      opt("firmar", "Bancarla sin fisuras", [
        delta("influencia", 10),
        delta("capital_social", -5),
        delta("estres", 9),
        flag("orbita_villarruel"),
      ]),
      opt("dudar", "Pedir matices", [
        delta("capital_social", 4),
        delta("influencia", -3),
        delta("bienestar", 2),
      ]),
    ],
    11,
    [...politico, { type: "influencia_gte", value: 35 }],
  ),
);

events.push(
  d(
    "espert_ajuste",
    "Espert y el Excel",
    "José Luis Espert te tira un monólogo de ajuste, déficit y 'no hay plata'. Después pregunta si sabés leer un presupuesto.",
    [
      opt("leer", "Leer el presupuesto en voz alta", [
        delta("influencia", 8),
        delta("capital_social", 3),
        delta("estres", 7),
        flag("orbita_espert"),
        risk(0.3, [cred("ciencia_politica")]),
      ]),
      opt("pasarla", "Asentir y mirar el reloj", [
        delta("bienestar", 2),
        delta("influencia", -1),
      ]),
    ],
    10,
    [
      { type: "has_credential", value: "secundaria" },
      { type: "influencia_gte", value: 22 },
    ],
  ),
);

events.push(
  d(
    "mayra_conurbano",
    "Mayra y el conurbano",
    "Mayra Mendoza arma una jornada de gestión en el sur. Te ofrecen mostrar un centro barrial... o maquillar los números de asistencia.",
    [
      opt("mostrar", "Mostrar el centro como está", [
        delta("capital_social", 9),
        delta("influencia", 5),
        delta("estres", 5),
        flag("gestion_mayra"),
      ]),
      opt("maquillar", "Maquillar asistencia", [
        delta("dinero", 45000),
        delta("influencia", 9),
        delta("capital_social", -8),
        delta("estres", 10),
        flag("numeros_truchos"),
      ]),
    ],
    11,
    militanteOrFlag,
  ),
);

events.push(
  d(
    "lousteau_radical",
    "Lousteau y la foto radical",
    "Martín Lousteau busca caras nuevas para una foto de 'renovación'. Hay café carísimo y la pregunta de si sabés sonreír sin parecer operador.",
    [
      opt("sonreir", "Sonreír y sumarte", [
        delta("influencia", 7),
        delta("capital_social", 6),
        delta("dinero", 25000),
        delta("estres", 5),
        flag("orbita_lousteau"),
      ]),
      opt("no", "Decir que no sos decorado", [
        delta("capital_social", 3),
        delta("influencia", -2),
      ]),
    ],
    10,
    [
      { type: "has_credential", value: "secundaria" },
      { type: "influencia_gte", value: 18 },
    ],
  ),
);

// =============================================================================
// TRANZAS GENERALES (político mid+)
// =============================================================================
events.push(
  d(
    "sobre_obra_publica",
    "El sobre de la obra",
    "Hay una obra pública fantasma. Un funcionario te ofrece un porcentaje si 'hacés de puente' con el proveedor amigo.",
    [
      opt("puente", "Hacer de puente", [
        delta("dinero", 200000),
        delta("influencia", 8),
        delta("capital_social", -12),
        delta("estres", 15),
        flag("fraude_obra"),
        flag("coimero"),
      ]),
      opt("denunciar", "Grabar y denunciar", [
        delta("capital_social", 10),
        delta("influencia", -6),
        delta("estres", 18),
        flag("denunciante"),
        risk(0.4, [delta("salud", -10), flag("amenaza_politica_flag")]),
      ]),
      opt("no", "Salir caminando", [
        delta("bienestar", 3),
        delta("influencia", -2),
      ]),
    ],
    13,
    [...politico, { type: "influencia_gte", value: 35 }],
  ),
);

events.push(
  d(
    "sindicato_tranza",
    "Tranza gremial",
    "El gremio quiere paz. Vos querés votos. Hay un almuerzo donde se habla de puestos, aportes y 'no joder la parroquia'.",
    [
      opt("tranzar", "Cerrar la tranza", [
        delta("dinero", 90000),
        delta("influencia", 9),
        delta("capital_social", -5),
        delta("estres", 8),
        flag("pacto_gremial"),
      ]),
      opt("pelear", "Pelear la calle", [
        delta("capital_social", 9),
        delta("influencia", 4),
        delta("estres", 12),
        flag("guerra_gremial"),
      ]),
    ],
    12,
    [...politico, { type: "influencia_gte", value: 28 }],
  ),
);

events.push(
  d(
    "lista_testaferro",
    "La lista y el testaferro",
    "Te ofrecen un lugar en la lista... pero figurás vos y decide otro. Plata asegurada, dignidad en cuotas.",
    [
      opt("aceptar", "Aceptar ser testaferro", [
        delta("dinero", 150000),
        delta("influencia", 5),
        delta("capital_social", -9),
        delta("estres", 10),
        flag("testaferro"),
      ]),
      opt("lugar_real", "Pedir lugar real o nada", [
        risk(0.4, [
          delta("influencia", 12),
          delta("capital_social", 6),
          flag("candidato_real"),
        ]),
        risk(0.6, [delta("influencia", -8), delta("estres", 8)]),
      ]),
    ],
    12,
    [...politico, { type: "influencia_gte", value: 40 }],
  ),
);

events.push(
  d(
    "amenaza_oppositor",
    "El mensaje anónimo",
    "Te llega un mensaje: 'dejá de joder el territorio'. Puede ser bluff... o no. La política argentina no perdona a los molestos.",
    [
      opt("seguir", "Seguir igual", [
        delta("estres", 14),
        delta("influencia", 5),
        delta("capital_social", 4),
        risk(0.25, [delta("salud", -15), delta("bienestar", -12)]),
      ]),
      opt("bajar", "Bajar un cambio", [
        delta("influencia", -5),
        delta("estres", -6),
        delta("bienestar", 4),
      ]),
      opt("denunciar", "Denunciar", [
        delta("capital_social", 5),
        delta("estres", 10),
        flag("denuncia_amenaza"),
      ]),
    ],
    12,
    [...politico, { type: "influencia_gte", value: 22 }],
  ),
);

events.push(
  d(
    "periodista_filtracion",
    "El periodista tiene chats",
    "Un periodista de investigación dice tener capturas tuyas. Ofrece 'contexto' a cambio de una exclusiva amable... o te quema.",
    [
      opt("exclusiva", "Dar la exclusiva amable", [
        delta("influencia", 4),
        delta("capital_social", 6),
        delta("estres", 8),
        delta("dinero", -30000),
        flag("pacto_prensa"),
      ]),
      opt("negar", "Negar todo y bancar el temporal", [
        delta("estres", 16),
        delta("capital_social", -10),
        risk(0.45, [flag("escandalo_mediatico"), delta("influencia", -12)]),
        risk(0.2, [flag("juicio_politico_inicio")]),
      ]),
      opt("coima_silencio", "Comprar silencio", [
        delta("dinero", -180000),
        delta("estres", 12),
        delta("capital_social", -4),
        flag("coima_prensa"),
        flag("coimero"),
      ]),
    ],
    13,
    [...politico, { type: "influencia_gte", value: 40 }],
  ),
);

// =============================================================================
// OPERADOR TERRITORIAL
// =============================================================================
events.push(
  d(
    "oferta_concejal",
    "Te tiran concejal",
    "Si cerrás dos tranzas barriales esta semana, el partido te pone en la boleta de concejal. Sucio, rápido, efectivo.",
    [
      opt("cerrar", "Cerrar las tranzas", [
        delta("dinero", 100000),
        delta("influencia", 12),
        delta("capital_social", -7),
        delta("estres", 14),
        flag("tranzas_barriales"),
        risk(0.55, [setJob("concejal")]),
      ]),
      opt("no", "No a ese precio", [
        delta("capital_social", 6),
        delta("influencia", -3),
      ]),
    ],
    14,
    [...operador, { type: "influencia_gte", value: 30 }],
  ),
);

events.push(
  d(
    "op_armado_lista",
    "Armado de lista",
    "Hay que armar la lista del distrito: nombres propios, testaferros y un lugar 'para los que laburan'. Todos te miran.",
    [
      opt("meritocracia", "Priorizar a los que laburan", [
        delta("capital_social", 10),
        delta("influencia", 6),
        delta("estres", 8),
        flag("lista_limpia"),
      ]),
      opt("equilibrio", "Equilibrar favores y mérito", [
        delta("influencia", 9),
        delta("capital_social", 3),
        delta("estres", 7),
        flag("lista_equilibrada"),
      ]),
      opt("vender", "Vender lugares al mejor postor", [
        delta("dinero", 220000),
        delta("influencia", 5),
        delta("capital_social", -14),
        delta("estres", 12),
        flag("lista_vendida"),
        flag("coimero"),
      ]),
    ],
    14,
    operador,
  ),
);

events.push(
  d(
    "op_mesa_dinero",
    "La mesa del dinero",
    "En un departamento sin cartel hay una mesa con fajos. Hay que 'mover' aportes de campaña sin que existan en papel.",
    [
      opt("mover", "Mover la plata", [
        delta("dinero", 120000),
        delta("influencia", 10),
        delta("capital_social", -10),
        delta("estres", 15),
        flag("caja_campana_negra"),
        flag("tranza_electoral"),
      ]),
      opt("no", "Salir antes de ver de más", [
        delta("bienestar", 3),
        delta("influencia", -4),
      ]),
    ],
    13,
    [...operador, { type: "influencia_gte", value: 28 }],
  ),
);

events.push(
  d(
    "op_espionaje",
    "Espionaje de campaña",
    "Te piden infiltrar un acto rival y grabar promesas. Si te agarran, sos 'el operador sucio' del titular.",
    [
      opt("infiltrar", "Infiltrar y grabar", [
        delta("influencia", 11),
        delta("capital_social", -6),
        delta("estres", 13),
        flag("espionaje_campana"),
        risk(0.3, [delta("influencia", -10), flag("quemado_publico")]),
      ]),
      opt("rechazar", "Rechazar el método", [
        delta("capital_social", 5),
        delta("influencia", -3),
      ]),
    ],
    13,
    operador,
  ),
);

events.push(
  d(
    "op_media_training",
    "Media training express",
    "Te meten en un sótano con luces: mirá a cámara, no titubees, nunca digas 'no sé'. El coach cobra en dólares emocionales.",
    [
      opt("entrenar", "Bancarte el entrenamiento", [
        delta("dinero", -35000),
        delta("estres", 8),
        delta("influencia", 7),
        delta("capital_social", 5),
        cred("aptitud_oratoria"),
        flag("media_training"),
      ]),
      opt("improvisar", "Improvisar siempre", [
        delta("bienestar", 2),
        risk(0.4, [delta("capital_social", -6)]),
      ]),
    ],
    12,
    operador,
  ),
);

events.push(
  d(
    "op_iglesia",
    "Pacto con la iglesia del barrio",
    "Un pastor evangélico ofrece votos a cambio de un subsidio 'cultural' y que no los molesten con ruidos.",
    [
      opt("pacto", "Cerrar el pacto", [
        delta("dinero", -40000),
        delta("influencia", 12),
        delta("capital_social", 4),
        delta("estres", 6),
        flag("pacto_religioso"),
      ]),
      opt("no", "No mezclar púlpito y urna", [
        delta("capital_social", 6),
        delta("influencia", -3),
      ]),
    ],
    12,
    operador,
  ),
);

events.push(
  d(
    "op_ascenso_limpio",
    "Ascenso por gestión",
    "El partido dice: si traés tres unidades nuevas sin quilombo mediático, vas a la boleta de concejal. Limpio... en teoría.",
    [
      opt("traer", "Traer las unidades", [
        delta("estres", 12),
        delta("influencia", 10),
        delta("capital_social", 8),
        delta("dinero", -20000),
        flag("unidades_nuevas"),
        risk(0.5, [setJob("concejal"), flag("concejal_por_gestion")]),
      ]),
      opt("atajo", "Comprar adhesiones", [
        delta("dinero", -90000),
        delta("influencia", 8),
        delta("capital_social", -5),
        flag("adhesiones_compradas"),
        risk(0.35, [setJob("concejal")]),
      ]),
    ],
    13,
    [...operador, { type: "influencia_gte", value: 35 }],
  ),
);

// =============================================================================
// CONCEJAL
// =============================================================================
events.push(
  d(
    "con_comision_obras",
    "Comisión de obras",
    "Te toca la comisión de obras. Un constructor amigo del bloque te invita a almorzar. El menú incluye un sobre.",
    [
      opt("sobre", "Aceptar el sobre", [
        delta("dinero", 280000),
        delta("influencia", 6),
        delta("capital_social", -12),
        delta("estres", 14),
        flag("coima_concejal"),
        flag("coimero"),
      ]),
      opt("rechazar", "Rechazar y pedir expediente limpio", [
        delta("capital_social", 9),
        delta("influencia", 4),
        delta("estres", 8),
        flag("concejal_intachable"),
      ]),
      opt("grabar", "Grabar y guardar", [
        delta("estres", 16),
        flag("carpeta_comprometedora"),
        risk(0.35, [delta("salud", -8), flag("amenaza_politica_flag")]),
      ]),
    ],
    14,
    concejal,
  ),
);

events.push(
  d(
    "con_pelea_recinto",
    "Pelea en el recinto",
    "Sesión caliente. Hay insultos, carteles y un micrófono abierto. Te piden que hagas el show o que bajes el tono.",
    [
      opt("show", "Hacer el show", [
        delta("influencia", 10),
        delta("capital_social", 6),
        delta("estres", 11),
        flag("showman_recinto"),
      ]),
      opt("bajar", "Bajar el tono y negociar", [
        delta("influencia", 5),
        delta("capital_social", 8),
        delta("estres", 4),
        flag("negociador_bloque"),
      ]),
    ],
    13,
    concejal,
  ),
);

events.push(
  d(
    "con_denuncia_medio",
    "Te nombran en una nota",
    "Un portal local titula que 'el concejal del barrio' tiene contratos familiares. Puede ser mentira... o no del todo.",
    [
      opt("demandar", "Demandar al medio", [
        delta("dinero", -70000),
        delta("estres", 12),
        delta("influencia", 4),
        flag("demanda_prensa"),
      ]),
      opt("explicar", "Explicar en redes", [
        delta("estres", 10),
        delta("capital_social", 5),
        risk(0.4, [delta("capital_social", -10), flag("escandalo_mediatico")]),
      ]),
      opt("silencio", "Perfil bajo una semana", [
        delta("influencia", -4),
        delta("estres", -3),
        delta("bienestar", 3),
      ]),
    ],
    13,
    concejal,
  ),
);

events.push(
  d(
    "con_aliados_bloque",
    "El bloque te prueba",
    "El jefe de bloque quiere saber si sos soldado o candidato. Te ofrece un proyecto visible... a cambio de callarte tres votaciones.",
    [
      opt("soldado", "Ser soldado tres meses", [
        delta("influencia", 8),
        delta("capital_social", -3),
        delta("estres", 7),
        flag("soldado_bloque"),
      ]),
      opt("candidato", "Negociar tu propio proyecto", [
        risk(0.5, [
          delta("influencia", 12),
          delta("capital_social", 7),
          flag("proyecto_propio"),
        ]),
        risk(0.5, [delta("influencia", -8), flag("aislado_bloque")]),
      ]),
    ],
    13,
    concejal,
  ),
);

events.push(
  d(
    "con_campana_intendente",
    "Corrés a intendente",
    "Los números del distrito dan. El partido te tienta: campaña a intendente. Hay que juntar plata, foto y un poco de alma.",
    [
      opt("lanzar", "Lanzar la campaña", [
        delta("dinero", -200000),
        delta("influencia", 14),
        delta("estres", 16),
        delta("capital_social", 6),
        flag("campana_intendente"),
        risk(0.5, [setJob("intendente"), flag("electo_intendente")]),
      ]),
      opt("tranza", "Campana con plata negra", [
        delta("dinero", -80000),
        delta("influencia", 12),
        delta("capital_social", -9),
        delta("estres", 18),
        flag("campana_intendente"),
        flag("caja_campana_negra"),
        risk(0.6, [setJob("intendente"), flag("electo_intendente")]),
        risk(0.2, [flag("causa_electoral")]),
      ]),
      opt("esperar", "Esperar otro turno", [
        delta("bienestar", 4),
        delta("influencia", -2),
      ]),
    ],
    15,
    [...concejal, { type: "influencia_gte", value: 42 }],
  ),
);

events.push(
  d(
    "con_presupuesto_fantasma",
    "Partida fantasma",
    "En el presupuesto municipal hay una partida que nadie sabe explicar. Te piden que la votes 'por disciplina'.",
    [
      opt("votar", "Votar por disciplina", [
        delta("influencia", 7),
        delta("dinero", 60000),
        delta("capital_social", -8),
        delta("estres", 9),
        flag("voto_fantasma"),
      ]),
      opt("pedir", "Pedir informes", [
        delta("capital_social", 8),
        delta("influencia", -5),
        delta("estres", 10),
        flag("fiscalizador"),
      ]),
    ],
    12,
    concejal,
  ),
);

// =============================================================================
// INTENDENTE
// =============================================================================
events.push(
  d(
    "int_obra_faraonica",
    "La obra faraónica",
    "Querés una obra que se vea desde el satélite. El costo se infla. El contratista sonríe. La oposición ya tiene el título listo.",
    [
      opt("obra", "Hacer la obra igual", [
        delta("dinero", -150000),
        delta("influencia", 12),
        delta("capital_social", 8),
        delta("estres", 14),
        flag("obra_faraonica"),
        risk(0.35, [flag("sobreprecio_obra"), delta("capital_social", -10)]),
      ]),
      opt("modesta", "Obra modesta y contable", [
        delta("capital_social", 10),
        delta("influencia", 5),
        delta("estres", 6),
        flag("gestion_austeridad"),
      ]),
    ],
    14,
    intendente,
  ),
);

events.push(
  d(
    "int_crisis_basura",
    "Crisis de la basura",
    "Los camiones no pasan. El barrio huele a fin de ciclo. El gremio quiere un aumento; vos querés no perder la reelección.",
    [
      opt("pagar", "Cerrar con el gremio", [
        delta("dinero", -120000),
        delta("influencia", 8),
        delta("estres", 10),
        delta("capital_social", 6),
        flag("pacto_basura"),
      ]),
      opt("pelear", "Bancarte el conflicto", [
        delta("capital_social", -12),
        delta("estres", 16),
        delta("influencia", 4),
        flag("guerra_basura"),
        risk(0.3, [delta("bienestar", -10), flag("escandalo_mediatico")]),
      ]),
    ],
    14,
    intendente,
  ),
);

events.push(
  d(
    "int_policia_municipal",
    "Policía municipal",
    "Te ofrecen armar una fuerza municipal 'para el orden'. Hay uniformes nuevos y la tentación de usarlos en la campaña.",
    [
      opt("armar", "Armar la fuerza", [
        delta("dinero", -180000),
        delta("influencia", 11),
        delta("capital_social", -6),
        delta("estres", 12),
        flag("policia_municipal"),
      ]),
      opt("no", "No militarizar el municipio", [
        delta("capital_social", 7),
        delta("influencia", -2),
        delta("bienestar", 3),
      ]),
    ],
    12,
    intendente,
  ),
);

events.push(
  d(
    "int_contrataciones",
    "Contrataciones amigas",
    "Hay que llenar cargos. Primas, cuñados y el hijo del referente aparecen en la lista. La prensa también.",
    [
      opt("amigos", "Acomodar a los amigos", [
        delta("influencia", 10),
        delta("dinero", 90000),
        delta("capital_social", -11),
        delta("estres", 11),
        flag("nepotismo_municipal"),
        flag("coimero"),
      ]),
      opt("concurso", "Concurso público de verdad", [
        delta("capital_social", 12),
        delta("influencia", 3),
        delta("estres", 9),
        flag("concurso_limpio"),
      ]),
    ],
    13,
    intendente,
  ),
);

events.push(
  d(
    "int_visita_gobernador",
    "Visita del gobernador",
    "El gobernador baja al municipio. Quiere foto con tu obra... y que le 'facilites' un padrón para la interna.",
    [
      opt("facilitar", "Facilitar el padrón", [
        delta("influencia", 12),
        delta("capital_social", -7),
        delta("estres", 10),
        flag("favor_gobernador"),
        flag("padron_trucho"),
      ]),
      opt("solo_foto", "Solo la foto y el café", [
        delta("capital_social", 5),
        delta("influencia", 4),
        delta("bienestar", 2),
      ]),
    ],
    13,
    intendente,
  ),
);

events.push(
  d(
    "int_campana_gobernador",
    "Salto a la provincia",
    "Los sondeos te ponen competitivo. Hay que decidir: campaña a gobernador con deuda política... o quedarte rey del distrito.",
    [
      opt("saltar", "Saltar a gobernador", [
        delta("dinero", -400000),
        delta("influencia", 16),
        delta("estres", 18),
        delta("capital_social", 5),
        flag("campana_gobernador"),
        risk(0.45, [setJob("gobernador"), flag("electo_gobernador")]),
      ]),
      opt("sucio", "Campaña con caja negra y padrones", [
        delta("dinero", -150000),
        delta("influencia", 14),
        delta("capital_social", -12),
        delta("estres", 20),
        flag("campana_gobernador"),
        flag("caja_campana_negra"),
        flag("tranza_electoral"),
        risk(0.55, [setJob("gobernador"), flag("electo_gobernador")]),
        risk(0.25, [flag("causa_electoral"), delta("influencia", -15)]),
      ]),
      opt("rey", "Quedarte rey del distrito", [
        delta("bienestar", 6),
        delta("influencia", 3),
        flag("rey_distrito"),
      ]),
    ],
    16,
    [...intendente, { type: "influencia_gte", value: 55 }],
  ),
);

// =============================================================================
// GOBERNADOR — camino a la Rosada
// =============================================================================
events.push(
  d(
    "gob_ajuste_vs_gasto",
    "Ajuste vs gasto",
    "La caja provincial sangra. El ministro de Economía pide ajuste; los intendentes piden obra. Vos tenés que elegir el relato.",
    [
      opt("ajuste", "Ajuste con relato duro", [
        delta("influencia", 8),
        delta("capital_social", -10),
        delta("estres", 14),
        flag("gobernador_ajuste"),
      ]),
      opt("gasto", "Gasto y presencia territorial", [
        delta("dinero", -250000),
        delta("capital_social", 12),
        delta("influencia", 6),
        delta("estres", 12),
        flag("gobernador_gasto"),
      ]),
    ],
    14,
    gobernador,
  ),
);

events.push(
  d(
    "gob_pelea_nacion",
    "Pelea con Nación",
    "Casa Rosada corta fondos. En Twitter te pelean. En el interior te piden que 'les digas de todo'.",
    [
      opt("pelear", "Pelear en vivo", [
        delta("influencia", 12),
        delta("capital_social", 8),
        delta("estres", 15),
        flag("pelea_nacion"),
      ]),
      opt("negociar", "Negociar en silencio", [
        delta("dinero", 180000),
        delta("influencia", 6),
        delta("capital_social", -3),
        delta("estres", 8),
        flag("pacto_nacion"),
      ]),
    ],
    14,
    gobernador,
  ),
);

events.push(
  d(
    "gob_medios_nacionales",
    "Los medios nacionales",
    "Te citan a un ciclo de entrevistas. Un periodista trae carpeta. Otro trae elogios. El rating no perdona.",
    [
      opt("carpeta", "Enfrentar la carpeta", [
        delta("estres", 16),
        delta("influencia", 10),
        delta("capital_social", 5),
        risk(0.35, [flag("escandalo_mediatico"), delta("capital_social", -12)]),
        risk(0.2, [flag("juicio_politico_inicio")]),
      ]),
      opt("elogios", "Bancarte el ciclo amable", [
        delta("capital_social", 10),
        delta("influencia", 7),
        delta("estres", 6),
        flag("honeymoon_medios"),
      ]),
    ],
    13,
    gobernador,
  ),
);

events.push(
  d(
    "gob_lanza_campana",
    "Lanzamiento presidencial",
    "En un estadio chico, con humo y LED, lanzás la precandidatura. El partido tiembla. La oposición sonríe. Empieza el juego grande.",
    [
      opt("lanzar", "Lanzar la precandidatura", [
        delta("dinero", -500000),
        delta("influencia", 18),
        delta("estres", 18),
        delta("capital_social", 10),
        flag("precandidato_presidente"),
        flag("campana_presidencial"),
      ]),
      opt("esperar", "Esperar mejores encuestas", [
        delta("bienestar", 4),
        delta("influencia", -3),
      ]),
    ],
    16,
    [
      ...gobernador,
      { type: "influencia_gte", value: 65 },
      { type: "missing_flag", value: "campana_presidencial" },
    ],
  ),
);

events.push(
  d(
    "gob_debate_tv",
    "Debate en vivo",
    "Luces, reloj y un moderador que odia los silencios. El rival te acusa de coimas. La gente en casa tiene el control remoto listo.",
    [
      opt("duro", "Salir a matar", [
        delta("influencia", 14),
        delta("capital_social", 6),
        delta("estres", 16),
        flag("debate_ganado"),
        risk(0.25, [delta("capital_social", -8), flag("debate_exceso")]),
      ]),
      opt("tecnico", "Ir técnico y aburrido", [
        delta("influencia", 6),
        delta("capital_social", 4),
        delta("estres", 8),
        flag("debate_tecnico"),
      ]),
      opt("humano", "Contar el origen cartonero", [
        delta("capital_social", 14),
        delta("influencia", 8),
        delta("estres", 10),
        flag("debate_origen"),
      ]),
    ],
    15,
    [
      ...gobernador,
      { type: "has_flag", value: "campana_presidencial" },
    ],
  ),
);

events.push(
  d(
    "gob_acusacion_fraude",
    "Acusación de fraude",
    "Sale una denuncia: padrones hinchados, cajas negras, 'el gobernador que viene del barrio'. Puede ser operación... o tu historial.",
    [
      opt("negar", "Negar y denunciar lawfare", [
        delta("estres", 18),
        delta("influencia", 8),
        delta("capital_social", -6),
        flag("denuncia_lawfare"),
        risk(0.3, [flag("escandalo_mediatico")]),
        risk(0.15, [flag("juicio_politico_inicio")]),
      ]),
      opt("limpiar", "Abrir tus cuentas y bancar el costo", [
        delta("dinero", -200000),
        delta("capital_social", 10),
        delta("estres", 14),
        delta("influencia", 5),
        flag("transparencia_forzada"),
        risk(0.25, [
          unflag("caja_campana_negra"),
          unflag("padron_trucho"),
          delta("influencia", -8),
        ]),
      ]),
      opt("pacto", "Pactar silencio con la otra bancada", [
        delta("dinero", -300000),
        delta("influencia", 6),
        delta("capital_social", -10),
        delta("estres", 12),
        flag("pacto_silencio_fraude"),
        flag("coimero"),
      ]),
    ],
    15,
    [
      ...gobernador,
      { type: "has_flag", value: "campana_presidencial" },
    ],
  ),
);

events.push(
  d(
    "gob_pacto_oposicion",
    "Pacto con la oposición",
    "Un operador de la otra vereda ofrece un acuerdo: ustedes no se pisan en tres provincias, y después 'se habla' de gabinete.",
    [
      opt("pactar", "Cerrar el pacto", [
        delta("influencia", 12),
        delta("capital_social", -5),
        delta("estres", 10),
        flag("pacto_oposicion"),
        flag("realpolitik"),
      ]),
      opt("solo", "Ir solo hasta el final", [
        delta("capital_social", 8),
        delta("influencia", 4),
        delta("estres", 12),
        flag("campana_solitaria"),
      ]),
    ],
    14,
    [
      ...gobernador,
      { type: "has_flag", value: "campana_presidencial" },
    ],
  ),
);

events.push(
  d(
    "gob_milei_ataque",
    "Milei te apunta",
    "En un streaming, Milei te llama 'la casta reciclada'. El chat explota. Tus asesores piden respuesta o silencio estratégico.",
    [
      opt("responder", "Responder con todo", [
        delta("influencia", 10),
        delta("capital_social", 7),
        delta("estres", 14),
        flag("pelea_milei"),
      ]),
      opt("silencio", "Silencio y gestión", [
        delta("bienestar", 4),
        delta("influencia", 3),
        delta("estres", 5),
        flag("perfil_estadista"),
      ]),
      opt("humor", "Respuesta con humor de barrio", [
        delta("capital_social", 12),
        delta("influencia", 6),
        delta("estres", 8),
        flag("relato_origen"),
      ]),
    ],
    14,
    [
      ...gobernador,
      { type: "has_flag", value: "campana_presidencial" },
    ],
  ),
);

events.push(
  d(
    "gob_noche_electoral",
    "Noche electoral",
    "Boletines, café frío y un Excel que tiembla. A las 21:40 el escrutinio te pone al borde. Una provincia puede decidirlo todo.",
    [
      opt("esperar_limpio", "Esperar el escrutinio limpio", [
        delta("estres", 20),
        risk(0.48, [
          setJob("presidente"),
          flag("victoria_electoral"),
          flag("asumio_presidencia"),
          delta("influencia", 20),
          delta("capital_social", 15),
        ]),
        risk(0.52, [
          flag("derrota_electoral"),
          delta("influencia", -12),
          delta("capital_social", -8),
          delta("bienestar", -10),
          delta("estres", 10),
        ]),
      ]),
      opt("operar", "Operar mesas dudosas", [
        delta("estres", 22),
        delta("capital_social", -14),
        flag("tranza_electoral"),
        risk(0.58, [
          setJob("presidente"),
          flag("victoria_electoral"),
          flag("asumio_presidencia"),
          flag("victoria_manchada"),
          delta("influencia", 16),
        ]),
        risk(0.3, [
          flag("fraude_descubierto"),
          flag("juicio_politico_inicio"),
          flag("derrota_electoral"),
          delta("influencia", -20),
          delta("capital_social", -18),
        ]),
      ]),
      opt("conceder", "Conceder temprano y salir parado", [
        flag("derrota_digna"),
        delta("capital_social", 10),
        delta("influencia", -6),
        delta("estres", -8),
        delta("bienestar", 6),
      ]),
    ],
    18,
    [
      ...gobernador,
      { type: "has_flag", value: "campana_presidencial" },
      { type: "influencia_gte", value: 70 },
      { type: "missing_flag", value: "victoria_electoral" },
      { type: "missing_flag", value: "derrota_electoral" },
      { type: "missing_flag", value: "derrota_digna" },
    ],
  ),
);

events.push(
  d(
    "gob_ballotage",
    "Balotaje",
    "Nadie llegó al 45. Hay dos semanas de infierno: pactos, spots y tu cara en todos los colectivos del país.",
    [
      opt("pactar_centro", "Pactar con el centro", [
        delta("dinero", -200000),
        delta("influencia", 12),
        delta("capital_social", 4),
        delta("estres", 14),
        flag("pacto_ballotage"),
        risk(0.55, [
          setJob("presidente"),
          flag("victoria_electoral"),
          flag("asumio_presidencia"),
        ]),
        risk(0.45, [
          flag("derrota_electoral"),
          delta("influencia", -10),
          delta("bienestar", -8),
        ]),
      ]),
      opt("base", "Ir a fondo con tu base", [
        delta("capital_social", 12),
        delta("influencia", 8),
        delta("estres", 16),
        flag("ballotage_base"),
        risk(0.42, [
          setJob("presidente"),
          flag("victoria_electoral"),
          flag("asumio_presidencia"),
        ]),
        risk(0.58, [flag("derrota_electoral"), delta("capital_social", -6)]),
      ]),
    ],
    17,
    [
      ...gobernador,
      { type: "has_flag", value: "campana_presidencial" },
      { type: "has_flag", value: "derrota_electoral" },
      { type: "missing_flag", value: "victoria_electoral" },
      { type: "missing_flag", value: "derrota_digna" },
      { type: "influencia_gte", value: 60 },
    ],
  ),
);

// =============================================================================
// CAÍDAS / ESCÁNDALOS (flags de clímax → endings)
// =============================================================================
events.push(
  d(
    "juicio_politico_cierre",
    "Juicio político",
    "El Congreso avanza. Hay votos, traiciones y una sesión que dura toda la noche. Tu carrera puede terminar en un pasillo.",
    [
      opt("defender", "Defenderte hasta el final", [
        delta("estres", 22),
        risk(0.4, [
          delta("influencia", 8),
          delta("capital_social", 5),
          flag("sobrevivio_juicio"),
          unflag("juicio_politico_inicio"),
        ]),
        risk(0.6, [flag("juicio_politico_perdido"), delta("influencia", -25)]),
      ]),
      opt("renunciar", "Renunciar y salvar algo", [
        flag("renuncia_forzada"),
        delta("capital_social", -8),
        delta("influencia", -15),
        delta("estres", -10),
        delta("bienestar", -6),
      ]),
    ],
    16,
    [
      { type: "has_flag", value: "juicio_politico_inicio" },
      { type: "missing_flag", value: "juicio_politico_perdido" },
      { type: "missing_flag", value: "sobrevivio_juicio" },
      { type: "missing_flag", value: "renuncia_forzada" },
    ],
  ),
);

events.push(
  d(
    "fraude_caida",
    "El fraude sale a la luz",
    "Una causa federal abre carpetas. Padrones, cajas y chats. El fiscal sonríe para la cámara. Vos tenés horas, no días.",
    [
      opt("bancarla", "Bancarla en el país", [
        delta("estres", 20),
        delta("capital_social", -15),
        risk(0.55, [flag("juicio_politico_perdido")]),
        risk(0.45, [flag("sobrevivio_juicio"), delta("influencia", -10)]),
      ]),
      opt("fuga", "Salir del país 'a dar una conferencia'", [
        flag("fuga_exterior"),
        delta("dinero", -500000),
        delta("influencia", -20),
        delta("capital_social", -20),
      ]),
    ],
    15,
    [
      { type: "has_flag", value: "fraude_descubierto" },
      { type: "missing_flag", value: "fuga_exterior" },
      { type: "missing_flag", value: "juicio_politico_perdido" },
    ],
  ),
);

writeFileSync(OUT, JSON.stringify(events, null, 2) + "\n");
console.log("politica events", events.length);
