import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import usePageMeta from "@/hooks/usePageMeta";
import { getWhatsAppUrl } from "@/config/whatsapp";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  usePageMeta({
    title: "Quality Medicines, Honestly Dispensed",
    description:
      "Amilax Pharmaceuticals — your trusted neighbourhood pharmacy in Eastleigh, Nairobi. Inquire about medicines, upload prescriptions via WhatsApp, and get genuine products dispensed by qualified pharmacists.",
  });

  return (
    <>
      <HeroSection />
      <ServicesSection />

      {/* Bottom CTA Band */}
      <section className="py-16 bg-primary">
        <div className="container text-center">
          <h2 className="font-heading text-2xl sm:text-3xl text-primary-foreground mb-3">
            {t("ctaBand.title")}
          </h2>
          <p className="text-primary-foreground/70 text-sm mb-8 max-w-md mx-auto">
            {t("ctaBand.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="cta"
              size="lg"
              className="text-base"
              asChild
            >
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5" />
                {t("ctaBand.whatsapp")}
              </a>
            </Button>
            <Button
              size="lg"
              className="text-base bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 border border-primary-foreground/20"
              asChild
            >
              <Link to="/medicines">
                {t("ctaBand.browse")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
