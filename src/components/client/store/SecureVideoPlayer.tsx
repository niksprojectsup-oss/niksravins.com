"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SecureVideoPlayerProps = {
  src: string;
  watermark: string;
  licenseNotice: string;
  title: string;
  watchLabel: string;
};

const POSITIONS = [
  "top-4 left-4",
  "top-4 right-4",
  "bottom-16 left-4",
  "bottom-16 right-4",
  "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
] as const;

export function SecureVideoPlayer({
  src,
  watermark,
  licenseNotice,
  title,
  watchLabel,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [positionIndex, setPositionIndex] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPositionIndex((current) => (current + 1) % POSITIONS.length);
    }, 12000);
    return () => window.clearInterval(interval);
  }, []);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, (currentTime / duration) * 100);
  }, [currentTime, duration]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function toggleFullscreen() {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      void container.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }

  return (
    <div className="layout-stack-md">
      <div className="relative overflow-hidden rounded-lg border border-border-subtle bg-ink">
        <video
          ref={videoRef}
          src={src}
          className="aspect-video w-full bg-ink object-contain"
          playsInline
          controls={false}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          onContextMenu={(event) => event.preventDefault()}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label={title}
        />

        <div
          className={cn(
            "pointer-events-none absolute z-10 rounded-md bg-ink/45 px-3 py-1.5 text-xs font-medium tracking-wide text-surface/90 backdrop-blur-sm transition-all duration-1000",
            POSITIONS[positionIndex],
          )}
        >
          Licensed to: {watermark}
        </div>
      </div>

      <div className="observed-card layout-stack-md p-4 md:p-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border-strong px-4 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
            aria-label={playing ? "Pause" : watchLabel}
          >
            {playing ? "Pause" : watchLabel}
          </button>

          <label className="flex flex-1 items-center gap-2 type-caption text-ink-subtle">
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                if (videoRef.current) videoRef.current.volume = next;
              }}
              className="w-full"
            />
          </label>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border-strong px-4 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Fullscreen
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={(event) => {
            const video = videoRef.current;
            if (!video || !duration) return;
            const next = (Number(event.target.value) / 100) * duration;
            video.currentTime = next;
            setCurrentTime(next);
          }}
          className="w-full"
          aria-label="Seek"
        />

        <p className="type-caption text-ink-subtle">{licenseNotice}</p>
      </div>
    </div>
  );
}
