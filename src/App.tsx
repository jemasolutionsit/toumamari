import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Home } from "./pages/Home";

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
