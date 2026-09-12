import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Maximize2, Activity, Settings2 } from 'lucide-react';
import { GrainParticleCanvas } from './GrainParticleCanvas';
import { farmAmbience } from '../utils/audioAmbiance';
import { useCms } from '../context/CmsContext';

interface HeroVideoCardProps {
  onExpandCinema?: () => void;
}

export const HeroVideoCard: React.FC<HeroVideoCardProps> = ({ onExpandCinema }) => {
  const { data, authStatus, updateMediaSlot } = useCms();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // Check if hero media slot has a video or default to generated maize harvest video
  const heroSlot = data.mediaSlots['media-hero-main'];
  const videoSource =
    heroSlot?.mediaType === 'video' && heroSlot.url
      ? heroSlot.url
      : '/assets/maize_harvest_video.mp4';
  const posterSource = heroSlot?.posterUrl || '/assets/maize_harvest_sheller_1789075425641.jpg';

  const [customInputUrl, setCustomInputUrl] = useState(videoSource);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {
        // Autoplay may be restricted without user interaction
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleSound = () => {
    const active = farmAmbience.toggle();
    setIsSoundOn(active);
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    updateMediaSlot('media-hero-main', {
      url: customInputUrl.trim(),
      mediaType: 'video',
      posterUrl: posterSource,
    });
    setIsEditingUrl(false);
  };

  return (
    <div
      className="relative rounded-2xl p-1 bg-gradient-to-br from-[#d4af37]/30 via-[#2a4430]/40 to-[#122016] shadow-2xl border border-[#c49746]/40 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer ambient glow */}
      <div className="absolute -inset-1 bg-radial from-[#e5a952]/10 to-transparent blur-xl pointer-events-none" />

      <div className="relative rounded-xl overflow-hidden bg-[#0d160f] aspect-[4/3] sm:aspect-[16/10]">
        {/* Background HTML5 Video */}
        <video
          ref={videoRef}
          src={videoSource}
          poster={posterSource}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />

        {/* Ambient Warm Golden Overlay for Film Aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a120c]/90 via-[#0a120c]/20 to-[#0a120c]/40 pointer-events-none" />

        {/* Interactive Golden Grain Particle Flow Animation */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            <GrainParticleCanvas density="medium" interactive={false} />
          </div>
        )}

        {/* Top Badges & Status Pill */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a120c]/80 backdrop-blur-md border border-[#c49746]/40 text-[#f5ecd8] text-[11px] font-medium shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e5a952] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]" />
            </span>
            <span className="tracking-wide">OPERATIONAL FIELD MOTION</span>
            <span className="text-[#c49746] font-mono text-[10px]">• 30FPS</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Particle Toggle */}
            <button
              type="button"
              onClick={() => setShowParticles((prev) => !prev)}
              title={showParticles ? 'Turn off particle animation' : 'Turn on grain particles'}
              className={`p-2 rounded-lg backdrop-blur-md transition-all text-xs ${
                showParticles
                  ? 'bg-[#c49746] text-[#0d160f] font-semibold'
                  : 'bg-[#0a120c]/70 text-[#d6cdb8] hover:bg-[#0a120c]/90 border border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Sound Toggle (Web Audio API Synthesizer) */}
            <button
              type="button"
              onClick={toggleSound}
              title={isSoundOn ? 'Mute Farm Ambiance' : 'Play Gentle Farm Ambiance (Wind & Machinery)'}
              className={`p-2 rounded-lg backdrop-blur-md transition-all text-xs ${
                isSoundOn
                  ? 'bg-[#284a30] text-[#71db88] border border-[#3e784c]'
                  : 'bg-[#0a120c]/70 text-[#d6cdb8] hover:bg-[#0a120c]/90 border border-white/10'
              }`}
            >
              {isSoundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Expand Cinema View */}
            {onExpandCinema && (
              <button
                type="button"
                onClick={onExpandCinema}
                title="Expand to Full Cinema View"
                className="p-2 rounded-lg bg-[#0a120c]/70 hover:bg-[#0a120c]/90 border border-white/10 text-[#d6cdb8] transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Admin Quick Edit Button */}
            {authStatus.isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsEditingUrl((prev) => !prev)}
                title="Change Video URL"
                className="p-2 rounded-lg bg-[#c49746]/20 hover:bg-[#c49746]/40 border border-[#c49746]/50 text-[#f5ecd8] transition-all"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center Play/Pause Overlay Indicator on Hover */}
        <div
          onClick={togglePlay}
          className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-300 ${
            !isPlaying || isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[#0a120c]/80 backdrop-blur-md border border-[#c49746]/60 flex items-center justify-center text-[#e5a952] shadow-xl hover:scale-110 transition-transform">
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Bottom Operational Telemetry & Caption */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-[#0a120c] via-[#0a120c]/80 to-transparent">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#e5a952] font-mono">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#e5a952]" />
                <span>NORTON GRAIN FACILITY • MAIZE SHELLING</span>
              </span>
              <span className="text-[#a4b4a6]">THROUGHPUT 4.5T/HR</span>
            </div>

            <p className="text-xs sm:text-sm text-[#f5ecd8] font-serif font-medium leading-snug">
              High-capacity mechanical shelling and post-harvest curing of commercial dent maize crop.
            </p>

            <div className="flex items-center justify-between pt-1 text-[10px] text-[#8ea492] border-t border-white/10">
              <span>Moisture Target: &lt;12.5%</span>
              <span>Farm-to-Market Value Addition</span>
              <span className="text-[#e5a952] font-semibold cursor-pointer hover:underline" onClick={onExpandCinema}>
                Watch Full Documentary →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Video URL Edit Drawer */}
      {isEditingUrl && authStatus.isAuthenticated && (
        <form onSubmit={handleSaveVideoUrl} className="p-3 bg-[#131f15] border-t border-[#c49746]/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#e5a952]">Configure Hero Video Source</span>
            <button
              type="button"
              onClick={() => setIsEditingUrl(false)}
              className="text-[#a4b4a6] hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInputUrl}
              onChange={(e) => setCustomInputUrl(e.target.value)}
              placeholder="e.g. /assets/maize_harvest_video.mp4 or https://..."
              className="flex-1 px-3 py-1.5 rounded bg-[#0a120c] border border-white/20 text-white text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#c49746] text-[#0d160f] font-semibold rounded"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
