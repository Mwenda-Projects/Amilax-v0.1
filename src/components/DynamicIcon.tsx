import { lazy, Suspense } from "react";
import { type LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

interface DynamicIconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

const fallback = <div className="w-5 h-5" />;

/**
 * Renders a Lucide icon by its kebab-case name (e.g. "shield-plus").
 * Icons are lazy-loaded so only used icons are bundled.
 */
const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const iconName = name as keyof typeof dynamicIconImports;

  if (!dynamicIconImports[iconName]) {
    // Fallback to a generic pill icon if the name is invalid
    const Pill = lazy(dynamicIconImports["pill"]);
    return (
      <Suspense fallback={fallback}>
        <Pill {...props} />
      </Suspense>
    );
  }

  const LucideIcon = lazy(dynamicIconImports[iconName]);

  return (
    <Suspense fallback={fallback}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

export default DynamicIcon;
