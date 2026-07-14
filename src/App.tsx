import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig, motion } from "motion/react";
import { Home } from "./pages/Home";

// Transición entre páginas: al navegar, un velo oscuro con el rombo de la
// marca cubre la pantalla mientras el scroll vuelve arriba (React Router
// mantiene la posición y la página nueva aparecía "abajo", como si el link
// no funcionara) y luego se disuelve revelando la página nueva. Solo anima
// opacidad, así que MotionConfig reducedMotion la respeta igual.
function RouteTransition() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [veilKey, setVeilKey] = useState(0);
  useEffect(() => {
    if (first.current) {
      first.current = false; // la carga inicial no lleva velo
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    setVeilKey((k) => k + 1);
  }, [pathname]);
  if (veilKey === 0) return null;
  return (
    <motion.div
      key={veilKey}
      aria-hidden
      className="fixed inset-0 z-[100] pointer-events-none bg-neutral-950 flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.35 }}
    >
      <div className="flex items-center">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#FFD700]/60" />
        <div className="w-3 h-3 rotate-45 border border-[#FFD700]/80 mx-4 shadow-[0_0_18px_rgba(255,215,0,0.5)]" />
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#FFD700]/60" />
      </div>
    </motion.div>
  );
}

// Home entra en el bundle inicial: es la landing y el LCP depende de ella.
// El resto se descarga solo cuando se navega, para bajar el TBT de la primera carga.
const TravelGuide = lazy(() => import("./pages/TravelGuide").then((m) => ({ default: m.TravelGuide })));
const SocialImpact = lazy(() => import("./pages/SocialImpact").then((m) => ({ default: m.SocialImpact })));
const Terms = lazy(() => import("./pages/Terms").then((m) => ({ default: m.Terms })));
const Gallery = lazy(() => import("./pages/Gallery").then((m) => ({ default: m.Gallery })));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div
        role="status"
        aria-label="Cargando"
        className="w-10 h-10 rounded-full border-[3px] border-[#FFD700]/20 border-t-[#FFD700] animate-spin"
      />
    </div>
  );
}

export default function App() {
  return (
    // reducedMotion="user": si el sistema del visitante pide menos movimiento
    // (prefers-reduced-motion), las animaciones de transform se desactivan.
    <MotionConfig reducedMotion="user">
      <Router>
        <RouteTransition />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guia" element={<TravelGuide />} />
            <Route path="/impacto" element={<SocialImpact />} />
            <Route path="/terminos" element={<Terms />} />
            <Route path="/galeria" element={<Gallery />} />
            {/* Cualquier URL desconocida vuelve a la landing (no hay página 404). */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </MotionConfig>
  );
}
