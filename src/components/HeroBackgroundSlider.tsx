import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HERO_SLIDES_DATA } from '../utils/imageAssets';

export interface SlideItem {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  location: string;
  badge: string;
  alt: string;
}

export const HERO_SLIDES: SlideItem[] = HERO_SLIDES_DATA;

interface HeroBackgroundSliderProps {
  intervalMs?: number; // Default 5000ms (5 seconds)
  children: React.ReactNode;
}

export const HeroBackgroundSlider: React.FC<HeroBackgroundSliderProps> = ({
  intervalMs = 5000,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying] = useState(true);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Handle slide advance
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    startTimeRef.current = Date.now();
  }, []);

  // Timer loop for 5-second interval
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= intervalMs) {
        nextSlide();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentIndex, isPlaying, intervalMs, nextSlide]);

  // Eagerly preload all slide images in browser cache for instant transitions
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.url;
    });
  }, []);

  return (
    <div
      className="relative overflow-hidden w-full min-h-[580px] lg:min-h-[640px] flex flex-col justify-between bg-[#fcfdf9]"
      id="hero-bahs-slider"
    >
      {/* 1. LIGHT FRESH FARM SLIDESHOW WITH 5-SECOND CROSS-FADE */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.url}
                alt={slide.alt}
                referrerPolicy="no-referrer"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* 2. LIGHT THEME SEAMLESS MIST GRADIENTS (NO DARK SCRIMS) */}
        {/* Soft daylight directional blend: text on left is super readable over light backdrop, right side shows bright sunny farm photo */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#fcfdf9]/95 via-[#fcfdf9]/80 to-[#fcfdf9]/20 pointer-events-none" />
        {/* Bottom feathering into the light page background */}
        <div className="absolute inset-x-0 bottom-0 h-24 z-20 bg-gradient-to-t from-[#fcfdf9] to-transparent pointer-events-none" />
      </div>

      {/* 3. FOREGROUND CONTENT (WORDS FLOW SEAMLESSLY DIRECTLY OVER PHOTO) */}
      <div className="relative z-30 flex-1 flex items-center pt-10 pb-8">
        {children}
      </div>
    </div>
  );
};

