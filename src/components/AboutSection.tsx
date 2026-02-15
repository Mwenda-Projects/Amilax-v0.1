import { CheckCircle2, Clock, ShieldCheck, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

const AboutSection = () => {
  const { t } = useTranslation();
  const values = t("about.values", { returnObjects: true }) as string[];

  return (
    <section className="py-16 sm:py-20 bg-secondary/50">
      <div className="container">
        {/* Page heading */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
            {t("about.subtitle")}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
            {t("about.title")}{" "}
            <span className="text-primary">{t("about.titleHighlight")}</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t("about.description")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Story */}
          <div>
            <h2 className="font-heading text-xl sm:text-2xl text-foreground mb-5">
              {t("about.storyTitle")}
            </h2>
            <p
              className="text-muted-foreground leading-relaxed mb-5"
              dangerouslySetInnerHTML={{ __html: t("about.storyP1") }}
            />
            <p className="text-muted-foreground leading-relaxed mb-5">
              {t("about.storyP2")}
            </p>
            <p
              className="text-muted-foreground leading-relaxed mb-8"
              dangerouslySetInnerHTML={{ __html: t("about.storyP3") }}
            />

            {/* Values checklist */}
            <div className="grid sm:grid-cols-2 gap-3">
              {values.map((v) => (
                <div key={v} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-[18px] h-[18px] text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground leading-snug">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key highlights card */}
          <div className="relative">
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border/50">
              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary rounded-xl p-5 text-center">
                  <p className="font-heading text-2xl sm:text-3xl text-primary font-bold">3+</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("about.yearsOfService")}</p>
                </div>
                <div className="bg-secondary rounded-xl p-5 text-center">
                  <p className="font-heading text-2xl sm:text-3xl text-primary font-bold">365</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("about.daysOpen")}</p>
                </div>
              </div>

              {/* Principles */}
              <div className="space-y-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: t("about.genuineMedicines"),
                    text: t("about.genuineMedicinesDesc"),
                  },
                  {
                    icon: Heart,
                    title: t("about.ethicalDispensing"),
                    text: t("about.ethicalDispensingDesc"),
                  },
                  {
                    icon: Clock,
                    title: t("about.availableTitle"),
                    text: t("about.availableDesc"),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 p-4 rounded-xl bg-secondary/60 border border-border/30"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-[18px] h-[18px] text-primary" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-semibold text-foreground mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-cta/10 rounded-2xl -z-10 hidden sm:block" />
            <div className="absolute -bottom-3 -left-3 w-28 h-28 bg-primary/5 rounded-2xl -z-10 hidden sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
