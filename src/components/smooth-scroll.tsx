"use client";

import React, { useEffect } from "react";
import Lenis from "lenis";

const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Add passive event listeners
    const wheelOptions = { passive: true };
    const touchOptions = { passive: true };

    window.addEventListener("wheel", () => {}, wheelOptions);
    window.addEventListener("touchmove", () => {}, touchOptions);

    return () => {
      lenis.destroy();
      window.removeEventListener("wheel", () => {});
      window.removeEventListener("touchmove", () => {});
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
