import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { createAlumni, generateMentorProfileWithAi, MentorProfileGenerationResult } from "@/lib/api";
import {
  Sparkles,
  Bot,
  CheckCircle2,
  GraduationCap,
  Building,
  Briefcase,
  Layers,
  HelpCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
} from "lucide-react";

interface MentorOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    name?: string;
    email?: string;
    password?: string;
    batch?: string;
  };
}

const DOMAIN_SUBJECTS: Record<string, string[]> = {
  "Software Engineering & Architecture": [
    "Distributed Systems & Microservices",
    "System Design & High Concurrency",
    "Cloud & DevOps (AWS/GCP/Kubernetes)",
    "Data Structures & LeetCode Patterns",
    "Database Internals & Caching (Redis/Postgres)",
    "Backend Engineering (Go, Java Spring, Node)",
    "Frontend & Performance (React, Next.js)",
    "Low-Level Systems & Networking (C++, Rust)",
  ],
  "Artificial Intelligence & Data Science": [
    "Large Language Models (LLMs) & Fine-Tuning",
    "Deep Learning & PyTorch Implementations",
    "Computer Vision & Multi-Modal Models",
    "MLOps, Model Serving & Vector Databases",
    "Natural Language Processing (NLP)",
    "Data Engineering Pipelines (Kafka, Spark)",
    "Statistical Inference & Empirical Research",
  ],
  "Core Engineering (ECE, EEE, Mech, Civil, Marine, Chemical)": [
    "Embedded Systems, RTOS & Firmware",
    "VLSI Design & Digital IC Verification",
    "Robotics, Control Systems & Automation",
    "Thermodynamics, CAD/CAM & Automotive",
    "Structural Engineering & Urban Infrastructure",
    "Naval Architecture & Marine Engineering",
    "Chemical Process & Renewable Energy Systems",
    "Power Systems, EV & Smart Grids",
  ],
  "Acting, Theatre & Filmmaking": [
    "Method Acting, Voice & Character Preparation",
    "Stagecraft & Classical/Modern Theatre Direction",
    "Film Direction, Visual Storytelling & Blocking",
    "Cinematography, Lighting & Camera Movement",
    "Screenwriting, Dialogue & Script Doctoring",
    "Film Editing, Color Grading & Post-Production",
    "Sound Design & Production Management",
    "Audition Preparation & Casting Navigation",
  ],
  "Fine Arts, Music, Dance & Performing Arts": [
    "Painting, Portraiture & Visual Composition",
    "Sculpture, Printmaking & Mixed Media",
    "Art History, Curation & Gallery Exhibitions",
    "Carnatic & Hindustani Classical Vocal/Instrumental",
    "Contemporary Music Production & Film Scoring",
    "Classical Dance (Bharatanatyam, Kuchipudi) & Choreography",
    "Digital Illustration & Concept Art",
  ],
  "Literature, Journalism & Mass Communication": [
    "Investigative & Broadcast Journalism",
    "Creative Writing, Fiction & Poetry",
    "Documentary Storytelling & Media Production",
    "Public Relations, Corporate Comms & Brand Strategy",
    "Digital Media, Podcasting & Content Strategy",
    "Literary Criticism, Publishing & Editing",
  ],
  "Law, UPSC / Civil Services & Public Policy": [
    "UPSC CSE (IAS / IPS / IFS) Preparation Strategy",
    "Constitutional Law & Supreme/High Court Litigation",
    "Corporate Law, Mergers & Contract Drafting",
    "Intellectual Property (IP), Cyber & Tech Law",
    "Public Policy, Governance & Development Economics",
    "State PSC (APPSC Group-1) & Judicial Services",
    "International Relations & Diplomacy",
  ],
  "Medicine, Pharmacy, Biotechnology & Life Sciences": [
    "Pharmaceutical Formulation, R&D & Drug Discovery",
    "Pharmacology, Clinical Trials & Regulatory Affairs",
    "CRISPR, Genomics & Molecular Biotechnology",
    "Bioinformatics & Computational Biology",
    "Microbiology, Biochemistry & Life Sciences Research",
    "Healthcare Management & Public Health Policy",
  ],
  "Finance, CA, Economics & Consulting": [
    "Discounted Cash Flow (DCF) & Valuation Modeling",
    "Investment Banking & Private Equity",
    "Chartered Accountancy (CA), Audit & Taxation",
    "Mergers & Acquisitions (M&A) Analysis",
    "Equity Research & Financial Statement Modeling",
    "Management Consulting Case Frameworks",
    "Macroeconomics & Quantitative Risk Analytics",
  ],
  "Startups, MBA, Marketing & Product Management": [
    "0-to-1 MVP Scoping & Rapid Prototyping",
    "Customer Discovery & Startup Validation",
    "Investor Pitch Decks & Venture Fundraising",
    "Product Management & PRD Frameworks (RICE)",
    "Brand Management, Growth & Digital Marketing",
    "Supply Chain, Operations & Strategy",
  ],
  "UI/UX, Product Design & Architecture": [
    "Design Systems & Token Architecture (Figma)",
    "UX Case Studies & Portfolio Presentations",
    "User Research & Usability Testing",
    "Sustainable Architecture & Urban Planning (B.Arch)",
    "Interior, Spatial & Landscape Design",
    "Interactive Prototyping & Motion Design",
  ],
  "Sports, Athletics & Fitness Coaching": [
    "Track & Field Sprinting & Endurance Biomechanics",
    "Strength & Conditioning Periodization",
    "Sports Psychology, Focus & Competition Readiness",
    "Cricket, Badminton & Team Sports Coaching",
    "Sports Nutrition, Recovery & Injury Prevention",
    "National/University Sports Trials & Career Pathways",
  ],
};

