import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Users, Clock, BookOpen, Layers } from "lucide-react";
import type { MentorPlaylist } from "@/data/mockData";

export const MentorPlaylistCard = ({
  playlist,
  onSelect,
}: {
  playlist: MentorPlaylist;
  onSelect: (playlist: MentorPlaylist) => void;
}) => {
  return (
    <Card
      onClick={() => onSelect(playlist)}
      className="overflow-hidden bg-card border border-border/70 hover:border-accent/40 hover:shadow-elegant hover:-translate-y-1 transition-smooth cursor-pointer group flex flex-col justify-between"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(playlist);
        }
      }}
    >
      <div>
        {/* Multi-Thumbnail Collage Header */}
        <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
          <div className="grid grid-cols-3 h-full gap-0.5">
            {playlist.thumbnails.slice(0, 3).map((thumb, idx) => (
              <div key={idx} className="relative h-full overflow-hidden">
                <img
                  src={thumb}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-700"
                />
                <div className="absolute inset-0 bg-primary/20" />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />

          {/* Floating Pill on top-left */}
          <Badge className="absolute top-3 left-3 bg-gold-gradient text-primary border-0 font-semibold text-xs shadow-soft flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {playlist.topic}
          </Badge>

          {/* Lesson Count badge on bottom-right */}
          <div className="absolute bottom-3 right-3 bg-black/85 text-white text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1 ring-1 ring-white/10">
            <BookOpen className="h-3 w-3 text-gold" />
            {playlist.videoCount} Lessons • {playlist.totalDuration}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3 className="font-serif text-lg font-bold text-primary group-hover:text-accent transition-smooth line-clamp-2 leading-snug">
            {playlist.title}
          </h3>

          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {playlist.whyCurated}
          </p>

          {/* Curating Alumnus */}
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2.5">
            <img
              src={playlist.mentorAvatar}
              alt={playlist.mentor}
              className="h-8 w-8 rounded-full bg-card ring-1 ring-accent/30 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-primary truncate">{playlist.mentor}</div>
              <div className="text-[10px] text-muted-foreground truncate">
                {playlist.mentorRole} ({playlist.mentorBatch})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-1 flex items-center justify-between text-xs border-t border-border/40 text-muted-foreground">
        <span className="flex items-center gap-1 text-[11px]">
          <Users className="h-3 w-3 text-accent" />
          {playlist.studentsFollowing} AU students following
        </span>
        <Button size="sm" variant="ghost" className="text-xs text-accent font-semibold p-0 h-auto hover:bg-transparent">
          Explore Track <Play className="h-3 w-3 ml-1 fill-accent" />
        </Button>
      </div>
    </Card>
  );
};
