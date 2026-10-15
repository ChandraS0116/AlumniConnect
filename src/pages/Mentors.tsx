import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/dashboard/VideoCard";
import { MentorPlaylistCard } from "@/components/dashboard/MentorPlaylistCard";
import {
  videosData,
  doubtsData,
  topics,
  mentorPlaylistsData,
  alumniData,
  Doubt,
  MentorVideo,
  MentorPlaylist,
} from "@/data/mockData";
import {
  Upload,
  MessageCircle,
  CheckCircle2,
  Clock,
  Youtube,
  HelpCircle,
  Search,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Layers,
  Globe,
  Quote,
  UserCheck,
  Compass,
  ArrowRight,
  Filter,
  PlusCircle,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import mentorImg from "@/assets/mentor-video.jpg";
import { toast } from "sonner";
import { extractYouTubeId } from "@/lib/youtube";
import { getVideos, getPlaylists, searchLiveYoutube, referVideo, getDoubts, postDoubt } from "@/lib/api";
import { DoubtDiscussionModal } from "@/components/dashboard/DoubtDiscussionModal";
import { Link } from "react-router-dom";

// Sub-topic recommendations for quick filtering across domains
const SUB_TOPIC_PILLS: Record<string, string[]> = {
  "Engineering": ["System Design", "Distributed Systems", "Database Indexing", "Kubernetes", "Microservices", "Coding Interview"],
  "AI/ML": ["Generative AI & LLMs", "PyTorch from Scratch", "Transformers", "RAG Systems", "MLOps", "Neural Networks"],
  "Core Engineering": ["VLSI Design Flow", "Embedded Systems", "Jet Propulsion", "Structural Analysis", "Robotics", "Power Systems"],
  "Filmmaking & Acting": ["Screen Acting & Auditions", "Cinematography & Lighting", "Directing & Blocking", "Screenwriting", "Editing & Color"],
  "Fine Arts & Music": ["Figure Drawing & Anatomy", "Color Theory", "Music Theory & Harmony", "Film Scoring", "Classical Ragas"],
  "Media & Literature": ["Story Structure & Plot", "Investigative Journalism", "Public Speaking", "Documentary Filmmaking", "Feature Writing"],
  "Law & Civil Services": ["UPSC CSE Mains Strategy", "Indian Constitution", "Contract Law", "Cross-Examination", "Moot Court Oral Arguments"],
  "Medicine & Pharma": ["Drug Discovery", "CRISPR Gene Editing", "Pharmacokinetics (ADME)", "Clinical Trials", "Cardiology & ECG"],
  "Finance": ["Investment Banking & DCF", "3-Statement Modeling", "Private Equity vs VC", "Consulting Case Interviews", "Derivatives"],
  "Entrepreneurship": ["Evaluating Startup Ideas", "Building an MVP", "Talking to Users (Mom Test)", "Pitching to VCs", "Product Management"],
  "Design": ["Figma Design Systems", "UI/UX Case Studies", "Design Portfolio Review", "Auto Layout", "Design Tokens"],
  "Sports & Athletics": ["Sprint Biomechanics", "Sports Psychology", "Athletic Periodization", "Strength & Core", "Injury Prevention"],
  "Career": ["ATS Resume Formula", "Tell Me About Yourself", "Amazon STAR Behavioral", "Salary Negotiation", "LinkedIn Networking"],
};

const Mentors = () => {
  // Navigation & Column Modes
  const [activeTab, setActiveTab] = useState<"library" | "roadmaps" | "live_search">("library");
  const [topic, setTopic] = useState("All");
  const [subTopic, setSubTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("alma_bookmarked_videos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Data States
  const [videos, setVideos] = useState<MentorVideo[]>(videosData);
  const [playlists, setPlaylists] = useState<MentorPlaylist[]>(mentorPlaylistsData);
  const [doubts, setDoubts] = useState<Doubt[]>(doubtsData);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [doubtModalOpen, setDoubtModalOpen] = useState(false);

  // Live YouTube Exploration State
  const [liveQuery, setLiveQuery] = useState("");
  const [liveResults, setLiveResults] = useState<MentorVideo[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  // Refer a Video Modal State
  const [isReferOpen, setIsReferOpen] = useState(false);
  const [referTitle, setReferTitle] = useState("");
  const [referMentor, setReferMentor] = useState("Venkata Sai Krishna");
  const [referRole, setReferRole] = useState("Staff SWE @ Google • AU CSE '18");
  const [referTopic, setReferTopic] = useState("Engineering");
  const [referUrl, setReferUrl] = useState("");
  const [referNote, setReferNote] = useState("");
  const [referAudience, setReferAudience] = useState("Final Year Placements");
  const [referChannel, setReferChannel] = useState("");

  // Ask Doubt Modal State
  const [isDoubtOpen, setIsDoubtOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [doubtQuestion, setDoubtQuestion] = useState("");
  const [doubtTopic, setDoubtTopic] = useState("Engineering");

  const loadData = async () => {
    const [vList, plList, dList] = await Promise.all([
      getVideos(topic),
      getPlaylists(topic),
      getDoubts(),
    ]);
    if (vList) setVideos(vList);
    if (plList) setPlaylists(plList);
    if (dList) setDoubts(dList);
  };

  useEffect(() => {
    loadData();
    setSubTopic(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  // Live YouTube Search Trigger
  const handleExecuteLiveSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) {
      toast.error("Please enter a subject to search across YouTube");
      return;
    }
    setIsSearchingLive(true);
    toast.info(`Querying YouTube's global catalog for "${q}"...`);
    try {
      const results = await searchLiveYoutube(q, topic !== "All" ? topic : undefined);
      setLiveResults(results);
      if (results.length > 0) {
        toast.success(`Found ${results.length} live YouTube masterclasses for "${q}"`);
      } else {
        toast.info("No external results returned; displaying relevant curated videos.");
      }
    } catch {
      toast.error("Could not reach YouTube search service. Displaying local library.");
    } finally {
      setIsSearchingLive(false);
    }
  };

  // Filtered Curated Videos
  const filtered = videos.filter((v) => {
    const matchTopic = topic === "All" || v.topic === topic;
    const matchSubTopic =
      !subTopic ||
      [v.title, v.description, v.mentorNote, v.recommendedFor]
        .join(" ")
        .toLowerCase()
        .includes(subTopic.toLowerCase());
    const matchSearch =
      !searchQuery.trim() ||
      [v.title, v.mentor, v.topic, v.description, v.channelName, v.mentorNote]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
    const matchBookmark = !bookmarkedOnly || bookmarkedIds.includes(v.id);
    return matchTopic && matchSubTopic && matchSearch && matchBookmark;
  });

  // Filtered Playlists
  const filteredPlaylists = playlists.filter(
    (p) => topic === "All" || p.topic === topic
  );

  // Active Lead Domain Mentor (derived from alumniData)
  const activeDomainMentor =
    alumniData.find((a) => {
      if (topic === "All") return a.is_featured;
      if (topic === "Filmmaking & Acting") return a.industry.includes("Film");
      if (topic === "Fine Arts & Music") return a.industry.includes("Arts");
      if (topic === "Law & Civil Services") return a.industry.includes("Law");
      if (topic === "Medicine & Pharma") return a.industry.includes("Healthcare");
      if (topic === "Core Engineering") return a.industry.includes("Core");
      if (topic === "Sports & Athletics") return a.industry.includes("Sports");
      if (topic === "Finance") return a.industry.includes("Finance");
      if (topic === "Entrepreneurship") return a.industry.includes("Startup");
      if (topic === "Design") return a.industry.includes("Design");
      return a.industry.includes("Tech");
    }) || alumniData[0];

  // Handle Mentor Video Referral
  const handleReferLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referTitle.trim()) {
      toast.error("Please enter a session title");
      return;
    }
    const ytId = extractYouTubeId(referUrl);
    if (!ytId) {
      toast.error("Please enter a valid YouTube video link (e.g. https://www.youtube.com/watch?v=...)");
      return;
    }

    const res = await referVideo({
      title: referTitle.trim(),
      mentor: referMentor.trim() || "AU Alumni Mentor",
      mentorRole: referRole.trim() || "Andhra University Alumnus",
      mentorNote: referNote.trim() || "Personally vetted and recommended for AU students.",
      channelName: referChannel.trim() || "YouTube Creator",
      recommendedFor: referAudience.trim() || "All Batches",
      topic: referTopic || "Engineering",
      description: `Referred by ${referMentor}: ${referNote.trim() || referTitle.trim()}`,
      youtubeUrl: referUrl.trim(),
    });

    if (res.success && res.data) {
      setVideos((prev) => [res.data!, ...prev]);
    } else {
      loadData();
    }

    toast.success("Mentor YouTube referral published to AU Library!");
    setIsReferOpen(false);
    setReferTitle("");
    setReferUrl("");
    setReferNote("");
    setReferChannel("");
  };

  // Handle Student Post Doubt
  const handlePostDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim()) {
      toast.error("Please write your question");
      return;
    }

    const res = await postDoubt({
      student: studentName.trim() || "AU Student",
      question: doubtQuestion.trim(),
      topic: doubtTopic,
    });

    if (res.success && res.data) {
      setDoubts((prev) => [res.data!, ...prev]);
    } else {
      loadData();
    }

    toast.success("Your question was posted to the Doubt Board!");
    setIsDoubtOpen(false);
    setStudentName("");
    setDoubtQuestion("");
  };

  // Quick live search suggestions for the current topic
  const currentSubPills = topic !== "All" && SUB_TOPIC_PILLS[topic] ? SUB_TOPIC_PILLS[topic] : [
    "System Design Masterclass",
    "Christopher Nolan Cinematography",
    "UPSC IAS Answer Writing",
    "Deep Learning from Scratch",
    "Classical Carnatic Raga",
    "CRISPR Drug Discovery",
    "Venture Capital Pitch Deck",
  ];

  const previewYtId = extractYouTubeId(referUrl);

  return (
    <>
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <img
          src={mentorImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          loading="lazy"
          width={1200}
          height={800}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/45" />
        <div className="container relative py-16 md:py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            <span>Andhra University</span>
            <span>•</span>
            <span>Alumni Mentor Hub</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mt-3 max-w-3xl leading-[1.1]">
            Curated wisdom from alumni who walked the path.
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl text-base sm:text-lg leading-relaxed">
            Our alumni work full-time across global tech companies, hospitals, civil services, studios, and firms. Because time is limited, they personally vet, refer, and annotate the world's highest-quality masterclasses for AU students.
          </p>

          {/* Action Row */}
          <div className="flex items-center gap-3 mt-8 flex-wrap">
            <Dialog open={isReferOpen} onOpenChange={setIsReferOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="lg" className="shadow-gold">
                  <PlusCircle className="h-4 w-4 mr-2" /> Refer a YouTube Video
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleReferLesson}>
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-primary">
                      Refer a YouTube Video to AU Students
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Busy mentors don't need to film studio videos. Paste any world-class YouTube lecture, add your practitioner note, and prescribe it to your junior AU batch.
                    </p>
                  </DialogHeader>

                  <div className="space-y-4 py-3">
                    {/* YouTube Link */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Youtube className="h-4 w-4 text-red-500 fill-red-500" /> YouTube Watch Link *
                      </label>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        className="mt-1.5"
                        value={referUrl}
                        onChange={(e) => setReferUrl(e.target.value)}
                        required
                      />
                      {previewYtId && (
                        <div className="mt-2.5 rounded-lg overflow-hidden border border-border/80 relative aspect-video bg-black/50 max-h-36">
                          <img
                            src={`https://i.ytimg.com/vi/${previewYtId}/hqdefault.jpg`}
                            alt="Live YouTube Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-400" /> Valid YouTube Video Detected
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lesson / Masterclass Title *
                      </label>
                      <Input
                        placeholder="e.g. Distributed Caching & Redis Architecture in Production"
                        className="mt-1.5"
                        value={referTitle}
                        onChange={(e) => setReferTitle(e.target.value)}
                        required
                      />
                    </div>

                    {/* YouTube Channel / Creator */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Original YouTube Creator / Channel Name
                      </label>
                      <Input
                        placeholder="e.g. ByteByteGo, MIT OpenCourseWare, StudioBinder"
                        className="mt-1.5"
                        value={referChannel}
                        onChange={(e) => setReferChannel(e.target.value)}
                      />
                    </div>

                    {/* Mentor Name & Role */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Referring Alumnus Name
                        </label>
                        <Input
                          placeholder="e.g. Venkata Sai Krishna"
                          className="mt-1.5"
                          value={referMentor}
                          onChange={(e) => setReferMentor(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Your AU Role & Batch
                        </label>
                        <Input
                          placeholder="e.g. Staff SWE @ Google • AU CSE '18"
                          className="mt-1.5"
                          value={referRole}
                          onChange={(e) => setReferRole(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Domain & Recommended Audience */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          University Domain
                        </label>
                        <select
                          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={referTopic}
                          onChange={(e) => setReferTopic(e.target.value)}
                        >
                          {topics.filter((t) => t !== "All").map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Recommended For
                        </label>
                        <Input
                          placeholder="e.g. Final Year Placement Prep, 2nd Year Foundation"
                          className="mt-1.5"
                          value={referAudience}
                          onChange={(e) => setReferAudience(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Mentor's Personal Takeaway Note */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Quote className="h-3.5 w-3.5 text-gold" />
                        Mentor's Practitioner Note & Advice for AU Students *
                      </label>
                      <Textarea
                        placeholder="Why do you recommend this? e.g. 'Pay special attention to min 12-25 on cache invalidation; this is the exact tradeoff we test in FAANG rounds.'"
                        rows={3}
                        className="mt-1.5 text-xs sm:text-sm"
                        value={referNote}
                        onChange={(e) => setReferNote(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button variant="hero" type="submit" className="w-full sm:w-auto">
                      <PlusCircle className="h-4 w-4 mr-1.5" /> Publish Referral to AU Library
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outlineGold"
              size="lg"
              onClick={() => setActiveTab("roadmaps")}
            >
              <Layers className="h-4 w-4 mr-2 text-primary" /> View 13 Alumni Syllabi Tracks
            </Button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container py-10">
        {/* The Alumni Referral Architecture Banner */}
        <Card className="p-4 sm:p-5 mb-8 bg-card border-border/80 shadow-soft rounded-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-3xl">
              <div className="h-10 w-10 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-primary">
                  The Andhra University Alumni Referral Architecture
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  Real alumni mentors in engineering, cinema, medicine, law, civil services, and finance cannot film full courses every week. Instead, each video below is <strong>curated, vetted, and annotated with a personal practitioner takeaway</strong> by an AU alumnus—giving you world-class instruction paired with verified alumni mentorship.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="border-accent/30 bg-accent/5 text-primary text-xs py-1 px-3">
                {videos.length} Verified Referrals
              </Badge>
              <Badge variant="outline" className="border-gold/40 bg-gold/5 text-primary text-xs py-1 px-3">
                13 Alumni Syllabi
              </Badge>
            </div>
          </div>
        </Card>

        {/* Column Navigation Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-smooth flex items-center gap-2 ${
                activeTab === "library"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary/60 text-foreground/75 hover:bg-secondary"
              }`}
            >
              <Compass className="h-4 w-4" />
              Curated Video Library ({filtered.length})
            </button>

            <button
              onClick={() => setActiveTab("roadmaps")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-smooth flex items-center gap-2 ${
                activeTab === "roadmaps"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary/60 text-foreground/75 hover:bg-secondary"
              }`}
            >
              <Layers className="h-4 w-4 text-gold" />
              Curated Alumni Roadmaps ({filteredPlaylists.length})
            </button>

            <button
              onClick={() => setActiveTab("live_search")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-smooth flex items-center gap-2 ${
                activeTab === "live_search"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary/60 text-foreground/75 hover:bg-secondary"
              }`}
            >
              <Globe className="h-4 w-4 text-red-500" />
              Explore YouTube Live (Unlimited)
            </button>
          </div>

          {activeTab === "library" && (
            <div className="flex items-center gap-2">
              <Button
                variant={bookmarkedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                className="text-xs font-semibold h-10 px-3.5"
              >
                {bookmarkedOnly ? (
                  <BookmarkCheck className="h-4 w-4 mr-1.5 text-gold fill-gold" />
                ) : (
                  <Bookmark className="h-4 w-4 mr-1.5" />
                )}
                Saved Lessons {bookmarkedIds.length > 0 && `(${bookmarkedIds.length})`}
              </Button>
            </div>
          )}
        </div>

        {/* 13 Domain Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTopic(t);
                setSubTopic(null);
                setBookmarkedOnly(false);
              }}
              className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full font-medium transition-smooth border ${
                topic === t && !bookmarkedOnly
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card border-border text-foreground/70 hover:border-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Sub-Topic Focus Pills when domain is selected */}
        {activeTab === "library" && currentSubPills.length > 0 && (
          <div className="p-3 rounded-xl bg-secondary/35 border border-border/60 mb-8 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Focus Topics:
            </span>
            <button
              onClick={() => setSubTopic(null)}
              className={`text-xs px-2.5 py-1 rounded-md transition-smooth font-medium ${
                subTopic === null
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All {topic === "All" ? "Topics" : topic}
            </button>
            {currentSubPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setSubTopic(subTopic === pill ? null : pill)}
                className={`text-xs px-2.5 py-1 rounded-md transition-smooth font-medium ${
                  subTopic === pill
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        )}

        {/* Split Grid: Main Content (2 Columns) + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Area: Library / Playlists / Live YouTube Search */}
          <div className="lg:col-span-2">
            {/* VIEW 1: CURATED VIDEO LIBRARY */}
            {activeTab === "library" && (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-primary">
                      {bookmarkedOnly
                        ? "Saved Lessons"
                        : topic === "All"
                        ? "All Mentor-Referred Masterclasses"
                        : `${topic} Masterclasses`}{" "}
                      <span className="text-muted-foreground font-normal text-lg">
                        ({filtered.length})
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Each video paired with an authentic AU Alumnus practitioner note.
                    </p>
                  </div>

                  {/* Search inside Library */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search title, channel, mentor..."
                      className="pl-9 h-10 text-xs bg-card border-border/80"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-border/70 p-8 shadow-soft">
                    <Badge variant="secondary" className="mb-3">
                      No masterclasses match this filter
                    </Badge>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      {bookmarkedOnly
                        ? "You haven't bookmarked any lessons yet. Click the ribbon on any card to save it."
                        : "Try selecting another topic pill or explore millions of videos on YouTube live."}
                    </p>
                    <div className="flex justify-center gap-3 mt-5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSubTopic(null);
                          setTopic("All");
                          setBookmarkedOnly(false);
                        }}
                      >
                        Reset filters
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => setActiveTab("live_search")}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1.5" /> Search YouTube Live
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {filtered.map((v) => (
                      <VideoCard
                        key={v.id}
                        v={v}
                        isBookmarked={bookmarkedIds.includes(v.id)}
                        onBookmarkToggle={(vid, isSaved) => {
                          setBookmarkedIds((prev) =>
                            isSaved ? [...prev, vid] : prev.filter((id) => id !== vid)
                          );
                        }}
                        onAskMentorQuestion={(mentor, title, mTopic) => {
                          setDoubtTopic(mTopic);
                          setDoubtQuestion(`Hi ${mentor}, I was watching "${title}" that you referred. Could you clarify how this applies to... `);
                          setIsDoubtOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* VIEW 2: ALUMNI STUDY ROADMAPS */}
            {activeTab === "roadmaps" && (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-bold text-primary">
                    Curated Alumni Syllabi Tracks
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Multi-video sequences organized by senior AU graduates. Instead of random tutorials, follow a structured sequence vetted by practicing leaders.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {filteredPlaylists.map((pl) => (
                    <MentorPlaylistCard
                      key={pl.id}
                      playlist={pl}
                      onSelect={(selectedPl) => {
                        setTopic(selectedPl.topic);
                        setActiveTab("library");
                        toast.success(`Switched to "${selectedPl.title}" (${selectedPl.topic})`);
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* VIEW 3: LIVE YOUTUBE GLOBAL EXPLORER */}
            {activeTab === "live_search" && (
              <>
                <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-soft mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Youtube className="h-5 w-5 text-red-500 fill-red-500" />
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                      Search YouTube's Global Catalog (Billions of Videos)
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Search any concept, skill, regional masterclass, or technical subject. AlumniConnect queries YouTube live and automatically wraps results with AU Mentor context.
                  </p>

                  <div className="flex gap-2 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g. Tollywood cinematography lighting, Kubernetes in production, UPSC GS3..."
                        className="pl-10 h-11 text-xs sm:text-sm bg-background border-border/80"
                        value={liveQuery}
                        onChange={(e) => setLiveQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleExecuteLiveSearch(liveQuery);
                          }
                        }}
                      />
                    </div>
                    <Button
                      variant="hero"
                      className="h-11 px-5 shrink-0"
                      disabled={isSearchingLive}
                      onClick={() => handleExecuteLiveSearch(liveQuery)}
                    >
                      {isSearchingLive ? "Searching..." : "Search YouTube"}
                    </Button>
                  </div>

                  {/* Quick Search Chips */}
                  <div className="mt-4 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                      Try Searching:
                    </span>
                    {currentSubPills.map((pill) => (
                      <button
                        key={pill}
                        onClick={() => {
                          setLiveQuery(pill);
                          handleExecuteLiveSearch(pill);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-secondary/70 hover:bg-secondary text-foreground/80 hover:text-foreground transition-smooth border border-border/60"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Results Display */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-bold text-primary">
                      {liveResults.length > 0
                        ? `Live YouTube Results (${liveResults.length})`
                        : "Ready to Explore YouTube"}
                    </h3>
                    {liveResults.length > 0 && (
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/20">
                        Live YouTube Feed
                      </Badge>
                    )}
                  </div>

                  {liveResults.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-2xl border border-border/70 p-8 shadow-soft">
                      <Youtube className="h-12 w-12 text-red-500 mx-auto mb-3 opacity-80" />
                      <h4 className="font-serif text-lg font-bold text-primary">
                        Access millions of YouTube videos
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                        Type any subject above or click one of the suggested topic pills to fetch real YouTube masterclasses on demand.
                      </p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-6">
                      {liveResults.map((v) => (
                        <VideoCard
                          key={v.id}
                          v={v}
                          isBookmarked={bookmarkedIds.includes(v.id)}
                          onBookmarkToggle={(vid, isSaved) => {
                            setBookmarkedIds((prev) =>
                              isSaved ? [...prev, vid] : prev.filter((id) => id !== vid)
                            );
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column / Sidebar */}
          <aside className="space-y-6">
            {/* Active Domain Lead Mentor Spotlight Card */}
            <Card className="p-5 bg-card border border-border/70 shadow-soft rounded-2xl overflow-hidden relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-wider text-accent font-semibold flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" /> Domain Lead Mentor
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {topic === "All" ? activeDomainMentor.industry : topic}
                </Badge>
              </div>

              <div className="flex items-center gap-3.5 mb-3.5">
                <img
                  src={activeDomainMentor.avatar}
                  alt={activeDomainMentor.name}
                  className="h-14 w-14 rounded-full bg-secondary ring-2 ring-accent/30 object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-base font-bold text-primary truncate">
                    {activeDomainMentor.name}
                  </h4>
                  <div className="text-xs text-muted-foreground truncate">
                    {activeDomainMentor.role}
                  </div>
                  <div className="text-[11px] text-accent font-medium truncate">
                    {activeDomainMentor.company} • AU '{activeDomainMentor.batch}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {activeDomainMentor.bio}
              </p>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Available for AU juniors
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="text-xs h-8 gap-1 border-accent/40 text-primary hover:bg-accent/10"
                >
                  <Link to="/alumni">
                    View Profile <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Doubt Board Card */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-primary">AU Doubt Board</h3>
                  <Badge variant="secondary" className="text-xs">
                    {doubts.length}
                  </Badge>
                </div>
              </div>

              <Card className="bg-card border-border/70 shadow-soft overflow-hidden rounded-2xl">
                {doubts.map((d, i) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDoubt(d);
                      setDoubtModalOpen(true);
                    }}
                    className={`p-4 ${
                      i !== doubts.length - 1 ? "border-b border-border/60" : ""
                    } hover:bg-secondary/40 transition-smooth cursor-pointer`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={d.studentAvatar}
                        alt={d.student}
                        className="h-9 w-9 rounded-full bg-secondary shrink-0 ring-1 ring-accent/20"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{d.student}</span>
                          <span>•</span>
                          <span>{d.postedAgo}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1 leading-snug line-clamp-2">
                          {d.question}
                        </p>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {d.topic}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {d.replies}
                          </span>
                          <span
                            className={`text-[11px] flex items-center gap-1 font-medium ${
                              d.status === "answered" ? "text-accent" : "text-muted-foreground"
                            }`}
                          >
                            {d.status === "answered" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {d.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Ask Doubt Dialog */}
              <Dialog open={isDoubtOpen} onOpenChange={setIsDoubtOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 h-11 text-xs sm:text-sm">
                    <HelpCircle className="h-4 w-4 mr-2 text-primary" /> Ask a Question to Mentors
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <form onSubmit={handlePostDoubt}>
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">Ask the AU Mentors</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Your Name
                        </label>
                        <Input
                          placeholder="e.g. Arjun Rao"
                          className="mt-1.5"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Domain
                        </label>
                        <select
                          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={doubtTopic}
                          onChange={(e) => setDoubtTopic(e.target.value)}
                        >
                          {topics.filter((t) => t !== "All").map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Your Question / Doubt *
                        </label>
                        <Textarea
                          placeholder="What career, concept, or interview question would you like guidance on?"
                          rows={3}
                          className="mt-1.5 text-xs sm:text-sm"
                          value={doubtQuestion}
                          onChange={(e) => setDoubtQuestion(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button variant="hero" type="submit">
                        Post to Doubt Board
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </aside>
        </div>
      </div>

      <DoubtDiscussionModal
        doubt={selectedDoubt}
        open={doubtModalOpen}
        onOpenChange={setDoubtModalOpen}
        onReplyAdded={() => loadData()}
      />
    </>
  );
};

export default Mentors;
