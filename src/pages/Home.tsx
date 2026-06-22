import React, { useEffect, useState, useRef, memo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "motion/react";
import { CalendarDays, MapPin, Clock, ArrowRight, Compass, Mail, X, Check, XCircle, Star, ShoppingCart, Anchor, Camera, UtensilsCrossed, Map, Users, Shield, Heart, Sparkles, ChevronDown, ChevronLeft, ChevronRight, Send, Phone } from "lucide-react";
import { useLanguage } from "../i18n";
import { useCart } from "../CartContext";
import { CONTACT_INFO, GALLERY_PHOTOS, getAbout, getReviews, getTours, getWhyUs, getCustomExperiences, Tour } from "../data";
import { fetchTours, getBookedSpotsForDate, DEFAULT_CAPACITY } from "../lib/api";
import { submitContactMessage } from "../lib/api";

function useContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const submit = async () => {
    if (!formData.name || !formData.email || !formData.message) return false;
    setSending(true);
    setError("");
    try {
      await submitContactMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || null,
        message: formData.message,
      });
      setSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError("Error al enviar. Intenta nuevamente.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setSending(false);
    }
    return true;
  };

  return { formData, update, submit, sending, sent, error };
}
import { TourCard } from "../components/TourCard";
import { Layout } from "../components/Layout";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const HERO_VIDEOS = ["/videos/rapanui-video1.mp4", "/videos/rapanui-video2.mp4"];

