import siteConfig from "@/config/site";

/**
 * Default pre-filled message for all WhatsApp CTAs.
 * This helps the pharmacy identify customer inquiries vs random chats.
 */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello Amilax Pharmaceuticals, I'm a customer visiting your website and I'd like to inquire about your services.";

/**
 * Build a WhatsApp URL that works reliably on both mobile and desktop.
 * Uses https://wa.me/ format with pre-filled text.
 */
export function getWhatsAppUrl(message?: string): string {
  const text = message || WHATSAPP_DEFAULT_MESSAGE;
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
