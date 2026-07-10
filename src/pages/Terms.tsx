import { Layout } from "../components/Layout";
import { useLanguage } from "../context/i18n";

export function Terms() {
  const { t } = useLanguage();

  return (
    <Layout scrolled={true}>
      <div className="pt-32 pb-24 max-w-3xl mx-auto px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-black mb-12">{t.navTerminos}</h1>
        
        <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">1. Políticas de Reserva</h2>
            <p>Las reservas se registran a través del sitio y se confirman por WhatsApp, donde coordinamos el pago directamente con nuestro equipo local. El cliente recibirá un correo con el resumen de su solicitud y los detalles del tour.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">2. Políticas de Cancelación</h2>
            <p><strong>Cancelación Flexible:</strong> Puedes cancelar tu tour hasta 48 horas antes de la fecha programada para recibir un reembolso del 100%.</p>
            <p>Si cancelas con menos de 48 horas de anticipación, no se realizarán reembolsos debido a los costos logísticos ya incurridos.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">3. Modificaciones</h2>
            <p>Se permiten cambios de fecha sujetos a disponibilidad si se solicitan con al menos 24 horas de anticipación.</p>
          </section>

           <section>
            <h2 className="text-2xl font-bold text-black mb-4">4. Clima y Fuerza Mayor</h2>
            <p>Si un tour no puede realizarse por condiciones climáticas extremas indicadas por las autoridades de la isla, reprogramaremos el tour para la siguiente fecha disponible o emitiremos un reembolso completo.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
