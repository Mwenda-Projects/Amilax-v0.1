import ContactSection from "@/components/ContactSection";
import usePageMeta from "@/hooks/usePageMeta";

const Contact = () => {
  usePageMeta({
    title: "Contact Us — WhatsApp, Phone & Location",
    description:
      "Contact Amilax Pharmaceuticals in Eastleigh, Nairobi. Reach us on WhatsApp (0790 540 867), email, or visit our pharmacy on Muratina Street. Open daily 9AM–midnight.",
  });

  return <ContactSection />;
};

export default Contact;
