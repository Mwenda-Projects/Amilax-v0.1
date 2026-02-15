import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AboutSection from "@/components/AboutSection";
import usePageMeta from "@/hooks/usePageMeta";
import siteConfig from "@/config/site";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();

  usePageMeta({
    title: "About Us — Trusted Pharmacy in Eastleigh",
    description:
      "Learn about Amilax Pharmaceuticals — a licensed pharmacy in Eastleigh, Nairobi committed to genuine medicines, ethical dispensing, and compassionate care since 2022.",
  });

  const promiseItems = t("about.promiseItems", { returnObjects: true }) as string[];
  const dontDoItems = t("about.dontDoItems", { returnObjects: true }) as string[];

  const commitments = [
    { title: t("about.whatWePromise"), items: promiseItems },
    { title: t("about.whatWeDontDo"), items: dontDoItems },
  ];

  return (
    <>
      <AboutSection />

      {/* Our Commitment */}
      <section className="py-16 sm:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
              {t("about.commitmentSubtitle")}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-foreground mb-4">
              {t("about.commitmentTitle")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              {t("about.commitmentDesc")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {commitments.map((group) => (
              <div
                key={group.title}
                className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border/50"
              >
                <h3 className="font-heading text-lg text-foreground mb-5">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          group.title === t("about.whatWePromise")
                            ? "bg-primary"
                            : "bg-destructive/60"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-14 bg-secondary/50">
        <div className="container text-center">
          <h2 className="font-heading text-xl sm:text-2xl text-foreground mb-3">
            {t("about.ctaTitle")}
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            {t("about.ctaDesc")}
          </p>
          <Button variant="cta" size="lg" className="text-base" asChild>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi, I have a question about my medicines.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" />
              {t("about.ctaButton")}
            </a>
          </Button>
        </div>
      </section>
    </>
  );
};

export default About;
