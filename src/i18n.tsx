import { ReactNode, createContext, useContext, useState } from "react";

type Language = "es" | "en";

interface Translations {
  navInicio: string;
  navTours: string;
  navNosotros: string;
  navContacto: string;
  cart: string;
  heroSub: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle3: string;
  heroText: string;
  exploreBtn: string;
  toursTitle1: string;
  toursTitle2: string;
  toursSubtitle: string;
  tourDetailsBtn: string;
  aboutTag: string;
  aboutStats1: string;
  aboutStats2: string;
  contactTitle1: string;
  contactTitle2: string;
  contactSubtitle: string;
  emailLabel: string;

  locationLabel: string;
  formName: string;
  formNameP: string;
  formEmail: string;
  formSubj: string;
  formSubjP: string;
  formMsg: string;
  formMsgP: string;
  formBtn: string;
  footerDesc: string;
  footerLinks: string;
  footerFollow: string;
  modalPrice: string;
  modalDuration: string;
  modalLocation: string;
  modalExperience: string;
  modalIncludes: string;
  modalNotIncludes: string;
  modalItinerary: string;
  modalTotal: string;
  modalReserve: string;
  cartTitle: string;
  cartEmpty: string;
  cartDate: string;
  cartTravelers: string;
  cartTotal: string;
  cartPayPayPal: string;
  cartSecurePayment: string;
  cartFlexibleCancel: string;
  modalAddDate: string;
  filterAll: string;
  filterHalfDay: string;
  filterFullDay: string;
  filterPacks: string;
  ofertaBadge: string;
  navGuia: string;
  navImpacto: string;
  navTerminos: string;
  reviewsTitle: string;
  reviewsSubtitle: string;
  promoVideoTitle: string;
  promoVideoSubtitle: string;
  whyUsTitle: string;
  whyUsSubtitle: string;
  customExpTitle: string;
  customExpSubtitle: string;
  customExpCTA: string;
  fromPrice: string;
  perPerson: string;
  minPassengers: string;
  footerNote: string;
}

