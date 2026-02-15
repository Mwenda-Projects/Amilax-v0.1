import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePageMeta from "@/hooks/usePageMeta";
import siteConfig from "@/config/site";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  usePageMeta({
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist. Return to Amilax Pharmaceuticals homepage.",
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50">
      <div className="text-center px-6">
        <p className="text-6xl font-heading font-bold text-primary mb-2">404</p>
        <h1 className="text-xl font-heading text-foreground mb-2">{t("notFound.title")}</h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
          {t("notFound.description")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="cta" asChild>
            <Link to="/">
              <Home className="w-4 h-4" />
              {t("notFound.backHome")}
            </Link>
          </Button>
          <Button variant="cta-outline" asChild>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent("Hi, I need help finding something on your website.")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-4 h-4" />
              {t("notFound.whatsapp")}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
