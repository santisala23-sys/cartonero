import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "data", "actualidad-events.json");

const d = (id, titulo, texto, opciones, peso = 10, condiciones = []) => ({
  id: "act_" + id,
  titulo,
  texto,
  peso,
  condiciones,
  opciones,
});

const opt = (id, label, efectos) => ({ id, label, efectos });
const delta = (metric, amount) => ({ type: "delta", metric, amount });
const flag = (value) => ({ type: "add_flag", value });
const unflag = (value) => ({ type: "remove_flag", value });
const cred = (value) => ({ type: "add_credential", value });
const risk = (chance, effects) => ({ type: "risk", chance, effects });

const events = [];
const add = (id, titulo, texto, opciones, peso = 10, condiciones = []) => {
  events.push(d(id, titulo, texto, opciones, peso, condiciones));
};

// --- Required themed events ---
add(
  "beltran_briones",
  "Capacitacion express: Beltran Briones",
  "Beltran Briones da una capacitacion de dos semanas sobre Negocios Inmobiliarios Digitales. Zoom, leads y la promesa de vender depas sin salir del living. Cupos limitados y un precio que duele.",
  [
    opt("anotarse", "Anotarte (cuesta plata y nervios)", [
      delta("dinero", -45000),
      delta("estres", 10),
      delta("capital_social", 6),
      delta("influencia", 3),
      cred("curso_inmobiliario_digital"),
      flag("alumno_beltran"),
    ]),
    opt("mirar_desde_afuera", "Seguir scrolleando", [delta("bienestar", 2)]),
  ],
  12,
);

add(
  "wanda_academia",
  "Academia Wanda",
  "Wanda Nara abre su academia de influencers digitales. Filtros, personal branding y la teoria del contenido que convierte. Hay fila de pibes con ring light.",
  [
    opt("inscribirse", "Inscribirte", [
      delta("dinero", -60000),
      delta("estres", 8),
      delta("capital_social", 10),
      delta("influencia", 5),
      cred("academia_influencers_wanda"),
      flag("alumno_wanda"),
    ]),
    opt("bardear", "Bardear en stories anonimas", [
      delta("capital_social", -4),
      delta("bienestar", 3),
      risk(0.3, [delta("influencia", -5), flag("cancelado_wanda")]),
    ]),
  ],
  12,
);

add(
  "guido_changuito",
  "Por el changuito",
  "Te anotas al programa de Guido Kaczka. Hay changuito, preguntas boludas y la chance de llevarte un plasma o volver con un mate listo y la verguenza.",
  [
    opt("jugar", "Jugar en vivo", [
      risk(0.45, [
        delta("dinero", 180000),
        delta("capital_social", 12),
        delta("influencia", 6),
        flag("gano_changuito"),
      ]),
      risk(0.55, [
        delta("capital_social", 4),
        delta("estres", 8),
        delta("bienestar", -4),
      ]),
    ]),
    opt("no_da", "Rajas antes de salir al aire", [
      delta("estres", -3),
      delta("bienestar", 2),
    ]),
  ],
  11,
);

add(
  "ivan_de_pineda",
  "Ivan de Pineda en el boliche",
  "Te cruzas a Ivan de Pineda en el boliche y pegan onda. Habla bajito, sonrie de comercial y el DJ pone algo que no es cumbia. Tenes una ventana de 40 segundos.",
  [
    opt("ocho_escalones", "Pedirle entrar a Los 8 Escalones", [
      risk(0.4, [
        delta("capital_social", 14),
        delta("influencia", 8),
        delta("estres", 6),
        flag("candidato_8_escalones"),
      ]),
      risk(0.6, [
        delta("capital_social", 3),
        delta("bienestar", -4),
        delta("estres", 5),
      ]),
    ]),
    opt("pedir_mangos", "Pedirle unos mangos: estas complicado", [
      risk(0.35, [
        delta("dinero", 80000),
        delta("capital_social", 2),
        delta("bienestar", -2),
      ]),
      risk(0.65, [
        delta("capital_social", -8),
        delta("estres", 10),
        delta("bienestar", -6),
      ]),
    ]),
    opt(
      "politica_irlandesa",
      "No pedirle nada: hablan de politica irlandesa toda la noche",
      [
        delta("capital_social", 15),
        delta("influencia", 4),
        delta("bienestar", 8),
        delta("estres", -4),
        flag("amigo_ivan_pineda"),
      ],
    ),
  ],
  14,
);

// Fix accents via Unicode escapes for the 4 required events after push
function patchRequiredCopy() {
  const byId = Object.fromEntries(events.map((e) => [e.id, e]));
  Object.assign(byId.act_beltran_briones, {
    titulo: "Capacitaci\u00f3n express: Beltr\u00e1n Briones",
    texto:
      "Beltr\u00e1n Briones da una capacitaci\u00f3n de dos semanas sobre Negocios Inmobiliarios Digitales. Zoom, leads y la promesa de vender depas sin salir del living. Cupos limitados y un precio que duele.",
  });
  byId.act_beltran_briones.opciones[0].label = "Anotarte (cuesta plata y nervios)";

  Object.assign(byId.act_wanda_academia, {
    titulo: "Academia Wanda",
    texto:
      "Wanda Nara abre su academia de influencers digitales. Filtros, personal branding y la teor\u00eda del contenido que convierte. Hay fila de pibes con ring light.",
  });
  byId.act_wanda_academia.opciones[1].label = "Bardear en stories an\u00f3nimas";

  Object.assign(byId.act_guido_changuito, {
    titulo: "Por el changuito",
    texto:
      "Te anot\u00e1s al programa de Guido Kaczka. Hay changuito, preguntas boludas y la chance de llevarte un plasma o volver con un mate listo y la verg\u00fcenza.",
  });
  byId.act_guido_changuito.opciones[1].label = "Raj\u00e1s antes de salir al aire";

  Object.assign(byId.act_ivan_de_pineda, {
    titulo: "Iv\u00e1n de Pineda en el boliche",
    texto:
      "Te cruz\u00e1s a Iv\u00e1n de Pineda en el boliche y pegan onda. Habla bajito, sonr\u00ede de comercial y el DJ pone algo que no es cumbia. Ten\u00e9s una ventana de 40 segundos.",
  });
  byId.act_ivan_de_pineda.opciones[1].label =
    "Pedirle unos mangos: est\u00e1s complicado";
  byId.act_ivan_de_pineda.opciones[2].label =
    "No pedirle nada: hablan de pol\u00edtica irlandesa toda la noche";
}

