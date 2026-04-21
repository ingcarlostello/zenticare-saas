"use client";

import { usePaddle } from "../hooks/usePaddle";

interface CheckoutButtonProps {
  priceId: string;
  text: string;
  className?: string;
  email?: string;
  clerkId?: string;
  /** Locale segment for the dashboard path, e.g. `es` → `/es/dashboard` */
  lang?: string;
}

export function CheckoutButton({
  priceId,
  text,
  className,
  email,
  clerkId,
  lang = "en",
}: CheckoutButtonProps) {
  const paddle = usePaddle();

  const handleCheckout = () => {
    if (!paddle) {
      console.warn("Paddle is not initialized yet");
      return;
    }

    const successUrl = `${window.location.origin}/${lang}/dashboard`;

    paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        variant: "one-page",
        successUrl,
      },
      items: [{ priceId: priceId, quantity: 1 }],
      customer: email ? { email } : undefined,
      customData: clerkId ? { clerkId } : undefined,
    });
  };

  return (
    <button onClick={handleCheckout} className={className}>
      {text}
    </button>
  );
}
