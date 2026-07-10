import { Layout } from "../components/Layout";
import { useLanguage } from "../context/i18n";
import { Heart, Leaf, Users } from "lucide-react";

export function SocialImpact() {
  const { t } = useLanguage();

  return (
    <Layout scrolled={true}>
      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6">{t.navImpacto}</h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">Nuestro compromiso no es solo con el viajero, sino con el cuidado de nuestra tierra y nuestra gente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-4">Turismo Sustentable</h3>
            <p className="text-neutral-600">Minimizamos nuestro impacto retirando los plásticos y utilizando transporte con bajas emisiones.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-4">Economía Circular</h3>
            <p className="text-neutral-600">Todos nuestros guías son nacidos y criados en la isla. Trabajamos exclusivamente con emprendimientos locales.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-4">Apoyo Comunitario</h3>
            <p className="text-neutral-600">Destinamos un porcentaje de nuestras ganancias a la conservación del patrimonio arqueológico y educación.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
