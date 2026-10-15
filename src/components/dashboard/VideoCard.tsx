import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Play, Eye, Clock, ExternalLink, Bookmark, BookmarkCheck, Youtube, Quote, UserCheck, MessageCircle } from "lucide-react";
import type { MentorVideo } from "@/data/mockData";
import { extractYouTubeId } from "@/lib/youtube";
import { toast } from "sonner";
import { recordVideoView } from "@/lib/api";

export const VideoCard = ({
  v,
  isBookmarked: propIsBookmarked,
  onBookmarkToggle,
  onAskMentorQuestion,
}: {
  v: MentorVideo;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string, saved: boolean) => void;
  onAskMentorQuestion?: (mentorName: string, videoTitle: string, topic: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState<boolean>(() => {
    if (propIsBookmarked !== undefined) return propIsBookmarked;
    try {
      const stored = localStorage.getItem("alma_bookmarked_videos");
      if (stored) {
        const arr = JSON.parse(stored);
        return Array.isArray(arr) && arr.includes(v.id);
      }
    } catch {
      // ignore
    }
    return false;
  });

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      const stored = localStorage.getItem("alma_bookmarked_videos");
      let arr: string[] = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(arr)) arr = [];
      if (nextSaved) {
        if (!arr.includes(v.id)) arr.push(v.id);
        toast.success(`Bookmarked: ${v.title}`);
      } else {
        arr = arr.filter((id) => id !== v.id);
        toast.info(`Removed from bookmarks`);
      }
      localStorage.setItem("alma_bookmarked_videos", JSON.stringify(arr));
      if (onBookmarkToggle) onBookmarkToggle(v.id, nextSaved);
    } catch {
      // ignore
    }
  };

  const youtubeId = extractYouTubeId(v.youtubeId || v.youtubeUrl);

  const handleOpen = () => {
    setIsOpen(true);
    recordVideoView(v.id);
  };

  return (
    <>
      <Card
        onClick={handleOpen}
        className="overflow-hidden bg-card border border-border/70 hover:border-accent/40 hover:shadow-elegant hover:-translate-y-1 transition-smooth group cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring flex flex-col justify-between"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label={`Play lesson: ${v.title} referred by ${v.mentor}`}
      >
        <div>
          {/* Thumbnail Container */}
          <div className="relative aspect-video overflow-hidden bg-secondary">
            <img
              src={v.thumbnail || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "")}
              alt={v.title}
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (youtubeId && !target.src.includes("mqdefault.jpg")) {
                  target.src = `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
                }
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/20 to-transparent opacity-65 group-hover:opacity-85 transition-smooth" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold scale-90 group-hover:scale-100 transition-smooth">
                <Play className="h-6 w-6 text-primary fill-primary ml-1" />
              </div>
            </div>

            {/* Topic Badge Top-Left */}
            <Badge className="absolute top-3 left-3 bg-gold-gradient text-primary border-0 font-semibold text-xs shadow-soft">
              {v.topic}
            </Badge>

            {/* Channel Badge Bottom-Left */}
            <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white/95 text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1.5 ring-1 ring-white/10">
              <Youtube className="h-3 w-3 text-red-500 fill-red-500 shrink-0" />
              <span className="truncate max-w-[150px]">{v.channelName || "YouTube"}</span>
            </div>

            {/* Duration Bottom-Right */}
            <div className="absolute bottom-3 right-3 bg-black/85 text-white text-xs font-mono px-2 py-0.5 rounded flex items-center gap-1 ring-1 ring-white/10">
              <Clock className="h-3 w-3" />
              {v.duration}
            </div>

            {/* Bookmark Top-Right */}
            <button
              onClick={toggleBookmark}
              type="button"
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-primary/80 backdrop-blur-md text-primary-foreground flex items-center justify-center hover:bg-primary transition-smooth ring-1 ring-white/10"
              aria-label={saved ? "Remove bookmark" : "Bookmark video"}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 text-gold fill-gold" />
              ) : (
                <Bookmark className="h-4 w-4 text-primary-foreground" />
              )}
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-5">
            <h3 className="font-serif text-base font-bold text-primary line-clamp-2 leading-snug min-h-[2.8em] group-hover:text-accent transition-smooth">
              {v.title}
            </h3>

            {/* AU Alumnus Referral Box */}
            <div className="mt-3.5 p-3 rounded-lg bg-secondary/50 border border-border/80 group-hover:border-accent/30 transition-smooth">
              <div className="flex items-center gap-2.5">
                <img
                  src={v.mentorAvatar}
                  alt={v.mentor}
                  className="h-8 w-8 rounded-full bg-card ring-1 ring-accent/30 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-primary truncate">{v.mentor}</span>
                    <span className="inline-flex items-center text-[10px] text-accent font-semibold px-1 rounded bg-accent/10 shrink-0">
                      <UserCheck className="h-2.5 w-2.5 mr-0.5" /> AU Referrer
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {v.mentorRole || "Andhra University Alumnus"}
                  </div>
                </div>
              </div>

              {/* Mentor's Note */}
              <div className="mt-2 pt-2 border-t border-border/60 flex items-start gap-1.5">
                <Quote className="h-3 w-3 text-gold shrink-0 mt-0.5 rotate-180" />
                <p className="text-[11px] text-foreground/80 italic leading-snug line-clamp-2">
                  "{v.mentorNote || "Vetted and recommended for Andhra University students."}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-4 sm:px-5 pb-4 pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 mt-1">
          <Badge variant="outline" className="text-[10px] font-normal border-border/70 text-muted-foreground">
            {v.recommendedFor || "All Batches"}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {v.views.toLocaleString()}
            </span>
            <span>•</span>
            <span>{v.postedAgo}</span>
          </div>
        </div>
      </Card>

      {/* Video Playback Modal with Full Mentor Takeaways */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-card border border-border/80 shadow-elegant sm:rounded-2xl gap-0">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-border/60 pr-12">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className="bg-gold-gradient text-primary border-0 font-semibold text-xs">
                {v.topic}
              </Badge>
              <Badge variant="secondary" className="text-[11px] flex items-center gap-1 font-mono">
                <Youtube className="h-3 w-3 text-red-500 fill-red-500" />
                {v.channelName || "YouTube"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" /> {v.duration}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" /> {v.views.toLocaleString()} views
              </span>
            </div>
            <DialogTitle className="font-serif text-xl md:text-2xl font-bold text-primary leading-snug">
              {v.title}
            </DialogTitle>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video w-full bg-black">
            {isOpen && youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title={v.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <Play className="h-12 w-12 mb-2 text-accent" />
                <p>Video source unavailable</p>
              </div>
            )}
          </div>

          {/* Details & Mentor Notes */}
          <div className="p-6 bg-card space-y-4">
            {/* AU Alumnus Endorsement Banner */}
            <div className="p-4 rounded-xl bg-secondary/60 border border-accent/20">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <img
                    src={v.mentorAvatar}
                    alt={v.mentor}
                    className="h-11 w-11 rounded-full bg-card ring-2 ring-accent/30 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-primary">{v.mentor}</span>
                      <Badge className="bg-accent/15 text-accent border-0 text-[10px] font-semibold">
                        AU Mentor Endorsement
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {v.mentorRole || "Andhra University Alumnus"}
                    </div>
                  </div>
                </div>

                {onAskMentorQuestion && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 h-8 border-accent/30 hover:bg-accent/10"
                    onClick={() => {
                      setIsOpen(false);
                      onAskMentorQuestion(v.mentor, v.title, v.topic);
                    }}
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-primary" />
                    Ask {v.mentor.split(" ")[0]} about this video
                  </Button>
                )}
              </div>

              {/* Mentor's Note Box */}
              <div className="mt-3 pt-3 border-t border-border/60">
                <div className="text-xs font-semibold text-primary/90 flex items-center gap-1.5 mb-1">
                  <Quote className="h-3.5 w-3.5 text-gold shrink-0 rotate-180" />
                  Mentor's Take & Study Advice for AU Students:
                </div>
                <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed pl-5 italic">
                  "{v.mentorNote || "I personally refer this masterclass to AU juniors because it cuts through unnecessary theory and demonstrates production techniques."}"
                </p>
              </div>
            </div>

            {/* Description & YouTube Action */}
            <div className="flex items-start justify-between gap-4 flex-wrap pt-2">
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed flex-1 min-w-[240px]">
                {v.description}
              </DialogDescription>
              {v.youtubeUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="text-xs gap-1.5 border-border hover:border-accent shrink-0"
                >
                  <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Watch on YouTube
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
