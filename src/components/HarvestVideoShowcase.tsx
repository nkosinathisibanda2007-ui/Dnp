import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  Layers,
  Flame,
  CheckCircle2,
  Wheat,
  Upload,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { GrainParticleCanvas } from './GrainParticleCanvas';
import { farmAmbience } from '../utils/audioAmbiance';
import { useCms } from '../context/CmsContext';

export const HarvestVideoShowcase: React.FC = () => {
  const { data, authStatus, updateMediaSlot, openEnquiryModal } = useCms();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  type ViewMode = 'field_operation' | 'grain_cascade' | 'interactive_physics';
  const [activeView, setActiveView] = useState<ViewMode>('field_operation');

  const [isPlaying, setIsPlaying] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7.04);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Video and poster references
  const videoSources: Record<ViewMode, string> = {
    field_operation: '/assets/maize_harvest_video.mp4',
    grain_cascade: '/assets/maize_harvest_video.mp4',
    interactive_physics: '',
  };

  const posterSources: Record<ViewMode, string> = {
    field_operation: '/assets/maize_harvest_sheller_1789075425641.jpg',
    grain_cascade: '/assets/maize_grain_cascade_1789075438961.jpg',
    interactive_physics: '/assets/maize_harvest_sheller_1789075425641.jpg',
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying, activeView]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleSound = () => {
    const active = farmAmbience.toggle();
    setIsSoundOn(active);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Title & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#ede8d8] border border-[#ded8c4] text-[#715421] text-xs font-semibold tracking-wider uppercase mb-2">
            <Wheat className="w-3.5 h-3.5 text-[#c48a39]" />
            <span>Field Operations in Motion</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#142217] tracking-tight">
            Harvest & Value Addition in Motion
          </h2>
          <p className="text-xs sm:text-sm text-[#48544a] mt-1.5 max-w-2xl leading-relaxed">
            Witness our active grain harvesting and mechanical shelling operations in Norton and Mvuma. Real field footage capturing high-volume cereal processing, strict moisture compliance, and organic biomass utilization.
          </p>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ede8d8] rounded-xl border border-[#ded8c4] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveView('field_operation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'field_operation'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#5a5241] hover:text-[#18261b]'
            }`}
          >
            Field Sheller
          </button>
          <button
            type="button"
            onClick={() => setActiveView('grain_cascade')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'grain_cascade'
                ? 'bg-[#1b2e20] text-white shadow-xs'
                : 'text-[#5a5241] hover:text-[#18261b]'
            }`}
          >
            Grain Cascade
          </button>
          <button
            type="button"
            onClick={() => setActiveView('interactive_physics')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
              activeView === 'interactive_physics'
                ? 'bg-[#c48a39] text-[#142217] font-bold shadow-xs'
                : 'text-[#5a5241] hover:text-[#18261b]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#715421]" />
            <span>Grain Simulation</span>
          </button>
        </div>
      </div>

      {/* Main Video & Cinema Container */}
      <div
        ref={containerRef}
        className={`relative rounded-3xl overflow-hidden border border-[#c49746]/40 bg-[#0c140e] shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
        }`}
      >
        {/* Media Frame View */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[320px] max-h-[580px] w-full overflow-hidden bg-[#09100a]">
          {activeView === 'interactive_physics' ? (
            /* Interactive Canvas Simulation Mode */
            <div className="relative w-full h-full bg-[#0a120c] flex items-center justify-center">
              <img
                src={posterSources.field_operation}
                alt="Grain field"
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
              <GrainParticleCanvas density="rich" interactive={true} />
              <div className="relative z-10 text-center max-w-md p-6 bg-[#0a120c]/80 backdrop-blur-md rounded-2xl border border-[#c49746]/40 shadow-2xl pointer-events-none">
                <Sparkles className="w-8 h-8 text-[#e5a952] mx-auto mb-2 animate-bounce" />
                <h4 className="text-lg font-serif font-bold text-[#faf9f5]">
                  Interactive Golden Grain Simulation
                </h4>
                <p className="text-xs text-[#d6cdb8] mt-1 leading-relaxed">
                  Move your mouse or touch the canvas above to interact with the cascading golden maize grain physics.
                </p>
                <span className="inline-block mt-3 px-2.5 py-0.5 rounded bg-[#c49746]/20 border border-[#c49746]/40 text-[#f5ecd8] text-[10px] font-mono">
                  PARTICLE PHYSICS • 60 FPS • INTERACTIVE ACCELERATION
                </span>
              </div>
            </div>
          ) : (
            /* HTML5 Video Playback Mode */
            <>
              <video
                ref={videoRef}
                src={videoSources[activeView]}
                poster={posterSources[activeView]}
                autoPlay
                loop
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
              />

              {/* Subtle ambient lighting vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09100a]/95 via-transparent to-[#09100a]/40 pointer-events-none" />

              {/* Optional Glistening Golden Grain Particle Animation Overlay */}
              {showParticles && (
                <div className="absolute inset-0 pointer-events-none">
                  <GrainParticleCanvas density="medium" interactive={false} />
                </div>
              )}
            </>
          )}

          {/* Top Info HUD Bar */}
          <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a120c]/85 backdrop-blur-md border border-[#c49746]/40 text-[#faf9f5] text-xs font-semibold shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>NORTON HUB • OPERATIONAL HARVEST VIDEO</span>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-[#0a120c]/70 backdrop-blur-md border border-white/10 text-[11px] text-[#e5a952] font-mono">
                CAMERA: FIELD CAPTURE 1080P
              </span>
            </div>

            {/* Quick action icons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setShowParticles((prev) => !prev)}
                title={showParticles ? 'Turn off particle flow' : 'Turn on grain particles'}
                className={`p-2 rounded-xl backdrop-blur-md transition-all text-xs flex items-center gap-1.5 ${
                  showParticles
                    ? 'bg-[#c49746] text-[#0d160f] font-bold shadow-md'
                    : 'bg-[#0a120c]/70 text-[#d6cdb8] hover:bg-[#0a120c]/90 border border-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Grain Particles</span>
              </button>

              <button
                type="button"
                onClick={toggleSound}
                title={isSoundOn ? 'Mute Farm Ambiance' : 'Play Gentle Farm Ambiance'}
                className={`p-2 rounded-xl backdrop-blur-md transition-all text-xs flex items-center gap-1.5 ${
                  isSoundOn
                    ? 'bg-[#26472d] text-[#6fe387] border border-[#3e784c] shadow-md'
                    : 'bg-[#0a120c]/70 text-[#d6cdb8] hover:bg-[#0a120c]/90 border border-white/10'
                }`}
              >
                {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{isSoundOn ? 'Ambiance On' : 'Audio Muted'}</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Cinema'}
                className="p-2 rounded-xl bg-[#0a120c]/70 hover:bg-[#0a120c]/90 border border-white/10 text-white transition-all"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Bottom Floating Scrubber & Playback Controls (When in Video Mode) */}
          {activeView !== 'interactive_physics' && (
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-[#09100a] via-[#09100a]/90 to-transparent space-y-2.5">
              {/* Progress Bar Scrubber */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={duration || 7}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#e5a952]"
                />
                <span className="text-[11px] font-mono text-[#a4b4a6] shrink-0">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Bottom Buttons Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((prev) => !prev)}
                    className="p-2 rounded-lg bg-[#e5a952] hover:bg-[#f3b760] text-[#0d160f] font-bold transition-transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="hidden sm:flex items-center gap-1 ml-2 text-xs text-[#d6cdb8]">
                    <span className="text-[11px] text-[#8ea492]">Speed:</span>
                    {[0.5, 1, 1.5].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-[#c48a39] text-[#142217] font-bold'
                            : 'bg-white/5 hover:bg-white/15 text-[#a4b4a6]'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="hidden md:flex items-center gap-2 text-[11px] text-[#e5a952] font-mono">
                    <span>ROTARY DRUM SEPARATOR</span>
                    <span>•</span>
                    <span>12.5% MOISTURE RETENTION</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEnquiryModal('products', 'Maize Grain Bulk Allocation')}
                    className="px-3 py-1.5 rounded-lg bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    Enquire on Grain Harvest
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Value Addition Operational Cards (Below Video Frame) */}
        <div className="p-6 sm:p-8 bg-[#111c13] border-t border-[#c49746]/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#162419] border border-[#243d2c]">
              <div className="w-8 h-8 rounded-lg bg-[#c48a39]/20 flex items-center justify-center text-[#e5a952] mb-3">
                <Wheat className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#faf9f5]">
                1. Mechanical Separation
              </h4>
              <p className="text-xs text-[#a9b9ab] mt-1.5 leading-relaxed">
                High-capacity rotary drum thresher cleanly separates dent maize kernels from the cob with minimal seed fracturing or mechanical loss.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#162419] border border-[#243d2c]">
              <div className="w-8 h-8 rounded-lg bg-[#c48a39]/20 flex items-center justify-center text-[#e5a952] mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#faf9f5]">
                2. Golden Grain Mound
              </h4>
              <p className="text-xs text-[#a9b9ab] mt-1.5 leading-relaxed">
                Freshly threshed yellow and white grain accumulates in bulk outdoor curing piles prior to moisture testing, fine screening, and 50kg bagging.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#162419] border border-[#243d2c]">
              <div className="w-8 h-8 rounded-lg bg-[#c48a39]/20 flex items-center justify-center text-[#e5a952] mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#faf9f5]">
                3. Biomass Utilization
              </h4>
              <p className="text-xs text-[#a9b9ab] mt-1.5 leading-relaxed">
                Stripped maize cobs shown stacked beside the machinery are captured for clean biochar conversion, livestock bedding, and organic compost.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#162419] border border-[#243d2c]">
              <div className="w-8 h-8 rounded-lg bg-[#c48a39]/20 flex items-center justify-center text-[#e5a952] mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="font-serif font-bold text-sm text-[#faf9f5]">
                4. Strict Quality Testing
              </h4>
              <p className="text-xs text-[#a9b9ab] mt-1.5 leading-relaxed">
                Every batch undergoes calibrated moisture testing to maintain &lt;12.5% moisture, preventing aflatoxin and guaranteeing commercial off-taker grade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
