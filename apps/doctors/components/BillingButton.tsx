"use client";

import { CreditCard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";

interface BillingButtonProps {
  label: string;
}

export function BillingButton({ label }: BillingButtonProps) {
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();

  const handleBillingClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId || isLoading) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/billing/portal-session", {
        method: "POST",
      });

      if (response.status === 404) {
        const lang = params?.lang ?? "en";
        router.push(`/${lang}/pricing`);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Failed to load customer portal", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <li>
      <a
        href="#"
        onClick={handleBillingClick}
        className={`is-drawer-close:tooltip is-drawer-close:tooltip-right ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        data-tip={label}
        //target="_blank" 
        // rel="noopener noreferrer"
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs mr-1" />
        ) : (
          <CreditCard />
        )}
        <span className="is-drawer-close:hidden ml-2">{label}</span>
      </a>
    </li>
  );
}
