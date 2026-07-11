import { type CartItem } from "../context/CartContext";

/** Deja solo dígitos: wa.me rechaza "+", espacios y guiones. */
const normalizePhone = (phone: string) => phone.replace(/\D/g, "");

// Sin montos: el cliente cotiza por WhatsApp según el número de personas,
// así que el mensaje solo lleva tours, fechas y viajeros.
export function buildOrderMessage(
  items: CartItem[],
  language: "es" | "en",
  customer?: { name: string; email: string },
): string {
  const isEs = language === "es";
  const lines: string[] = [];

  lines.push(
    isEs
      ? "¡Hola! Me gustaría cotizar los siguientes tours desde la web:"
      : "Hello! I'd like a quote for the following tours from the website:",
    "",
  );

  items.forEach((item, i) => {
    const modalidad =
      item.modality === "private" ? (isEs ? "Privado" : "Private") : isEs ? "Grupal" : "Group";

    lines.push(`${i + 1}. *${item.tour.title}* (${modalidad})`);
    lines.push(`   ${isEs ? "Fecha" : "Date"}: ${item.date}`);
    lines.push(`   ${isEs ? "Viajeros" : "Travelers"}: ${item.travelers}`);
  });

  if (customer?.name) {
    lines.push("");
    lines.push(`${isEs ? "Nombre" : "Name"}: ${customer.name}`);
    if (customer.email) lines.push(`${isEs ? "Correo" : "Email"}: ${customer.email}`);
  }

  lines.push("");
  lines.push(
    isEs
      ? "Quedo a la espera de la cotización y disponibilidad. ¡Gracias!"
      : "Looking forward to the quote and availability. Thank you!",
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
