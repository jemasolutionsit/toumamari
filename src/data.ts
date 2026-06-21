export interface Tour {
  id: string;
  title: string;
  price: number;
  priceCLP?: number;
  originalPrice?: number;
  discountPercentage?: number;
  categoryId: string;
  type: string;
  duration: string;
  description: string;
  longDescription: string;
  image: string;
  included: string[];
  notIncluded: string[];
  itinerary: { time: string; title: string; desc: string }[];
  minPassengers?: number;
}

export const getTours = (lang: 'es' | 'en'): Tour[] => [
  {
    id: "1",
    title: lang === 'es' ? "Full Day Ruta Anakena y Moai" : "Full Day Anakena & Moai Route",
    price: 55,
    priceCLP: 45000,
    categoryId: "full-day",
    type: "Full Day",
    duration: lang === 'es' ? "Día completo" : "Full day",
    description: lang === 'es' ? "Recorre Vaihu, Rano Raraku, Ahu Tongariki, Te Pito Kura, Ovahe, Playa Anakena y Ahu Nau Nau." : "Visit Vaihu, Rano Raraku, Ahu Tongariki, Te Pito Kura, Ovahe, Anakena Beach and Ahu Nau Nau.",
    longDescription: lang === 'es' ? "El recorrido más completo de Rapa Nui. Comenzamos en Ahu Vaihu, donde 8 moais yacen boca abajo desde las guerras civiles del siglo XVIII — mantenidos sin restaurar como acto deliberado de memoria histórica. Seguimos a Rano Raraku, el volcán-cantera donde se tallaron casi 400 moais; los semienterrados en sus laderas no quedaron por olvido, sino que fueron colocados de pie en fosas rituales como guardianes eternos del volcán sagrado. En Ahu Tongariki contemplamos los 15 moais restaurados tras el devastador tsunami de 1960 que los arrastró tierra adentro. Visitamos Te Pito Kura y la enigmática piedra magnética esférica (Te Pito o te Henua — El Ombligo del Mundo), junto al caído Moai Paro, el más grande jamás transportado e instalado con éxito: casi 10 metros y 80 toneladas. Terminamos en la playa de reyes de Anakena, de aguas turquesas, junto al Ahu Nau Nau." : "Rapa Nui's most complete route. We start at Ahu Vaihu, where 8 moais lie face-down since the 18th-century civil wars — left unrestored as a deliberate act of historical memory. We continue to Rano Raraku, the quarry volcano where nearly 400 moais were carved; those semiburied on its slopes were not abandoned but deliberately placed upright in ritual pits as eternal guardians of the sacred volcano. At Ahu Tongariki we stand before the 15 moais restored after the devastating 1960 tsunami that swept them inland. We visit Te Pito Kura and the enigmatic magnetic spherical stone (Te Pito o te Henua — The Navel of the World), beside the fallen Moai Paro, the largest ever successfully transported and installed: nearly 10 meters tall and 80 tons. We finish at Anakena, the kings' beach of turquoise waters, beside Ahu Nau Nau.",
    image: "/images/tours/ahu-tongariki-dia.jpg",
    included: lang === 'es' ? ["Traslado ida y vuelta", "Guía local experto", "Experiencia cultural", "Tiempo para fotografías"] : ["Round trip transportation", "Expert local guide", "Cultural experience", "Photo time"],
    notIncluded: lang === 'es' ? ["Ticket Parque Nacional Rapa Nui", "Almuerzo (opcional +$20.000 CLP)"] : ["Rapa Nui National Park Ticket", "Lunch (optional +$20,000 CLP)"],
    itinerary: lang === 'es' ? [
      { time: "09:00 AM", title: "Inicio", desc: "Recogida en Hanga Roa y salida hacia la Ruta Sur." },
      { time: "10:00 AM", title: "Vaihu", desc: "Primera parada en plataforma ancestral." },
      { time: "11:00 AM", title: "Rano Raraku", desc: "Trekking suave por la cantera de los moais." },
      { time: "12:30 PM", title: "Ahu Tongariki", desc: "Los 15 moais más emblemáticos de la isla." },
      { time: "02:00 PM", title: "Te Pito Kura & Ovahe", desc: "El ombligo del mundo y caleta secreta." },
      { time: "03:30 PM", title: "Playa Anakena", desc: "Tiempo libre, Ahu Nau Nau y relax." },
      { time: "05:30 PM", title: "Regreso", desc: "Retorno a Hanga Roa." }
    ] : [
      { time: "09:00 AM", title: "Start", desc: "Pick up in Hanga Roa, departure to South Route." },
      { time: "10:00 AM", title: "Vaihu", desc: "First stop at ancestral platform." },
      { time: "11:00 AM", title: "Rano Raraku", desc: "Gentle trekking through moai quarry." },
      { time: "12:30 PM", title: "Ahu Tongariki", desc: "The 15 most emblematic moais of the island." },
      { time: "02:00 PM", title: "Te Pito Kura & Ovahe", desc: "The navel of the world and secret cove." },
      { time: "03:30 PM", title: "Anakena Beach", desc: "Free time, Ahu Nau Nau and relax." },
      { time: "05:30 PM", title: "Return", desc: "Return to Hanga Roa." }
    ]
  },
  {
    id: "2",
    title: lang === 'es' ? "Tour Orongo y Ruta Tangata Manu" : "Orongo & Birdman Route",
    price: 55,
    priceCLP: 45000,
    categoryId: "half-day",
    type: lang === 'es' ? "Medio Día" : "Half Day",
    duration: lang === 'es' ? "5 horas" : "5 hours",
    description: lang === 'es' ? "Rano Kau, Aldea Orongo, Vinapu, Puna Pau, Ahu Akivi y Ahu Te Peu." : "Rano Kau, Orongo Village, Vinapu, Puna Pau, Ahu Akivi and Ahu Te Peu.",
    longDescription: lang === 'es' ? "El tour del lado espiritual de Rapa Nui. Ascendemos al cráter del Rano Kau, cuya laguna interior de 1,5 km de diámetro está tapizada de islas flotantes de totora creando un microclima único. En su borde, la aldea ceremonial de Orongo: epicentro del culto al Tangata Manu (Hombre-Pájaro), donde cada primavera los guerreros de los clanes debían bajar acantilados de 300 metros, nadar en aguas infestadas de tiburones hasta el islote Motu Nui y esperar el primer huevo del manutara (gaviotín pascuense). En Puna Pau vemos los pukao — los cilindros de escoria roja volcánica que coronaban las cabezas de los moais de élite, simbolizando el cabello en moño alto de la nobleza rapanui y una enorme concentración de mana (fuerza espiritual). Cerramos con Ahu Akivi y sus 7 moais únicos: miran al océano y están alineados astronómicamente con los equinoccios, funcionando como calendario agrícola sagrado." : "The spiritual side of Rapa Nui. We ascend the Rano Kau crater, whose 1.5-km interior lake is carpeted with floating totora islands creating a unique microclimate. On its rim, the ceremonial village of Orongo: epicenter of the Tangata Manu (Birdman) cult, where each spring clan warriors had to descend 300-meter cliffs, swim shark-infested waters to Motu Nui islet, and wait for the first manutara (sooty tern) egg. At Puna Pau we see the pukao — volcanic red scoria cylinders that crowned elite moais' heads, symbolizing the noble bun hairstyle of the Rapanui aristocracy and a great concentration of mana (spiritual force). We close with Ahu Akivi and its 7 unique moais: they face the ocean and are astronomically aligned with the equinoxes, serving as a sacred agricultural calendar.",
    image: "/images/tours/rano-kau-crater.jpg",
    included: lang === 'es' ? ["Traslado ida y vuelta", "Guía local experto", "Interpretación cultural", "Fotografías"] : ["Round trip transportation", "Expert local guide", "Cultural interpretation", "Photos"],
    notIncluded: lang === 'es' ? ["Ticket Parque Nacional Rapa Nui", "Almuerzo (opcional +$20.000 CLP)"] : ["Rapa Nui National Park Ticket", "Lunch (optional +$20,000 CLP)"],
    itinerary: lang === 'es' ? [
      { time: "09:00 AM", title: "Salida", desc: "Recogida en tu alojamiento." },
      { time: "09:30 AM", title: "Rano Kau", desc: "Ascenso panorámico al volcán." },
      { time: "10:15 AM", title: "Aldea Orongo", desc: "Recorrido guiado por casas ceremoniales y petroglifos." },
      { time: "11:30 AM", title: "Vinapu & Puna Pau", desc: "Plataformas ancestrales y cantera de pukao." },
      { time: "12:30 PM", title: "Ahu Akivi & Ahu Te Peu", desc: "Los 7 moais y ruinas costeras." },
      { time: "01:30 PM", title: "Retorno", desc: "Regreso a Hanga Roa." }
    ] : [
      { time: "09:00 AM", title: "Departure", desc: "Pick up at your accommodation." },
      { time: "09:30 AM", title: "Rano Kau", desc: "Panoramic ascent to the volcano." },
      { time: "10:15 AM", title: "Orongo Village", desc: "Guided tour through ceremonial houses and petroglyphs." },
      { time: "11:30 AM", title: "Vinapu & Puna Pau", desc: "Ancestral platforms and pukao quarry." },
      { time: "12:30 PM", title: "Ahu Akivi & Ahu Te Peu", desc: "The 7 moais and coastal ruins." },
      { time: "01:30 PM", title: "Return", desc: "Return to Hanga Roa." }
    ]
  },
  {
    id: "3",
    title: lang === 'es' ? "Amanecer en Ahu Tongariki" : "Sunrise at Ahu Tongariki",
    price: 42,
    priceCLP: 35000,
    categoryId: "half-day",
    type: lang === 'es' ? "Medio Día" : "Half Day",
    duration: lang === 'es' ? "3 horas" : "3 hours",
    description: lang === 'es' ? "Contempla el espectáculo más asombroso de Rapa Nui. Quince moais monumentales delineados por los primeros rayos del sol." : "Behold the most amazing spectacle in Rapa Nui. Fifteen monumental moais outlined by the first rays of the sun.",
    longDescription: lang === 'es' ? "Ahu Tongariki es la estructura ceremonial más grande de toda la Polinesia: 15 moais alineados de espaldas al océano Pacífico, representando el máximo esplendor del poder del clan Hotu Iti. Fueron derribados durante las guerras civiles internas y luego arrastrados varios metros tierra adentro por el devastador tsunami de 1960. La impecable restauración arqueológica liderada por Claudio Cristino en los años 90 los devolvió a la vida. Al amanecer, sus siluetas se recortan contra los primeros rayos de luz del Pacífico con el acantilado del Poike al fondo. Solo uno de los moais lleva pukao — el tocado de escoria roja que simbolizaba el poder y el mana. Es el momento más fotogénico y espiritual de la isla." : "Ahu Tongariki is the largest ceremonial structure in all of Polynesia: 15 moais aligned with their backs to the Pacific, representing the peak power of the Hotu Iti clan. They were toppled during Rapa Nui's civil wars, then swept inland by the devastating 1960 tsunami. An impeccable archaeological restoration led by Claudio Cristino in the 1990s brought them back. At sunrise, their silhouettes are outlined against the first Pacific light with the Poike cliff behind. Only one moai wears a pukao — the red scoria crown symbolizing power and mana. The island's most photogenic and spiritual moment.",
    image: "/images/tours/ahu-tongariki-amanecer.jpg",
    included: lang === 'es' ? ["Transporte ida y vuelta", "Guía local experto (Español/Inglés)", "Café caliente y snack"] : ["Round trip transportation", "Expert local guide (Spanish/English)", "Hot coffee and snack"],
    notIncluded: lang === 'es' ? ["Ticket Parque Nacional Rapa Nui"] : ["Rapa Nui National Park Ticket"],
    itinerary: lang === 'es' ? [
      { time: "06:00 AM", title: "Recogida", desc: "Te pasamos a buscar a tu alojamiento." },
      { time: "06:45 AM", title: "Llegada a Tongariki", desc: "Ubicación en el mejor punto fotográfico." },
      { time: "08:30 AM", title: "Desayuno Ligero", desc: "Café frente a los monumentos." },
      { time: "09:00 AM", title: "Regreso", desc: "Retorno a Hanga Roa." }
    ] : [
      { time: "06:00 AM", title: "Pick up", desc: "We pick you up at your accommodation." },
      { time: "06:45 AM", title: "Arrival at Tongariki", desc: "Best photographic point." },
      { time: "08:30 AM", title: "Light Breakfast", desc: "Coffee in front of the monuments." },
      { time: "09:00 AM", title: "Return", desc: "Return to Hanga Roa." }
    ]
  },
  {
    id: "4",
    title: lang === 'es' ? "Experiencia Motu" : "Motu Experience",
    price: 42,
    priceCLP: 35000,
    categoryId: "half-day",
    type: lang === 'es' ? "Medio Día" : "Half Day",
    duration: lang === 'es' ? "4 horas" : "4 hours",
    description: lang === 'es' ? "Navega hacia los islotes sagrados y descubre la vida marina de Rapa Nui. Opción con snorkel disponible." : "Sail to the sacred islets and discover the marine life of Rapa Nui. Snorkel option available.",
    longDescription: lang === 'es' ? "Frente a los acantilados del volcán Rano Kau se alzan tres islotes sagrados: Motu Nui (el más grande), Motu Iti y la aguja de roca vertical del Motu Kao Kao. Este triángulo de piedra fue el escenario de la competencia más extrema del mundo antiguo — el Tangata Manu. Cada primavera, guerreros designados bajaban 300 metros de acantilados, nadaban en aguas infestadas de tiburones, y esperaban en los islotes el primer huevo del manutara. El ganador entregaba el poder político y espiritual de toda la isla a su clan por un año. Navegamos hasta ellos para vivirlos desde el mar, observar la fauna marina y conectar con esa energía ancestral que aún impregna estas aguas." : "Off the cliffs of Rano Kau volcano rise three sacred islets: Motu Nui (the largest), Motu Iti, and the vertical rock needle of Motu Kao Kao. This stone triangle was the stage of the ancient world's most extreme competition — the Tangata Manu. Each spring, designated warriors descended 300-meter cliffs, swam shark-infested waters, and waited on the islets for the first manutara egg. The winner granted political and spiritual power over the entire island to his clan for a year. We sail out to experience them from the sea, observe the marine wildlife, and connect with that ancestral energy still imbued in these waters.",
    image: "/images/tours/motu-islotes.jpg",
    included: lang === 'es' ? ["Navegación guiada", "Equipo de seguridad", "Bebidas a bordo"] : ["Guided navigation", "Safety equipment", "Drinks on board"],
    notIncluded: lang === 'es' ? ["Almuerzo", "Equipo de snorkel (incluido en opción con snorkel)"] : ["Lunch", "Snorkel equipment (included in snorkel option)"],
    itinerary: lang === 'es' ? [
      { time: "09:00 AM", title: "Embarque", desc: "Reunión en el puerto de Hanga Roa." },
      { time: "09:30 AM", title: "Navegación", desc: "Rumbo a los islotes sagrados." },
      { time: "10:30 AM", title: "Exploración", desc: "Avistamiento de fauna marina y snorkel." },
      { time: "01:00 PM", title: "Regreso", desc: "Retorno al puerto." }
    ] : [
      { time: "09:00 AM", title: "Boarding", desc: "Meeting at Hanga Roa port." },
      { time: "09:30 AM", title: "Navigation", desc: "Heading to sacred islets." },
      { time: "10:30 AM", title: "Exploration", desc: "Marine wildlife sighting and snorkeling." },
      { time: "01:00 PM", title: "Return", desc: "Return to port." }
    ]
  },
  {
    id: "5",
    title: lang === 'es' ? "Tour Navegable Anakena" : "Anakena Sailing Tour",
    price: 145,
    priceCLP: 120000,
    categoryId: "full-day",
    type: "Full Day",
    duration: lang === 'es' ? "6 horas" : "6 hours",
    description: lang === 'es' ? "Navegación costera, almuerzo incluido y traslado Anakena – Pueblo. Una experiencia premium por mar." : "Coastal sailing, lunch included and Anakena-Town transfer. A premium experience by sea.",
    longDescription: lang === 'es' ? "Rapa Nui vista desde el océano, como llegaron por primera vez los ancestros. Zarpamos desde Hanga Roa bordeando la costa volcánica — una sucesión de acantilados y tubos de lava que emergen al mar. Navegamos frente a Ana Kakenga (la Cueva de las Dos Ventanas), donde la roca volcánica encuadra el azul del océano en una ventana perfecta, y junto a Ana Te Pahu, la 'Cueva de los Plátanos': sus amplias aberturas superiores permitían a los antiguos rapanui cultivar plátanos, taro y camotes protegidos del viento, con reservas de agua dulce subterránea vitales en tiempos de sequía. Llegamos a Anakena por mar — la perspectiva que ningún tour terrestre puede darte — y almorzamos en la playa de aguas turquesas más hermosa de la isla." : "Rapa Nui seen from the ocean, as the ancestors first arrived. We set sail from Hanga Roa along the volcanic coast — a succession of cliffs and lava tubes that emerge into the sea. We sail past Ana Kakenga (the Cave of Two Windows), where volcanic rock frames the ocean blue in a perfect aperture, and beside Ana Te Pahu, the 'Banana Cave': its wide overhead openings allowed ancient Rapanui to grow bananas, taro, and sweet potatoes sheltered from the wind, with vital underground freshwater reserves in times of drought. We arrive at Anakena by sea — the perspective no land tour can give you — and lunch on the island's most beautiful turquoise beach.",
    image: "/images/tours/cueva-ana-kakenga.jpg",
    included: lang === 'es' ? ["Navegación costera completa", "Almuerzo gourmet", "Traslado Anakena – Pueblo", "Guía náutico"] : ["Full coastal navigation", "Gourmet lunch", "Anakena-Town transfer", "Nautical guide"],
    notIncluded: lang === 'es' ? ["Ticket Parque Nacional Rapa Nui"] : ["Rapa Nui National Park Ticket"],
    itinerary: lang === 'es' ? [
      { time: "09:00 AM", title: "Zarpe", desc: "Salida desde el puerto de Hanga Roa." },
      { time: "10:30 AM", title: "Costa volcánica", desc: "Navegación panorámica por acantilados." },
      { time: "12:00 PM", title: "Anakena", desc: "Llegada por mar a la playa." },
      { time: "01:00 PM", title: "Almuerzo", desc: "Comida gourmet con productos locales." },
      { time: "03:00 PM", title: "Regreso", desc: "Traslado terrestre a Hanga Roa." }
    ] : [
      { time: "09:00 AM", title: "Set sail", desc: "Departure from Hanga Roa port." },
      { time: "10:30 AM", title: "Volcanic coast", desc: "Panoramic sailing along cliffs." },
      { time: "12:00 PM", title: "Anakena", desc: "Arrival by sea to the beach." },
      { time: "01:00 PM", title: "Lunch", desc: "Gourmet meal with local products." },
      { time: "03:00 PM", title: "Return", desc: "Land transfer back to Hanga Roa." }
    ]
  },
  {
    id: "6",
    title: lang === 'es' ? "Super Full Day Privado" : "Super Full Day Private",
    price: 120,
    priceCLP: 100000,
    categoryId: "packs",
    type: lang === 'es' ? "Privado" : "Private",
    duration: lang === 'es' ? "Día completo" : "Full day",
    description: lang === 'es' ? "Experiencia privada y personalizada. Recorre los sitios más emblemáticos a tu ritmo. Mínimo 2 pasajeros." : "Private and personalized experience. Visit the most iconic sites at your own pace. Minimum 2 passengers.",
    longDescription: lang === 'es' ? "La experiencia más completa y exclusiva de Toumamari. Un día entero dedicado solo a ti y tu grupo, con tu guía privado rapanui diseñando la ruta según tus intereses. ¿Arqueología profunda? Recorremos desde las fosas rituales de Rano Raraku hasta el magnético Te Pito o te Henua. ¿Fotografía? Elegimos el ángulo y la luz exacta en cada sitio. ¿Espiritualidad? Te llevamos a miradores secretos que solo los locales conocen, donde no hay nadie más. Sin itinerarios fijos, sin grupos, sin prisas. Acceso especial a puntos no turísticos y contexto histórico profundo — cada sitio que visites cobra vida con la voz de alguien que creció entre estos moais." : "Toumamari's most complete and exclusive experience. An entire day dedicated only to you and your group, with your private Rapanui guide designing the route to your interests. Deep archaeology? We cover ritual pits of Rano Raraku to the magnetic Te Pito o te Henua. Photography? We choose the exact angle and light at each site. Spirituality? We take you to secret viewpoints only locals know, where there's nobody else. No fixed itineraries, no groups, no rush. Special access to non-tourist points and deep historical context — every site comes alive through the voice of someone who grew up among these moais.",
    image: "/images/tours/rano-raraku-sector1.jpg",
    included: lang === 'es' ? ["Guía privado todo el día", "Transporte exclusivo", "Ruta personalizada", "Almuerzo incluido"] : ["Private guide all day", "Exclusive transport", "Customized route", "Lunch included"],
    notIncluded: lang === 'es' ? ["Ticket Parque Nacional Rapa Nui"] : ["Rapa Nui National Park Ticket"],
    minPassengers: 2,
    itinerary: lang === 'es' ? [
      { time: "09:00 AM", title: "Inicio", desc: "Encuentro con tu guía privado." },
      { time: "09:30 AM", title: "Ruta personalizada", desc: "Recorrido diseñado según tus intereses." },
      { time: "01:00 PM", title: "Almuerzo", desc: "Comida en locación especial." },
      { time: "02:30 PM", title: "Exploración", desc: "Miradores secretos y sitios exclusivos." },
      { time: "05:30 PM", title: "Fin", desc: "Retorno a tu alojamiento." }
    ] : [
      { time: "09:00 AM", title: "Start", desc: "Meet your private guide." },
      { time: "09:30 AM", title: "Custom route", desc: "Tour designed to your interests." },
      { time: "01:00 PM", title: "Lunch", desc: "Meal at special location." },
      { time: "02:30 PM", title: "Exploration", desc: "Secret viewpoints and exclusive sites." },
      { time: "05:30 PM", title: "End", desc: "Return to your accommodation." }
    ]
  }
];