const handcrafted = [
  ["barra_boca", "La 12 te mira", "En la Bombonera alguien te pasa una remera y te pregunta si vas a bancar de verdad o sos turista del Twitter.", [
    opt("sumarte", "Sumarte a la barra", [delta("capital_social", 8), delta("estres", 12), delta("salud", -4), flag("barra_boca"), flag("hincha_activo")]),
    opt("solo_alentar", "Alentar desde el popular y chau", [delta("capital_social", 3), delta("bienestar", 4)]),
  ]],
  ["barra_river", "El Monumental vibra", "Los borrachos del Monumental te ofrecen un lugar en la fila. Huele a bengala y a decisi\u00f3n irreversible.", [
    opt("entrar", "Entrar a la confianza", [delta("capital_social", 8), delta("estres", 11), delta("salud", -3), flag("barra_river"), flag("hincha_activo")]),
    opt("no", "Decir que tu vieja te espera", [delta("bienestar", 2), delta("capital_social", -2)]),
  ]],
  ["roman_riquelme", "Aparece Rom\u00e1n", "Juan Rom\u00e1n Riquelme est\u00e1 en un asado de dirigentes. Te mira como si ya hubiera visto tu CV en 2001. Boca late en el living.", [
    opt("acercarte", "Acercarte con respeto", [delta("capital_social", 10), delta("influencia", 8), flag("saludo_roman")]),
    opt("pedir_laburo", "Tirar que busc\u00e1s laburo en el club", [
      risk(0.4, [delta("influencia", 12), delta("capital_social", 6), flag("contacto_boca")]),
      risk(0.6, [delta("capital_social", -5), delta("estres", 6)]),
    ]),
  ]],
  ["san_lorenzo_boedo", "San Lorenzo y los cuervos", "En un local de Boedo hablan de refundar el club, de la cancha y de un Rom\u00e1n que entiende el barrio. Hay vino tinto y proyectos en servilletas.", [
    opt("militar_cuervo", "Militar la lista barrial", [delta("capital_social", 9), delta("influencia", 7), delta("estres", 7), flag("militante_san_lorenzo")]),
    opt("escuchar", "Escuchar y no firmar nada", [delta("bienestar", 3), delta("capital_social", 2)]),
  ]],
  ["presidencia_club_chico", "Presidencia de un club de barrio", "Te ofrecen ser presidente de un club de barrio: cancha de tierra, deuda de luz y una elecci\u00f3n con 40 votos. Es poder... de otro estilo.", [
    opt("aceptar", "Aceptar la presidencia", [delta("influencia", 10), delta("capital_social", 12), delta("estres", 14), delta("dinero", -30000), flag("presidente_club_barrio")]),
    opt("declinar", "Declinar con elegancia", [delta("capital_social", 2)]),
  ]],
  ["elecciones_boca", "Interna en Boca", "Hay lista, hay WhatsApp y hay un asado donde se decide el futuro. Te piden que traigas gente.", [
    opt("traer_gente", "Traer un bondi de votantes", [delta("influencia", 9), delta("capital_social", 6), delta("estres", 10), delta("dinero", -20000), flag("operador_boca")]),
    opt("no_te_metas", "No te metas en esa", [delta("bienestar", 4), delta("estres", -2)]),
  ]],
  ["scaloni_charla", "Charla de Scaloni", "Te cuelas a una charla motivacional donde Scaloni habla del grupo y de no vender humo. Hasta el utilero llora.", [
    opt("tomar_nota", "Tomar nota como si fuera un MBA", [delta("bienestar", 10), delta("estres", -8), delta("capital_social", 5), flag("motivado_scaloni")]),
    opt("selfi", "Selfie y story", [delta("capital_social", 7), delta("influencia", 3)]),
  ]],
  ["messi_intermiami", "Fiebre Inter Miami", "Todo el mundo habla de Messi en Miami. Un amigo te ofrece un viaje trucho a verlo. Hay cuotas y un PDF sospechoso.", [
    opt("viajar", "Comprar el paquete", [
      delta("dinero", -220000),
      risk(0.5, [delta("capital_social", 15), delta("bienestar", 12), flag("vio_messi_miami")]),
      risk(0.5, [delta("capital_social", -6), delta("estres", 12), delta("bienestar", -8)]),
    ]),
    opt("ver_por_tv", "Verlo por TV con birra", [delta("bienestar", 6), delta("dinero", -5000)]),
  ]],
  ["maradona_aniversario", "Aniversario Diego", "Hay murales, banderas y un asado en honor a Maradona. Te piden una palabra en el micr\u00f3fono.", [
    opt("hablar", "Hablar desde el coraz\u00f3n", [delta("capital_social", 11), delta("influencia", 4), delta("bienestar", 6)]),
    opt("callado", "Quedarte callado y brindar", [delta("bienestar", 4), delta("capital_social", 2)]),
  ]],
  ["noche_libertadores", "Noche de Libertadores", "La tele tiembla, el vecino grita y vos ten\u00e9s que decidir si vas a la cancha o te qued\u00e1s a no dormir igual.", [
    opt("cancha", "Ir a la cancha cueste lo que cueste", [delta("dinero", -35000), delta("estres", 15), delta("capital_social", 12), delta("salud", -5), flag("noche_libertadores")]),
    opt("living", "Verlo en el living con pizza", [delta("dinero", -8000), delta("bienestar", 5), delta("estres", 8)]),
  ], 13],
  ["hacerse_socio", "Hacerse socio", "El club te ofrece cuota, carnet y la promesa de platea en 2031. La fila es eterna y el PDF de beneficios es un ensayo.", [
    opt("socio", "Sacarte el carnet", [delta("dinero", -25000), delta("capital_social", 8), delta("influencia", 3), flag("socio_club")]),
    opt("despues", "Decir que volv\u00e9s el mes que viene", [delta("bienestar", 1)]),
  ]],
  ["fantasy_plantel", "Fantasy de la fecha", "Arm\u00e1s el plantel del fantasy y tu cu\u00f1ado te bardea porque pusiste al arquero del Ascenso.", [
    opt("allin", "All-in en el 9 caliente", [
      risk(0.4, [delta("dinero", 40000), delta("capital_social", 6), flag("rey_fantasy")]),
      risk(0.6, [delta("dinero", -15000), delta("estres", 7), delta("bienestar", -3)]),
    ]),
    opt("conservador", "Armar seguro y dormir", [delta("bienestar", 3), delta("estres", -2)]),
  ]],
  ["elecciones_river", "Elecciones en River", "Hay lista oficial, lista opositora y un grupo de WhatsApp que se prende fuego. Te piden que milites.", [
    opt("militar", "Militar con remera y termo", [delta("influencia", 8), delta("capital_social", 5), delta("estres", 9), flag("operador_river")]),
    opt("neutral", "Quedarte en el medio", [delta("bienestar", 2)]),
  ]],
  ["lali_show", "Lali en el Movistar", "Hay entradas a precio de ri\u00f1\u00f3n. Tu grupo insiste: es cultural. El QR parpadea como amenaza.", [
    opt("comprar", "Comprar la entrada", [delta("dinero", -90000), delta("bienestar", 12), delta("capital_social", 8), flag("fue_a_lali")]),
    opt("stream", "Ver el aftermovie en Instagram", [delta("bienestar", 2), delta("capital_social", -2)]),
  ]],
  ["bizarrap_session", "Rumores de Bzrp", "Circula que Bizarrap graba sesi\u00f3n con alguien imposible. Un amigo sweare que tiene el dato.", [
    opt("filtrar", "Difundir el rumor", [
      risk(0.5, [delta("influencia", 8), delta("capital_social", 5), flag("filtrador_bzrp")]),
      risk(0.5, [delta("influencia", -6), delta("estres", 8)]),
    ]),
    opt("callar", "Guardarte el dato", [delta("bienestar", 3)]),
  ]],
  ["duki_estadio", "Duki llena todo", "Te ofrecen ir al show de Duki con una entrada de un primo. Suena a trucho y a \u00e9pica.", [
    opt("ir", "Ir igual", [
      delta("dinero", -55000),
      risk(0.6, [delta("bienestar", 14), delta("capital_social", 10), flag("fue_a_duki")]),
      risk(0.4, [delta("estres", 12), delta("bienestar", -6), delta("dinero", -10000)]),
    ]),
    opt("no", "Quedarte a escuchar el \u00e1lbum", [delta("bienestar", 5)]),
  ]],
  ["tini_after", "After de Tini", "Alguien dice que hay after de Tini y que conoce a alguien. La noche se estira.", [
    opt("after", "Ir al after", [delta("dinero", -40000), delta("estres", 6), delta("capital_social", 9), delta("salud", -4), risk(0.35, [flag("foto_con_tini"), delta("influencia", 6)])]),
    opt("casa", "Casa y t\u00e9", [delta("bienestar", 4), delta("estres", -3)]),
  ]],
  ["malba_domingo", "Domingo en el MALBA", "Hay muestra nueva, cola de influencers y un caf\u00e9 a precio de obra. Te sent\u00eds culto por 40 minutos.", [
    opt("entrar", "Entrar a la muestra", [delta("dinero", -12000), delta("bienestar", 8), delta("influencia", 3), flag("visitante_malba")]),
    opt("selfie_afuera", "Selfie en la escalera y chau", [delta("capital_social", 4), delta("bienestar", 2)]),
  ]],
  ["teatro_corrientes", "Teatro por Corrientes", "Hay 2x1 y una obra que todo el mundo vio. Tu ex est\u00e1 en la fila. El destino es un productor chanta.", [
    opt("obra", "Ver la obra", [delta("dinero", -18000), delta("bienestar", 7), delta("capital_social", 4), risk(0.3, [delta("estres", 8), flag("cruzaste_ex_teatro")])]),
    opt("bar", "Bar de la esquina", [delta("bienestar", 4), delta("dinero", -6000)]),
  ]],
  ["pena_folklore", "Pe\u00f1a folkl\u00f3rica", "Guitarra, vino y alguien que pide zamba. Te ofrecen el micr\u00f3fono aunque no sepas la letra.", [
    opt("cantar", "Cantar igual", [delta("capital_social", 8), delta("bienestar", 7), delta("estres", 5), flag("canto_en_pena")]),
    opt("aplaudir", "Aplaudir con alma", [delta("bienestar", 4), delta("capital_social", 2)]),
  ]],
  ["bailanta_cumbia", "Noche de cumbia", "La bailanta est\u00e1 a full. Huele a perfume barato y a decisi\u00f3n. El DJ mira como un juez.", [
    opt("bailar", "Bailar hasta que duela", [delta("bienestar", 10), delta("salud", -3), delta("dinero", -15000), delta("capital_social", 6)]),
    opt("borde", "Quedarte en el borde con una birra", [delta("bienestar", 3), delta("dinero", -5000)]),
  ]],
  ["mirtha_almuerzo", "Almuerzo con Mirtha", "Te invitan de p\u00fablico al almuerzo de Mirtha. Hay mesaza, tensioncita y la chance de salir en c\u00e1mara comiendo pan.", [
    opt("ir", "Ir de p\u00fablico", [delta("capital_social", 10), delta("estres", 8), delta("influencia", 5), risk(0.2, [flag("saliste_en_mirtha"), delta("influencia", 8)])]),
    opt("ver_tv", "Verlo por TV con ensalada", [delta("bienestar", 3)]),
  ]],
  ["tinelli_casting", "Casting de Tinelli", "Hay casting para un segmento imposible. Te piden bailar, llorar y tener historia.", [
    opt("casting", "Anotar al casting", [
      delta("estres", 12),
      risk(0.35, [delta("capital_social", 14), delta("influencia", 10), delta("dinero", 50000), flag("paso_tinelli")]),
      risk(0.65, [delta("bienestar", -6), delta("capital_social", 2)]),
    ]),
    opt("no", "No es lo tuyo", [delta("bienestar", 2)]),
  ]],
  ["susana_entrevista", "Susana te apunta", "En un evento Susana Gim\u00e9nez pasa cerca. El micr\u00f3fono parece un arma y alguien te empuja.", [
    opt("hablar", "Decir algo memorable", [
      risk(0.4, [delta("influencia", 12), delta("capital_social", 8), flag("mencion_susana")]),
      risk(0.6, [delta("capital_social", -5), delta("estres", 10)]),
    ]),
    opt("sonreir", "Sonre\u00edr y no existir", [delta("bienestar", 2)]),
  ]],
  ["fantino_radio", "Fantino al aire", "En la radio Fantino pide opiniones de oyentes. Tu dedo tiembla sobre el bot\u00f3n de WhatsApp.", [
    opt("audios", "Mandar un audio largo", [
      risk(0.45, [delta("influencia", 7), delta("capital_social", 6), flag("salio_en_fantino")]),
      risk(0.55, [delta("estres", 8), delta("bienestar", -3)]),
    ]),
    opt("escuchar", "Solo escuchar", [delta("bienestar", 2)]),
  ]],
  ["wanda_icardi_trend", "Wanda vs Icardi trending", "Twitter arde. Te piden take caliente. El algoritmo sonr\u00ede con sangre.", [
    opt("take", "Subir un take picante", [delta("influencia", 6), delta("capital_social", 4), risk(0.4, [delta("estres", 10), flag("cancelado_wanda_icardi")])]),
    opt("mute", "Mutear el trend", [delta("estres", -5), delta("bienestar", 4)]),
  ]],
  ["streamer_collab", "Collab con streamer", "Un streamer mediano te invita a una partida. Hay 800 viewers y tu micr\u00f3fono suena a mate.", [
    opt("aceptar", "Entrar al stream", [delta("capital_social", 9), delta("influencia", 6), delta("estres", 7), risk(0.3, [flag("clip_viral"), delta("influencia", 8)])]),
    opt("declinar", "Declinar por laburo", [delta("bienestar", 2)]),
  ]],
  ["dolar_blue_esquina", "El blue en la esquina", "Hay cueva, cola y un tipo que dice el n\u00famero como si rezara. Tu bolsillo tiembla.", [
    opt("cambiar", "Cambiar un poco", [
      delta("dinero", -50000),
      risk(0.55, [delta("dinero", 58000), delta("estres", 6)]),
      risk(0.45, [delta("estres", 12), delta("bienestar", -5), flag("mala_cueva")]),
    ]),
    opt("no", "Seguir con los pesos", [delta("estres", 3)]),
  ]],
  ["prepag_aumento", "Aumento de prepaga", "Llega el mail: tu prepaga aument\u00f3 otra vez. El PDF explica contexto macro con cari\u00f1o corporativo.", [
    opt("pagar", "Pagar apretando los dientes", [delta("dinero", -40000), delta("estres", 8), delta("salud", 2)]),
    opt("cambiar", "Pasarte al plan m\u00e1s barato", [delta("dinero", -15000), delta("estres", 5), delta("salud", -2), flag("prepaga_barata")]),
  ]],
  ["copa_america_banderazo", "Banderazo de selecci\u00f3n", "Hay banderazo en el Obelisco. Alguien te pasa una bandera m\u00e1s grande que tu depto.", [
    opt("ir", "Ir al banderazo", [delta("capital_social", 10), delta("bienestar", 8), delta("salud", -3), delta("estres", 5), flag("banderazo_seleccion")]),
    opt("tv", "Verlo por TV", [delta("bienestar", 4)]),
  ]],
  ["crypto_amigo", "El amigo crypto", "Un amigo te explica un token que reci\u00e9n empieza. Tiene gr\u00e1fico de colores y fe de carbonero.", [
    opt("meter", "Meter una moneda", [
      delta("dinero", -30000),
      risk(0.3, [delta("dinero", 90000), delta("influencia", 4), flag("crypto_win")]),
      risk(0.7, [delta("estres", 12), delta("bienestar", -6), flag("crypto_rekt")]),
    ]),
    opt("no", "Decir que no entend\u00e9s", [delta("bienestar", 2)]),
  ]],
  ["whatsapp_tia", "Cadena de la t\u00eda", "Tu t\u00eda manda un audio de 7 minutos sobre pol\u00edtica, f\u00fatbol y una crema milagrosa.", [
    opt("contestar", "Contestar con cari\u00f1o", [delta("capital_social", 4), delta("bienestar", 2), delta("estres", 3)]),
    opt("audios", "Dejar en visto", [delta("estres", -2), delta("capital_social", -2)]),
  ]],
  ["subte_paro", "Paro de subte", "Hay paro, combo y un colectivo que no frena. Lleg\u00e1s tarde o no lleg\u00e1s.", [
    opt("uber", "Pedir Uber con dolor", [delta("dinero", -9000), delta("estres", 6), delta("bienestar", -2)]),
    opt("caminar", "Caminar 40 cuadras", [delta("salud", 3), delta("estres", 8), delta("bienestar", -3)]),
  ]],
  ["inflacion_super", "Supermercado surreal", "El precio cambi\u00f3 entre la g\u00f3ndola y la caja. El cajero se encoge de hombros con empat\u00eda nacional.", [
    opt("pagar", "Pagar igual", [delta("dinero", -22000), delta("estres", 7), delta("bienestar", -3)]),
    opt("dejar", "Dejar el carrito y rajarte", [delta("estres", 5), delta("bienestar", -2), delta("salud", -1)]),
  ]],
  ["delivery_moto", "Delivery a 3 AM", "Ped\u00eds una hamburguesa a las 3 AM. El repartidor es fil\u00f3sofo y te deja pensando.", [
    opt("propina", "Dejar buena propina", [delta("dinero", -12000), delta("bienestar", 5), delta("capital_social", 3)]),
    opt("minima", "Propina m\u00ednima y culpa", [delta("dinero", -7000), delta("bienestar", -2), delta("estres", 2)]),
  ]],
  ["maria_becerra", "Mar\u00eda Becerra en streaming", "Sale tema nuevo y el grupo de WhatsApp explota. Te piden reacci\u00f3n en stories YA.", [
    opt("story", "Subir story con baile", [delta("capital_social", 7), delta("influencia", 4), delta("estres", 3)]),
    opt("escuchar", "Escuchar en silencio", [delta("bienestar", 4)]),
  ]],
  ["nicki_nicole", "Nicki Nicole downtown", "Circula que Nicki Nicole est\u00e1 en un bar. Tu amiga ya est\u00e1 en camino con el celular cargado.", [
    opt("ir", "Ir a intentar el cruce", [
      delta("dinero", -20000),
      risk(0.25, [delta("capital_social", 12), delta("influencia", 5), flag("foto_nicki")]),
      risk(0.75, [delta("estres", 6), delta("bienestar", -2)]),
    ]),
    opt("no", "Quedarte en casa", [delta("bienestar", 2)]),
  ]],
  ["trueno_plaza", "Trueno en la plaza", "Hay freestyle improvisado y un pibe que dice que Trueno pas\u00f3 por ac\u00e1. La plaza vibra.", [
    opt("freestyle", "Tirar unas l\u00edneas", [
      risk(0.4, [delta("capital_social", 10), delta("influencia", 4), flag("gano_freestyle")]),
      risk(0.6, [delta("capital_social", -3), delta("estres", 5)]),
    ]),
    opt("mirar", "Mirar desde el banco", [delta("bienestar", 3)]),
  ]],
  ["coscu_army", "Coscu Army vibes", "Hay evento de la Coscu Army. Te ofrecen remera, fila y la chance de salir en un highlight.", [
    opt("ir", "Ir al evento", [delta("dinero", -25000), delta("capital_social", 8), delta("bienestar", 5), flag("coscu_army")]),
    opt("ver_stream", "Verlo por stream", [delta("bienestar", 3)]),
  ]],
  ["ole_tapa", "Casi tapa de Ol\u00e9", "Sac\u00e1s una foto en la cancha que casi es tapa. Un editor te pide cesi\u00f3n de derechos por dos medialunas.", [
    opt("ceder", "Ceder la foto", [delta("influencia", 8), delta("capital_social", 6), delta("bienestar", 3), flag("foto_ole")]),
    opt("cobrar", "Pedir plata", [
      risk(0.4, [delta("dinero", 30000), delta("influencia", 4)]),
      risk(0.6, [delta("influencia", -3), delta("estres", 4)]),
    ]),
  ]],
  ["podcast_invitado", "Invitado al podcast", "Un podcast chico te invita. Hay micr\u00f3fono malo y preguntas buenas. Puede salir clip.", [
    opt("ir", "Ir al podcast", [delta("influencia", 7), delta("capital_social", 6), delta("estres", 5), risk(0.3, [flag("clip_podcast"), delta("influencia", 6)])]),
    opt("no", "Declinar", [delta("bienestar", 1)]),
  ]],
  ["feria_matreros", "Feria de Mataderos", "Domingo de feria: folklore, chorip\u00e1n y un poncho que te mira. La ciudad se siente otra.", [
    opt("feria", "Perderte en la feria", [delta("dinero", -15000), delta("bienestar", 9), delta("capital_social", 4)]),
    opt("rapido", "Chorip\u00e1n y chau", [delta("dinero", -5000), delta("bienestar", 4)]),
  ]],
  ["costanera_mate", "Mate en la Costanera", "Hay sol, r\u00edo y alguien que pide fuego para el asado improvisado. Te sum\u00e1s o segu\u00eds.", [
    opt("sumarte", "Sumarte al asado", [delta("capital_social", 7), delta("bienestar", 8), delta("dinero", -6000)]),
    opt("solo", "Mate solo mirando el r\u00edo", [delta("bienestar", 6), delta("estres", -4)]),
  ]],
  ["villa_carlos_paz", "Temporada en Carlos Paz", "Te ofrecen laburo de temporada en Carlos Paz: teatro, turistas y calor. Es un portal.", [
    opt("aceptar", "Aceptar la temporada", [delta("dinero", 80000), delta("estres", 12), delta("capital_social", 8), delta("salud", -4), flag("temporada_carlos_paz")]),
    opt("no", "Quedarte en Buenos Aires", [delta("bienestar", 2)]),
  ]],
  ["cordoba_cuarteto", "Noche de cuarteto", "En C\u00f3rdoba el cuarteto no es m\u00fasica: es clima. Te tiran a la pista sin pedir permiso.", [
    opt("bailar", "Bailar hasta el amanecer", [delta("bienestar", 12), delta("salud", -4), delta("dinero", -18000), delta("capital_social", 7), flag("bailo_cuarteto")]),
    opt("borde", "Borde con fernet", [delta("bienestar", 5), delta("dinero", -8000)]),
  ]],
  ["deuda_amigo", "El amigo que debe", "Un amigo te debe hace meses. Te escribe el mes que viene con un sticker de coraz\u00f3n.", [
    opt("perdonar", "Perdonar la deuda", [delta("dinero", -20000), delta("capital_social", 6), delta("bienestar", 2), unflag("cobrando_deuda_amigo")]),
    opt("cobrar", "Cobrar con firmeza", [delta("dinero", 20000), delta("capital_social", -5), delta("estres", 4), flag("cobrando_deuda_amigo")]),
  ]],
  ["curso_ia", "Curso de IA milagrosa", "Un aviso promete que con prompts vas a facturar en d\u00f3lares. Hay Zoom y un PDF de 80 p\u00e1ginas.", [
    opt("curso", "Comprar el curso", [
      delta("dinero", -55000),
      delta("estres", 6),
      risk(0.4, [cred("curso_ia_prompts"), delta("influencia", 4)]),
      risk(0.6, [delta("bienestar", -5), delta("estres", 8)]),
    ]),
    opt("youtube", "Aprender por YouTube", [delta("bienestar", 2), delta("influencia", 1)]),
  ]],
  ["asamblea_consorcio", "Asamblea de consorcio", "Hay asamblea: filtraciones, expensas y un vecino que habla 40 minutos. Es el Congreso del edificio.", [
    opt("hablar", "Hablar con datos", [delta("influencia", 5), delta("estres", 8), delta("capital_social", 4), flag("referente_consorcio")]),
    opt("callar", "Callar y sufrir", [delta("estres", 5), delta("bienestar", -3)]),
  ]],
  ["perro_callejero", "Perro en la esquina", "Un perro te sigue tres cuadras. Parece decidir tu futuro emocional.", [
    opt("adoptar", "Adoptarlo", [delta("dinero", -15000), delta("bienestar", 12), delta("estres", 4), flag("adopte_perro")]),
    opt("comida", "Darle de comer y seguir", [delta("dinero", -2000), delta("bienestar", 4)]),
  ]],
  ["blackout_barrio", "Corte de luz", "Se corta la luz en todo el barrio. Hay velas, vecinos y una guitarra que aparece de la nada.", [
    opt("guitarra", "Sumarte a la guitarra", [delta("capital_social", 8), delta("bienestar", 7), delta("estres", -3)]),
    opt("dormir", "Dormir temprano", [delta("salud", 4), delta("bienestar", 3)]),
  ]],
  ["fito_aniversario", "Fito P\u00e1ez suena", "En un bar ponen Fito y alguien llora con 11 y 6. Te ofrecen un shot por la Patria Rock.", [
    opt("shot", "Brindar y cantar", [delta("bienestar", 8), delta("capital_social", 5), delta("salud", -2)]),
    opt("mate", "Pedir un mate en vez de shot", [delta("bienestar", 5)]),
  ]],
  ["charly_vinilo", "Vinilo de Charly", "En una feria encontr\u00e1s un vinilo de Charly a precio dudoso. El vendedor jura autenticidad.", [
    opt("comprar", "Comprar el vinilo", [
      delta("dinero", -35000),
      risk(0.5, [delta("bienestar", 10), delta("influencia", 3), flag("vinilo_charly")]),
      risk(0.5, [delta("estres", 6), delta("bienestar", -4)]),
    ]),
    opt("pasar", "Seguir de largo", [delta("bienestar", 1)]),
  ]],
  ["cronica_vivo", "Cr\u00f3nica TV en vivo", "Hay m\u00f3vil de Cr\u00f3nica a dos cuadras. El reportero busca vecino impactado.", [
    opt("vecino", "Hacerte el vecino impactado", [delta("capital_social", 5), delta("influencia", 4), delta("estres", 4), flag("salio_cronica")]),
    opt("esquivar", "Esquivar la c\u00e1mara", [delta("bienestar", 2)]),
  ]],
  ["intratables_opinion", "Intratables te cita", "Un productor te pide una frase para el m\u00f3vil. Ten\u00e9s 8 segundos de fama potencial.", [
    opt("frase", "Mandar la frase", [
      risk(0.5, [delta("influencia", 9), delta("capital_social", 6), flag("salio_intratables")]),
      risk(0.5, [delta("estres", 7), delta("bienestar", -3)]),
    ]),
    opt("no", "No contestar", [delta("estres", -2)]),
  ]],
  ["entradas_reventa", "Reventa de entradas", "Necesit\u00e1s entradas. Mercado Libre sonr\u00ede. Tu dignidad negocia.", [
    opt("reventa", "Comprar en reventa", [delta("dinero", -120000), delta("estres", 10), delta("bienestar", 6), risk(0.25, [flag("entrada_trucha"), delta("estres", 15)])]),
    opt("no_ir", "Aceptar que no vas", [delta("bienestar", -4), delta("estres", 3)]),
  ]],
  ["gimnasio_influencer", "Gimnasio de influencers", "El gym est\u00e1 lleno de ring lights. Te piden que no pases por el fondo del video.", [
    opt("entrenar", "Entrenar igual", [delta("salud", 6), delta("estres", 3), delta("dinero", -10000), risk(0.2, [flag("saliste_en_reel_ajeno"), delta("influencia", 3)])]),
    opt("irse", "Irte a correr a la plaza", [delta("salud", 4), delta("bienestar", 3)]),
  ]],
  ["elecciones_pas", "Domingo de PASO", "Hay elecci\u00f3n, boleta y un t\u00edo que te explica todo mal. La escuela es un sauna c\u00edvico.", [
    opt("votar", "Ir a votar", [delta("capital_social", 3), delta("influencia", 2), delta("estres", 4), flag("voto_paso")]),
    opt("fiscal", "Anotar como fiscal", [delta("influencia", 6), delta("estres", 10), delta("dinero", 15000), flag("fiscal_electoral")]),
  ]],
  ["mendoza_vendimia", "Eco de Vendimia", "Hay eco de Vendimia y un amigo mendocino te invita. Vino, luces y la promesa de una noche.", [
    opt("viajar", "Viajar", [delta("dinero", -70000), delta("bienestar", 11), delta("capital_social", 7), flag("fue_vendimia")]),
    opt("vino_local", "Comprar un vino y fingir", [delta("dinero", -8000), delta("bienestar", 4)]),
  ]],
  ["rosario_nocturna", "Noche en Rosario", "Rosario de noche: bares, f\u00fatbol y un amigo que dice que conoce a alguien del Central.", [
    opt("salir", "Salir hasta tarde", [delta("dinero", -25000), delta("capital_social", 8), delta("salud", -3), delta("bienestar", 6)]),
    opt("temprano", "Volver temprano", [delta("bienestar", 3), delta("estres", -2)]),
  ]],
  ["lluvia_flood", "Lluvia porte\u00f1a", "Llueve como si la ciudad debiera algo. El subte es un acuario y tu paraguas traiciona.", [
    opt("remis", "Pedir rem\u00eds", [delta("dinero", -11000), delta("estres", 5), delta("salud", 1)]),
    opt("mojado", "Llegar mojado", [delta("salud", -3), delta("estres", 6), delta("bienestar", -2)]),
  ]],
  ["polÃ©mica_panel", "Panel de chimentos", "Te invitan a un panel de cable a las 2 AM. Hay caf\u00e9 malo y opiniones peores.", [
    opt("panel", "Sentarte al panel", [delta("influencia", 7), delta("estres", 11), delta("capital_social", 5), risk(0.35, [delta("capital_social", -8), flag("panelista_cancelado")])]),
    opt("no", "Dormir como persona", [delta("bienestar", 5), delta("salud", 3)]),
  ]],
  ["tyc_previa", "Previa TyC", "Te cuelas a una previa de TyC Sports. Hay pantallas, caf\u00e9 y un panelista que no mira a nadie.", [
    opt("opinar", "Tirar una opini\u00f3n al aire", [
      risk(0.4, [delta("influencia", 8), delta("capital_social", 5)]),
      risk(0.6, [delta("capital_social", -4), delta("estres", 6)]),
    ]),
    opt("callado", "Quedarte callado", [delta("bienestar", 2)]),
  ]],
  ["momo_twitch", "Noche de Momo", "El chat pide que dones. Tu dedo duda entre 500 y mejor no.", [
    opt("donar", "Donar un poco", [delta("dinero", -8000), delta("capital_social", 4), delta("bienestar", 3)]),
    opt("lurk", "Lurkear en silencio", [delta("bienestar", 2)]),
  ]],
  ["onlyfans_rumor", "Rumor de contenido", "Alguien sugiere que hay que diversificar ingresos con un tono sospechoso. El WiFi tiembla.", [
    opt("pensar", "Pensarlo en serio", [delta("estres", 8), delta("influencia", 2), flag("considero_contenido")]),
    opt("cambiar", "Cambiar de tema al asado", [delta("bienestar", 3)]),
  ]],
];

