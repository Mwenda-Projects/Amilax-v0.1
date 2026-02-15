import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
}

/**
 * Sets the document title and meta description for SEO.
 * Title is appended with the brand suffix automatically.
 */
const usePageMeta = ({ title, description }: PageMeta) => {
  useEffect(() => {
    const fullTitle = `${title} | Amilax Pharmaceuticals`;
    document.title = fullTitle;

    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", description);
    }

    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description);
  }, [title, description]);
};

export default usePageMeta;
