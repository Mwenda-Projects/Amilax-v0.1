import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/config/whatsapp";
import { useTranslation } from "react-i18next";

const FloatingWhatsApp = () => {
  const { t } = useTranslation();

  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-cta hover:bg-cta-hover text-cta-foreground rounded-full pl-4 pr-5 py-3 shadow-lg hover:shadow-xl transition-all duration-200 animate-float group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="text-sm font-semibold hidden sm:inline">{t("floating.whatsapp")}</span>
    </a>
  );
};

export default FloatingWhatsApp;
