import { useState } from "react";
import { Search, MessageCircle, ChevronRight, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DynamicIcon from "@/components/DynamicIcon";
import medicineCategories from "@/config/medicine-categories";
import usePageMeta from "@/hooks/usePageMeta";
import siteConfig from "@/config/site";
import { useTranslation } from "react-i18next";

const Medicines = () => {
  const { t } = useTranslation();

  usePageMeta({
    title: "Medicine Categories — Browse & Inquire",
    description:
      "Browse medicine categories at Amilax Pharmaceuticals. Check availability of prescription medicines, over-the-counter drugs, and health products via WhatsApp.",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filtered = medicineCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.examples.some((e) =>
        e.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      c.medicines?.some((m) =>
        `${m.name} ${m.dosage}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleInquiry = (categoryName: string) => {
    const text = `Hi, I'd like to inquire about a medicine in the ${categoryName} category.`;
    window.open(
      `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  return (
    <>
      {/* Header */}
      <section className="py-14 sm:py-16 bg-secondary/50">
        <div className="container">
          <div className="text-center mb-8">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
              {t("medicines.subtitle")}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
              {t("medicines.title")}
            </h1>
            <p
              className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("medicines.description") }}
            />
          </div>

          {/* Search */}
          <div className="max-w-sm mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("medicines.searchPlaceholder")}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 sm:py-16">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-2">
                {t("medicines.noResults")} "
                <span className="text-foreground font-medium">
                  {searchTerm}
                </span>
                ".
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {t("medicines.noResultsHint")}
              </p>
              <Button variant="cta" asChild>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(`Hi, I'm looking for: ${searchTerm}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("medicines.askWhatsApp")}
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {filtered.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    {/* Category header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <DynamicIcon
                          name={cat.icon}
                          className="w-5 h-5 text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-heading text-lg text-foreground">
                            {cat.name}
                          </h2>
                          {cat.note && (
                            <span className="text-[10px] font-semibold uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {t("medicines.prescriptionRequired")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {/* Medicines in stock */}
                    {cat.medicines && cat.medicines.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleCategory(cat.name)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors mb-2"
                        >
                          {t("medicines.inStock")} ({cat.medicines.length})
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              expandedCategory === cat.name ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {expandedCategory === cat.name && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 animate-fade-in">
                            {cat.medicines.map((med, idx) => (
                              <div
                                key={`${med.name}-${med.dosage}-${idx}`}
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/60 border border-border/30"
                              >
                                <span className="text-sm text-foreground font-medium">
                                  {med.name}
                                </span>
                                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                                  {med.dosage}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Example medicines (tags) */}
                    {(!cat.medicines || expandedCategory !== cat.name) && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cat.examples.map((ex) => (
                          <span
                            key={ex}
                            className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Inquiry button */}
                    <button
                      onClick={() => handleInquiry(cat.name)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t("medicines.inquireAbout", { name: cat.name })}
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="max-w-2xl mx-auto mt-10 text-center">
            <div className="bg-secondary/60 rounded-xl p-5 border border-border/30">
              <p
                className="text-xs text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t("medicines.disclaimer") }}
              />
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-10">
            <p className="text-muted-foreground text-sm mb-4">
              {t("medicines.cantFind")}
            </p>
            <Button variant="cta" size="lg" className="text-base" asChild>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to check if a specific medicine is available.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5" />
                {t("medicines.askAbout")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Medicines;