const MENTOR_OFFERINGS = [
  { id: "mock_interview", label: "1-on-1 Mock Interview / Audition / Case Prep" },
  { id: "resume_review", label: "Resume, Showreel or Portfolio Deep-Dive Critique" },
  { id: "job_referral", label: "Referral or Industry Introductions" },
  { id: "coffee_chat", label: "30-min Virtual Coffee Chat & Career Strategy" },
  { id: "capstone_guide", label: "Project, Film, Research or Thesis Advisory" },
];

const AU_COLLEGES = [
  "AU College of Engineering (A.U.C.E)",
  "AU College of Arts & Commerce (Theatre, Fine Arts, Music, Literature, Media)",
  "AU College of Science & Technology",
  "AU School of International Business & Management",
  "Dr. B.R. Ambedkar College of Law, AU",
  "AU College of Pharmaceutical Sciences",
  "AU Department of Fine Arts & Performing Arts",
  "AU Department of Physical Education & Sports Sciences",
];

export const MentorOnboardingModal = ({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: MentorOnboardingModalProps) => {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Step 1: Credentials
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState(AU_COLLEGES[0]);
  const [batch, setBatch] = useState("2020");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("Visakhapatnam, IN");
  const [linkedin, setLinkedin] = useState("");

  // Step 2: Domain & Subjects (Tick boxes)
  const [domain, setDomain] = useState("Software Engineering & Architecture");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Distributed Systems & Microservices",
    "System Design & High Concurrency",
  ]);

  // Step 3: AI Diagnostic Interview & Offerings
  const [coreAdvice, setCoreAdvice] = useState("");
  const [favoriteQuestion, setFavoriteQuestion] = useState("");
  const [commonMistake, setCommonMistake] = useState("");
  const [selectedOfferings, setSelectedOfferings] = useState<string[]>([
    "1-on-1 Mock Interview / Audition / Case Prep",
    "Resume, Showreel or Portfolio Deep-Dive Critique",
    "30-min Virtual Coffee Chat & Career Strategy",
  ]);
  const [availability, setAvailability] = useState("2-4 hours / month");

  // Step 4: AI Synthesis Result
  const [aiResult, setAiResult] = useState<MentorProfileGenerationResult | null>(null);
  const [editableBio, setEditableBio] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      setName(initialData?.name || "");
      setEmail(initialData?.email || "");
      setPassword(initialData?.password || "");
      setCollege(AU_COLLEGES[0]);
      setBatch(initialData?.batch || "2020");
      setRole("");
      setCompany("");
      setLocation("Visakhapatnam, IN");
      setLinkedin("");
      setDomain("Software Engineering & Architecture");
      setSelectedSubjects([
        "Distributed Systems & Microservices",
        "System Design & High Concurrency",
      ]);
      setCoreAdvice("");
      setFavoriteQuestion("");
      setCommonMistake("");
      setSelectedOfferings([
        "1-on-1 Mock Interview / Audition / Case Prep",
        "Resume, Showreel or Portfolio Deep-Dive Critique",
        "30-min Virtual Coffee Chat & Career Strategy",
      ]);
      setAvailability("2-4 hours / month");
      setAiResult(null);
      setEditableBio("");
    }
  }, [open, initialData]);

  // Toggle subject tickbox
  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  // Toggle offering tickbox
  const toggleOffering = (offeringLabel: string) => {
    setSelectedOfferings((prev) =>
      prev.includes(offeringLabel)
        ? prev.filter((o) => o !== offeringLabel)
        : [...prev, offeringLabel]
    );
  };

  // Domain-aware AI suggestion for mentor questions
  const handleAiSuggestAnswer = (qIndex: 1 | 2 | 3) => {
    const isFilm = domain.includes("Acting") || domain.includes("Filmmaking");
    const isArts = domain.includes("Fine Arts") || domain.includes("Music") || domain.includes("Literature");
    const isLaw = domain.includes("Law") || domain.includes("UPSC");
    const isMed = domain.includes("Medicine") || domain.includes("Pharmacy");
    const isSports = domain.includes("Sports");

    if (qIndex === 1) {
      if (isFilm) {
        setCoreAdvice("Mastering emotional truth, active listening in every frame, and visual storytelling fundamentals rather than relying on gear or surface theatrics.");
      } else if (isArts) {
        setCoreAdvice("Developing daily discipline in foundational form, light, rhythm, and original voice before chasing commercial trends.");
      } else if (isLaw) {
        setCoreAdvice("Deep analytical reading of primary constitutional texts, structured answer writing, and clear logical argumentation.");
      } else if (isMed) {
        setCoreAdvice("Rigorous laboratory methodology, understanding molecular mechanisms, and ethical clinical research standards.");
      } else if (isSports) {
        setCoreAdvice("Consistent biomechanics, structured recovery, and mental composure under high-pressure tournament situations.");
      } else {
        setCoreAdvice(
          `Mastering core fundamentals in ${selectedSubjects[0] || domain} and building real-world depth rather than rushing through surface concepts.`
        );
      }
    } else if (qIndex === 2) {
      if (isFilm) {
        setFavoriteQuestion("How would you block and light a 2-minute dramatic scene in a single room to show a power shift without dialogue?");
      } else if (isArts) {
        setFavoriteQuestion("Walk me through the emotional and compositional choices behind the centerpiece of your portfolio.");
      } else if (isLaw) {
        setFavoriteQuestion("How do you balance constitutional fundamental rights against state regulatory power in emerging technology cases?");
      } else {
        setFavoriteQuestion(
          `Walk me through a real-world challenge in ${selectedSubjects[0] || domain} where you had to weigh competing trade-offs.`
        );
      }
    } else {
      if (isFilm || isArts) {
        setCommonMistake("Waiting for big budgets or permission to create instead of producing tight, authentic short works and building a distinct showreel.");
      } else if (isLaw) {
        setCommonMistake("Collecting endless study materials without practicing timed answer writing, mooting, or case briefing.");
      } else {
        setCommonMistake(
          "Listing generic coursework without demonstrating hands-on portfolio work, measurable impact, or clear original thinking."
        );
      }
    }
    toast.success("Suggested response applied!");
  };

  // Proceed to Step 4 with AI Synthesis
  const handleProceedToStep4 = async () => {
    if (selectedOfferings.length === 0) {
      toast.error("Please tick at least one mentorship offering");
      return;
    }

    setGeneratingAi(true);
    const synthesis = await generateMentorProfileWithAi({
      name: name || "AU Alumnus Mentor",
      batch: Number(batch) || 2020,
      degree: college,
      role: role || "Senior Mentor",
      company: company || "Andhra University Alumni Network",
      domain,
      subjects: selectedSubjects,
      answers: { coreAdvice, favoriteQuestion, commonMistake },
      offerings: selectedOfferings,
    });
    setGeneratingAi(false);

    if (synthesis) {
      setAiResult(synthesis);
      setEditableBio(synthesis.bio);
      setStep(4);
    } else {
      toast.error("Failed to generate profile synthesis. Please try again.");
    }
  };

  const mapDomainToIndustry = (d: string) => {
    if (d.includes("Acting") || d.includes("Filmmaking")) return "Film & Media";
    if (d.includes("Fine Arts") || d.includes("Music")) return "Arts & Culture";
    if (d.includes("Literature") || d.includes("Journalism")) return "Film & Media";
    if (d.includes("Law") || d.includes("UPSC")) return "Law & Civil Services";
    if (d.includes("Medicine") || d.includes("Pharmacy")) return "Healthcare";
    if (d.includes("Finance")) return "Finance";
    if (d.includes("Startup") || d.includes("MBA")) return "Startup";
    if (d.includes("Architecture") || d.includes("UI/UX")) return "Design";
    if (d.includes("Sports")) return "Sports";
    if (d.includes("Core Engineering")) return "Core Engineering";
    return "Technology";
  };

  // Final Confirmation & Submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);

    try {
      // 1. Create alumni database profile
      await createAlumni({
        name,
        batch: Number(batch) || 2020,
        degree: college,
        role,
        company,
        location,
        industry: mapDomainToIndustry(domain),
        linkedin,
        bio: editableBio,
        skills: selectedSubjects,
        email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@alumni.andhrauniv.edu.in`,
      });

      // 2. Register user credentials if password provided
      if (email && password) {
        await register({
          name,
          email,
          password,
          role: "alumni",
          batch: Number(batch) || 2020,
          major: college,
        });
      }

      toast.success("Your AU Alumni Mentor profile is now live!");
      setSubmitting(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to finalize mentor registration");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-6 bg-card border-border shadow-elegant sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-mono text-muted-foreground">
              Step {step} of 4:{" "}
              <span className="font-semibold text-foreground">
                {step === 1 && "Credentials"}
                {step === 2 && "Subject Specializations"}
                {step === 3 && "Mentor Questions"}
                {step === 4 && "Review & Publish"}
              </span>
            </div>
          </div>
          <DialogTitle className="font-serif text-2xl md:text-3xl text-primary mt-1">
            Alumni Mentor Registration
          </DialogTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Set up your Andhra University alumni profile, select your subject specializations, and share guidance for students.
          </p>
        </DialogHeader>

        {/* Step Progress Bar */}
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden my-2">
          <div
            className="bg-gold-gradient h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: Credentials */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name *
                </label>
                <Input
                  placeholder="e.g. Satya Venkat"
                  className="mt-1.5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Graduation Batch (Year) *
                </label>
                <Input
                  placeholder="e.g. 2018"
                  type="number"
                  className="mt-1.5"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  AU College / School *
                </label>
                <select
                  className="w-full mt-1.5 h-10 rounded-md border border-input bg-background px-3 text-xs"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                >
                  {AU_COLLEGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Organization / Company *
                </label>
                <Input
                  placeholder="e.g. Google, Microsoft, Goldman Sachs"
                  className="mt-1.5"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Role / Title *
                </label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  className="mt-1.5"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Location (City, Country)
                </label>
                <Input
                  placeholder="e.g. Bengaluru, IN or London, UK"
                  className="mt-1.5"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email (University or Work) *
                </label>
                <Input
                  placeholder="name@alumni.andhrauniv.edu.in"
                  type="email"
                  className="mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password (to access portal) *
                </label>
                <Input
                  placeholder="Create portal password"
                  type="password"
                  className="mt-1.5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                LinkedIn Profile URL
              </label>
              <Input
                placeholder="https://linkedin.com/in/username"
                className="mt-1.5"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Domain & Subject Specialization (Tick Boxes) */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choose Primary Domain:
              </label>
              <select
                className="w-full mt-1.5 h-10 rounded-md border border-input bg-background px-3 text-xs font-medium"
                value={domain}
                onChange={(e) => {
                  const newDomain = e.target.value;
                  setDomain(newDomain);
                  // Auto-select first two subjects
                  const subs = DOMAIN_SUBJECTS[newDomain] || [];
                  setSelectedSubjects(subs.slice(0, 2));
                }}
              >
                {Object.keys(DOMAIN_SUBJECTS).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Select Subject Specializations (Tick all that apply):
                </label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {selectedSubjects.length} selected
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                {(DOMAIN_SUBJECTS[domain] || []).map((sub) => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <div
                      key={sub}
                      onClick={() => toggleSubject(sub)}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-smooth cursor-pointer ${
                        isChecked
                          ? "bg-accent/10 border-accent/70 shadow-sm"
                          : "bg-background border-border/70 hover:border-accent/40"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleSubject(sub)}
                        className="mt-0.5"
                      />
                      <div className="text-xs font-medium text-foreground leading-snug">
                        {sub}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent shrink-0" />
              <span>
                These subjects help AU students match directly with your expertise in search, mentoring inquiries, and the AI Matchmaker.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: AI Diagnostic Interview & Offerings */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-primary text-primary-foreground p-3.5 shadow-soft flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="h-5 w-5 text-gold animate-bounce" />
                <div>
                  <h4 className="font-serif font-bold text-sm">AU AI Diagnostic Interview</h4>
                  <p className="text-[11px] text-primary-foreground/80">
                    Your answers will be synthesized into your verified mentor thesis.
                  </p>
                </div>
              </div>
              <Badge className="bg-gold-gradient text-primary border-0 font-bold text-[10px]">
                Domain: {domain.split(" ")[0]}
              </Badge>
            </div>

            {/* Question 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  1. What is the #1 foundational concept AU juniors must master in your field?
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[11px] h-6 px-2 text-accent hover:text-accent font-semibold"
                  onClick={() => handleAiSuggestAnswer(1)}
                >
                  <Sparkles className="h-3 w-3 mr-1" /> AI Suggest
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="e.g. Deep understanding of distributed transactions, memory models, and end-to-end latency..."
                value={coreAdvice}
                onChange={(e) => setCoreAdvice(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  2. What technical or case question do you ask candidates during real interviews?
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[11px] h-6 px-2 text-accent hover:text-accent font-semibold"
                  onClick={() => handleAiSuggestAnswer(2)}
                >
                  <Sparkles className="h-3 w-3 mr-1" /> AI Suggest
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="e.g. How would you design a distributed rate limiter that handles 100k requests/second without single-point failure..."
                value={favoriteQuestion}
                onChange={(e) => setFavoriteQuestion(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Question 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  3. What is the most common resume or interview mistake you see AU juniors make?
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[11px] h-6 px-2 text-accent hover:text-accent font-semibold"
                  onClick={() => handleAiSuggestAnswer(3)}
                >
                  <Sparkles className="h-3 w-3 mr-1" /> AI Suggest
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="e.g. Listing 10 different frameworks without being able to explain what happens under the hood..."
                value={commonMistake}
                onChange={(e) => setCommonMistake(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Mentorship Offerings Tick Boxes */}
            <div className="pt-2 border-t border-border/70">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                What can you offer to AU students? (Tick boxes):
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                {MENTOR_OFFERINGS.map((off) => {
                  const isChecked = selectedOfferings.includes(off.label);
                  return (
                    <div
                      key={off.id}
                      onClick={() => toggleOffering(off.label)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-smooth cursor-pointer ${
                        isChecked
                          ? "bg-accent/10 border-accent/70"
                          : "bg-background border-border/70 hover:border-accent/40"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleOffering(off.label)}
                        className="mt-0.5"
                      />
                      <span className="text-xs font-medium text-foreground">{off.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Availability */}
            <div className="grid sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Monthly Availability:
                </label>
                <select
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-xs"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="1-2 hours / month">1-2 hours / month (Low commitment)</option>
                  <option value="2-4 hours / month">2-4 hours / month (Recommended)</option>
                  <option value="4+ hours / month">4+ hours / month (Active Lead Mentor)</option>
                </select>
              </div>
              <div className="text-[11px] text-muted-foreground pt-4">
                You will retain full control to accept or reschedule student sessions on your calendar.
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AI Synthesis & Activation */}
        {step === 4 && aiResult && (
          <div className="space-y-4 py-2">
            <div className="rounded-xl bg-gold-gradient p-0.5 shadow-gold">
              <div className="bg-card rounded-[10px] p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
                        name || "alumni"
                      )}&backgroundColor=c0aede,d1d4f9,b6e3f4`}
                      alt={name}
                      className="h-14 w-14 rounded-full bg-secondary ring-2 ring-accent/40 shadow-soft"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-xl font-bold text-primary">{name}</h3>
                        <Badge className="bg-gold-gradient text-primary border-0 font-bold text-[10px]">
                          AU Accredited Mentor
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground">
                        {role} @ <span className="font-semibold text-primary">{company}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {college} • Class of {batch} • {location}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-accent text-accent font-mono text-xs">
                    {availability}
                  </Badge>
                </div>

                {/* AI Synthesized Bio */}
                <div className="mt-4 pt-4 border-t border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-accent" /> AI Synthesized Mentor Bio:
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      (Editable prior to activation)
                    </span>
                  </div>
                  <Textarea
                    rows={4}
                    value={editableBio}
                    onChange={(e) => setEditableBio(e.target.value)}
                    className="text-xs font-sans leading-relaxed"
                  />
                </div>

                {/* Skills & Offerings */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Accredited Specialization Tags:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSubjects.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[11px] px-2 py-0.5">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/70">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Active Mentorship Offerings:
                  </div>
                  <div className="grid sm:grid-cols-2 gap-1.5">
                    {selectedOfferings.map((off) => (
                      <div key={off} className="text-xs flex items-center gap-1.5 text-foreground/80">
                        <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span>{off}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4 text-accent shrink-0" />
              <span>
                By activating, your verified badge will be published to the AU Alumni Directory and you will receive priority student consultation requests.
              </span>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2 flex-wrap">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as any)}
                disabled={submitting || generatingAi}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step === 1 && (
              <Button
                type="button"
                variant="hero"
                onClick={() => {
                  if (!name || !company || !role || !email) {
                    toast.error("Please fill in name, company, role, and email");
                    return;
                  }
                  setStep(2);
                }}
              >
                Next: Subject Specializations <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                variant="hero"
                onClick={() => {
                  if (selectedSubjects.length === 0) {
                    toast.error("Please tick at least one subject specialization");
                    return;
                  }
                  setStep(3);
                }}
              >
                Next: AI Diagnostic Interview <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}

            {step === 3 && (
              <Button
                type="button"
                variant="hero"
                disabled={generatingAi}
                onClick={handleProceedToStep4}
              >
                <Sparkles className="h-4 w-4 mr-1.5" />
                {generatingAi ? "AI Synthesizing..." : "Synthesize AI Profile"}
              </Button>
            )}

            {step === 4 && (
              <Button
                type="button"
                variant="hero"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="bg-gold-gradient text-primary font-bold shadow-gold"
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                {submitting ? "Activating Profile..." : "Confirm & Activate AU Accreditation"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
