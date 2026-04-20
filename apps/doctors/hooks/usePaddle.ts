"use client";

import { useEffect, useState } from 'react';
import { initializePaddle, type Paddle } from '@paddle/paddle-js';

export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    // Ensuring it only runs on the client and initializes once
    const env = (process.env.NEXT_PUBLIC_PADDLE_ENV as "sandbox" | "production") || "sandbox";
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

    if (!token) {
        console.warn("Paddle client token is missing. Please set NEXT_PUBLIC_PADDLE_CLIENT_TOKEN in .env.local");
        return;
    }

    initializePaddle({
      environment: env,
      token: token,
      checkout: {
        settings: {
          displayMode: 'overlay', // or 'inline' depending on what we want
          theme: 'light',
        },
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance);
      }
    });
  }, []);

  return paddle;
}
