"use client";

import {
  Download,
  Loader2,
  Music,
  Pause,
  Play,
  Volume2,
  X,
} from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { Slider } from "./ui/slider";
import Image from "next/image";

export default function SoundBar() {
  const { track, setTrack } = usePlayerStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false); // State to toggle volume slider
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null); // Ref for the volume control container

  // Effect to close volume slider on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        volumeRef.current &&
        !volumeRef.current.contains(event.target as Node)
      ) {
        setIsVolumeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration)) setDuration(audio.duration);
    };
    const handleTrackEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleTrackEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleTrackEnd);
    };
  }, [track]);

  useEffect(() => {
    if (audioRef.current && track?.url) {
      setCurrentTime(0);
      setDuration(0);
      audioRef.current.src = track.url;
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Playback failed: ", error);
            setIsPlaying(false);
          });
      }
    }
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0]! / 100;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!track?.url || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && value[0] !== undefined) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (!track) return null;

  const downloadSong = async (trackId: string) => {
    try {
      setIsDownloading(true);
      const res = await fetch(`/api/download/${trackId}`);
      if (!res.ok) throw new Error("Failed to download track");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${trackId}.mp3`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="px-4 pb-2">
      <Card className="bg-background/60 relative w-full shrink-0 border-t py-0 backdrop-blur">
        <div className="space-y-2 p-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Left Section */}
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                {track?.artwork ? (
                  <Image
                    alt={track.title!}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-full w-full rounded-md object-cover"
                    src={track.artwork}
                  />
                ) : (
                  <Music className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex flex-col space-y-1 overflow-hidden">
                <p
                  className="w-full truncate text-sm font-medium"
                  title={track.title!}
                >
                  {track?.title}
                </p>
                {track.instrumental && (
                  <p className="text-muted-foreground truncate text-[11px]">
                    Instrumental
                  </p>
                )}
                <p
                  className="text-muted-foreground w-full truncate text-xs"
                  title={track.createdByUserName!}
                >
                  {track?.createdByUserName}
                </p>
              </div>
            </div>

            {/* Centered controls */}
            <div className="flex justify-center">
              <Button
                className="cursor-pointer bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:text-white"
                variant="ghost"
                size="icon"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end gap-1 sm:gap-3">
              {/* ---- MODIFIED VERTICAL VOLUME CONTROL START ---- */}
              <div ref={volumeRef} className="relative flex items-center">
                {isVolumeOpen && (
                  <div className="bg-background/80 absolute bottom-full left-1/2 mb-4 -translate-x-1/2 rounded-lg p-2.5 shadow-lg backdrop-blur-md">
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      orientation="vertical"
                      className="h-24"
                    />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVolumeOpen((prev) => !prev)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              {/* ---- MODIFIED VERTICAL VOLUME CONTROL END ---- */}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => downloadSong(track.id)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-current" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTrack(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Full width progress bar for song */}
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground w-8 text-right text-[10px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              className="flex-1"
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
            />
            <span className="text-muted-foreground w-8 text-right text-[10px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {track?.url && (
          <audio ref={audioRef} src={track.url} preload="metadata" />
        )}
      </Card>
    </div>
  );
}
