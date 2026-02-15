import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language?.startsWith("so") ? "so" : "en";

  const toggleLanguage = () => {
    const next = currentLang === "en" ? "so" : "en";
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border/50"
      aria-label="Switch language"
    >
      <Globe className="w-3.5 h-3.5" />
      {currentLang === "en" ? t("lang.so") : t("lang.en")}
    </button>
  );
};

export default LanguageSwitcher;
