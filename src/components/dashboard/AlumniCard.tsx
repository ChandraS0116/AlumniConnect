import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Linkedin,
  MapPin,
  Mail,
  Award,
  Send,
  CheckCircle2,
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import type { Alumni } from "@/data/mockData";
import { requestMentorship } from "@/lib/api";
import { toast } from "sonner";

export const AlumniCard = ({
  a,
  onConnected,
}: {
  a: Alumni;
  onConnected?: (id: string) => void;
}) => {
  const [connectOpen, setConnectOpen] = useState(false);
  const [studentName, setStudentName] = useState(() => {
    try {
      const stored = localStorage.getItem("alma_user");
      if (stored) {
        const u = JSON.parse(stored);
        return u.name || "";
      }
    } catch (_e) {
      /* ignore */
    }
    return "";
  });
  const [studentEmail, setStudentEmail] = useState(() => {
    try {
      const stored = localStorage.getItem("alma_user");
      if (stored) {
        const u = JSON.parse(stored);
        return u.email || "";
      }
    } catch (_e) {
      /* ignore */
    }
    return "";
  });
  const [mentorshipTopic, setMentorshipTopic] = useState("Career Guidance & Industry Transition");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const [isConnected, setIsConnected] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("alma_connected_alumni_ids");
      if (stored) {
        const arr = JSON.parse(stored);
        return Array.isArray(arr) && arr.includes(a.id);
      }
    } catch (_e) {
      /* ignore */
    }
    return false;
  });

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim()) {
      toast.error("Please enter your name and student email");
      return;
    }

    setSending(true);
    const fullNote = `[Topic: ${mentorshipTopic}] ${note.trim() || "Seeking career advice and mentorship from an Andhra University senior."}`;

    const res = await requestMentorship(a.id, {
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      note: fullNote,
    });

    setSending(false);
    if (res.success) {
      setIsConnected(true);
      try {
        const stored = localStorage.getItem("alma_connected_alumni_ids");
        const arr: string[] = stored ? JSON.parse(stored) : [];
        if (!arr.includes(a.id)) arr.push(a.id);
        localStorage.setItem("alma_connected_alumni_ids", JSON.stringify(arr));
      } catch (_e) {
        /* ignore */
      }

      toast.success(`Mentorship request delivered to ${a.name}! Saved in your connections.`);
      if (onConnected) onConnected(a.id);
      setConnectOpen(false);
    } else {
      toast.error(res.message || "Failed to deliver request");
    }
  };

  const copyOutreachTemplate = () => {
    const template = `Dear ${a.name},\n\nI am currently a student at Andhra University studying ${a.skills[0] || "my degree"}. I came across your inspiring journey as ${a.role} at ${a.company} through the Alma.Net network.\n\nI would be immensely grateful for 10-15 minutes of your guidance regarding career paths and industry expectations.\n\nWarm regards,\n${studentName || "[Your Name]"}\nAndhra University`;
    navigator.clipboard.writeText(template);
    toast.success("Outreach message copied to clipboard! You can paste it into LinkedIn or Email.");
  };

  const linkedinUrl =
    a.linkedin && a.linkedin !== "#" && a.linkedin.includes("http")
      ? a.linkedin
      : `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(
          `${a.name} ${a.company} Andhra University`
        )}`;

  const mailSubject = encodeURIComponent(`AU Alumni Mentorship Connect — Request from AU Student`);
  const mailBody = encodeURIComponent(
    `Dear ${a.name},\n\nI am an Andhra University student. I found your profile on Alma.Net and admire your work as ${a.role} at ${a.company}.\n\nI would love to connect for brief mentorship regarding ${a.skills[0] || "career guidance"}.\n\nBest regards,\n${studentName || "AU Student"}\n${studentEmail || ""}`
  );
  const mailUrl = a.email
    ? `mailto:${a.email}?subject=${mailSubject}&body=${mailBody}`
    : `mailto:alumni@andhrauniv.edu.in?subject=${mailSubject}&body=${mailBody}`;

  return (
    <>
      <Card className="p-6 bg-card-gradient border border-border/70 hover:border-accent/40 hover:shadow-elegant hover:-translate-y-1 transition-smooth group relative overflow-hidden flex flex-col justify-between">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold-gradient opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-smooth" />

        <div>
          {/* Header with Avatar and Batch */}
          <div className="flex items-start gap-4 relative">
            <div className="relative shrink-0">
              <img
                src={a.avatar}
                alt={a.name}
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes("dicebear")) {
                    target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
                      a.name
                    )}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;
                  }
                }}
                className="h-16 w-16 rounded-full bg-secondary ring-2 ring-accent/30 object-cover shadow-soft"
              />
              <div
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gold-gradient flex items-center justify-center text-[10px] font-bold text-primary border-2 border-card"
                title={`AU Batch ${a.batch}`}
              >
                {String(a.batch).slice(2)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-serif text-lg font-bold text-primary leading-tight group-hover:text-accent transition-smooth truncate">
                  {a.name}
                </h3>
              </div>
              <div className="text-xs text-foreground/85 font-medium mt-0.5 line-clamp-1">
                {a.role}
              </div>
              <div className="text-xs text-accent font-semibold truncate mt-0.5">
                {a.company}
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-xs text-muted-foreground mt-3.5 line-clamp-2 leading-relaxed">
            {a.bio}
          </p>

          {/* Location & Degree */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-3 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-accent" />
              {a.location}
            </span>
            <span>•</span>
            <span className="truncate max-w-[200px]" title={a.degree}>
              {a.degree}
            </span>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {a.skills.slice(0, 3).map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="bg-accent/10 text-primary border-0 text-[10px] font-medium"
              >
                {s}
              </Badge>
            ))}
          </div>

          {/* Achievements */}
          {a.achievements && a.achievements.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-accent">
              <Award className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span className="font-medium truncate">{a.achievements[0]}</span>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/60">
          <Button
            size="sm"
            variant={isConnected ? "outline" : "hero"}
            className={`flex-1 text-xs h-9 font-semibold ${
              isConnected ? "border-green-600/40 text-green-700 bg-green-500/5 hover:bg-green-500/10" : ""
            }`}
            onClick={() => setConnectOpen(true)}
          >
            {isConnected ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-green-600" /> Connected
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1" /> Connect
              </>
            )}
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 border-border hover:border-accent hover:bg-accent/15 hover:text-primary transition-smooth"
            title={`Find ${a.name} on LinkedIn`}
            asChild
          >
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-4 w-4 text-primary" />
            </a>
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 shrink-0 border-border hover:border-accent hover:bg-accent/15 hover:text-primary transition-smooth"
            title={`Send Email to ${a.name}`}
            asChild
          >
            <a href={mailUrl}>
              <Mail className="h-4 w-4 text-primary" />
            </a>
          </Button>
        </div>
      </Card>

      {/* Interactive Connect Modal */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <img
                src={a.avatar}
                alt={a.name}
                className="h-12 w-12 rounded-full bg-secondary ring-2 ring-accent/30 object-cover"
              />
              <div>
                <DialogTitle className="font-serif text-2xl text-primary leading-tight">
                  Connect with {a.name}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {a.role} at <span className="font-semibold text-accent">{a.company}</span> • AU '{a.batch}
                </p>
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-2">
              Send an official mentorship request, email directly, or reach out on LinkedIn.
            </DialogDescription>
          </DialogHeader>

          {isConnected ? (
            <div className="py-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-primary">
                Mentorship Request Already Active
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                You have already requested a connection with {a.name}. While you await their response, you can also reach out via LinkedIn or send a direct follow-up email.
              </p>

              <div className="flex justify-center gap-2 pt-2 flex-wrap">
                <Button variant="outline" size="sm" asChild className="text-xs gap-1.5">
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-3.5 w-3.5 text-blue-600" /> Open LinkedIn
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs gap-1.5">
                  <a href={mailUrl}>
                    <Mail className="h-3.5 w-3.5" /> Send Direct Email
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={copyOutreachTemplate} className="text-xs gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Copy Message Template
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-4 py-2">
              {/* Mentorship Focus */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" /> Mentorship Goal / Focus *
                </label>
                <select
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={mentorshipTopic}
                  onChange={(e) => setMentorshipTopic(e.target.value)}
                >
                  <option value="Career Guidance & Industry Transition">Career Guidance & Industry Transition</option>
                  <option value="Resume & Portfolio Review">Resume & Portfolio Review</option>
                  <option value="Technical Interview & System Design Prep">Technical Interview & System Design Prep</option>
                  <option value="Higher Studies & Research Guidance">Higher Studies (MS/PhD/UPSC/GATE) Guidance</option>
                  <option value="Startup & Product Strategy Advice">Startup & Product Strategy Advice</option>
                </select>
              </div>

              {/* Student Name & Email */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Name *
                  </label>
                  <Input
                    placeholder="e.g. Arjun Rao"
                    className="mt-1.5 text-xs"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Student Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="arjun@andhrauniv.edu.in"
                    className="mt-1.5 text-xs"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Personal Note */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Personal Note / Questions
                </label>
                <Textarea
                  placeholder={`Dear ${a.name}, I am an AU student inspired by your work at ${a.company}. I would love 15 minutes of guidance on ${a.skills[0] || "my career"}...`}
                  rows={3}
                  className="mt-1.5 text-xs sm:text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Fast Outreach Utilities */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                <span>Also available on:</span>
                <div className="flex items-center gap-2">
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn Profile
                  </a>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={copyOutreachTemplate}
                    className="text-xs text-foreground/80 hover:text-accent flex items-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Template
                  </button>
                </div>
              </div>

              <DialogFooter className="mt-4 pt-2">
                <Button variant="hero" type="submit" disabled={sending} className="w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-1.5" /> {sending ? "Delivering Request..." : "Send Mentorship Request"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
