import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { X, Trash2, CreditCard, ShoppingCart, ShieldCheck, CalendarCheck, Loader2, CheckCircle, AlertCircle, User, Mail } from "lucide-react";
import { useCart } from "./CartContext";
import { useLanguage } from "./i18n";
import { createBooking, sendBookingConfirmation, getBookedSpotsForDate, DEFAULT_CAPACITY } from "./lib/api";
import { CONTACT_INFO } from "./data";

type CheckoutStep = "cart" | "form" | "loading" | "success" | "error";

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateTravelers, total } = useCart();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const totalCLP = items.reduce((sum, item) => sum + (item.tour.priceCLP ?? 0) * item.travelers, 0);

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset form state after drawer closes
    setTimeout(() => {
      setStep("cart");
      setName("");
      setEmail("");
      setErrorMsg("");
    }, 300);
  };

  const handleProceedToForm = () => setStep("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStep("loading");

    try {
      // Validate availability for each item before booking
      for (const item of items) {
        const capacity = DEFAULT_CAPACITY[item.tour.categoryId] ?? 10;
        const booked = await getBookedSpotsForDate(item.tour.id, item.date);
        if (booked + item.travelers > capacity) {
          setErrorMsg(language === "es"
            ? `"${item.tour.title}" no tiene disponibilidad para el ${item.date}`
            : `"${item.tour.title}" has no availability for ${item.date}`);
          setStep("cart");
          return;
        }
      }

      for (const item of items) {
        await createBooking({
          profile_id: null,
          guest_name: name.trim(),
          guest_email: email.trim(),
          tour_id: item.tour.id,
          travel_date: item.date,
          travelers: item.travelers,
          total_clp: (item.tour.priceCLP ?? 0) * item.travelers,
          total_usd: item.tour.price * item.travelers,
          status: "pending",
          payment_method: null,
          payment_id: null,
          notes: null,
        });
      }

      // Send one consolidated confirmation email with the first tour (or all items combined)
      const tourTitles = items.map(i => i.tour.title).join(", ");
      const firstDate = items[0]?.date ?? "";
      const totalTravelers = items.reduce((s, i) => s + i.travelers, 0);

      // Email is best-effort — don't block success if not configured
      try {
        await sendBookingConfirmation({
          traveler_name: name.trim(),
          traveler_email: email.trim(),
          tour_title: tourTitles,
          tour_date: firstDate,
          travelers: totalTravelers,
          total_usd: total,
          total_clp: totalCLP,
          language,
        });
      } catch {
        // silently ignore — booking already saved to Supabase
      }

      setStep("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="relative px-6 py-5 flex items-center justify-between bg-gradient-to-b from-neutral-900 to-black text-white">
              <motion.h2
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-black tracking-tight flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5 text-yellow-400" />
                {t.cartTitle}
              </motion.h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* --- CART STEP --- */}
            {step === "cart" && (
              <>
                {errorMsg && (
                  <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-sm font-semibold text-rose-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                      <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                      <p className="font-medium text-lg">{t.cartEmpty}</p>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        transition={{ delay: idx * 0.07, type: "spring", stiffness: 200, damping: 22 }}
                        whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                        className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100"
                      >
                        <img src={item.tour.image} alt={item.tour.title} className="w-24 h-24 object-cover rounded-xl" />
                        <div className="flex-1 flex flex-col">
                          <h4 className="font-bold text-sm leading-tight mb-2 text-neutral-900">{item.tour.title}</h4>
                          <p className="text-xs text-neutral-500 mb-auto">{t.cartDate}: <span className="font-semibold text-neutral-900">{item.date}</span></p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateTravelers(item.id, Math.max(1, item.travelers - 1))}
                                className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-500 hover:bg-neutral-100 hover:scale-110 active:scale-95 transition-transform"
                              >-</button>
                              <span className="text-sm font-bold w-4 text-center">{item.travelers}</span>
                              <button
                                onClick={() => updateTravelers(item.id, item.travelers + 1)}
                                className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center text-sm font-bold text-neutral-500 hover:bg-neutral-100 hover:scale-110 active:scale-95 transition-transform"
                              >+</button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-yellow-600">
                                ${item.tour.price * item.travelers}
                              </span>
                              <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-6 bg-white border-t border-neutral-200">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-bold text-neutral-500 uppercase tracking-wider text-sm">{t.cartTotal}</span>
                      <span className="text-3xl font-black text-black">${total} USD</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2, boxShadow: "0 15px 30px rgba(255,196,57,0.35)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProceedToForm}
                      className="w-full bg-[#FFC439] hover:bg-[#F4BB33] text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(255,196,57,0.2)] mb-4"
                    >
                      <CreditCard className="w-6 h-6" />
                      {t.cartPayPayPal}
                    </motion.button>
                    <div className="flex flex-col gap-2 mt-4 text-xs font-semibold text-neutral-500 items-center justify-center text-center">
                      <p className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500" /> {t.cartSecurePayment}</p>
                      <p className="flex items-center gap-2"><CalendarCheck className="w-4 h-4 text-blue-500" /> {t.cartFlexibleCancel}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* --- FORM STEP --- */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 space-y-6">
                  <div>
                    <h3 className="font-black text-lg text-neutral-900 mb-1">
                      {language === "es" ? "Datos del viajero" : "Traveler details"}
                    </h3>
                    <p className="text-sm text-neutral-500">
                      {language === "es"
                        ? "Recibirás tu confirmación de reserva por email."
                        : "You will receive your booking confirmation by email."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1">
                        <User className="inline w-4 h-4 mr-1" />
                        {language === "es" ? "Nombre completo" : "Full name"}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={language === "es" ? "Tu nombre" : "Your name"}
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-neutral-700 mb-1">
                        <Mail className="inline w-4 h-4 mr-1" />
                        {language === "es" ? "Correo electrónico" : "Email address"}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={language === "es" ? "tu@email.com" : "your@email.com"}
                        className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      />
                    </div>
                  </div>

                  {/* Order summary */}
                  <div className="bg-white rounded-2xl border border-neutral-100 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                      {language === "es" ? "Resumen del pedido" : "Order summary"}
                    </p>
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-neutral-600 truncate mr-2">{item.tour.title} × {item.travelers}</span>
                        <span className="font-bold text-neutral-900 shrink-0">${item.tour.price * item.travelers}</span>
                      </div>
                    ))}
                    <div className="border-t border-neutral-100 pt-2 flex justify-between font-black">
                      <span>{language === "es" ? "Total" : "Total"}</span>
                      <span>${total} USD</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-neutral-200 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="flex-1 border border-neutral-200 text-neutral-600 py-3 rounded-2xl font-bold text-sm hover:bg-neutral-50 transition-colors"
                  >
                    {language === "es" ? "Volver" : "Back"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#FFC439] hover:bg-[#F4BB33] text-black py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {language === "es" ? "Confirmar reserva" : "Confirm booking"}
                  </button>
                </div>
              </form>
            )}

            {/* --- LOADING STEP --- */}
            {step === "loading" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-neutral-600">
                <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
                <p className="font-semibold">
                  {language === "es" ? "Procesando tu reserva..." : "Processing your booking..."}
                </p>
              </div>
            )}

            {/* --- SUCCESS STEP --- */}
            {step === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500" />
                <div>
                  <h3 className="font-black text-xl text-neutral-900 mb-2">
                    {language === "es" ? "¡Reserva confirmada!" : "Booking confirmed!"}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {language === "es"
                      ? `Hemos enviado la confirmación a ${email}. Nuestro guía se pondrá en contacto contigo por WhatsApp.`
                      : `We sent a confirmation to ${email}. Our guide will contact you via WhatsApp.`}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25d366] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#1fba59] transition-colors"
                >
                  {language === "es" ? "Contactar por WhatsApp" : "Contact via WhatsApp"}
                </a>
                <button
                  onClick={handleClose}
                  className="text-sm text-neutral-400 hover:text-neutral-600 underline"
                >
                  {language === "es" ? "Cerrar" : "Close"}
                </button>
              </div>
            )}

            {/* --- ERROR STEP --- */}
            {step === "error" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
                <AlertCircle className="w-16 h-16 text-rose-500" />
                <div>
                  <h3 className="font-black text-xl text-neutral-900 mb-2">
                    {language === "es" ? "Algo salió mal" : "Something went wrong"}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {errorMsg || (language === "es" ? "Por favor intenta de nuevo." : "Please try again.")}
                  </p>
                </div>
                <button
                  onClick={() => setStep("form")}
                  className="bg-neutral-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-neutral-700 transition-colors"
                >
                  {language === "es" ? "Reintentar" : "Try again"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
