import { MessageCircle, FileText, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-pharmacy.jpg";
import { getWhatsAppUrl } from "@/config/whatsapp";
import { useTranslation, Trans } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Amilax Pharmaceuticals - Professional pharmacy interior"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 via-foreground/75 to-foreground/60 sm:bg-gradient-to-r sm:from-foreground/90 sm:via-foreground/75 sm:to-foreground/40" />
      </div>

      <div className="container relative z-10 py-12">
        <div className="max-w-xl">
          {/* Trust badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <ShieldCheck className="w-4 h-4 text-cta" />
            <span className="text-sm font-medium text-primary-foreground/90">
              {t("hero.badge")}
            </span>
          </div>

          <h1
            className="font-heading text-3xl sm:text-4xl lg:text-5xl leading-[1.15] text-primary-foreground mb-3 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {t("hero.title")}{" "}
            <span className="text-cta">{t("hero.titleHighlight")}</span>
          </h1>

          <p
            className="font-heading text-lg sm:text-xl text-primary-foreground/90 mb-5 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {t("hero.tagline")}
          </p>

          <p
            className="text-base text-primary-foreground/70 mb-4 max-w-md leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
            dangerouslySetInnerHTML={{ __html: t("hero.description") }}
          />

          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/15 mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.48s" }}
          >
            <Clock className="w-4 h-4 text-cta flex-shrink-0" />
            <span
              className="text-sm text-primary-foreground/85 font-medium"
              dangerouslySetInnerHTML={{ __html: t("hero.hours") }}
            />
          </div>

          <div
            className="flex flex-col sm:flex-row gap-3 animate-fade-in-up"
            style={{ animationDelay: "0.55s" }}
          >
            <Button variant="cta" size="lg" className="text-base w-full sm:w-auto" asChild>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5" />
                {t("hero.ctaWhatsApp")}
              </a>
            </Button>
            <Button
              variant="cta-outline"
              size="lg"
              className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground w-full sm:w-auto"
              asChild
            >
              <Link to="/prescription">
                <FileText className="w-5 h-5" />
                {t("hero.ctaPrescription")}
              </Link>
            </Button>
          </div>

          <div
            className="grid grid-cols-3 gap-4 mt-10 animate-fade-in-up"
            style={{ animationDelay: "0.68s" }}
          >
            {[
              [t("hero.statYears"), t("hero.statYearsLabel")],
              [t("hero.statGenuine"), t("hero.statGenuineLabel")],
              [t("hero.statDays"), t("hero.statDaysLabel")],
            ].map(([stat, label]) => (
              <div key={label} className="text-center sm:text-left">
                <p className="font-heading text-xl sm:text-2xl text-cta font-bold">{stat}</p>
                <p className="text-[11px] sm:text-xs text-primary-foreground/55 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
