"use client";

import { useState, useMemo } from "react";
import { SongCard } from "@/components/SongCard";
import type { Category, Song } from "@prisma/client";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";

type SongWithRelation = Song & {
  user: { name: string | null };
  _count: {
    likes: number;
  };
  categories: Category[];
  thumbnailUrl?: string | null;
};

//  7066036640
interface MusicPageProps {
  userId: string;
  songs: SongWithRelation[];
}

export default function NavWithSearch({ userId, songs }: MusicPageProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const searchResults = useMemo(() => {
    if (!debouncedSearch) return [];

    const query = debouncedSearch.toLowerCase();

    return songs.filter((song) => {
      const titleMatch = song.title.toLowerCase().includes(query);
      const categoryMatch = song.categories.some((c) =>
        c.name.toLowerCase().includes(query),
      );
      const userNameMatch = song.user.name!.toLowerCase().includes(query);

      return titleMatch || categoryMatch || userNameMatch;
    });
  }, [debouncedSearch, songs]);

  return (
    <div className="py-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Discover Music</h1>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-input bg-background placeholder:text-muted-foreground h-9 w-56 rounded-md border pr-3 pl-8 text-sm focus:border-black focus:outline-none"
          />
        </div>
      </div>

      {debouncedSearch && search && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {searchResults.map((song) => (
                <SongCard key={song.id} userId={userId} song={song} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2 text-sm">
              No songs found matching “{debouncedSearch}”
            </p>
          )}
        </div>
      )}
    </div>
  );
}