export const getReviews = (lang: 'es' | 'en') => [
  {
    id: 1,
    name: "Carolina M.",
    country: lang === 'es' ? "Chile" : "Chile",
    text: lang === 'es' ? "Hicimos el pack de 4 días y la organización fue perfecta. Nuestro guía Tuki nos transmitió un amor por su cultura que nunca olvidaremos. ¡100% recomendados!" : "We did the 4-day pack and the organization was perfect. Our guide Tuki passed on a love for his culture that we will never forget. 100% recommended!",
    rating: 5,
    platform: "TripAdvisor"
  },
  {
    id: 2,
    name: "James D.",
    country: lang === 'es' ? "Estados Unidos" : "United States",
    text: lang === 'es' ? "El amanecer en Tongariki fue la experiencia más mágica de mi vida. Puntuales, atentos y con un café caliente que se agradece mucho por la mañana." : "The sunrise at Tongariki was the most magical experience of my life. Punctual, attentive and with a hot coffee that is much appreciated in the morning.",
    rating: 5,
    platform: "Google"
  },
  {
    id: 3,
    name: "Laura G.",
    country: lang === 'es' ? "España" : "Spain",
    text: lang === 'es' ? "Anakena es el paraíso. Me encantó que el grupo era pequeño, se sintió como hacer un tour con amigos. ¡Gracias familia Toumamari!" : "Anakena is paradise. I loved that the group was small, it felt like doing a tour with friends. Thank you Toumamari family!",
    rating: 5,
    platform: "Instagram"
  }
];


