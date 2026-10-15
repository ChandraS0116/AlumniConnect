import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlumniCard } from "@/components/dashboard/AlumniCard";
import { alumniData, industries, batches, Alumni as AlumniType } from "@/data/mockData";
import { Search, SlidersHorizontal, UserPlus, UserCheck, Users } from "lucide-react";
import { getAlumni } from "@/lib/api";
import { MentorOnboardingModal } from "@/components/auth/MentorOnboardingModal";

const Alumni = () => {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("All");
  const [batch, setBatch] = useState("All");
  const [onlyConnected, setOnlyConnected] = useState(false);
  const [connectedIds, setConnectedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("alma_connected_alumni_ids") || "[]");
    } catch {
      return [];
    }
  });
  const [alumniList, setAlumniList] = useState<AlumniType[]>(alumniData);
  const [mentorWizardOpen, setMentorWizardOpen] = useState(false);

  const fetchList = async () => {
    const list = await getAlumni({ q, industry, batch });
    setAlumniList(list);
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, industry, batch]);

  const handleConnected = (id: string) => {
    setConnectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const displayedList = onlyConnected
    ? alumniList.filter((a) => connectedIds.includes(a.id))
    : alumniList;

  return (
    <div className="container py-12">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Directory</div>
          <h1 className="font-serif text-5xl font-bold text-primary mt-2">Alumni Network</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Explore 200+ verified Andhra University graduates across industries, batches, and global institutions.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant={!onlyConnected ? "hero" : "outline"}
            size="sm"
            onClick={() => setOnlyConnected(false)}
            className="rounded-full shadow-soft"
          >
            <Users className="h-4 w-4 mr-1.5" />
            All Alumni ({alumniList.length})
          </Button>

          <Button
            variant={onlyConnected ? "hero" : "outline"}
            size="sm"
            onClick={() => setOnlyConnected(true)}
            className="rounded-full border-accent/40 shadow-soft"
          >
            <UserCheck className="h-4 w-4 mr-1.5 text-primary" />
            My Connections
            <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs font-bold bg-secondary/80 text-primary">
              {connectedIds.length}
            </Badge>
          </Button>

          <Button
            variant="hero"
            size="sm"
            onClick={() => setMentorWizardOpen(true)}
            className="rounded-full ml-1"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Add Profile
          </Button>
        </div>
      </div>


      {/* Search bar */}
      <div className="mt-10 bg-card-gradient border border-border/60 rounded-xl p-4 shadow-soft">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, company, role, skill..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 h-11 bg-background border-border"
            />
          </div>
          <Button variant="hero" size="lg" className="hidden sm:flex">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mr-1">Industry</span>
            {industries.map((i) => (
              <button key={i} onClick={() => setIndustry(i)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-smooth border ${
                  industry === i ? "bg-primary text-primary-foreground border-primary shadow-soft" : "bg-background border-border text-foreground/70 hover:border-accent"
                }`}>{i}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mr-1">Batch</span>
            {batches.map((b) => (
              <button key={b} onClick={() => setBatch(b)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-smooth border ${
                  batch === b ? "bg-accent text-accent-foreground border-accent shadow-gold" : "bg-background border-border text-foreground/70 hover:border-accent"
                }`}>{b}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 mb-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{displayedList.length}</span>{" "}
          {onlyConnected ? "connected" : ""} alumni
          {onlyConnected && (
            <span className="text-xs ml-2 text-muted-foreground">
              (out of {alumniList.length} total)
            </span>
          )}
        </p>
        {(industry !== "All" || batch !== "All" || q || onlyConnected) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("");
              setIndustry("All");
              setBatch("All");
              setOnlyConnected(false);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {displayedList.length === 0 ? (
        <div className="text-center py-20 bg-card-gradient border border-border/50 rounded-2xl p-8">
          <Badge variant="secondary" className="mb-4">
            {onlyConnected ? "No Connection Requests Yet" : "No matches"}
          </Badge>
          <p className="text-muted-foreground max-w-md mx-auto">
            {onlyConnected
              ? "You haven't sent any mentorship requests yet. Browse the alumni directory and click 'Connect' on any profile to send a formal request."
              : "Try widening your search terms or picking another industry/batch filter."}
          </p>
          {onlyConnected && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => setOnlyConnected(false)}
              className="mt-4"
            >
              Browse All {alumniList.length} Alumni
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map((a) => (
            <AlumniCard key={a.id} a={a} onConnected={handleConnected} />
          ))}
        </div>
      )}

      <MentorOnboardingModal
        open={mentorWizardOpen}
        onOpenChange={setMentorWizardOpen}
        onSuccess={fetchList}
      />
    </div>
  );
};

export default Alumni;

