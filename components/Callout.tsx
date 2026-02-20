import { AlertOctagon, AlertTriangle, Info } from "lucide-react";
import React from "react";

type CalloutVariant = "info" | "warning" | "danger";

interface CalloutProps {
  variant?: CalloutVariant;
  title: string;
  children: React.ReactNode;
}

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const variantStyles = {
    info: {
      container:
        "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
      icon: <Info className="w-5 h-5 text-blue-500" />,
    },
    warning: {
      container:
        "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    },
    danger: {
      container:
        "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
      icon: <AlertOctagon className="w-5 h-5 text-red-600" />,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className={`my-6 flex items-start p-4 border rounded-lg ${currentVariant.container}`}
    >
      <div className="flex-shrink-0 mr-3 mt-1">{currentVariant.icon}</div>
      <div>
        {title && <strong className="block font-bold mb-1">{title}</strong>}
        <div className="last:mb-0 mdx-callout-content">{children}</div>
      </div>
    </div>
  );
}
