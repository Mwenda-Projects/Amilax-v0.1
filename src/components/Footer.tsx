import { Link } from "react-router-dom";
import { Clock, MessageCircle, Mail, ShieldCheck } from "lucide-react";
import siteConfig from "@/config/site";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-foreground py-12">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-sm">A</span>
              </div>
              <span className="font-heading font-bold text-primary-foreground text-sm">
                Amilax Pharmaceuticals
              </span>
            </Link>
            <p className="text-primary-foreground/50 text-xs leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-primary-foreground mb-4">
              {t("footer.quickLinks")}
            </h4>
            <nav className="flex flex-col gap-2">
              {[
                { label: t("footer.home"), to: "/" },
                { label: t("footer.aboutUs"), to: "/about" },
                { label: t("footer.medicines"), to: "/medicines" },
                { label: t("footer.prescriptionUpload"), to: "/prescription" },
                { label: t("footer.contactUs"), to: "/contact" },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-primary-foreground/50 hover:text-primary-foreground text-xs transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Operating Hours & Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-primary-foreground mb-4">
              {t("footer.contactHours")}
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-cta mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80 text-xs font-medium">{t("footer.operatingHours")}</p>
                  <p className="text-primary-foreground/50 text-xs">{siteConfig.operatingHours}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-cta mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80 text-xs font-medium">{t("footer.whatsapp")}</p>
                  <a
                    href={`https://wa.me/${siteConfig.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-foreground/50 hover:text-primary-foreground text-xs transition-colors"
                  >
                    {t("footer.chatWithUs")}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-cta mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80 text-xs font-medium">{t("footer.email")}</p>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="text-primary-foreground/50 hover:text-primary-foreground text-xs transition-colors"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-primary-foreground mb-4">
              {t("footer.disclaimer")}
            </h4>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cta mt-0.5 flex-shrink-0" />
              <p className="text-primary-foreground/50 text-xs leading-relaxed">
                {t("footer.disclaimerText")}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-primary-foreground/40 text-xs text-center sm:text-left">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground/30 hover:text-primary-foreground/60 text-xs transition-colors"
          >
            {t("footer.builtWith")}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
