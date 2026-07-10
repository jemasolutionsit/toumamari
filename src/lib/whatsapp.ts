import { unitPrice, unitPriceCLP, type CartItem } from "../context/CartContext";

/** Deja solo dígitos: wa.me rechaza "+", espacios y guiones. */
const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

export function buildOrderMessage(
  items: CartItem[],
  totalUsd: number,
  totalClp: number,
  language: "es" | "en",
  customer?: { name: string; email: string },
  exchangeRate: number = 980
): string {
  const isEs = language === "es";
  const lines: string[] = [];

  lines.push(
    isEs
      ? "¡Hola! Me gustaría coordinar el siguiente pedido desde la web:"
      : "Hello! I'd like to arrange the following order from the website:",
    "",
  );

  items.forEach((item, i) => {
    const subtotalUsd = unitPrice(item.tour, item.modality) * item.travelers;
    const subtotalClp = unitPriceCLP(item.tour, item.modality, exchangeRate) * item.travelers;
    const modalidad =
      item.modality === "private" ? (isEs ? "Privado" : "Private") : isEs ? "Grupal" : "Group";

    lines.push(`${i + 1}. *${item.tour.title}* (${modalidad})`);
    lines.push(`   ${isEs ? "Fecha" : "Date"}: ${item.date}`);
    lines.push(
      `   ${isEs ? "Viajeros" : "Travelers"}: ${item.travelers} | Subtotal: $${subtotalUsd} USD` +
        (subtotalClp ? ` ($${subtotalClp.toLocaleString("es-CL")} CLP)` : ""),
    );
  });

  lines.push("");
  lines.push(
    `*${isEs ? "TOTAL ESTIMADO" : "ESTIMATED TOTAL"}: $${totalUsd} USD` +
      (totalClp ? ` / $${totalClp.toLocaleString("es-CL")} CLP` : "") +
      "*",
  );

  if (customer?.name) {
    lines.push("");
    lines.push(`${isEs ? "Nombre" : "Name"}: ${customer.name}`);
    if (customer.email) lines.push(`${isEs ? "Correo" : "Email"}: ${customer.email}`);
  }

  lines.push("");
  lines.push(
    isEs
      // El informe dice "coordinar el pago y la entrega"; aquí no hay entrega
      // física, se coordina el punto de encuentro del tour.
      ? "Quedo a la espera de confirmación para coordinar el pago. ¡Gracias!"
      : "Looking forward to your confirmation to arrange payment. Thank you!",
  );

  return lines.join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}

/**
 * Debe invocarse dentro del manejador de un gesto del usuario: si se llama
 * después de un `await`, el navegador trata la ventana como emergente y la bloquea.
 */
export function openWhatsApp(phone: string, message: string): void {
  window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
}
