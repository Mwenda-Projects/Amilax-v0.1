import { Upload, MessageCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl } from "@/config/whatsapp";
import { useTranslation } from "react-i18next";

const PrescriptionSection = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Camera, step: "1", title: t("prescription.step1Title"), description: t("prescription.step1Desc") },
    { icon: Upload, step: "2", title: t("prescription.step2Title"), description: t("prescription.step2Desc") },
    { icon: MessageCircle, step: "3", title: t("prescription.step3Title"), description: t("prescription.step3Desc") },
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
            {t("prescription.subtitle")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            {t("prescription.title")}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("prescription.description")}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
          {steps.map((s) => (
            <div key={s.step} className="text-center bg-card rounded-xl p-6 shadow-card border border-border/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">{s.step}</span>
              </div>
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4 mt-2">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-base text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="cta" size="lg" className="text-base" asChild>
            <a
              href={getWhatsAppUrl("Hello Amilax Pharmaceuticals, I'm a customer and I'd like to upload my prescription. Please let me know how to proceed.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" />
              {t("prescription.sendViaWhatsApp")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionSection;