export const getAbout = (lang: 'es' | 'en') => ({
  title: lang === 'es' ? "Caminando con los Ancestros" : "Walking with the Ancestors",
  description: lang === 'es' ? "Servicios Turísticos Touamamari SpA ofrece experiencias diseñadas para conectar a nuestros visitantes con la historia, cultura, naturaleza y mar de Rapa Nui. Creamos experiencias auténticas y personalizadas, combinando patrimonio arqueológico, paisajes únicos, gastronomía local y atención cercana para que cada visita sea inolvidable." : "Touamamari SpA Tourism Services offers experiences designed to connect our visitors with the history, culture, nature and sea of Rapa Nui. We create authentic and personalized experiences, combining archaeological heritage, unique landscapes, local gastronomy and close attention so that every visit is unforgettable.",
  description2: lang === 'es' ? "Nos enorgullece ser un eslabón entre el pasado milenario y el viajero moderno. Cuando recorres estas tierras con Toumamari, no eres un turista; eres un invitado a nuestra casa, a nuestra historia y a nuestra familia." : "We are proud to be a link between the ancient past and the modern traveler. When you tour these lands with Toumamari, you are not a tourist; you are a guest in our home, our history and our family.",
  badges: {
    title: lang === 'es' ? "Guías Locales" : "Local Guides",
    desc: lang === 'es' ? "Expertos nacidos en el ombligo del mundo." : "Experts born in the navel of the world."
  },
  image: "/nosotros.jpg"
});

