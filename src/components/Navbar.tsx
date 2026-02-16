import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, Menu, X, MessageCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import siteConfig from "@/config/site";
import { getWhatsAppUrl } from "@/config/whatsapp";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  // Robust check for Somali language
  const isSomali = i18n.language.startsWith('so');
  
  // Cart Logic for Step 4 & 5
  const [cartCount, setCartCount] = useState(0);

  const updateCount = () => {
    const savedCount = localStorage.getItem("amilax_cart_count");
    setCartCount(savedCount ? parseInt(savedCount) : 0);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener("cartUpdate", updateCount);
    updateCount();
    return () => window.removeEventListener("cartUpdate", updateCount);
  }, [location]);

  // Fixed navLinks to handle the Somali translation for Supplements
  const navLinks = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.medicines"), to: "/medicines" },
    { label: isSomali ? "Nafaqooyin" : "Supplements", to: "/supplements" },
    { label: t("nav.prescription"), to: "/prescription" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-lg">A</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-heading font-bold text-foreground text-lg leading-tight block">
              Amilax
            </span>
            <span className="text-[10px] text-muted-foreground leading-none tracking-wider uppercase">
              Pharmaceuticals
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === to
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Action Buttons & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <Link 
            to="/cart" 
            className={`relative p-2 transition-colors ${
              location.pathname === "/cart" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="cta-outline" size="sm" asChild>
              <a href={`tel:+${siteConfig.whatsappNumber}`}>
                <Phone className="w-4 h-4" />
                <span className="hidden lg:inline">{t("nav.callUs")}</span>
              </a>
            </Button>
            <Button variant="cta" size="sm" asChild>
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden lg:inline">{t("nav.whatsapp")}</span>
              </a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-card border-b border-border animate-fade-in">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`text-left text-sm font-medium py-2 transition-colors ${
                  location.pathname === to
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
            {/* Mobile Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="cta-outline" size="sm" className="flex-1" asChild>
                <a href={`tel:+${siteConfig.whatsappNumber}`}>
                  <Phone className="w-4 h-4" />
                  {t("nav.callUs")}
                </a>
              </Button>
              <Button variant="cta" size="sm" className="flex-1" asChild>
                <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" />
                  {t("nav.whatsapp")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;