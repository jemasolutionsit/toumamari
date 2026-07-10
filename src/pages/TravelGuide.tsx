import { Layout } from "../components/Layout";
import { useLanguage } from "../context/i18n";
import { Map, Tent, Info } from "lucide-react";

export function TravelGuide() {
  const { t } = useLanguage();

  return (
    <Layout scrolled={true}>
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-black mb-6">{t.navGuia}</h1>
        <p className="text-xl text-neutral-500 mb-12">Artículos y consejos para tu viaje a Rapa Nui.</p>

        <div className="space-y-8">
          {/* Post Simulado */}
          <article className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 text-yellow-600 mb-4 font-bold text-sm uppercase tracking-wider">
              <Info className="w-5 h-5" /> Requisitos
            </div>
            <h2 className="text-2xl font-bold mb-4">Requisitos de Ingreso a la Isla</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Recuerda que para viajar a Rapa Nui como turista debes llenar el Formulario Único de Ingreso, tener un boleto de ida y vuelta intransferible y tu reserva en un alojamiento registrado en Sernatur.
            </p>
            <a href="#" className="font-bold text-black border-b-2 border-yellow-500 pb-1">Leer más</a>
          </article>

          <article className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 text-emerald-600 mb-4 font-bold text-sm uppercase tracking-wider">
              <Tent className="w-5 h-5" /> Clima
            </div>
            <h2 className="text-2xl font-bold mb-4">Mejor época para visitar</h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              Rapa Nui tiene un clima subtropical agradable durante todo el año. Sin embargo, te contamos cuáles son los meses con menos precipitaciones y temperaturas ideales para el trekking.
            </p>
            <a href="#" className="font-bold text-black border-b-2 border-yellow-500 pb-1">Leer más</a>
          </article>
        </div>
      </div>
    </Layout>
  );
}