export const getWhyUs = (lang: 'es' | 'en') => [
  { icon: "authentic", text: lang === 'es' ? "Experiencias auténticas en Rapa Nui" : "Authentic experiences in Rapa Nui" },
  { icon: "personal", text: lang === 'es' ? "Atención personalizada" : "Personalized attention" },
  { icon: "guides", text: lang === 'es' ? "Guías locales" : "Local guides" },
  { icon: "nature", text: lang === 'es' ? "Cultura, mar y naturaleza" : "Culture, sea and nature" },
  { icon: "group", text: lang === 'es' ? "Experiencias privadas y grupales" : "Private and group experiences" },
  { icon: "heritage", text: lang === 'es' ? "Compromiso con el patrimonio y la comunidad" : "Commitment to heritage and community" },
];

export const getCustomExperiences = (lang: 'es' | 'en') => [
  { emoji: "🗿", text: lang === 'es' ? "Tours arqueológicos" : "Archaeological tours" },
  { emoji: "🌊", text: lang === 'es' ? "Experiencias de mar" : "Sea experiences" },
  { emoji: "🌴", text: lang === 'es' ? "Rutas privadas" : "Private routes" },
  { emoji: "🍽", text: lang === 'es' ? "Gastronomía local" : "Local gastronomy" },
  { emoji: "📸", text: lang === 'es' ? "Experiencias fotográficas" : "Photography experiences" },
  { emoji: "🚐", text: lang === 'es' ? "Tours personalizados" : "Custom tours" },
  { emoji: "♿", text: lang === 'es' ? "Turismo inclusivo y accesible (próximamente)" : "Inclusive & accessible tourism (coming soon)" },
];

