import { MapPin, Phone, Clock, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import siteConfig from "@/config/site";
import { getWhatsAppUrl } from "@/config/whatsapp";
import { useTranslation } from "react-i18next";

const ContactSection = () => {
  const { t } = useTranslation();

  const contactInfo = [
    { icon: MapPin, title: t("contact.visitUs"), lines: siteConfig.address },
    { icon: Phone, title: t("contact.callUs"), lines: [siteConfig.phoneNumber], href: `tel:${siteConfig.phoneNumber}` },
    { icon: Clock, title: t("contact.workingHours"), lines: [siteConfig.operatingHours] },
    { icon: Mail, title: t("contact.email"), lines: [siteConfig.email], href: `mailto:${siteConfig.email}` },
  ];

  return (
    <section id="contact" className="py-16 sm:py-20">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
            {t("contact.subtitle")}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            {t("contact.title")}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("contact.description")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info) => (
            <div
              key={info.title}
              className="bg-card rounded-xl p-6 shadow-card border border-border/50 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-sm font-semibold text-foreground mb-2">
                {info.title}
              </h3>
              {info.lines.map((line) =>
                info.href ? (
                  <a
                    key={line}
                    href={info.href}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {line}
                  </a>
                ) : (
                  <p key={line} className="text-sm text-muted-foreground">
                    {line}
                  </p>
                )
              )}
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="mb-12">
          <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50">
            <iframe
              src={siteConfig.mapEmbedUrl}
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Amilax Pharmaceuticals location"
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            📍 {siteConfig.address.join(", ")}
          </p>
        </div>

        <div className="text-center">
          <Button variant="cta" size="lg" className="text-base" asChild>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" />
              {t("contact.chatWhatsApp")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
