import { writeFileSync } from "fs";

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
const risk = (c, effects) => ({ type: "risk", chance: c, effects });
const setJob = (job_id) => ({ type: "set_job", job_id });

const politico = [{ type: "job_tag", value: "politico" }];
const militante = [{ type: "job_id", value: "militante_barrial" }];
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

// === MISIONES MILITANTE ===
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
        risk(0.35, [setJob("operador_territorial")]),
      ]),
      opt("no", "Decir que no bancás eso", [
        delta("capital_social", 5),
        delta("influencia", -4),
      ]),
    ],
    12,
    [
      ...militanteOrFlag,
      { type: "influencia_gte", value: 18 },
    ],
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
    [{ type: "capital_social", /* invalid */ }],
  ),
);

// Fix grabois - I made an error with invalid condition. Will fix in final array.
events.pop();

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
    [
      ...politico,
      { type: "has_credential", value: "secundaria" },
    ],
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
        risk(0.4, [delta("influencia", -6), flag("díscolo")]),
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
    [
      ...politico,
      { type: "influencia_gte", value: 30 },
    ],
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
    [
      ...elite,
      { type: "missing_flag", value: "evento_milei_elon" },
    ],
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
    [
      ...politico,
      { type: "influencia_gte", value: 35 },
    ],
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
    [
      ...politico,
      { type: "influencia_gte", value: 28 },
    ],
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
    [
      ...politico,
      { type: "influencia_gte", value: 40 },
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
    [
      ...politico,
      { type: "influencia_gte", value: 25 },
    ],
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
      opt("limpio", "Padron limpio", [
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
        risk(0.5, [setJob("concejal")]),
      ]),
      opt("no", "No a ese precio", [
        delta("capital_social", 6),
        delta("influencia", -3),
      ]),
    ],
    14,
    [
      { type: "job_id", value: "operador_territorial" },
      { type: "influencia_gte", value: 30 },
    ],
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
    [
      ...politico,
      { type: "influencia_gte", value: 22 },
    ],
  ),
);

writeFileSync(
  "src/data/politica-events.json",
  JSON.stringify(events, null, 2) + "\n",
);
console.log("politica events", events.length);
