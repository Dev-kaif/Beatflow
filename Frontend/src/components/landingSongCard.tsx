// components/landing/SongCard.tsx

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import type { Song } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { scaleIn } from "./LandingPage";

type SongWithRelations = Song & {
  thumbnailUrl: string | null;
};

interface SongCardProps {
  song: SongWithRelations;
  index: number;
  activeSong: string | null;
  isPlaying: boolean | null;
  isLoading: string | null;
  duration: number;
  currentTime: number;
  handlePlay: (id: string) => void;
  handlePause: () => void;
}

export function SongCard({
  song,
  index,
  activeSong,
  isPlaying,
  isLoading,
  duration,
  currentTime,
  handlePlay,
  handlePause,
}: SongCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTextLong =
    (song.describedLyrics ?? song.fullDescribedSong ?? "").length > 100;

  const TimeDisplay = () => (
    <div className="mt-4">
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-2 transition-all duration-200"
          style={{
            width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
          }}
        />
      </div>
      <div className="text-muted-foreground mt-2 flex justify-between text-xs">
        <span>
          {Math.floor(currentTime / 60)}:
          {String(Math.floor(currentTime % 60)).padStart(2, "0")}
        </span>
        <span>
          {Math.floor(duration / 60)}:
          {String(Math.floor(duration % 60)).padStart(2, "0")}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      key={song.id}
      className="mx-auto mt-12 max-w-3xl sm:mt-20"
      variants={scaleIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          {/* MOBILE LAYOUT */}
          <div className="md:hidden">
            {/* ✅ THIS IS THE KEY CHANGE: Alignment switches when expanded */}
            <div
              className={`flex justify-between gap-3 ${isExpanded ? "items-start" : "items-center"}`}
            >
              <div className="flex min-w-0 items-start gap-3">
                {song.thumbnailUrl && (
                  <Image
                    unoptimized
                    height={100}
                    width={100}
                    src={song.thumbnailUrl}
                    alt={song.title ?? "Song thumbnail"}
                    className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{song.title}</h3>
                  <p
                    className={`text-muted-foreground text-sm ${!isExpanded && "truncate"}`}
                  >
                    {song.describedLyrics ?? song.fullDescribedSong}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                onClick={() =>
                  activeSong === song.id && isPlaying
                    ? handlePause()
                    : handlePlay(song.id)
                }
                className="h-12 w-12 flex-shrink-0"
                disabled={isLoading === song.id}
              >
                {isLoading === song.id ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : activeSong === song.id && isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </Button>
            </div>
            {isTextLong && (
              <Button
                variant="link"
                className="mt-1 h-auto p-0 text-sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Show more"}
              </Button>
            )}
            {activeSong === song.id && <TimeDisplay />}
          </div>

          {/* DESKTOP LAYOUT */}
          <div className="hidden md:grid md:grid-cols-12 md:items-start md:gap-6">
            <div className="md:col-span-3">
              {song.thumbnailUrl && (
                <Image
                  unoptimized
                  height={200}
                  width={200}
                  src={song.thumbnailUrl}
                  alt={song.title ?? "Song thumbnail"}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              )}
            </div>
            <div className="flex flex-col self-stretch md:col-span-8">
              <div className="flex-grow text-left">
                <h3 className="text-xl font-semibold">{song.title}</h3>
                <p
                  className={`text-muted-foreground mt-2 text-sm ${!isExpanded && "line-clamp-3"}`}
                >
                  {song.describedLyrics ?? song.fullDescribedSong}
                </p>
                {isTextLong && (
                  <Button
                    variant="link"
                    className="mt-1 h-auto p-0 text-sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </Button>
                )}
              </div>
              {activeSong === song.id && <TimeDisplay />}
            </div>
            <div className="flex justify-end md:col-span-1">
              <Button
                size="icon"
                onClick={() =>
                  activeSong === song.id && isPlaying
                    ? handlePause()
                    : handlePlay(song.id)
                }
                className="h-14 w-14"
                disabled={isLoading === song.id}
              >
                {isLoading === song.id ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : activeSong === song.id && isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
