"use client";

import { usePaddle } from "../hooks/usePaddle";

interface CheckoutButtonProps {
  priceId: string;
  text: string;
  className?: string;
  email?: string;
  clerkId?: string;
}

export function CheckoutButton({ priceId, text, className, email, clerkId }: CheckoutButtonProps) {
  const paddle = usePaddle();

  const handleCheckout = () => {
    if (!paddle) {
      console.warn("Paddle is not initialized yet");
      return;
    }

    paddle.Checkout.open({
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
