import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { TravelGuide } from "./pages/TravelGuide";
import { SocialImpact } from "./pages/SocialImpact";
import { Terms } from "./pages/Terms";
import { Admin } from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guia" element={<TravelGuide />} />
        <Route path="/impacto" element={<SocialImpact />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
