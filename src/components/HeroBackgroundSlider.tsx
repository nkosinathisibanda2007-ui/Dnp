import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, MapPin, Sparkles } from 'lucide-react';

export interface SlideItem {
  id: string;
  url: string;
  title: string;
  subtitle: string;
  location: string;
  badge: string;
  alt: string;
}

export const HERO_SLIDES: SlideItem[] = [
  {
    id: 'livestock',
    url: '/assets/hero_livestock_bull.jpg',
    title: 'Pedigreed Livestock & Beef Cattle',
    subtitle: 'High-vigor Brahman genetics, feedlot nutrition & range management',
    location: 'Mvuma Hub • Zimbabwe',
    badge: 'Livestock & Genetics',
    alt: 'Pedigreed Brahman beef bull in timber corral at Dzinopona Farms Mvuma hub',
  },
  {
    id: 'nursery',
    url: '/assets/hero_nursery_greenhouse.jpg',
    title: 'Certified Nursery & Orchard Saplings',
    subtitle: 'Precision drip-irrigated avocado, macadamia & fruit tree propagation',
    location: 'Esigodini Hub • Zimbabwe',
    badge: 'Horticulture & Nursery',
    alt: 'Commercial fruit tree saplings in nursery greenhouse at Dzinopona Farms Esigodini hub',
  },
  {
    id: 'irrigated-fields',
    url: '/assets/hero_irrigated_field.jpg',
    title: 'Commercial Irrigated Crop Fields',
    subtitle: 'Modern pipeline delivery, pivot irrigation & high-density cereal cultivation',
    location: 'Norton Hub • Zimbabwe',
    badge: 'Crops & Irrigation',
    alt: 'Lush commercial irrigated crop field and pipeline at Dzinopona Farms Norton hub',
  },
];

interface HeroBackgroundSliderProps {
  intervalMs?: number; // Default 5000ms (5 seconds)
  children: React.ReactNode;
}

export const HeroBackgroundSlider: React.FC<HeroBackgroundSliderProps> = ({
  intervalMs = 5000,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Handle slide advance
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    startTimeRef.current = Date.now();
  };

  // Timer loop for 5-second interval
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / intervalMs) * 100);
      setProgress(pct);

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

  const activeSlide = HERO_SLIDES[currentIndex];

  return (
    <div
      className="relative overflow-hidden w-full text-white min-h-[640px] lg:min-h-[720px] flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="hero-bahs-slider"
    >
      {/* 1. BACKGROUND IMAGES SLIDESHOW WITH 5-SECOND CROSS-FADE & KEN BURNS ZOOM */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a120c]">
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
                className={`w-full h-full object-cover object-center transform transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* 2. SOPHISTICATED GRADIENT OVERLAYS FOR OPTICAL CONTRAST (BAHS-STYLE) */}
        {/* Primary directional dark scrim ensuring text legibility */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#070f09]/95 via-[#0b160d]/85 to-[#0c180e]/65 pointer-events-none" />
        
        {/* Vertical gradient for header and bottom controls */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/60 via-transparent to-[#070f09]/90 pointer-events-none" />

        {/* Subtle radial vignette accent */}
        <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/70 pointer-events-none" />

        {/* Subtle grid line accent */}
        <div className="absolute inset-0 z-20 opacity-10 bg-subtle-lines pointer-events-none" />
      </div>

      {/* 3. FOREGROUND CONTENT (USER'S HERO CONTENT) */}
      <div className="relative z-30 flex-1 flex items-center pt-8 pb-16">
        {children}
      </div>

      {/* 4. BOTTOM CONTROLS & SLIDE INDICATOR BAR (BAHS-STYLE 5-SEC INTERVAL) */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
          {/* Active slide badge & location info */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e5a952]/20 border border-[#e5a952]/40 text-[#f5d061] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>{activeSlide.badge}</span>
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#d1dec4]">
              <MapPin className="w-3.5 h-3.5 text-[#e5a952] shrink-0" />
              <span className="font-medium text-white">{activeSlide.location}</span>
              <span className="hidden md:inline text-white/40">•</span>
              <span className="hidden md:inline text-white/80">{activeSlide.title}</span>
            </div>
          </div>

          {/* Controls: Prev, Play/Pause, Next & Progress Dots */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* 3 Slide Progress Bars */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className="group flex flex-col gap-1 p-1 focus:outline-none"
                    aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  >
                    <div className="w-10 sm:w-14 h-1.5 rounded-full bg-white/20 overflow-hidden relative transition-all group-hover:bg-white/40">
                      {isActive && (
                        <div
                          className="h-full bg-[#e5a952] transition-all duration-100 ease-linear rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      )}
                      {!isActive && idx < currentIndex && (
                        <div className="h-full bg-white/70 w-full rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Prev / Play-Pause / Next Buttons */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
              <button
                type="button"
                onClick={prevSlide}
                className="w-7 h-7 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Previous slide"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded flex items-center justify-center text-[#e5a952] hover:text-white hover:bg-white/10 transition-colors"
                title={isPlaying ? 'Pause slideshow' : 'Play slideshow (5s interval)'}
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={nextSlide}
                className="w-7 h-7 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Next slide"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Slide Count Display */}
            <div className="text-xs font-mono text-[#a8bba9]">
              <span className="text-white font-bold">{currentIndex + 1}</span>
              <span className="text-white/40"> / </span>
              <span>{HERO_SLIDES.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
