import {
  Pill,
  FileText,
  HeartPulse,
  Truck,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Pill,
      title: t("services.prescriptionMedicines"),
      description: t("services.prescriptionMedicinesDesc"),
    },
    {
      icon: FileText,
      title: t("services.prescriptionUpload"),
      description: t("services.prescriptionUploadDesc"),
    },
    {
      icon: HeartPulse,
      title: t("services.healthConsultation"),
      description: t("services.healthConsultationDesc"),
    },
    {
      icon: Truck,
      title: t("services.localDelivery"),
      description: t("services.localDeliveryDesc"),
    },
    {
      icon: Clock,
      title: t("services.quickService"),
      description: t("services.quickServiceDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("services.genuineProducts"),
      description: t("services.genuineProductsDesc"),
    },
  ];

  return (
    <section id="services" className="py-20 bg-trust-pattern">
      <div className="container">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
            {t("services.subtitle")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            {t("services.title")}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("services.description")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={service.title}
              className="group bg-card rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                <service.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-heading text-lg text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
