/**
 * ============================================================
 * SITE-WIDE CONFIGURATION
 * ============================================================
 *
 * Central place for contact details, business info, and other
 * site-wide settings. Update these values once and they will
 * reflect across the entire website.
 *
 * ============================================================
 */

const siteConfig = {
  /** WhatsApp number (digits only, with country code, no + sign) */
  whatsappNumber: "254790540867",

  /** Phone number displayed on the site (with formatting) */
  phoneNumber: "0790 540 867",

  /** Business email */
  email: "amilaxpharma@gmail.com",

  /** Operating hours text */
  operatingHours: "Everyday: 9:00 AM – 12:00 AM",

  /** Physical address lines */
  address: ["Muratina Street, Eastleigh", "Nairobi, Kenya"],

  /**
   * Google Maps embed URL.
   * To get yours: Google Maps → Search location → Share → Embed a map → Copy the src URL
   */
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8176!2d36.8569!3d-1.2742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17e7a3bcf003%3A0x5765f53c2ca1ca6a!2sAmilax%20Pharmaceuticals!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske",

  /** Link to Google Maps for directions */
  mapDirectionsUrl: "https://maps.app.goo.gl/WS7GH8sf8N8djjfq7",
} as const;

export default siteConfig;