function AnimatedCounter({ target, suffix = "" }: { target: number | string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numTarget = typeof target === 'string' ? parseInt(target) : target;

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * numTarget));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, numTarget]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 11.3 + 5) % 100}%`,
  top: `${(i * 17.7 + 8) % 100}%`,
  duration: 3 + (i % 5) * 0.8,
  delay: i * 0.55,
}));

const ParticleField = memo(function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#FFD700]/30 rounded-full"
          style={{ left: p.left, top: p.top }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
});

function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#FFD700]/40" />
      <div className="w-2 h-2 rotate-45 border border-[#FFD700]/40 mx-4" />
      <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#FFD700]/40" />
    </div>
  );
}

function SiteMarquee({ lang }: { lang: 'es' | 'en' }) {
  const sites = lang === 'es'
    ? ["Ahu Tongariki", "Rano Raraku", "Volcán Rano Kau", "Orongo", "Ana Kakenga", "Te Pito Kura", "Puna Pau", "Ahu Akivi", "Anakena", "Ahu Vaihu", "Ana Te Pahu", "Motu Nui"]
    : ["Ahu Tongariki", "Rano Raraku", "Rano Kau Volcano", "Orongo", "Ana Kakenga", "Te Pito Kura", "Puna Pau", "Ahu Akivi", "Anakena Beach", "Ahu Vaihu", "Ana Te Pahu", "Motu Nui"];
  const doubled = [...sites, ...sites];
  return (
    <div className="relative overflow-hidden py-3 mb-14">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((site, i) => (
          <span key={i} className="flex items-center gap-8 text-[#FFD700]/35 text-[11px] font-bold uppercase tracking-[0.4em]">
            {site}
            <span className="inline-block w-1 h-1 rounded-full bg-[#FFD700]/25" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const whyUsIcons: Record<string, typeof Heart> = {
  authentic: Sparkles,
  personal: Heart,
  guides: Users,
  nature: Anchor,
  group: Map,
  heritage: Shield,
};

const customIcons: Record<string, typeof Heart> = {
  "🗿": MapPin,
  "🌊": Anchor,
  "🌴": Map,
  "🍽": UtensilsCrossed,
  "📸": Camera,
  "🚐": Map,
  "♿": Users,
};

export function Home() {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const contactForm = useContactForm();

  const [tours, setTours] = useState<Tour[]>(() => getTours(language));
  const [heroVideoIndex, setHeroVideoIndex] = useState(0);
  const [promoVideoIndex, setPromoVideoIndex] = useState(0);
  const [promoDir, setPromoDir] = useState(1);

  // Calendar state
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [blockedDates, setBlockedDates] = useState<Record<string, number>>({});
  const [calLoading, setCalLoading] = useState(false);
  const [availabilityForSelected, setAvailabilityForSelected] = useState<number | null>(null);

  useEffect(() => {
    fetchTours(language)
      .then(result => setTours(result.length > 0 ? result : getTours(language)))
      .catch(() => setTours(getTours(language)));
  }, [language]);

  const ABOUT = getAbout(language);
  const REVIEWS = getReviews(language);
  const WHY_US = getWhyUs(language);
  const CUSTOM_EXP = getCustomExperiences(language);

  const filteredTours = activeFilter === "all" ? tours : tours.filter(tour => tour.categoryId === activeFilter);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (selectedTour) {
      document.body.style.overflow = "hidden";
      setSelectedDate("");
      setTravelers(selectedTour.minPassengers || 1);
      setAvailabilityForSelected(null);
      const now = new Date();
      setCalYear(now.getFullYear());
      setCalMonth(now.getMonth());
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedTour]);

  // Load booked spots for all dates in the visible month when tour or month changes
  useEffect(() => {
    if (!selectedTour) return;
    let cancelled = false;
    setCalLoading(true);
    const capacity = DEFAULT_CAPACITY[selectedTour.categoryId] ?? 10;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const promises: Promise<void>[] = [];
    const results: Record<string, number> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const day = new Date(calYear, calMonth, d);
      if (day < today) continue;
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 90);
      if (day > maxDate) { results[dateStr] = capacity; continue; } // blocked — skip query
      promises.push(
        getBookedSpotsForDate(selectedTour.id, dateStr)
          .then(spots => { results[dateStr] = spots; })
          .catch(() => { results[dateStr] = 0; })
      );
    }
    Promise.all(promises).then(() => {
      if (!cancelled) {
        setBlockedDates(results);
        setCalLoading(false);
      }
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTour, calYear, calMonth]);

  // Update availability badge when selected date changes
  useEffect(() => {
    if (!selectedTour || !selectedDate) { setAvailabilityForSelected(null); return; }
    const capacity = DEFAULT_CAPACITY[selectedTour.categoryId] ?? 10;
    getBookedSpotsForDate(selectedTour.id, selectedDate)
      .then(spots => setAvailabilityForSelected(Math.max(0, capacity - spots)))
      .catch(() => setAvailabilityForSelected(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTour]);

  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } }
  };

  return (
    <Layout scrolled={scrolled}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section ref={heroRef} id="inicio" className="relative h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black grain-overlay">
        <ParticleField />

        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 w-full h-full">
          <AnimatePresence mode="sync">
            <motion.video
              key={heroVideoIndex}
              autoPlay
              muted
              playsInline
              onEnded={() => setHeroVideoIndex(i => (i + 1) % HERO_VIDEOS.length)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              src={HERO_VIDEOS[heroVideoIndex]}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            <motion.span variants={fadeUp} className="text-[#FFD700] border border-[#FFD700]/50 rounded-full px-5 py-2 text-xs uppercase tracking-[0.25em] font-semibold mb-8 flex items-center gap-2 bg-black/40 backdrop-blur-sm">
              <MapPin className="w-3 h-3" /> {t.heroSub}
            </motion.span>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white mb-8 uppercase tracking-tight leading-[1.05]">
              <motion.span className="inline-block" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
                {t.heroTitle1}
              </motion.span>{" "}
              <br className="md:hidden" />
              <motion.span className="inline-block" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
                {t.heroTitle2}
              </motion.span>{" "}
              <motion.span className="inline-block text-gradient-gold" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, duration: 0.8, ease: EASE }}>
                {t.heroTitle3}
              </motion.span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-neutral-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              {t.heroText}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <a href="#tours" className="bg-[#FFD700] text-black px-10 py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider hover:bg-yellow-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,215,0,0.4)] flex items-center gap-3 w-full sm:w-auto justify-center animate-pulse-glow">
                {t.exploreBtn} <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#contacto" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-full font-bold text-sm md:text-base uppercase tracking-wider hover:bg-white hover:text-black hover:scale-105 transition-all flex items-center gap-3 w-full sm:w-auto justify-center">
                <Mail className="w-5 h-5" /> {t.contactTitle2}
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <ChevronDown className="w-8 h-8 text-[#FFD700]/60" />
        </motion.div>
      </section>

      {/* ═══════════════ VIDEO PROMO ═══════════════ */}
      <section className="py-16 md:py-24 bg-black relative overflow-hidden">
        <ParticleField />
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-white relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
            <h2 className="text-3xl md:text-5xl font-black mb-12">{t.promoVideoTitle} <span className="text-gradient-gold">{t.promoVideoSubtitle}</span></h2>
          </motion.div>
          <div className="relative max-w-4xl mx-auto">
            {/* carousel frame */}
            <div className="overflow-hidden rounded-3xl shadow-2xl border border-white/10 aspect-video relative bg-neutral-900">
              <AnimatePresence initial={false} custom={promoDir}>
                <motion.div
                  key={promoVideoIndex}
                  custom={promoDir}
                  variants={{
                    enter: (dir: number) => ({ x: `${dir * 100}%`, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({ x: `${-dir * 100}%`, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.55, ease: EASE }}
                  className="absolute inset-0"
                >
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                    src={HERO_VIDEOS[promoVideoIndex]}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* arrows */}
            <button
              onClick={() => { setPromoDir(-1); setPromoVideoIndex(i => (i - 1 + HERO_VIDEOS.length) % HERO_VIDEOS.length); }}
              aria-label="Anterior"
              className="absolute left-2 md:-left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-200 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setPromoDir(1); setPromoVideoIndex(i => (i + 1) % HERO_VIDEOS.length); }}
              aria-label="Siguiente"
              className="absolute right-2 md:-right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all duration-200 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* dots */}
            <div className="flex justify-center gap-2 mt-5">
              {HERO_VIDEOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (i !== promoVideoIndex) { setPromoDir(i > promoVideoIndex ? 1 : -1); setPromoVideoIndex(i); } }}
                  className={`h-2 rounded-full transition-all duration-300 ${i === promoVideoIndex ? "w-6 bg-[#FFD700]" : "w-2 bg-white/30 hover:bg-white/60"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* gradient bridge: dark promo → light tours */}
      <div
        aria-hidden
        className="h-64 md:h-80 -mb-1"
        style={{
          background:
            "linear-gradient(to bottom, #000000 0%, #1c1c1c 15%, #404040 30%, #737373 50%, #d4d4d4 70%, #f5f5f5 85%, #fafafa 100%)",
        }}
      />

      {/* ═══════════════ CATÁLOGO DE TOURS ═══════════════ */}
      <section id="tours" className="py-20 md:py-32 px-4 md:px-8 max-w-7xl mx-auto relative">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-neutral-900">
            {t.toursTitle1} <span className="text-gradient-gold">{t.toursTitle2}</span>
          </h2>
          <p className="text-neutral-500 max-w-2xl mx-auto text-lg mb-10">{t.toursSubtitle}</p>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
            {[
              { id: "all", label: t.filterAll },
              { id: "half-day", label: t.filterHalfDay },
              { id: "full-day", label: t.filterFullDay },
              { id: "packs", label: t.filterPacks }
            ].map((f) => (
              <motion.button
                key={f.id}
                variants={scaleUp}
                onClick={() => setActiveFilter(f.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${activeFilter === f.id ? "bg-black text-white border-black shadow-lg" : "bg-white text-neutral-500 border-neutral-200 hover:border-black hover:text-black"}`}
              >
                {f.label}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredTours.map((tour, i) => (
              <motion.div
                key={tour.id}
                layout
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
                className="h-full"
              >
                <TourCard tour={tour} onClick={() => setSelectedTour(tour)} btnText={t.tourDetailsBtn} ofertaText={t.ofertaBadge} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* gradient bridge: light tours → dark gallery */}
      <div
        aria-hidden
        className="h-64 md:h-80 -mb-1"
        style={{
          background:
            "linear-gradient(to bottom, #fafafa 0%, #f5f5f5 15%, #d4d4d4 30%, #737373 50%, #404040 70%, #1c1c1c 85%, #0a0a0a 100%)",
        }}
      />

      {/* ═══════════════ GALERÍA FOTOGRÁFICA ═══════════════ */}
      <section id="galeria" className="py-16 md:py-24 bg-neutral-950 text-white relative overflow-hidden">
        <SiteMarquee lang={language} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-[#FFD700] text-xs font-bold uppercase tracking-[0.3em] mb-4"
            >
              {language === 'es' ? "Sitios Arqueológicos" : "Archaeological Sites"}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              {language === 'es' ? "Rapa Nui " : "Rapa Nui "}
              <span className="text-gradient-gold">{language === 'es' ? "en Imágenes" : "in Images"}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-neutral-400 max-w-xl mx-auto">
              {language === 'es'
                ? "Cada rincón de la isla guarda siglos de historia viva — te llevamos a vivirlos."
                : "Every corner of the island holds centuries of living history — we take you to experience them."}
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {GALLERY_PHOTOS.map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.7,
                  delay: (i % 4) * 0.09,
                  ease: EASE,
                }}
                className={`relative overflow-hidden rounded-xl group cursor-pointer h-44 sm:h-52 ${i % 14 === 0 || i % 14 === 8 ? "md:col-span-2 md:h-64" : ""}`}
              >
                <motion.img
                  src={photo.src}
                  alt={language === 'es' ? photo.title_es : photo.title_en}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.07 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-70 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-[#FFD700] text-[9px] font-bold uppercase tracking-[0.35em] mb-0.5">
                    {language === 'es' ? photo.subtitle_es : photo.subtitle_en}
                  </p>
                  <h3 className="text-white font-bold text-sm leading-tight">
                    {language === 'es' ? photo.title_es : photo.title_en}
                  </h3>
                </div>
                <div className="absolute inset-0 ring-1 ring-white/0 group-hover:ring-[#FFD700]/30 rounded-xl transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ EXPERIENCIAS PERSONALIZADAS ═══════════════ */}
      <section className="py-16 md:py-24 bg-neutral-950 text-white relative overflow-hidden grain-overlay">
        <ParticleField />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t.customExpTitle} <span className="text-gradient-gold">{t.customExpSubtitle}</span></h2>
            <p className="text-neutral-400 max-w-xl mx-auto text-lg">
              {language === 'es' ? "Touamamari también ofrece experiencias adaptadas a cada visitante" : "Toumamari also offers experiences adapted to each visitor"}
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-12">
            {CUSTOM_EXP.map((exp, i) => {
              const Icon = customIcons[exp.emoji] || Sparkles;
              return (
                <motion.div key={i} variants={scaleUp} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-[#FFD700]/30 transition-all duration-400 group hover-lift">
                  <div className="w-12 h-12 bg-[#FFD700]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#FFD700]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#FFD700]" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-300 group-hover:text-white transition-colors">{exp.text}</p>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <a href="#contacto" className="inline-flex items-center gap-3 bg-[#FFD700] text-black px-8 py-4 rounded-full font-bold uppercase tracking-wider hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all">
              <Mail className="w-5 h-5" /> {t.customExpCTA}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ NOSOTROS ═══════════════ */}
      <section id="nosotros" className="py-20 md:py-28 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: EASE }} className="relative h-[380px] sm:h-[480px] lg:h-[600px] w-full rounded-3xl overflow-hidden border border-white/10 group">
            <img src={ABOUT.image} alt="Cultura Rapa Nui" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md border border-[#FFD700]/30 p-6 rounded-2xl max-w-xs">
              <Compass className="w-10 h-10 text-[#FFD700] mb-3" />
              <p className="font-bold text-lg mb-1">{ABOUT.badges.title}</p>
              <p className="text-sm text-neutral-400">{ABOUT.badges.desc}</p>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
            <span className="text-[#FFD700] font-bold tracking-[0.2em] uppercase text-sm mb-4 block">{t.aboutTag}</span>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">{ABOUT.title}</h2>
            <div className="text-neutral-300 text-lg font-light leading-relaxed space-y-6">
              <p>{ABOUT.description}</p>
              <p>{ABOUT.description2}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12 py-8 border-y border-white/10">
              <div>
                <p className="text-4xl font-black text-[#FFD700]"><AnimatedCounter target={15} suffix="+" /></p>
                <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mt-2">{t.aboutStats1}</p>
              </div>
              <div>
                <p className="text-4xl font-black text-[#FFD700]"><AnimatedCounter target={100} suffix="%" /></p>
                <p className="text-sm text-neutral-400 font-medium uppercase tracking-wider mt-2">{t.aboutStats2}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* gradient bridge: dark nosotros → light why-us */}
      <div
        aria-hidden
        className="h-64 md:h-80 -mb-1"
        style={{
          background:
            "linear-gradient(to bottom, #000000 0%, #1c1c1c 15%, #404040 30%, #737373 50%, #d4d4d4 70%, #f5f5f5 85%, #fafafa 100%)",
        }}
      />

      {/* ═══════════════ POR QUÉ TOUMAMARI ═══════════════ */}
      <section className="py-16 md:py-24 bg-neutral-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900">{t.whyUsTitle} <span className="text-gradient-gold">{t.whyUsSubtitle}</span></h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {WHY_US.map((item, i) => {
              const Icon = whyUsIcons[item.icon] || Check;
              return (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 hover:border-[#FFD700]/40 hover:shadow-lg transition-all duration-400 hover-lift">
                  <div className="w-12 h-12 bg-[#FFD700]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#FFD700]" />
                  </div>
                  <p className="font-semibold text-neutral-800">{item.text}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ RESEÑAS ═══════════════ */}
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-neutral-900">{t.reviewsTitle} <span className="text-gradient-gold">{t.reviewsSubtitle}</span></h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((r) => (
              <motion.div key={r.id} variants={fadeUp} className="bg-neutral-50 p-8 rounded-3xl border border-neutral-200 flex flex-col h-full hover:shadow-xl hover:border-[#FFD700]/30 transition-all duration-500 hover-lift">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-[#FFD700] fill-current" />)}
                </div>
                <p className="italic text-neutral-600 mb-6 flex-grow leading-relaxed">"{r.text}"</p>
                <div className="border-t border-neutral-200 pt-4 flex justify-between items-end">
                  <div>
                    <p className="font-bold text-neutral-900">{r.name}</p>
                    <p className="text-xs text-neutral-500 uppercase font-semibold">{r.country}</p>
                  </div>
                  <span className="text-xs font-bold text-neutral-400 uppercase bg-neutral-100 px-3 py-1 rounded-full">{r.platform}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CONTACTO ═══════════════ */}
      <section id="contacto" className="py-20 md:py-32 px-4 md:px-8 max-w-7xl mx-auto relative">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div variants={fadeUp} className="flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t.contactTitle1} <span className="text-gradient-gold">{t.contactTitle2}</span></h2>
            <p className="text-neutral-500 text-lg mb-12">{t.contactSubtitle}</p>

            <div className="space-y-8">
              {[
                { icon: Mail, label: t.emailLabel, value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
                { icon: MapPin, label: t.locationLabel, value: CONTACT_INFO.location, href: undefined },
                { icon: Phone, label: "WhatsApp", value: CONTACT_INFO.whatsapp, href: `https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, '')}` },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-6 group">
                  <div className="w-16 h-16 bg-neutral-100 flex items-center justify-center rounded-2xl text-neutral-900 group-hover:bg-[#FFD700]/10 group-hover:text-[#FFD700] transition-all duration-300">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-xl font-bold hover:text-[#FFD700] transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-xl font-bold">{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-neutral-100 hover:shadow-[0_20px_60px_rgba(255,215,0,0.08)] transition-shadow duration-500">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); contactForm.submit(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-2">{t.formName}</label>
                  <input type="text" required value={contactForm.formData.name} onChange={(e) => contactForm.update("name", e.target.value)} placeholder={t.formNameP} className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 rounded-2xl px-5 py-4 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-2">{t.formEmail}</label>
                  <input type="email" required value={contactForm.formData.email} onChange={(e) => contactForm.update("email", e.target.value)} placeholder="correo@ejemplo.com" className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 rounded-2xl px-5 py-4 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-2">{t.formSubj}</label>
                <input type="text" value={contactForm.formData.subject} onChange={(e) => contactForm.update("subject", e.target.value)} placeholder={t.formSubjP} className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 rounded-2xl px-5 py-4 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-2">{t.formMsg}</label>
                <textarea rows={4} required value={contactForm.formData.message} onChange={(e) => contactForm.update("message", e.target.value)} placeholder={t.formMsgP} className="w-full bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-[#FFD700] focus:ring-4 focus:ring-[#FFD700]/10 rounded-2xl px-5 py-4 outline-none transition-all resize-none" />
              </div>
              {contactForm.error && (
                <p className="text-red-500 text-sm font-medium">{contactForm.error}</p>
              )}
              <button type="submit" disabled={contactForm.sending} className={`w-full py-5 rounded-2xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 ${contactForm.sent ? "bg-emerald-500 text-white" : "bg-black text-white hover:bg-[#FFD700] hover:text-black hover:shadow-xl hover:shadow-[#FFD700]/20"}`}>
                {contactForm.sent ? (
                  <><Check className="w-5 h-5" /> {language === 'es' ? "¡Mensaje enviado!" : "Message sent!"}</>
                ) : contactForm.sending ? (
                  <>{language === 'es' ? "Enviando..." : "Sending..."}</>
                ) : (
                  <><Send className="w-5 h-5" /> {t.formBtn}</>
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ MAPA ═══════════════ */}
      <section className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-neutral-900">
            <div className="w-10 h-10 bg-[#FFD700]/10 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#FFD700]" />
            </div>
            {language === 'es' ? "Encuéntranos en Hanga Roa" : "Find us in Hanga Roa"}
          </h3>
          <div className="rounded-3xl overflow-hidden border border-neutral-200 shadow-lg h-80 md:h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13577.89!2d-109.4272439!3d-27.1507321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9947de4a70aae4fd%3A0x4c2286c96a1ddf2c!2sHanga%20Roa%2C%20Easter%20Island!5e0!3m2!1ses!2scl!4v1718000000000!5m2!1ses!2scl"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hanga Roa, Easter Island"
              allowFullScreen
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════════ FOOTER NOTE ═══════════════ */}
      <div className="bg-neutral-100 py-6 px-4 text-center">
        <p className="text-xs text-neutral-500 max-w-3xl mx-auto leading-relaxed">{t.footerNote}</p>
      </div>

      {/* ═══════════════ MODAL TOUR ═══════════════ */}
      <AnimatePresence>
        {selectedTour && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTour(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 top-10 md:top-20 z-[70] bg-white rounded-t-[2.5rem] overflow-hidden flex flex-col shadow-2xl mx-auto md:max-w-5xl"
            >
              <div className="absolute top-6 right-6 z-10">
                <button onClick={() => setSelectedTour(null)} className="w-12 h-12 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg border border-white/20 text-neutral-900">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="relative h-64 md:h-96 w-full overflow-hidden">
                  <motion.img layoutId={`tour-img-${selectedTour.id}`} src={selectedTour.image} alt={selectedTour.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8 md:p-12">
                    <div>
                      <span className="text-[#FFD700] text-sm font-bold uppercase tracking-wider mb-2 block">{selectedTour.type}</span>
                      <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">{selectedTour.title}</h2>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12">
                  <div className="flex flex-wrap gap-8 py-6 border-y border-neutral-100">
                    <div>
                      <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-1">{t.modalPrice}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-black text-yellow-600">${selectedTour.price} USD</p>
                        {selectedTour.priceCLP && <p className="text-sm text-neutral-400">(${selectedTour.priceCLP.toLocaleString('es-CL')} CLP)</p>}
                      </div>
                      {selectedTour.minPassengers && <p className="text-xs text-neutral-400 mt-1">{t.minPassengers.replace('{n}', String(selectedTour.minPassengers))}</p>}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-1">{t.modalDuration}</p>
                      <p className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-neutral-400" /> {selectedTour.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-400 font-bold uppercase tracking-wider mb-1">{t.modalLocation}</p>
                      <p className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-neutral-400" /> Rapa Nui</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black mb-4">{t.modalExperience}</h3>
                    <p className="text-neutral-600 leading-relaxed text-lg">{selectedTour.longDescription}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-900"><Check className="w-5 h-5 text-emerald-500" /> {t.modalIncludes}</h4>
                      <ul className="space-y-3">
                        {selectedTour.included.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-neutral-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-neutral-900"><XCircle className="w-5 h-5 text-rose-500" /> {t.modalNotIncludes}</h4>
                      <ul className="space-y-3">
                        {selectedTour.notIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-neutral-500"><span className="w-1.5 h-1.5 rounded-full bg-rose-300 mt-2 flex-shrink-0" />{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black mb-6">{t.modalItinerary}</h3>
                    <div className="space-y-6">
                      {selectedTour.itinerary.map((step, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className="flex gap-6">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
                            {idx !== selectedTour.itinerary.length - 1 && <div className="w-px h-full bg-neutral-200 mt-2" />}
                          </div>
                          <div className="pb-6">
                            <div className="flex flex-wrap items-baseline gap-3 mb-1">
                              <span className="text-sm font-bold text-[#FFD700]">{step.time}</span>
                              <h4 className="text-lg font-bold">{step.title}</h4>
                            </div>
                            <p className="text-neutral-500">{step.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-50 p-6 md:p-8 rounded-3xl border border-neutral-100 flex flex-col gap-6">
                    {/* Calendar */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{t.modalAddDate}</label>
                        {calLoading && <span className="text-xs text-neutral-400">{language === 'es' ? 'Cargando...' : 'Loading...'}</span>}
                      </div>
                      <div className="bg-white border border-neutral-200 rounded-2xl p-4 select-none">
                        {/* Month nav */}
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => {
                              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                              else setCalMonth(m => m - 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-bold text-neutral-900">
                            {new Date(calYear, calMonth).toLocaleString(language === 'es' ? 'es-CL' : 'en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            onClick={() => {
                              const maxDate = new Date(today);
                              maxDate.setDate(today.getDate() + 90);
                              const maxYear = maxDate.getFullYear();
                              const maxM = maxDate.getMonth();
                              if (calYear > maxYear || (calYear === maxYear && calMonth >= maxM)) return;
                              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                              else setCalMonth(m => m + 1);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-500"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Day headers Mon-Sun */}
                        <div className="grid grid-cols-7 mb-1">
                          {(language === 'es' ? ['Lu','Ma','Mi','Ju','Vi','Sá','Do'] : ['Mo','Tu','We','Th','Fr','Sa','Su']).map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-neutral-400 py-1">{d}</div>
                          ))}
                        </div>
                        {/* Day grid */}
                        {(() => {
                          const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
                          const offset = (firstDay + 6) % 7; // shift to Mon=0
                          const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                          const maxDate = new Date(today);
                          maxDate.setDate(today.getDate() + 90);
                          const capacity = DEFAULT_CAPACITY[selectedTour.categoryId] ?? 10;
                          const cells: React.ReactNode[] = [];
                          for (let i = 0; i < offset; i++) cells.push(<div key={`e-${i}`} />);
                          for (let d = 1; d <= daysInMonth; d++) {
                            const date = new Date(calYear, calMonth, d);
                            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const isPast = date < today;
                            const isBeyond = date > maxDate;
                            const bookedSpots = blockedDates[dateStr] ?? 0;
                            const isBlocked = bookedSpots >= capacity;
                            const isSelected = selectedDate === dateStr;
                            const disabled = isPast || isBeyond || isBlocked;
                            cells.push(
                              <button
                                key={d}
                                disabled={disabled}
                                onClick={() => !disabled && setSelectedDate(dateStr)}
                                className={[
                                  'w-full aspect-square flex items-center justify-center rounded-full text-xs font-semibold transition-colors',
                                  isSelected ? 'bg-[#FFD700] text-black font-black' : '',
                                  !isSelected && !disabled ? 'hover:bg-[#FFD700]/20 text-neutral-900' : '',
                                  disabled ? 'text-neutral-300 cursor-not-allowed line-through' : '',
                                  isBlocked && !isPast && !isBeyond ? 'text-neutral-300 line-through' : '',
                                ].filter(Boolean).join(' ')}
                              >
                                {d}
                              </button>
                            );
                          }
                          return <div className="grid grid-cols-7 gap-y-1">{cells}</div>;
                        })()}
                      </div>
                      {/* Availability badge */}
                      {selectedDate && availabilityForSelected !== null && (
                        <p className={`mt-2 text-xs font-bold text-center ${availabilityForSelected === 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {availabilityForSelected === 0
                            ? (language === 'es' ? 'Sin cupos disponibles' : 'No spots available')
                            : (language === 'es' ? `${availabilityForSelected} cupos disponibles` : `${availabilityForSelected} spots available`)}
                        </p>
                      )}
                    </div>
                    {/* Travelers */}
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">{t.cartTravelers}</label>
                      <div className="flex items-center bg-white border border-neutral-200 rounded-2xl px-5 py-3">
                        <button onClick={() => setTravelers(Math.max(selectedTour.minPassengers || 1, travelers - 1))} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 hover:bg-neutral-200 transition-colors">-</button>
                        <span className="flex-1 text-center font-bold text-xl">{travelers}</span>
                        <button onClick={() => setTravelers(travelers + 1)} className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 hover:bg-neutral-200 transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-white border-t border-neutral-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] flex items-center justify-between gap-6">
                <div>
                  <p className="text-neutral-500 text-sm font-semibold">{t.modalTotal}</p>
                  <p className="text-3xl font-black text-neutral-900">${selectedTour.price * travelers}</p>
                </div>
                <button onClick={() => {
                  if (!selectedDate) {
                    alert(language === 'es' ? "Por favor selecciona una fecha para el tour." : "Please select a date for the tour.");
                    return;
                  }
                  addToCart(selectedTour, selectedDate, travelers);
                  setSelectedTour(null);
                }} className="bg-black text-white px-8 md:px-12 py-4 rounded-2xl font-bold uppercase tracking-wider hover:bg-[#FFD700] hover:text-black hover:shadow-xl hover:shadow-[#FFD700]/20 transition-all duration-300 flex items-center gap-3">
                  {t.modalReserve} <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