export const CONTACT_INFO = {
  email: "info@touamamari.com",
  location: "Hanga Roa, Rapa Nui (Isla de Pascua)",
  whatsapp: "+56912345678",
  instagram: "https://www.instagram.com/toumamari.rapanui",
  facebook: "https://www.facebook.com/toumamari",
};

export const GALLERY_PHOTOS = [
  { src: "/images/tours/ahu-tongariki-dia.jpg",       title_es: "Ahu Tongariki",           title_en: "Ahu Tongariki",          subtitle_es: "Los 15 Moais",               subtitle_en: "The 15 Moais" },
  { src: "/images/tours/ahu-tongariki-amanecer.jpg",  title_es: "Ahu Tongariki",           title_en: "Ahu Tongariki",          subtitle_es: "Amanecer Sagrado",           subtitle_en: "Sacred Sunrise" },
  { src: "/images/tours/rano-kau-crater.jpg",         title_es: "Volcán Rano Kau",         title_en: "Rano Kau Volcano",       subtitle_es: "Cráter y Laguna",            subtitle_en: "Crater & Lagoon" },
  { src: "/images/tours/rano-raraku-principal.jpg",   title_es: "Rano Raraku",             title_en: "Rano Raraku",            subtitle_es: "La Cantera de Moais",        subtitle_en: "The Moai Quarry" },
  { src: "/images/tours/rano-raraku-sector2.jpg",     title_es: "Rano Raraku",             title_en: "Rano Raraku",            subtitle_es: "Sendero entre Gigantes",     subtitle_en: "Path Among Giants" },
  { src: "/images/tours/rano-raraku-sector3.jpg",     title_es: "Rano Raraku",             title_en: "Rano Raraku",            subtitle_es: "Guardianes del Volcán",      subtitle_en: "Volcano Guardians" },
  { src: "/images/tours/ahu-akivi.jpg",               title_es: "Ahu Akivi",               title_en: "Ahu Akivi",              subtitle_es: "Los Siete Exploradores",     subtitle_en: "The Seven Explorers" },
  { src: "/images/tours/motu-islotes.jpg",            title_es: "Islotes Motu",            title_en: "Motu Islets",            subtitle_es: "Vista desde Orongo",         subtitle_en: "View from Orongo" },
  { src: "/images/tours/puna-pau.jpg",                title_es: "Puna Pau",                title_en: "Puna Pau",               subtitle_es: "Cantera de Pukao",           subtitle_en: "Pukao Quarry" },
  { src: "/images/tours/puna-pau-detalle.jpg",        title_es: "Pukao de Puna Pau",       title_en: "Puna Pau Pukao",         subtitle_es: "Detalle de Escoria Roja",    subtitle_en: "Red Scoria Detail" },
  { src: "/images/tours/cueva-ana-kakenga.jpg",       title_es: "Ana Kakenga",             title_en: "Ana Kakenga",            subtitle_es: "Cueva de Dos Ventanas",      subtitle_en: "Cave of Two Windows" },
  { src: "/images/tours/cueva-costera.jpg",           title_es: "Cuevas Costeras",         title_en: "Coastal Caves",          subtitle_es: "Túneles de Lava",            subtitle_en: "Lava Tunnels" },
  { src: "/images/tours/te-pito-kura.jpg",            title_es: "Te Pito Kura",            title_en: "Te Pito Kura",           subtitle_es: "El Ombligo del Mundo",       subtitle_en: "The Navel of the World" },
  { src: "/images/tours/moai-paro-derribado.jpg",     title_es: "Moai Paro",               title_en: "Moai Paro",              subtitle_es: "El Moai Más Grande",         subtitle_en: "The Largest Moai" },
  { src: "/images/tours/ahu-vaihu.jpg",               title_es: "Ahu Vaihu",               title_en: "Ahu Vaihu",              subtitle_es: "Moais Derribados",           subtitle_en: "Fallen Moais" },
  { src: "/images/tours/ana-te-pahu.jpg",             title_es: "Ana Te Pahu",             title_en: "Ana Te Pahu",            subtitle_es: "Cueva de los Plátanos",      subtitle_en: "Banana Cave" },
  { src: "/images/galeria/moai-heic-1.jpg",           title_es: "Moais de Rano Raraku",    title_en: "Rano Raraku Moais",      subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/moai-heic-2.jpg",           title_es: "Detalle de Moai",         title_en: "Moai Detail",            subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/moai-heic-3.jpg",           title_es: "Moais en la Ladera",      title_en: "Hillside Moais",         subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/moai-heic-4.jpg",           title_es: "Perfil de Moai",          title_en: "Moai Profile",           subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/moai-heic-5.jpg",           title_es: "Moais Monumentales",      title_en: "Monumental Moais",       subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/moai-heic-6.jpg",           title_es: "Moais al Atardecer",      title_en: "Moais at Dusk",          subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/moai-heic-7.jpg",           title_es: "Moais en la Neblina",     title_en: "Moais in the Mist",      subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/moai-heic-8.jpg",           title_es: "Moais Ancestrales",       title_en: "Ancestral Moais",        subtitle_es: "Fotografía Original",        subtitle_en: "Original Photography" },
  { src: "/images/galeria/rapanui-extra1.jpg",        title_es: "Rapa Nui",                title_en: "Rapa Nui",               subtitle_es: "Isla de Pascua",             subtitle_en: "Easter Island" },
  { src: "/images/galeria/rapanui-extra2.jpg",        title_es: "Rapa Nui",                title_en: "Rapa Nui",               subtitle_es: "Isla de Pascua",             subtitle_en: "Easter Island" },
  { src: "/images/tours/ahu-tongariki-day.jpg",       title_es: "Ahu Tongariki",           title_en: "Ahu Tongariki",          subtitle_es: "Luz del Día",                subtitle_en: "Daylight" },
  { src: "/images/tours/ahu-tongariki-sunset.jpg",    title_es: "Ahu Tongariki",           title_en: "Ahu Tongariki",          subtitle_es: "Atardecer Rojizo",           subtitle_en: "Crimson Sunset" },
  { src: "/images/tours/rano-raraku-sector1.jpg",     title_es: "Rano Raraku",             title_en: "Rano Raraku",            subtitle_es: "Zona Norte",                 subtitle_en: "Northern Zone" },
  { src: "/images/tours/rano-raraku-sector4.jpg",     title_es: "Rano Raraku",             title_en: "Rano Raraku",            subtitle_es: "Sector Este",                subtitle_en: "Eastern Sector" },
  { src: "/images/tours/rano-raraku-sector.jpg",      title_es: "Rano Raraku",             title_en: "Rano Raraku",            subtitle_es: "Vista General",              subtitle_en: "General View" },
  { src: "/images/tours/rano-raraku.jpg",             title_es: "Rano Raraku",             title_en: "Rano Raraku",            subtitle_es: "Cantera Sagrada",            subtitle_en: "Sacred Quarry" },
  { src: "/images/tours/hero-rapanui.jpg",            title_es: "Rapa Nui",                title_en: "Rapa Nui",               subtitle_es: "Vista Panorámica",           subtitle_en: "Panoramic View" },
  { src: "/images/tours/costa-acantilado.jpg",        title_es: "Costa de Acantilados",    title_en: "Cliff Coast",            subtitle_es: "Paisaje Salvaje",            subtitle_en: "Wild Landscape" },
  { src: "/images/tours/cueva-costa2.jpg",            title_es: "Cuevas Costeras",         title_en: "Coastal Caves",          subtitle_es: "Acceso al Mar",              subtitle_en: "Sea Access" },
  { src: "/images/tours/cuevas-costas-2.jpg",         title_es: "Cuevas del Litoral",      title_en: "Littoral Caves",         subtitle_es: "Formaciones de Lava",        subtitle_en: "Lava Formations" },
  { src: "/images/tours/moai-derribado.jpg",          title_es: "Moai Derribado",          title_en: "Fallen Moai",            subtitle_es: "Historia en el Suelo",       subtitle_en: "History on the Ground" },
  { src: "/images/tours/pukao-detalle.jpg",           title_es: "Pukao",                   title_en: "Pukao",                  subtitle_es: "Topknot de los Moais",       subtitle_en: "Moai Topknot" },
  { src: "/images/tours/puna-pau-acceso.jpg",         title_es: "Puna Pau",                title_en: "Puna Pau",               subtitle_es: "Camino a la Cantera",        subtitle_en: "Path to the Quarry" },
];
