import { Check } from "lucide-react";
import { ReactNode } from "react";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  isHighlighted?: boolean;
  actionButton?: ReactNode;
}

export function PricingCard({
  title,
  price,
  features,
  isHighlighted = false,
  actionButton,
}: PricingCardProps) {
  const cardClassName = isHighlighted
    ? "bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-10 shadow-2xl text-white flex flex-col h-full md:scale-105 sm:scale-100 relative overflow-hidden"
    : "bg-base-100 rounded-[2rem] p-10 shadow-lg border border-base-200 flex flex-col h-full relative";

  const titleClassName = isHighlighted
    ? "text-2xl font-bold mb-8 uppercase tracking-wide"
    : "text-2xl font-bold text-base-content mb-8";

  const featureContainerClassName = isHighlighted
    ? "space-y-4 mb-auto text-white/90 flex-grow relative z-10"
    : "space-y-4 mb-auto text-base-content/80 flex-grow";

  const iconClassName = isHighlighted
    ? "w-5 h-5 text-white/60"
    : "w-5 h-5 text-base-content/40";

  const priceDividerClassName = isHighlighted
    ? "mt-12 pt-6 border-t border-white/20 relative z-10"
    : "mt-12 pt-6 border-t border-base-200/60";

  const priceClassName = isHighlighted
    ? "text-4xl font-bold"
    : "text-4xl font-bold text-base-content";

  return (
    <div className={cardClassName}>
      <h2 className={titleClassName}>{title}</h2>

      <ul className={featureContainerClassName}>
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <Check className={iconClassName} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className={priceDividerClassName}>
        <div className="flex items-end gap-1 mb-6">
          <span className={priceClassName}>${price}</span>
        </div>
        {actionButton}
      </div>
    </div>
  );
}
