import type { LocaleCards } from './types';

/**
 * Spanish (neutral, informal "tú"). Terms follow the "Spanish terminology
 * update" in notes/roadmap-2026/13-multilingual-sources.md. Amounts use the
 * "$" sign (read as pesos across most of Latin America) with the English
 * figures unchanged. Needs a native-speaker review before shipping.
 */
export const es: LocaleCards = {
  'confirmation-bias': {
    name: 'Sesgo de confirmación',
    definition: 'Dar más peso a la información que encaja con lo que ya creemos.',
    scenario:
      'Lucía está segura de que a su nuevo compañero de trabajo le cae mal. Recuerda muy bien la mañana en que no la saludó y la reunión en que la interrumpió, pero no las tres veces que la ayudó.',
    options: ['Efecto ancla', 'Sesgo de confirmación', 'Falacia del costo hundido'],
    explanation:
      'Lucía nota y recuerda las pruebas que encajan con su creencia y deja escapar el resto, así que la creencia parece mejor respaldada de lo que está.',
    counterMove: 'Pregúntate: ¿qué esperaría ver si me equivocara, y lo he buscado?',
  },
  anchoring: {
    name: 'Efecto ancla',
    definition: 'Apoyarnos demasiado en el primer número o dato que vemos.',
    scenario:
      'Un auto usado se anuncia a $18 000. Tras regatear, Diego paga $15 500 y siente que hizo un gran negocio, aunque autos parecidos se venden por unos $14 000.',
    options: ['Efecto halo', 'Falacia del jugador', 'Efecto ancla'],
    explanation:
      'El precio de venta fijó un punto de referencia. Diego juzgó el trato frente a los $18 000 y no frente a lo que el auto vale de verdad.',
    counterMove: 'Antes de ver la cifra de otra persona, anota tu propia estimación.',
  },
  'availability-heuristic': {
    name: 'Heurística de disponibilidad',
    definition: 'Juzgar la probabilidad de algo por lo fácil que nos vienen ejemplos a la mente.',
    scenario:
      'Después de una semana de noticias sobre un accidente aéreo, Andrea decide viajar 900 km por carretera en vez de tomar un avión, convencida de que es la opción más segura.',
    options: ['Heurística de disponibilidad', 'Sesgo del statu quo', 'Maldición del conocimiento'],
    explanation:
      'Las historias vívidas y recientes hacen que los accidentes aéreos sean fáciles de imaginar, así que parecen frecuentes. Por kilómetro, viajar en auto es mucho más riesgoso que volar.',
    counterMove: 'Pregúntate: ¿qué dicen las cifras reales, no los ejemplos que más recuerdo?',
  },
  'framing-effect': {
    name: 'Efecto marco',
    definition: 'Reaccionar distinto ante la misma información según cómo se presente.',
    scenario:
      'Una médica describe la misma operación a dos pacientes. Uno oye «El 90 % de los pacientes sobrevive». El otro oye «El 10 % de los pacientes muere». El primero está mucho más dispuesto a operarse.',
    options: ['Sesgo de optimismo', 'Efecto marco', 'Efecto ancla'],
    explanation:
      'Ambas frases describen las mismas probabilidades. Plantearlo como ganancia o como pérdida cambió la decisión, no los hechos.',
    counterMove: 'Plantea la elección al revés y comprueba si tu respuesta cambia.',
  },
  'sunk-cost-fallacy': {
    name: 'Falacia del costo hundido',
    definition: 'Seguir con algo por lo que ya invertimos en ello.',
    scenario:
      'Paula lleva una hora viendo una película que no le gusta. Se queda hasta el final porque ya pagó la entrada.',
    options: ['Falacia del jugador', 'Sesgo del statu quo', 'Falacia del costo hundido'],
    explanation:
      'El dinero de la entrada ya se gastó, se quede o se vaya. Solo la próxima hora sigue siendo una elección.',
    counterMove: 'Pregúntate: si no hubiera gastado nada todavía, ¿elegiría esto ahora?',
  },
  'survivorship-bias': {
    name: 'Sesgo de supervivencia',
    definition: 'Sacar conclusiones solo de los casos que salieron adelante.',
    scenario:
      'Una revista presenta a diez personas que dejaron la universidad y se hicieron multimillonarias, y concluye que abandonar los estudios es un camino inteligente hacia el éxito.',
    options: ['Sesgo de supervivencia', 'Efecto halo', 'Efecto del falso consenso'],
    explanation:
      'Las muchas personas que dejaron la universidad y no se hicieron multimillonarias no salen en la revista, así que la muestra solo enseña a los ganadores.',
    counterMove: 'Pregúntate: ¿quién intentó lo mismo y fracasó, y por qué no lo veo?',
  },
  'confirmation-bias-review': {
    name: 'Sesgo de confirmación',
    definition: 'Dar más peso a la información que encaja con lo que ya creemos.',
    scenario:
      'Javier cree que su nueva dieta le da más energía. Se fija en cada día que se siente genial y olvida los días de cansancio, así que la dieta parece funcionar.',
    options: ['Falacia del costo hundido', 'Sesgo de supervivencia', 'Sesgo de confirmación'],
    explanation:
      'Solo contaron los días que encajaban con la creencia, así que la dieta parece mejor de lo que muestran las pruebas.',
    counterMove: 'Pregúntate: ¿qué esperaría ver si me equivocara, y lo he buscado?',
  },
  'fundamental-attribution-error': {
    name: 'Error fundamental de atribución',
    definition: 'Explicar la conducta ajena por el carácter de la persona y pasar por alto su situación.',
    scenario:
      'Un cajero le responde de mala manera a Carmen. Ella decide que es simplemente una persona grosera, sin pensar que quizá está terminando un turno de doce horas.',
    options: ['Maldición del conocimiento', 'Error fundamental de atribución', 'Sesgo de confirmación'],
    explanation:
      'Carmen saltó a un juicio sobre quién es el cajero. La situación explica buena parte de la conducta, y tendemos a darle poco peso cuando se trata de otros.',
    counterMove: 'Pregúntate: ¿qué situación haría que una persona razonable actuara así?',
  },
  'status-quo-bias': {
    name: 'Sesgo del statu quo',
    definition: 'Preferir que las cosas sigan como están, aunque un cambio fuera mejor.',
    scenario:
      'Una empresa cambia su plan de jubilación para que los nuevos empleados queden inscritos automáticamente, salvo que pidan salir. La participación sube mucho, aunque las opciones son exactamente las mismas que antes.',
    options: ['Sesgo del statu quo', 'Sesgo de optimismo', 'Sesgo del punto ciego'],
    explanation:
      'Muchas personas se quedan con la opción que viene por defecto. Cambiar esa opción cambió la conducta sin cambiar las opciones de nadie.',
    counterMove: 'Pregúntate: si la opción por defecto fuera la otra, ¿me cambiaría a esta?',
  },
  'halo-effect': {
    name: 'Efecto halo',
    definition: 'Dejar que una buena impresión tiña nuestro juicio sobre cualidades que no tienen relación.',
    scenario:
      'Un candidato a un empleo se muestra seguro y va bien vestido. El entrevistador le pone mejor nota en honestidad y en habilidad técnica, aunque la entrevista no evaluó ninguna de las dos.',
    options: ['Efecto ancla', 'Efecto del falso consenso', 'Efecto halo'],
    explanation:
      'Un rasgo positivo se trasladó a la valoración de rasgos sobre los que el entrevistador no tenía pruebas.',
    counterMove: 'Valora cada cualidad por separado, usando solo las pruebas de esa cualidad.',
  },
  'false-consensus': {
    name: 'Efecto del falso consenso',
    definition: 'Sobrestimar cuántas personas comparten nuestras opiniones y costumbres.',
    scenario:
      'A Tomás le encanta la pizza con piña y le sorprende saber que a la mayoría de sus compañeros de trabajo no. Daba por hecho que casi todos opinaban igual.',
    options: ['Efecto del falso consenso', 'Sesgo de supervivencia', 'Efecto marco'],
    explanation:
      'Nuestra propia opinión nos parece normal, así que suponemos que es común. Tomás proyectó un gusto personal sobre el grupo.',
    counterMove: 'Pregúntate: ¿cómo podría averiguar de verdad lo que piensan los demás?',
  },
  'gamblers-fallacy': {
    name: 'Falacia del jugador',
    definition: 'Creer que los resultados aleatorios pasados cambian las probabilidades de los futuros.',
    scenario:
      'Una ruleta cae en rojo seis veces seguidas. Valeria apuesta fuerte al negro, segura de que «ya le toca».',
    options: ['Falacia del costo hundido', 'Falacia del jugador', 'Heurística de disponibilidad'],
    explanation:
      'Cada tirada es independiente. La ruleta no tiene memoria, así que la probabilidad de negro es la misma que en cualquier otra tirada.',
    counterMove: 'Pregúntate: ¿este proceso tiene alguna memoria de los resultados anteriores?',
  },
  'curse-of-knowledge': {
    name: 'Maldición del conocimiento',
    definition: 'Olvidar cómo es no saber algo que conocemos bien.',
    scenario:
      'Una experta escribe las instrucciones de instalación de una nueva aplicación y se salta los pasos que a ella le parecen obvios. La mayoría de los principiantes se atasca en el paso dos.',
    options: ['Maldición del conocimiento', 'Error fundamental de atribución', 'Efecto halo'],
    explanation:
      'Una vez que sabemos algo, cuesta imaginar no saberlo, así que omitimos lo que necesitan los principiantes.',
    counterMove: 'Pide a alguien nuevo que lo pruebe, o explícalo como si fuera para alguien que nunca lo ha visto.',
  },
  'anchoring-review': {
    name: 'Efecto ancla',
    definition: 'Apoyarnos demasiado en el primer número o dato que vemos.',
    scenario:
      'El formulario de donación de una organización benéfica sugiere dar $100, $250 o $500. Inés, que pensaba dar $50, da $100.',
    options: ['Efecto ancla', 'Efecto halo', 'Maldición del conocimiento'],
    explanation:
      'Las cantidades sugeridas fijaron un punto de referencia que empujó la donación hacia arriba.',
    counterMove: 'Antes de ver la cifra de otra persona, anota tu propia estimación.',
  },
  'automation-bias': {
    name: 'Sesgo de automatización',
    definition: 'Confiar en los sistemas automáticos por encima de nuestro propio juicio y de lo que tenemos delante.',
    scenario:
      'Una aplicación de navegación le indica a un conductor que gire hacia una calle con un cartel de «Calle cerrada». El conductor le hace caso a la aplicación y termina atascado.',
    options: ['Sesgo del statu quo', 'Sesgo de automatización', 'Efecto ancla'],
    explanation:
      'El conductor dejó que la aplicación pesara más que una prueba clara. Lo mismo puede pasar con las herramientas de IA, incluida esta.',
    counterMove: 'Toma lo que diga una herramienta como una sugerencia y compáralo con lo que puedes ver.',
  },
  'bias-blind-spot': {
    name: 'Sesgo del punto ciego',
    definition: 'Ver los sesgos en los demás con más facilidad que en nosotros mismos.',
    scenario:
      'Después de leer sobre sesgos cognitivos, Martín concluye que la mayoría de la gente está bastante sesgada, pero califica su propio juicio como mejor que el promedio.',
    options: ['Sesgo del punto ciego', 'Sesgo de optimismo', 'Efecto del falso consenso'],
    explanation:
      'Aprender sobre los sesgos suele hacernos mejores para detectarlos en otros, no en nosotros.',
    counterMove: 'Supón que tienes tantos sesgos como cualquiera, y busca dónde están.',
  },
  'planning-fallacy': {
    name: 'Falacia de la planificación',
    definition: 'Subestimar cuánto tardarán nuestras propias tareas, aunque ya nos hayamos retrasado antes.',
    scenario:
      'Raúl cuenta con terminar un informe en una tarde. Cada uno de los últimos cuatro informes le llevó unas tres tardes, pero Raúl confía en que esta vez será distinto.',
    options: ['Falacia de la planificación', 'Falacia del costo hundido', 'Sesgo del punto ciego'],
    explanation:
      'Raúl partió del mejor escenario para esta tarea en vez de lo que de verdad han tardado tareas parecidas.',
    counterMove: 'Parte de lo que de verdad te llevaron tareas parecidas y luego ajusta.',
  },
  'base-rate-neglect': {
    name: 'Falacia de la tasa base',
    definition: 'Ignorar lo común que es algo en general al juzgar un caso concreto.',
    scenario:
      'Pablo es callado, le encantan los libros y tiene el escritorio ordenado. Si se pregunta si es más probable que Pablo sea bibliotecario o vendedor, la mayoría dice bibliotecario, aunque los vendedores superan muchas veces en número a los bibliotecarios.',
    options: ['Efecto halo', 'Falacia de la tasa base', 'Efecto ancla'],
    explanation:
      'La descripción encaja con el estereotipo de bibliotecario, pero hay tantos más vendedores que un vendedor callado y lector sigue siendo la opción más probable.',
    counterMove: 'Pregúntate: antes de mirar los detalles, ¿con qué frecuencia se da cada posibilidad?',
  },
  'hindsight-bias': {
    name: 'Sesgo retrospectivo',
    definition: 'Creer, después de que algo pasa, que lo veíamos venir.',
    scenario:
      'Después de que su equipo pierde la final, Elena les dice a sus amigos que siempre supo que la defensa era muy débil. Antes del partido, había pronosticado una victoria fácil.',
    options: ['Sesgo de confirmación', 'Falacia de la planificación', 'Sesgo retrospectivo'],
    explanation:
      'Conocer el resultado cambia nuestro recuerdo de lo que esperábamos, así que el desenlace parece haber sido previsible desde el principio.',
    counterMove: 'Anota tus predicciones antes de saber el resultado y luego compáralas.',
  },
  'authority-bias': {
    name: 'Sesgo de autoridad',
    definition: 'Dar más peso a una afirmación por quién la dice, incluso fuera de su especialidad.',
    scenario:
      'Un cirujano cardíaco famoso recomienda en un anuncio una nueva aplicación para hacer presupuestos. Muchos espectadores la descargan, confiando en su criterio sobre finanzas personales.',
    options: ['Sesgo de autoridad', 'Sesgo del statu quo', 'Falacia de la planificación'],
    explanation:
      'Ser experto en un campo no se traslada a otro, pero el prestigio del cirujano hace que el consejo parezca creíble.',
    counterMove: 'Pregúntate: ¿esta persona es experta en esta pregunta concreta?',
  },
  'sunk-cost-fallacy-review': {
    name: 'Falacia del costo hundido',
    definition: 'Seguir con algo por lo que ya invertimos en ello.',
    scenario:
      'Una empresa lleva dos años gastando en un software que todavía no funciona. Sus directivos aprueban otro año de financiación porque «hemos invertido demasiado para parar ahora».',
    options: ['Sesgo del statu quo', 'Falacia del costo hundido', 'Sesgo retrospectivo'],
    explanation:
      'Los dos años ya están gastados pase lo que pase. La única pregunta es si el próximo año de financiación vale la pena.',
    counterMove: 'Pregúntate: si no hubiera gastado nada todavía, ¿elegiría esto ahora?',
  },
  'belief-bias': {
    name: 'Sesgo de creencia',
    definition: 'Juzgar la lógica de un argumento según si nos gusta su conclusión.',
    scenario:
      'Piensa en esto: «Todas las flores necesitan agua. Las rosas necesitan agua. Por lo tanto, las rosas son flores». Mucha gente considera que el argumento es lógicamente válido porque la conclusión es verdadera.',
    options: ['Falacia del jugador', 'Sesgo de confirmación', 'Sesgo de creencia'],
    explanation:
      'Necesitar agua no convierte algo en flor, así que el razonamiento falla aunque la conclusión resulte ser cierta. Una conclusión creíble ocultó un mal argumento.',
    counterMove: 'Cambia la conclusión por una con la que no estés de acuerdo y comprueba si la lógica sigue pareciéndote bien.',
  },
  'self-serving-bias': {
    name: 'Sesgo de autoservicio',
    definition: 'Atribuirnos los éxitos y culpar a las circunstancias de los fracasos.',
    scenario:
      'Cuando la presentación de Óscar sale bien, lo atribuye a su preparación. Cuando la siguiente fracasa, culpa al proyector y a un público difícil.',
    options: ['Sesgo de autoservicio', 'Error fundamental de atribución', 'Sesgo retrospectivo'],
    explanation:
      'Atribuirnos los aciertos y culpar a factores externos de los fallos protege cómo nos sentimos con nosotros mismos, pero dificulta aprender de los errores.',
    counterMove: 'Pregúntate: ¿qué parte de este resultado fue mía, haya salido bien o mal?',
  },
  'zero-risk-bias': {
    name: 'Sesgo del riesgo cero',
    definition: 'Preferir eliminar del todo un riesgo pequeño antes que reducir más un riesgo mayor.',
    scenario:
      'Una ciudad puede eliminar un contaminante poco común de un pozo, lo que reduce los casos de enfermedad esperados de 5 a 0, o reducir un contaminante común en toda la ciudad, lo que baja los casos de 50 a 25. Muchos vecinos prefieren el primer plan.',
    options: ['Efecto marco', 'Sesgo del riesgo cero', 'Sesgo del statu quo'],
    explanation:
      'El segundo plan evita 25 casos en vez de 5, pero llevar un riesgo hasta cero se siente más seguro.',
    counterMove: 'Compara el daño total que se evita, no si un riesgo llega a cero.',
  },
  'forer-effect': {
    name: 'Efecto Forer',
    definition: 'Considerar que descripciones vagas y generales nos retratan con una precisión única.',
    scenario:
      'Un test en línea le dice a Sofía: «Tienes mucho potencial sin aprovechar y a veces dudas de si tomaste la decisión correcta». Ella está asombrada de lo bien que la conoce.',
    options: ['Sesgo de confirmación', 'Sesgo del punto ciego', 'Efecto Forer'],
    explanation:
      'Frases así encajan con casi todo el mundo, así que parecen personales sin decir nada concreto.',
    counterMove: 'Pregúntate: ¿esta descripción encajaría con la mayoría de la gente que conozco?',
  },
  'outcome-bias': {
    name: 'Sesgo de resultado',
    definition: 'Juzgar una decisión por cómo salió y no por lo que se sabía al tomarla.',
    scenario:
      'Julia pone todos sus ahorros en una sola acción arriesgada porque se lo recomendó un amigo, y su valor se triplica. Sus amigos lo elogian como una decisión inteligente.',
    options: ['Sesgo de resultado', 'Sesgo de supervivencia', 'Falacia del jugador'],
    explanation:
      'Salió bien, pero la decisión era una apuesta con la misma información en cualquier caso. Las buenas consecuencias pueden seguir a malas decisiones, y al revés.',
    counterMove: 'Pregúntate: ¿seguiría pareciendo una buena decisión si hubiera salido mal?',
  },
  'illusory-truth-effect': {
    name: 'Efecto de la verdad ilusoria',
    definition: 'Creer más una afirmación después de oírla varias veces.',
    scenario:
      'Mateo ha visto en varios videos la afirmación de que «solo usamos el 10 % del cerebro». No recuerda ninguna fuente, pero ahora le parece obviamente cierta.',
    options: ['Heurística de disponibilidad', 'Efecto de la verdad ilusoria', 'Sesgo de autoridad'],
    explanation:
      'La repetición hace que una frase resulte familiar, y lo familiar parece verdadero. Lo del 10 % es un mito.',
    counterMove: 'Pregúntate: ¿sé por qué esto es cierto, o solo lo he oído muchas veces?',
  },
  'availability-heuristic-review': {
    name: 'Heurística de disponibilidad',
    definition: 'Juzgar la probabilidad de algo por lo fácil que nos vienen ejemplos a la mente.',
    scenario:
      'Después de enterarse del robo en la casa de un vecino, Isabel calcula que los robos en su barrio son mucho más frecuentes de lo que muestran los registros de la policía.',
    options: ['Efecto ancla', 'Sesgo de resultado', 'Heurística de disponibilidad'],
    explanation:
      'Una sola historia vívida y reciente hizo que los robos fueran fáciles de imaginar, así que parecieron más comunes de lo que son.',
    counterMove: 'Pregúntate: ¿qué dicen las cifras reales, no los ejemplos que más recuerdo?',
  },
  'bandwagon-effect': {
    name: 'Efecto arrastre',
    definition: 'Adoptar una elección o una creencia porque muchos otros ya lo hicieron.',
    scenario:
      'Hay dos restaurantes uno al lado del otro. Uno tiene una fila que sale por la puerta y el otro está vacío. Natalia se pone en la fila sin mirar el menú ni ninguna reseña.',
    options: ['Sesgo del statu quo', 'Efecto halo', 'Efecto arrastre'],
    explanation:
      'Una multitud puede ser una señal útil, pero también puede significar solo que otros siguieron a la multitud. Natalia no comprobó nada más.',
    counterMove: 'Pregúntate: ¿qué sé de esto, aparte de cuántas personas lo eligieron?',
  },
  'spotlight-effect': {
    name: 'Efecto reflector',
    definition: 'Sobrestimar cuánto notan los demás nuestro aspecto y nuestros errores.',
    scenario:
      'Hugo se derrama café en la camisa antes de una reunión y pasa la hora seguro de que todos miran la mancha. Después, nadie la recuerda.',
    options: ['Efecto reflector', 'Maldición del conocimiento', 'Sesgo de negatividad'],
    explanation:
      'Somos el centro de nuestra propia atención, así que suponemos que somos el centro de la de todos. Los estudios muestran que la gente cree que la notan cerca del doble de lo que en realidad ocurre.',
    counterMove: 'Pregúntate: ¿cuánto me fijé yo la última vez que a otra persona le pasó esto?',
  },
  'ikea-effect': {
    name: 'Efecto IKEA',
    definition: 'Valorar más las cosas porque las hicimos nosotros mismos.',
    scenario:
      'Después de dos horas armando una estantería algo inestable, Marta la valora más que otra más firme de la tienda y no la vendería por lo que pagó.',
    options: ['Falacia del costo hundido', 'Efecto IKEA', 'Sesgo del statu quo'],
    explanation:
      'Construir algo con éxito por nuestra cuenta aumenta cuánto lo valoramos, más allá de lo que valdría para cualquier otra persona.',
    counterMove: 'Pregúntate: ¿lo valoraría tanto si lo hubiera hecho otra persona?',
  },
  'conjunction-fallacy': {
    name: 'Falacia de la conjunción',
    definition: 'Juzgar una combinación concreta de hechos como más probable que una de sus partes.',
    scenario:
      '¿Qué es más probable el próximo año: «un gran terremoto en Chile» o «un gran terremoto en Chile que provoque una inundación»? Mucha gente elige la segunda.',
    options: ['Heurística de disponibilidad', 'Efecto ancla', 'Falacia de la conjunción'],
    explanation:
      'Todo terremoto que provoca una inundación también es un terremoto, así que la segunda opción nunca puede ser más probable. Los detalles extra hacen la historia más vívida, no más probable.',
    counterMove: 'Pregúntate: ¿este detalle extra lo hace más probable o solo más convincente?',
  },
  'negativity-bias': {
    name: 'Sesgo de negatividad',
    definition: 'Dar más peso a las malas experiencias e informaciones que a las buenas de igual intensidad.',
    scenario:
      'Rocío recibe diez comentarios amables y uno crítico sobre su charla. Esa noche, solo puede pensar en la crítica.',
    options: ['Sesgo de negatividad', 'Efecto reflector', 'Sesgo de confirmación'],
    explanation:
      'La información negativa capta más atención y pesa más, así que una crítica puede pesar más que diez elogios.',
    counterMove: 'Pregúntate: si doy el mismo peso a lo bueno y a lo malo, ¿cuál es el panorama general?',
  },
  'naive-realism': {
    name: 'Realismo ingenuo',
    definition: 'Suponer que vemos el mundo tal como es, así que quien no está de acuerdo debe de estar mal informado o tener sesgos.',
    scenario:
      'Dos amigos ven una jugada dudosa que pita el árbitro. Cada uno está seguro de que su visión es simplemente obvia y de que el otro solo la ve distinto por el equipo al que apoya.',
    options: ['Efecto del falso consenso', 'Realismo ingenuo', 'Sesgo de autoservicio'],
    explanation:
      'Cada amigo trata su propia visión como la realidad pura y busca excusas para la del otro. Rara vez notamos que nuestra perspectiva es una perspectiva.',
    counterMove: 'Pregúntate: ¿qué tendría que creer una persona razonable para verlo al revés?',
  },
  'framing-effect-review': {
    name: 'Efecto marco',
    definition: 'Reaccionar distinto ante la misma información según cómo se presente.',
    scenario:
      'Los compradores prefieren carne molida etiquetada «75 % magra» a la misma carne etiquetada «25 % grasa».',
    options: ['Efecto marco', 'Efecto halo', 'Efecto ancla'],
    explanation:
      'Las dos etiquetas describen la misma carne. Describirla por lo bueno en vez de por lo malo cambió la elección.',
    counterMove: 'Plantea la elección al revés y comprueba si tu respuesta cambia.',
  },
  'clustering-illusion': {
    name: 'Ilusión de agrupamiento',
    definition: 'Ver patrones con sentido en rachas aleatorias.',
    scenario:
      'La lista de reproducción de Clara está en modo aleatorio y pone tres canciones seguidas del mismo artista. Ella decide que el modo aleatorio no es realmente aleatorio.',
    options: ['Falacia del jugador', 'Sesgo de confirmación', 'Ilusión de agrupamiento'],
    explanation:
      'Las secuencias aleatorias producen rachas más a menudo de lo que esperamos. Un orden de verdad aleatorio suele parecer menos aleatorio que uno diseñado para evitar repeticiones.',
    counterMove: 'Pregúntate: ¿con qué frecuencia pasaría esto solo por azar?',
  },
  reactance: {
    name: 'Reactancia psicológica',
    definition: 'Resistirnos a una petición porque la sentimos como una amenaza a nuestra libertad.',
    scenario:
      'Un cartel dice: «Terminantemente prohibido usar el teléfono a partir de aquí». Roberto, que no pensaba usar el suyo, de pronto siente unas ganas enormes de mirarlo.',
    options: ['Reactancia psicológica', 'Sesgo del statu quo', 'Efecto arrastre'],
    explanation:
      'Que nos digan que no podemos hacer algo puede volverlo más atractivo, como una forma de recuperar nuestra libertad de elegir.',
    counterMove: 'Pregúntate: ¿de verdad quiero esto, o solo no me gusta que me digan que no?',
  },
  'third-person-effect': {
    name: 'Efecto de tercera persona',
    definition: 'Pensar que los mensajes de los medios influyen más en los demás que en nosotros.',
    scenario:
      'Tras una ola de anuncios llamativos de una nueva bebida energética, Nicolás dice que a sus amigos los manipulan los anuncios, pero que a él no le afectan.',
    options: ['Efecto halo', 'Efecto de tercera persona', 'Reactancia psicológica'],
    explanation:
      'Tendemos a ver a los demás como más fáciles de influir que nosotros, lo que nos deja menos en guardia ante los mismos mensajes.',
    counterMove: 'Pregúntate: si este anuncio funciona con otras personas, ¿por qué no funcionaría conmigo?',
  },
  'false-memory': {
    name: 'Falsos recuerdos',
    definition: 'Recordar con seguridad hechos que nunca ocurrieron, o que ocurrieron de otra manera.',
    scenario:
      'Años después, dos hermanas recuerdan con todo detalle haber sido la que encontró al perro perdido de la familia. Solo una de ellas puede tener razón.',
    options: ['Sesgo retrospectivo', 'Sesgo de autoservicio', 'Falsos recuerdos'],
    explanation:
      'La memoria se reconstruye cada vez que evocamos algo, así que un recuerdo vívido y seguro puede ser erróneo.',
    counterMove: 'Pregúntate: ¿hay algún registro que pueda comprobar este recuerdo?',
  },
  suggestibility: {
    name: 'Sugestionabilidad',
    definition: 'Dejar que las preguntas tendenciosas o la información posterior cambien lo que recordamos.',
    scenario:
      'Tras ver un video de un choque, las personas a las que se pregunta «¿A qué velocidad iban los autos cuando se estrellaron uno contra otro?» recuerdan velocidades más altas, y algunas recuerdan vidrios rotos que nunca estuvieron ahí.',
    options: ['Sugestionabilidad', 'Maldición del conocimiento', 'Sesgo del statu quo'],
    explanation:
      'La palabra «estrellaron» cambió el propio recuerdo, no solo la respuesta. Lo que oímos después puede reescribir en silencio lo que creemos haber visto.',
    counterMove: 'Pregúntate: ¿pudo la forma en que me preguntaron moldear lo que recuerdo?',
  },
  'in-group-favoritism': {
    name: 'Favoritismo endogrupal',
    definition: 'Favorecer a la gente de nuestro propio grupo, aunque los grupos sean arbitrarios.',
    scenario:
      'Se divide a unos voluntarios en dos equipos lanzando una moneda. Cuando se les pide repartir un premio, la mayoría da más a su propio equipo, aunque no conocen a nadie de ninguno de los dos.',
    options: ['Efecto arrastre', 'Favoritismo endogrupal', 'Efecto del falso consenso'],
    explanation:
      'Un equipo asignado con una moneda bastó para que la gente favoreciera a «nosotros» frente a «ellos».',
    counterMove: 'Pregúntate: ¿decidiría lo mismo si esta persona estuviera en el otro equipo?',
  },
  'survivorship-bias-review': {
    name: 'Sesgo de supervivencia',
    definition: 'Sacar conclusiones solo de los casos que salieron adelante.',
    scenario:
      'Una aficionada a las casas antiguas dice que hace un siglo se construía mejor, y señala las sólidas casas viejas que siguen en pie en el pueblo.',
    options: ['Sesgo retrospectivo', 'Sesgo de supervivencia', 'Efecto halo'],
    explanation:
      'Las casas mal construidas de esa época se han derribado casi todas, así que solo quedan a la vista las mejores.',
    counterMove: 'Pregúntate: ¿quién intentó lo mismo y fracasó, y por qué no lo veo?',
  },
};