const translations: Record<Language, Translations> = {
  es: {
    navInicio: "Inicio",
    navTours: "Catálogo de Tours",
    navNosotros: "Nosotros",
    navContacto: "Contacto",
    cart: "Carrito",
    heroSub: "Isla de Pascua",
    heroTitle1: "Descubre los",
    heroTitle2: "Misterios de",
    heroTitle3: "Rapa Nui",
    heroText: "Catálogo visual y reservas exclusivas para expediciones, rutas arqueológicas y experiencias inmersivas guiadas por expertos locales con profundo respeto al mana ancestral.",
    exploreBtn: "Explorar Experiencias",
    toursTitle1: "Catálogo de",
    toursTitle2: "Aventuras",
    toursSubtitle: "Selecciona las fechas de tu expedición y reserva tus tours de forma segura. Sumérgete en la historia, geografía y mitología de la isla.",
    tourDetailsBtn: "Ver Detalles",
    aboutTag: "Sobre la Agencia",
    aboutStats1: "Años de Experiencia",
    aboutStats2: "Autenticidad Rapanui",
    contactTitle1: "Ponte en",
    contactTitle2: "Contacto",
    contactSubtitle: "¿Tienes dudas sobre los paquetes turísticos o necesitas armar un tour a medida? Escríbenos y un guía local te responderá a la brevedad.",
    emailLabel: "Email Oficial",
    locationLabel: "Oficina Central",
    formName: "Nombre Completo",
    formNameP: "Ej. Juan Pérez",
    formEmail: "Email",
    formSubj: "Asunto (Opcional)",
    formSubjP: "Tour a medida, cotización familiar...",
    formMsg: "Mensaje",
    formMsgP: "¿En qué te podemos ayudar?",
    formBtn: "Enviar Mensaje",
    footerDesc: "Descubriendo los místicos senderos de Rapa Nui con el mismo respeto y amor que nuestros ancestros.",
    footerLinks: "Enlaces Rápidos",
    footerFollow: "Síguenos",
    modalPrice: "Precio",
    modalDuration: "Duración",
    modalLocation: "Ubicación",
    modalExperience: "La Experiencia",
    modalIncludes: "Qué incluye",
    modalNotIncludes: "No incluye",
    modalItinerary: "Itinerario referencial",
    modalTotal: "Total del grupo",
    modalReserve: "Reservar Tour",
    cartTitle: "Tu Carrito",
    cartEmpty: "No hay tours en tu carrito.",
    cartDate: "Fecha",
    cartTravelers: "Viajeros",
    cartTotal: "Subtotal",
    cartPayPayPal: "Pagar con PayPal",
    cartSecurePayment: "Pago 100% seguro",
    cartFlexibleCancel: "Cancelación flexible",
    modalAddDate: "Selecciona Fecha",
    filterAll: "Todos",
    filterHalfDay: "Medio Día",
    filterFullDay: "Full Day",
    filterPacks: "Paquetes",
    ofertaBadge: "Ahorra",
    navGuia: "Guía del Viajero",
    navImpacto: "Aporte Local",
    navTerminos: "Términos y Condiciones",
    reviewsTitle: "Lo que dicen nuestros",
    reviewsSubtitle: "viajeros",
    promoVideoTitle: "Siente el",
    promoVideoSubtitle: "Mana",
    whyUsTitle: "¿Por qué",
    whyUsSubtitle: "Toumamari?",
    customExpTitle: "Experiencias",
    customExpSubtitle: "Personalizadas",
    customExpCTA: "Consultar por Email",
    fromPrice: "Desde",
    perPerson: "por persona",
    minPassengers: "Mín. {n} pasajeros",
    footerNote: "Valores sujetos a disponibilidad, temporada y condiciones climáticas. Entradas a parques no incluidas salvo indicación expresa."
  },
  en: {
    navInicio: "Home",
    navTours: "Catalog",
    navNosotros: "About Us",
    navContacto: "Contact",
    cart: "Cart",
    heroSub: "Easter Island",
    heroTitle1: "Discover the",
    heroTitle2: "Mysteries of",
    heroTitle3: "Rapa Nui",
    heroText: "Visual catalog and exclusive bookings for expeditions, archaeological routes, and immersive experiences guided by local experts with deep respect for the ancestral mana.",
    exploreBtn: "Explore Experiences",
    toursTitle1: "Catalog of",
    toursTitle2: "Adventures",
    toursSubtitle: "Select the dates of your expedition and book your tours securely. Immerse yourself in the history, geography, and mythology of the island.",
    tourDetailsBtn: "View Details",
    aboutTag: "About the Agency",
    aboutStats1: "Years of Experience",
    aboutStats2: "Rapanui Authenticity",
    contactTitle1: "Get in",
    contactTitle2: "Touch",
    contactSubtitle: "Do you have questions about our tour packages or need a custom tour? Write to us and a local guide will reply shortly.",
    emailLabel: "Official Email",
    locationLabel: "Head Office",
    formName: "Full Name",
    formNameP: "e.g. John Doe",
    formEmail: "Email",
    formSubj: "Subject (Optional)",
    formSubjP: "Custom tour, family quote...",
    formMsg: "Message",
    formMsgP: "How can we help you?",
    formBtn: "Send Message",
    footerDesc: "Discovering the mystical trails of Rapa Nui with the same respect and love as our ancestors.",
    footerLinks: "Quick Links",
    footerFollow: "Follow Us",
    modalPrice: "Price",
    modalDuration: "Duration",
    modalLocation: "Location",
    modalExperience: "The Experience",
    modalIncludes: "What's included",
    modalNotIncludes: "Not included",
    modalItinerary: "Reference itinerary",
    modalTotal: "Group total",
    modalReserve: "Book Tour",
    cartTitle: "Your Cart",
    cartEmpty: "No tours in your cart.",
    cartDate: "Date",
    cartTravelers: "Travelers",
    cartTotal: "Subtotal",
    cartPayPayPal: "Pay with PayPal",
    cartSecurePayment: "100% secure payment",
    cartFlexibleCancel: "Flexible cancellation",
    modalAddDate: "Select Date",
    filterAll: "All",
    filterHalfDay: "Half Day",
    filterFullDay: "Full Day",
    filterPacks: "Packages",
    ofertaBadge: "Save",
    navGuia: "Traveler's Guide",
    navImpacto: "Social Impact",
    navTerminos: "Terms & Conditions",
    reviewsTitle: "What our travelers",
    reviewsSubtitle: "say",
    promoVideoTitle: "Feel the",
    promoVideoSubtitle: "Mana",
    whyUsTitle: "Why",
    whyUsSubtitle: "Toumamari?",
    customExpTitle: "Custom",
    customExpSubtitle: "Experiences",
    customExpCTA: "Ask via Email",
    fromPrice: "From",
    perPerson: "per person",
    minPassengers: "Min. {n} passengers",
    footerNote: "Prices subject to availability, season and weather conditions. Park entrances not included unless expressly stated."
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
