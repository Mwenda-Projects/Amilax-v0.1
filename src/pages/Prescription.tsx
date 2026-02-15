import { useState, useRef } from "react";
import {
  Upload,
  MessageCircle,
  Camera,
  FileText,
  X,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import usePageMeta from "@/hooks/usePageMeta";
import siteConfig from "@/config/site";
import { useTranslation } from "react-i18next";

const Prescription = () => {
  const { t } = useTranslation();

  usePageMeta({
    title: "Upload Prescription — Fast WhatsApp Service",
    description:
      "Upload your prescription to Amilax Pharmaceuticals via WhatsApp. Our pharmacists verify and prepare your medicines quickly. Serving Eastleigh, Nairobi.",
  });

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
      if (!allowed.includes(file.type)) {
        toast({ title: t("prescription.unsupportedFile"), description: t("prescription.unsupportedFileDesc"), variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: t("prescription.fileTooLarge"), description: t("prescription.fileTooLargeDesc"), variant: "destructive" });
        return;
      }
      setFileName(file.name);
    }
  };

  const clearFile = () => {
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name || !phone) {
      toast({ title: t("prescription.requiredFields"), description: t("prescription.requiredFieldsDesc"), variant: "destructive" });
      return;
    }
    if (!/^[\d+\-() ]{7,20}$/.test(phone)) {
      toast({ title: t("prescription.invalidPhone"), description: t("prescription.invalidPhoneDesc"), variant: "destructive" });
      return;
    }
    const parts = [
      `Prescription Upload Request`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      fileName ? `File: ${fileName} (I will attach it in this chat)` : "",
      form.message.trim() ? `Note: ${form.message.trim()}` : "",
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(parts)}`, "_blank");
    toast({
      title: t("prescription.openingWhatsApp"),
      description: fileName ? t("prescription.attachHint") : t("prescription.shareHint"),
    });
  };

  const steps = [
    { icon: Camera, step: "1", title: t("prescription.step1Title"), desc: t("prescription.step1Desc") },
    { icon: Upload, step: "2", title: t("prescription.step2Title"), desc: t("prescription.step2Desc") },
    { icon: CheckCircle2, step: "3", title: t("prescription.step3Title"), desc: t("prescription.step3Desc") },
  ];

  return (
    <>
      <section className="py-14 sm:py-16 bg-secondary/50">
        <div className="container">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">
              {t("prescription.subtitle")}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl text-foreground mb-4">
              {t("prescription.title")}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
              {t("prescription.description")}
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="container">
          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-14">
            {steps.map((s) => (
              <div key={s.step} className="text-center bg-card rounded-xl p-6 shadow-card border border-border/50 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">{s.step}</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3 mt-2">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-sm font-semibold text-foreground mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border/50">
              <h2 className="font-heading text-xl text-foreground mb-1">{t("prescription.formTitle")}</h2>
              <p className="text-sm text-muted-foreground mb-6">{t("prescription.formDesc")}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                    {t("prescription.name")} <span className="text-destructive">*</span>
                  </label>
                  <Input id="name" name="name" placeholder={t("prescription.namePlaceholder")} value={form.name} onChange={handleChange} maxLength={100} />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                    {t("prescription.phone")} <span className="text-destructive">*</span>
                  </label>
                  <Input id="phone" name="phone" type="tel" placeholder={t("prescription.phonePlaceholder")} value={form.phone} onChange={handleChange} maxLength={20} />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("prescription.fileLabel")}</label>
                {fileName ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border/50">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {fileName.toLowerCase().endsWith(".pdf") ? <FileText className="w-4 h-4 text-primary" /> : <ImageIcon className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="text-sm text-foreground truncate flex-1">{fileName}</span>
                    <button onClick={clearFile} className="p-1 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove file">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/60 transition-all text-center group cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <p className="text-sm font-medium text-foreground mb-1">{t("prescription.tapToSelect")}</p>
                    <p className="text-xs text-muted-foreground">{t("prescription.fileHint")}</p>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,.pdf" onChange={handleFileChange} className="hidden" />
              </div>

              <div className="mb-5">
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                  {t("prescription.notes")} <span className="text-muted-foreground font-normal">{t("prescription.optional")}</span>
                </label>
                <Textarea id="message" name="message" placeholder={t("prescription.notesPlaceholder")} value={form.message} onChange={handleChange} rows={3} maxLength={500} />
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15 mb-5">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: t("prescription.pharmacistNotice") }} />
              </div>

              <Button variant="cta" size="lg" className="w-full text-base" onClick={handleSubmit}>
                <MessageCircle className="w-5 h-5" />
                {t("prescription.sendViaWhatsApp")}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {fileName ? t("prescription.redirectNoticeWithFile") : t("prescription.redirectNotice")}
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm mb-3">{t("prescription.noPrescrip")}</p>
              <Button variant="cta-outline" size="lg" className="text-base" asChild>
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to check if a specific medicine is available.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t("prescription.inquireButton")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Prescription;
