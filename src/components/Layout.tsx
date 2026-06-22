import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Globe, Instagram, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../i18n";
import { useCart } from "../CartContext";
import { CONTACT_INFO } from "../data";
import { CartDrawer } from "../Cart";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export function Layout({ children, scrolled }: { children: ReactNode; scrolled: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const { items, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.travelers, 0);

  const navLinks = [
    { to: "/", label: t.navInicio, type: "route" as const },
    { to: "/#tours", label: t.navTours, type: "hash" as const },
    { to: "/guia", label: t.navGuia, type: "route" as const },
    { to: "/impacto", label: t.navImpacto, type: "route" as const },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-[#FFD700] selection:text-black flex flex-col">
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
          scrolled || menuOpen
            ? "bg-black/95 backdrop-blur-md border-[#FFD700]/20 py-3 md:py-4 shadow-xl"
            : "bg-gradient-to-b from-black/80 to-transparent border-transparent py-4 md:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">

          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 md:gap-4 cursor-pointer">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#FFD700] flex items-center justify-center bg-black shadow-[0_0_15px_rgba(255,215,0,0.3)] flex-shrink-0">
              <img
                src="/logo.jpg"
                alt="Toumamari Tour Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-[#FFD700] font-bold text-xl">TT</span>';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl tracking-widest text-white leading-none">TOUMAMARI</span>
              <span className="text-[0.55rem] md:text-[0.65rem] uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#FFD700]">Tour Rapa Nui</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="text-neutral-300 hover:text-[#FFD700] transition-colors">{t.navInicio}</Link>
            <a href="/#tours" className="text-neutral-300 hover:text-[#FFD700] transition-colors">{t.navTours}</a>
            <Link to="/guia" className="text-neutral-300 hover:text-[#FFD700] transition-colors">{t.navGuia}</Link>
            <Link to="/impacto" className="text-neutral-300 hover:text-[#FFD700] transition-colors">{t.navImpacto}</Link>
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "es" | "en")}
                className="bg-transparent text-sm text-neutral-300 outline-none cursor-pointer focus:text-white"
              >
                <option value="es" className="bg-neutral-900">ES</option>
                <option value="en" className="bg-neutral-900">EN</option>
              </select>
            </div>
            <button onClick={() => setIsCartOpen(true)} aria-label={t.cart} className="relative group text-white hover:text-[#FFD700] transition-colors flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 md:w-5 md:h-5" />
              <span className="hidden lg:block text-sm font-medium">{t.cart}</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 lg:-right-4 w-5 h-5 bg-[#FFD700] text-black text-xs font-bold flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Hamburger — mobile/tablet only */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="lg:hidden text-white hover:text-[#FFD700] transition-colors p-1 -mr-1"
            >
              {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden border-t border-white/10 mt-3"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  link.type === "route" ? (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="text-neutral-200 hover:text-[#FFD700] hover:bg-white/5 transition-colors py-3 px-3 rounded-xl text-base font-medium"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="text-neutral-200 hover:text-[#FFD700] hover:bg-white/5 transition-colors py-3 px-3 rounded-xl text-base font-medium"
                    >
                      {link.label}
                    </a>
                  )
                ))}
                {/* Language toggle inside menu */}
                <div className="flex items-center gap-3 mt-3 pt-4 border-t border-white/10 px-3">
                  <Globe className="w-4 h-4 text-[#FFD700]" />
                  <div className="flex gap-2">
                    {(["es", "en"] as const).map((lng) => (
                      <button
                        key={lng}
                        onClick={() => setLanguage(lng)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase transition-all ${
                          language === lng ? "bg-[#FFD700] text-black" : "bg-white/10 text-neutral-300"
                        }`}
                      >
                        {lng}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 border-t border-neutral-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-md overflow-hidden bg-white/5 border border-neutral-800">
                <img src="/logo.jpg" alt="Toumamari Tour" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl text-white tracking-widest">TOUMAMARI</span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
              {t.footerDesc}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t.footerLinks}</h4>
             <div className="space-y-3 font-medium text-sm">
               <p><Link to="/" className="hover:text-yellow-500 transition-colors">{t.navInicio}</Link></p>
               <p><Link to="/guia" className="hover:text-yellow-500 transition-colors">{t.navGuia}</Link></p>
               <p><Link to="/impacto" className="hover:text-yellow-500 transition-colors">{t.navImpacto}</Link></p>
               <p><Link to="/terminos" className="hover:text-yellow-500 transition-colors">{t.navTerminos}</Link></p>
             </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
             <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">{t.footerFollow}</h4>
             <div className="flex gap-4">
               <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all">
                 <Instagram className="w-5 h-5" />
               </a>
               <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
               </a>
               <a href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all">
                 <WhatsAppIcon />
               </a>
             </div>
          </div>

        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-neutral-900 text-center text-xs text-neutral-600 font-medium flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Toumamari – Servicios Turísticos Touamamari SpA. Todos los derechos reservados.</p>
        </div>
      </footer>

      <CartDrawer />

      {/* WhatsApp floating button */}
      <motion.a
        href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola Toumamari, quiero información sobre los tours en Rapa Nui')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-safe right-5 md:right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.7)]"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.93 }}
      >
        <WhatsAppIcon />
      </motion.a>
    </div>
  );
}
