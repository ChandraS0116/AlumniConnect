import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { studentsData, Student } from "@/data/mockData";
import { Github, Linkedin, Search, Plus, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getStudents, createStudent } from "@/lib/api";
import { toast } from "sonner";

const Students = () => {
  const [q, setQ] = useState("");
  const [students, setStudents] = useState<Student[]>(studentsData);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("Final Year");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    const list = await getStudents(q);
    setStudents(list);
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !major.trim()) {
      toast.error("Please enter your name and major");
      return;
    }

    setSubmitting(true);
    const res = await createStudent({
      name: name.trim(),
      major: major.trim(),
      year: year.trim() || "Final Year",
      linkedin: linkedin.trim(),
      github: github.trim(),
      bio: bio.trim() || "Andhra University student eager to learn and connect.",
      skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : ["Engineering"],
      lookingFor: lookingFor.trim() || "SDE Internship",
    });

    setSubmitting(false);

    if (res.success) {
      toast.success("Profile published successfully! Visible to alumni network.");
      setDialogOpen(false);
      setName("");
      setMajor("");
      setLinkedin("");
      setGithub("");
      setBio("");
      setSkills("");
      setLookingFor("");
      loadStudents();
    } else {
      toast.error(res.message || "Failed to publish profile");
    }
  };

  return (
    <div className="container py-12">
      <div className="flex items-end justify-between flex-wrap gap-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Current Students</div>
          <h1 className="font-serif text-5xl font-bold text-primary mt-2">Student Profiles</h1>
          <p className="text-muted-foreground mt-3 text-lg">Showcase your work — link your LinkedIn & GitHub, share what you're building.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg"><Plus className="h-4 w-4" /> Post Your Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Create your student profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full name *</label>
                  <Input placeholder="Your name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Major *</label>
                    <Input placeholder="Computer Science" className="mt-1.5" value={major} onChange={(e) => setMajor(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</label>
                    <Input placeholder="Final Year" className="mt-1.5" value={year} onChange={(e) => setYear(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn URL
                  </label>
                  <Input placeholder="https://linkedin.com/in/..." className="mt-1.5" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5" /> GitHub URL
                  </label>
                  <Input placeholder="https://github.com/..." className="mt-1.5" value={github} onChange={(e) => setGithub(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills (comma-separated)</label>
                  <Input placeholder="React, Node, Python, System Design" className="mt-1.5" value={skills} onChange={(e) => setSkills(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Looking for</label>
                  <Input placeholder="SDE Internship, Hardware mentor..." className="mt-1.5" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Short bio</label>
                  <Textarea placeholder="What are you building? What excites you?" rows={3} className="mt-1.5" value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="hero" type="submit" disabled={submitting}>
                  <Sparkles className="h-4 w-4" /> {submitting ? "Publishing..." : "Publish profile"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-10 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students by skill, major..." className="pl-10 h-11" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {students.map((s) => (
          <Card key={s.id} className="p-6 bg-card-gradient border-border/60 hover:shadow-elegant hover:-translate-y-1 transition-smooth group">
            <div className="flex items-start gap-4">
              <img src={s.avatar} alt={s.name} className="h-14 w-14 rounded-full bg-secondary ring-2 ring-accent/30" />
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold text-primary leading-tight">{s.name}</h3>
                <div className="text-sm text-muted-foreground">{s.year} • {s.major}</div>
              </div>
            </div>
            <p className="text-sm text-foreground/80 mt-4 leading-relaxed">{s.bio}</p>

            <div className="mt-4 p-3 rounded-lg bg-accent-soft/50 border border-accent/20">
              <div className="text-[10px] uppercase tracking-wider text-accent font-bold">Looking for</div>
              <div className="text-sm font-medium text-primary mt-0.5">{s.lookingFor}</div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4">
              {s.skills.map((sk) => (
                <Badge key={sk} variant="secondary" className="bg-secondary text-secondary-foreground border-0 text-xs">{sk}</Badge>
              ))}
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-border/60">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={s.linkedin && s.linkedin !== "#" ? s.linkedin : `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(s.name)}`} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-1.5" /> LinkedIn
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={s.github && s.github !== "#" ? s.github : `https://github.com/search?q=${encodeURIComponent(s.name)}`} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-1.5" /> GitHub
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Students;
