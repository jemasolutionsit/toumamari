import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Camera, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/i18n";
import { GALLERY_PHOTOS } from "../data/data";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Photo {
  src: string;
  title_es: string;
  title_en: string;
  subtitle_es: string;
  subtitle_en: string;
}

export function Gallery() {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<"all" | "moais" | "landscapes" | "caves">("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const getPhotoCategory = (p: Photo): "moais" | "landscapes" | "caves" => {
    const src = p.src.toLowerCase();
    const txt = (p.title_es + " " + p.subtitle_es).toLowerCase();
    if (src.includes("moai") || txt.includes("moai") || src.includes("tongariki") || src.includes("akivi") || src.includes("paro") || src.includes("vaihu")) {
      return "moais";
    }
    if (src.includes("cueva") || src.includes("ana-") || src.includes("cueva-costa") || src.includes("motu")) {
      return "caves";
    }
    return "landscapes";
  };

  const filteredPhotos = GALLERY_PHOTOS.filter(p => {
    if (filter === "all") return true;
    return getPhotoCategory(p) === filter;
  });

  const categories = [
    { id: "all", label_es: "Todos", label_en: "All" },
    { id: "moais", label_es: "Moais", label_en: "Moais" },
    { id: "landscapes", label_es: "Volcanes y Canteras", label_en: "Volcanoes & Quarries" },
    { id: "caves", label_es: "Cuevas y Islotes", label_en: "Caves & Islets" }
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#FFD700]/5 via-transparent to-transparent pointer-events-none" />

      {/* Floating back button */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#FFD700] transition-colors font-bold uppercase tracking-wider text-sm group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          {language === "es" ? "Regresar al inicio" : "Back to home"}
        </Link>
      </div>

      {/* Page Header */}
      <header className="max-w-4xl mx-auto text-center px-4 pt-12 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#FFD700]/30 shadow-lg">
            <Camera className="w-6 h-6 text-[#FFD700]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            {language === "es" ? "Galería " : "Photo "}
            <span className="text-gradient-gold">{language === "es" ? "Fotográfica" : "Gallery"}</span>
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {language === "es"
              ? "Explora la belleza y el misticismo de Rapa Nui a través de nuestra selección de imágenes en alta resolución."
              : "Explore the beauty and mysticism of Rapa Nui through our selection of high-resolution images."}
          </p>
        </motion.div>

        {/* Filter categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mt-10"
        >
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                filter === c.id
                  ? "bg-[#FFD700] text-black border-[#FFD700] shadow-lg shadow-[#FFD700]/10"
                  : "bg-white/5 text-neutral-400 border-white/10 hover:border-[#FFD700] hover:text-white"
              }`}
            >
              {language === "es" ? c.label_es : c.label_en}
            </button>
          ))}
        </motion.div>
      </header>

      {/* Grid containing photos */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pb-24 relative z-10">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredPhotos.map((photo, i) => (
              <motion.div
                key={photo.src}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: EASE }}
                onClick={() => setSelectedPhoto(photo)}
                className="relative overflow-hidden rounded-2xl group cursor-pointer aspect-[4/3] bg-neutral-900 border border-white/5"
              >
                <img
                  src={photo.src}
                  alt={language === "es" ? photo.title_es : photo.title_en}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-[#FFD700] text-[9px] font-bold uppercase tracking-[0.3em] mb-1">
                    {language === "es" ? photo.subtitle_es : photo.subtitle_en}
                  </p>
                  <h3 className="text-white font-bold text-sm">
                    {language === "es" ? photo.title_es : photo.title_en}
                  </h3>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Lightbox / Modal view */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center justify-center">
              <motion.img
                initial={{ scale: 0.97 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.97 }}
                src={selectedPhoto.src}
                alt={language === "es" ? selectedPhoto.title_es : selectedPhoto.title_en}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <div className="text-center mt-6">
                <p className="text-[#FFD700] text-xs font-bold uppercase tracking-[0.3em] mb-1">
                  {language === "es" ? selectedPhoto.subtitle_es : selectedPhoto.subtitle_en}
                </p>
                <h2 className="text-xl font-bold text-white">
                  {language === "es" ? selectedPhoto.title_es : selectedPhoto.title_en}
                </h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