for (const row of handcrafted) {
  const [id, titulo, texto, opciones, peso] = row;
  add(id, titulo, texto, opciones, peso ?? 10);
}

// PeÃ±as for many clubs to pad toward 120+
const penas = [
  ["racing", "Racing", "La Academia", "Avellaneda"],
  ["independiente", "Independiente", "El Rojo", "Avellaneda"],
  ["velez", "V\u00e9lez", "El Fort\u00edn", "Liniers"],
  ["huracan", "Hurac\u00e1n", "Los Quemeros", "Parque Patricios"],
  ["gimnasia_lp", "Gimnasia", "El Lobo", "La Plata"],
  ["estudiantes_lp", "Estudiantes", "El Pincha", "La Plata"],
  ["newells", "Newell's", "La Lepra", "Rosario"],
  ["central", "Rosario Central", "El Canalla", "Rosario"],
  ["talleres", "Talleres", "La T", "C\u00f3rdoba"],
  ["belgrano", "Belgrano", "El Pirata", "C\u00f3rdoba"],
  ["lanus", "Lan\u00fas", "El Granate", "Lan\u00fas"],
  ["banfield", "Banfield", "El Taladro", "Banfield"],
  ["argentinos", "Argentinos Juniors", "El Bicho", "La Paternal"],
  ["defensa", "Defensa y Justicia", "El Halc\u00f3n", "Varela"],
  ["platense", "Platense", "El Calamar", "Vicente L\u00f3pez"],
  ["godoy_cruz", "Godoy Cruz", "El Tomba", "Mendoza"],
  ["atletico_tucuman", "Atl\u00e9tico Tucum\u00e1n", "El Decano", "Tucum\u00e1n"],
  ["colon", "Col\u00f3n", "El Sabalero", "Santa Fe"],
  ["union", "Uni\u00f3n", "El Tatengue", "Santa Fe"],
  ["instituto", "Instituto", "La Gloria", "C\u00f3rdoba"],
  ["sarmiento", "Sarmiento", "El Verde", "Jun\u00edn"],
  ["barracas", "Barracas Central", "El Guapo", "Barracas"],
  ["tigre", "Tigre", "El Matador", "Victoria"],
  ["arsenal", "Arsenal", "El Viaducto", "Sarand\u00ed"],
  ["aldosivi", "Aldosivi", "El Tibur\u00f3n", "Mar del Plata"],
  ["ferro", "Ferro", "El Verdolaga", "Caballito"],
  ["atlanta", "Atlanta", "El Bohemio", "Villa Crespo"],
  ["chacarita", "Chacarita", "El Funebrero", "San Mart\u00edn"],
  ["all_boys", "All Boys", "El Albo", "Floresta"],
  ["riestra", "Deportivo Riestra", "El Blanquinegro", "Buenos Aires"],
  ["patronato", "Patronato", "El Patr\u00f3n", "Paran\u00e1"],
  ["quilmes", "Quilmes", "El Cervecero", "Quilmes"],
  ["temperley", "Temperley", "El Gasolero", "Temperley"],
  ["estudiantes_rc", "Estudiantes RC", "El Pincha", "R\u00edo Cuarto"],
  ["central_cordoba", "Central C\u00f3rdoba", "El Ferroviario", "Santiago del Estero"],
  ["san_martin_tuc", "San Mart\u00edn Tucum\u00e1n", "El Ciruja", "Tucum\u00e1n"],
  ["san_martin_sj", "San Mart\u00edn SJ", "El Verdinegro", "San Juan"],
  ["gimnasia_mza", "Gimnasia Mendoza", "El Lobo mendocino", "Mendoza"],
  ["moron", "Deportivo Mor\u00f3n", "El Gallo", "Mor\u00f3n"],
  ["almagro", "Almagro", "El Tricolor", "Jos\u00e9 Ingenieros"],
  ["chicago", "Nueva Chicago", "El Torito", "Mataderos"],
  ["los_andes", "Los Andes", "El Milrayitas", "Lomas de Zamora"],
  ["brown", "Brown de Adrogu\u00e9", "El Tricolor", "Adrogu\u00e9"],
  ["agropecuario", "Agropecuario", "El Sojero", "Carlos Casares"],
  ["san_lorenzo_pena", "San Lorenzo", "El Cuervo", "Boedo"],
  ["boca_pena", "Boca", "Xeneize de pe\u00f1a", "La Boca"],
  ["river_pena", "River", "Millonario de pe\u00f1a", "N\u00fa\u00f1ez"],
  ["caacupe", "Club de barrio", "Pe\u00f1a improvisada", "una esquina"],
];

