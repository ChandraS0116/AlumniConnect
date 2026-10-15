import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Doubt } from "@/data/mockData";
import { CheckCircle2, Clock, MessageCircle, Send, UserCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface DoubtReply {
  id: string;
  author: string;
  author_role?: string;
  author_avatar?: string;
  message: string;
  created_at: string;
}

interface DoubtDiscussionModalProps {
  doubt: Doubt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplyAdded?: (doubtId: string) => void;
}

export const DoubtDiscussionModal = ({ doubt, open, onOpenChange, onReplyAdded }: DoubtDiscussionModalProps) => {
  const { user, isAuthenticated } = useAuth();
  const [replies, setReplies] = useState<DoubtReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReplies = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doubts/${id}/replies`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setReplies(data.data);
      }
    } catch (e) {
      console.warn("Failed to fetch replies:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doubt && open) {
      fetchReplies(doubt.id);
    }
  }, [doubt, open]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubt || !replyText.trim()) return;

    setSubmitting(true);
    try {
      const authorName = user?.name || "AU Alumni Mentor";
      const authorRole = user?.role === "alumni" ? "AU Alumnus" : user?.role === "admin" ? "AU Faculty Dean" : "AU Senior Student";

      const res = await fetch(`/api/doubts/${doubt.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: authorName,
          authorRole,
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Answer posted to discussion thread!");
        setReplyText("");
        fetchReplies(doubt.id);
        onReplyAdded?.(doubt.id);
      } else {
        toast.error(data.message || "Failed to post answer");
      }
    } catch {
      toast.error("Network error posting reply");
    } finally {
      setSubmitting(false);
    }
  };

  if (!doubt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-card border border-border/80 shadow-elegant sm:rounded-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border/60 bg-secondary/30">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-gold-gradient text-primary border-0 font-semibold text-xs">
              {doubt.topic}
            </Badge>
            <span className={`text-xs flex items-center gap-1 font-medium ${doubt.status === "answered" ? "text-accent" : "text-muted-foreground"}`}>
              {doubt.status === "answered" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
              {doubt.status === "answered" ? "Answered" : "Open Doubt"}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {replies.length} answers
            </span>
          </div>

          <DialogTitle className="font-serif text-xl md:text-2xl font-bold text-primary leading-snug">
            {doubt.question}
          </DialogTitle>

          <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-border/40">
            <img src={doubt.studentAvatar} alt={doubt.student} className="h-8 w-8 rounded-full bg-secondary ring-1 ring-accent/30" />
            <div className="text-xs">
              <span className="font-semibold text-foreground">{doubt.student}</span>
              <span className="text-muted-foreground ml-1.5">• Asked {doubt.postedAgo}</span>
            </div>
          </div>
        </div>

        {/* Replies List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Mentor & Alumni Guidance ({replies.length})</span>
            <Sparkles className="h-3.5 w-3.5 text-accent" />
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading discussion answers...</div>
          ) : replies.length === 0 ? (
            <div className="py-8 text-center bg-secondary/30 rounded-xl border border-dashed border-border p-6">
              <p className="text-sm font-medium text-foreground">No answers posted yet</p>
              <p className="text-xs text-muted-foreground mt-1">Be the first alumnus or peer to share guidance on this doubt.</p>
            </div>
          ) : (
            replies.map((r, i) => (
              <div key={r.id || i} className="p-4 rounded-xl bg-secondary/40 border border-border/60 transition-smooth">
                <div className="flex items-start gap-3">
                  <img
                    src={r.author_avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${r.author}`}
                    alt={r.author}
                    className="h-9 w-9 rounded-full bg-secondary ring-1 ring-accent/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{r.author}</span>
                      {r.author_role && (
                        <Badge variant="outline" className="text-[10px] py-0 border-accent/40 text-accent font-medium">
                          <UserCheck className="h-3 w-3 mr-1" /> {r.author_role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-foreground/85 mt-2 leading-relaxed">{r.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Answer input */}
        <div className="p-4 bg-card border-t border-border/60">
          <form onSubmit={handleSubmitReply} className="space-y-2.5">
            <Textarea
              placeholder={isAuthenticated ? `Write your guidance as ${user?.name}...` : "Write your guidance for this student..."}
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="resize-none text-sm bg-background"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                AU verified answers help build junior careers
              </span>
              <Button size="sm" variant="hero" type="submit" disabled={submitting || !replyText.trim()}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> {submitting ? "Posting..." : "Post Guidance"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
