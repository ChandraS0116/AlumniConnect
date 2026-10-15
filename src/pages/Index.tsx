import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-campus.jpg";
import alumniImg from "@/assets/alumni-group.jpg";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlumniCard } from "@/components/dashboard/AlumniCard";
import { VideoCard } from "@/components/dashboard/VideoCard";
import { alumniData, videosData, doubtsData, stats as defaultStats, Alumni, MentorVideo, Doubt } from "@/data/mockData";
import { Users, GraduationCap, Video, Globe, Building2, MessageCircle, ArrowRight, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { getStats, getAlumni, getVideos, getDoubts } from "@/lib/api";

import { DoubtDiscussionModal } from "@/components/dashboard/DoubtDiscussionModal";

const Index = () => {
  const [stats, setStats] = useState(defaultStats);
  const [featuredAlumni, setFeaturedAlumni] = useState<Alumni[]>(alumniData.slice(0, 6));
  const [mentorVideos, setMentorVideos] = useState<MentorVideo[]>(videosData.slice(0, 4));
  const [doubts, setDoubts] = useState<Doubt[]>(doubtsData);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [doubtOpen, setDoubtOpen] = useState(false);

  useEffect(() => {
    async function loadLiveData() {
      const [s, a, v, d] = await Promise.all([getStats(), getAlumni(), getVideos(), getDoubts()]);
      if (s) setStats(s);
      if (a && a.length > 0) setFeaturedAlumni(a.slice(0, 6));
      if (v && v.length > 0) setMentorVideos(v.slice(0, 4));
      if (d && d.length > 0) setDoubts(d);
    }
    loadLiveData();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="University campus at golden hour" className="w-full h-full object-cover" width={1600} height={900} />
          <div className="absolute inset-0 bg-hero-gradient opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl animate-fade-up">
            <Badge className="bg-accent-soft text-accent-foreground border-0 mb-6 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Andhra University · Est. 1926 · 12,000+ alumni worldwide
            </Badge>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-primary-foreground leading-[1.05]">
              Where wisdom meets <span className="text-gold italic">ambition</span>.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mt-6 max-w-2xl leading-relaxed">
              The official Andhra University alumni network — search graduates by department & company, follow mentor lessons, and post your story. One dashboard for the entire AU family.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button variant="hero" size="lg" asChild>
                <Link to="/alumni">Explore the Network <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outlineGold" size="lg" asChild>
                <Link to="/mentors">Watch Mentor Sessions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container -mt-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={Users} label="Alumni" value={stats.alumni} accent />
          <StatCard icon={GraduationCap} label="Students" value={stats.students} />
          <StatCard icon={Video} label="Mentors" value={stats.mentors} />
          <StatCard icon={Video} label="Lessons" value={stats.videos} />
          <StatCard icon={Globe} label="Countries" value={stats.countries} />
          <StatCard icon={Building2} label="Companies" value={stats.companies} />
        </div>
      </section>

      {/* ALUMNI SPOTLIGHT */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Spotlight</div>
            <h2 className="font-serif text-4xl font-bold text-primary mt-2">Featured Alumni</h2>
            <p className="text-muted-foreground mt-2 max-w-xl">Hand-picked stories from graduates making waves across industries.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/alumni">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAlumni.map((a) => <AlumniCard key={a.id} a={a} />)}
        </div>
      </section>

      {/* MENTOR + DOUBTS SPLIT */}
      <section className="container py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Alumni Knowledge Vault</div>
              <h2 className="font-serif text-3xl font-bold text-primary mt-2">Mentor-Referred Masterclasses</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Hand-picked YouTube masterclasses paired with practitioner takeaways from practicing AU alumni.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/mentors">Explore 250+ videos & roadmaps <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {mentorVideos.map((v) => <VideoCard key={v.id} v={v} />)}
          </div>
        </div>

        <aside>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Live</div>
              <h2 className="font-serif text-3xl font-bold text-primary mt-2">Doubt Board</h2>
            </div>
          </div>
          <Card className="p-2 bg-card border-border/60 shadow-soft">
            {doubts.map((d, i) => (
              <div
                key={d.id}
                onClick={() => {
                  setSelectedDoubt(d);
                  setDoubtOpen(true);
                }}
                className={`p-4 ${i !== doubts.length - 1 ? "border-b border-border/60" : ""} hover:bg-secondary/40 rounded transition-smooth cursor-pointer`}
              >
                <div className="flex gap-3">
                  <img src={d.studentAvatar} alt={d.student} className="h-9 w-9 rounded-full bg-secondary shrink-0 ring-1 ring-accent/20" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{d.student}</span>
                      <span>•</span>
                      <span>{d.postedAgo}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-snug">{d.question}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{d.topic}</Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />{d.replies} replies
                      </span>
                      <span className={`text-[11px] flex items-center gap-1 font-medium ${d.status === "answered" ? "text-accent" : "text-muted-foreground"}`}>
                        {d.status === "answered" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {d.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </aside>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="relative overflow-hidden bg-primary text-primary-foreground border-0 shadow-elegant">
          <img src={alumniImg} alt="Alumni networking" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-25" width={1200} height={800}/>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/40" />
          <div className="relative p-10 md:p-16 max-w-2xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
              Your story belongs <span className="text-gold italic">here</span>.
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg">
              Add your LinkedIn, GitHub, and bio in minutes. Be discovered by the next batch — be the mentor someone needed.
            </p>
            <div className="flex gap-3 mt-8">
              <Button variant="hero" size="lg" asChild>
                <Link to="/alumni">Create your profile</Link>
              </Button>
              <Button variant="outlineGold" size="lg" asChild>
                <Link to="/mentors">Take a tour</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <DoubtDiscussionModal
        doubt={selectedDoubt}
        open={doubtOpen}
        onOpenChange={setDoubtOpen}
        onReplyAdded={async () => {
          const list = await getDoubts();
          if (list) setDoubts(list);
        }}
      />
    </>
  );
};

export default Index;