for (const [slug, club, apodo, lugar] of penas) {
  add(
    `pena_${slug}`,
    `Pe\u00f1a ${club}`,
    `En ${lugar} arman pe\u00f1a de ${club} (${apodo}). Hay mate, himno, chorip\u00e1n y alguien que jura que este a\u00f1o toca. Te ofrecen un lugar cerca del bombo.`,
    [
      opt("ir", "Ir a la pe\u00f1a y bancar", [
        delta("capital_social", 7),
        delta("bienestar", 5),
        delta("dinero", -5000),
        flag(`pena_${slug}`),
      ]),
      opt("bombo", "Acercarte al bombo", [
        delta("capital_social", 9),
        delta("salud", -2),
        delta("estres", 4),
        flag(`pena_${slug}_bombo`),
      ]),
      opt("no", "Saludar y seguir de largo", [delta("bienestar", 2)]),
    ],
    8,
  );
}


// Extra peñas / zeitgeist to clear 120+
const extras = [
  ["pena_deportivo_espanol", "Pe\u00f1a Deportivo Espa\u00f1ol", "En el Bajo Flores late una pe\u00f1a del Espa\u00f1ol. Hay nostalgia, tortilla y un himno que no se rinde."],
  ["pena_estudiantes_ba", "Pe\u00f1a Estudiantes Caseros", "Estudiantes de Buenos Aires arma previa. Hay bombo, medialunas y un relato de Ascenso."],
  ["pena_defensores_belgrano", "Pe\u00f1a Defensores de Belgrano", "En Nu\u00f1ez (el otro) arman pe\u00f1a. Hay mate y orgullo de barrio que no pide permiso."],
  ["pena_talleres_re", "Pe\u00f1a Talleres RE", "Talleres de Remedi\u00f3s de Escalada canta. Te ofrecen una remera que pesa historia."],
  ["pena_excursionistas", "Pe\u00f1a Excursionistas", "Los Villeros arman pe\u00f1a en Belgrano R. Hay cumbia suave y f\u00fatbol duro."],
  ["pena_comunicaciones", "Pe\u00f1a Comunicaciones", "Comunicaciones junta gente. Hay previa, termo colectivo y un DJ improvisado."],
  ["pena_sacachispas", "Pe\u00f1a Sacachispas", "En Villa Soldati late Sacachispas. Te miran si banc\u00e1s de verdad."],
  ["pena_deportivo_laferrere", "Pe\u00f1a Deportivo Laferrere", "El Lobo de Laffe arma pe\u00f1a. Hay asado, oeste y decisi\u00f3n."],
];

for (const [id, titulo, texto] of extras) {
  add(
    id,
    titulo,
    texto,
    [
      opt("ir", "Ir a la pe\u00f1a", [
        delta("capital_social", 6),
        delta("bienestar", 4),
        delta("dinero", -4000),
        flag(id),
      ]),
      opt("no", "Quedarte en casa", [delta("bienestar", 2)]),
    ],
    8,
  );
}

patchRequiredCopy();

writeFileSync(OUT, JSON.stringify(events, null, 2) + "\n", "utf8");
console.log(events.length);