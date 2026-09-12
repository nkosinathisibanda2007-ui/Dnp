import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GrainParticleCanvas } from './GrainParticleCanvas';
import { farmAmbience } from '../utils/audioAmbiance';

interface VideoCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  posterUrl?: string;
}

export const VideoCinemaModal: React.FC<VideoCinemaModalProps> = ({
  isOpen,
  onClose,
  videoUrl = '/assets/maize_harvest_video.mp4',
  posterUrl = '/assets/maize_harvest_sheller_1789075425641.jpg',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7.04);

  useEffect(() => {
    if (!isOpen) {
      if (isSoundOn) {
        farmAmbience.stop();
        setIsSoundOn(false);
      }
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSound = () => {
    const active = farmAmbience.toggle();
    setIsSoundOn(active);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#0a120c] border border-[#c49746]/50 shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111c13] border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse" />
            <div>
              <h3 className="text-base font-serif font-bold text-[#faf9f5]">
                Dzinopona Farms Cinema • Field Harvest & Shelling
              </h3>
              <p className="text-xs text-[#a9b9ab]">
                Norton Operational Station • Commercial Grain Threshing & Value Addition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSoundOn
                  ? 'bg-[#284a30] text-[#71db88] border border-[#3e784c]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isSoundOn ? 'Field Audio Active' : 'Unmute Farm Audio'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={posterUrl}
            autoPlay
            loop
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain"
          />

          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              <GrainParticleCanvas density="medium" interactive={false} />
            </div>
          )}

          {/* Center Play Button Overlay on Hover/Pause */}
          <div
            onClick={togglePlay}
            className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity ${
              !isPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-[#0a120c]/85 border border-[#c49746] flex items-center justify-center text-[#e5a952] shadow-2xl">
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
            </div>
          </div>

          {/* Bottom Floating Bar */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 rounded-lg bg-[#e5a952] text-[#0d160f] font-bold"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-[#d6cdb8]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowParticles((p) => !p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  showParticles ? 'bg-[#c49746] text-[#0d160f] font-bold' : 'bg-white/10 text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Harvest Glow</span>
              </button>
            </div>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="p-4 sm:p-5 bg-[#111c13] text-xs text-[#a9b9ab] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>Documentary capture of commercial harvesting at Dzinopona Farms (Norton Hub).</span>
          </div>
          <div className="flex items-center gap-4 text-[#e5a952] font-mono text-[11px]">
            <span>THROUGHPUT: 4.5 TONNES/HR</span>
            <span>•</span>
            <span>MOISTURE SPEC: &lt;12.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
