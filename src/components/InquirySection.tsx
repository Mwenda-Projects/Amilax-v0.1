import { useState } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import siteConfig from "@/config/site";
import { useTranslation } from "react-i18next";

const InquirySection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", medicine: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleWhatsAppInquiry = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const medicine = form.medicine.trim();
    const message = form.message.trim();

    if (!name || !phone || !medicine) {
      toast({ title: t("prescription.requiredFields"), description: t("prescription.requiredFieldsDesc"), variant: "destructive" });
      return;
    }
    if (!/^[\d+\-() ]{7,20}$/.test(phone)) {
      toast({ title: t("prescription.invalidPhone"), description: t("prescription.invalidPhoneDesc"), variant: "destructive" });
      return;
    }

    const text = [
      `Hello Amilax Pharmaceuticals, I'm a customer inquiring about a medicine from your website.`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Medicine: ${medicine}`,
      message ? `Note: ${message}` : "",
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
    toast({ title: t("prescription.openingWhatsApp"), description: t("inquiry.responseTime") });
  };

  return (
    <section id="inquiry" className="py-20">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
              {t("inquiry.subtitle")}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
              {t("inquiry.title")}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t("inquiry.description")}
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border/50">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("inquiry.name")} <span className="text-destructive">*</span>
                </label>
                <Input id="name" name="name" placeholder={t("prescription.namePlaceholder")} value={form.name} onChange={handleChange} maxLength={100} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("inquiry.phone")} <span className="text-destructive">*</span>
                </label>
                <Input id="phone" name="phone" type="tel" placeholder={t("prescription.phonePlaceholder")} value={form.phone} onChange={handleChange} maxLength={20} />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="medicine" className="block text-sm font-medium text-foreground mb-1.5">
                {t("inquiry.medicine")} <span className="text-destructive">*</span>
              </label>
              <Input id="medicine" name="medicine" placeholder={t("inquiry.medicinePlaceholder")} value={form.medicine} onChange={handleChange} maxLength={200} />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                {t("inquiry.additionalDetails")} <span className="text-muted-foreground font-normal">{t("inquiry.optional")}</span>
              </label>
              <Textarea id="message" name="message" placeholder={t("inquiry.detailsPlaceholder")} value={form.message} onChange={handleChange} rows={3} maxLength={500} />
            </div>

            <Button variant="cta" size="lg" className="w-full text-base" onClick={handleWhatsAppInquiry}>
              <MessageCircle className="w-5 h-5" />
              {t("inquiry.sendInquiry")}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              {t("inquiry.responseTime")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquirySection;
