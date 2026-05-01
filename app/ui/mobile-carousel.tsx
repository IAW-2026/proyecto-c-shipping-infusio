"use client"

import React, { useState, useRef, useEffect } from "react";

export default function MobileCarousel() {
  const images = [
    "https://images.pexels.com/photos/37125860/pexels-photo-37125860.jpeg",
    "https://images.pexels.com/photos/7734747/pexels-photo-7734747.jpeg",
    "https://images.pexels.com/photos/8329966/pexels-photo-8329966.jpeg",
    "https://images.pexels.com/photos/10255629/pexels-photo-10255629.jpeg",
    "https://images.pexels.com/photos/17113066/pexels-photo-17113066.jpeg"
  ];

  const [index, setIndex] = useState(0);
  const startXRef = useRef<number | null>(null);
  const deltaXRef = useRef(0);
  const pausedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    deltaXRef.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current == null) return;
    deltaXRef.current = e.touches[0].clientX - startXRef.current;
  };

  const onTouchEnd = () => {
    const threshold = 40; // swipe threshold in px
    if (deltaXRef.current > threshold) prev();
    else if (deltaXRef.current < -threshold) next();
    startXRef.current = null;
    deltaXRef.current = 0;
  };

  // autoplay
  useEffect(() => {
    const startAutoplay = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (!pausedRef.current) setIndex((i) => (i + 1) % images.length);
      }, 3500) as unknown as number;
    };

    startAutoplay();

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    pausedRef.current = true;
    onTouchStart(e);
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  };

  const handleTouchEnd = () => {
    onTouchEnd();
    pausedRef.current = false;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % images.length);
    }, 3500) as unknown as number;
  };

  // overlap settings (percent of container)
  const slideWidth = 80; // each slide uses 80% of container width
  const overlap = 12; // overlap between slides in percent
  const step = slideWidth - overlap; // movement step in percent

  return (
    <div className="mt-8 sm:mt-10 block lg:hidden">
      <div className="relative">
        <div
          className="overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${index * step}%)` }}
          >
            {images.map((src, idx) => (
              <div
                key={idx}
                className="flex-none px-4"
                style={{ flex: `0 0 ${slideWidth}%` }}
              >
                <div className="mx-auto rounded-xl overflow-hidden bg-card shadow-sm" style={{ width: '100%', height: 'min(120vw, 60vh)' }}>
                  <img src={src} alt={`slide-${idx}`} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* controls */}
        <button
          aria-label="Anterior"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 shadow-md"
        >
          ‹
        </button>
        <button
          aria-label="Siguiente"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 shadow-md"
        >
          ›
        </button>

        {/* indicators */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-8 rounded-full ${i === index ? "bg-primary" : "bg-muted/60"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
