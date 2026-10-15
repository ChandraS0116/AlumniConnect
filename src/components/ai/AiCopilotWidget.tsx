import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, X, Send, Bot, Users, ArrowRight, Lightbulb, Compass, Award, FileText, CheckCircle2, TrendingUp, Check } from "lucide-react";
import { askAiCareerAdvice, matchAiMentors, reviewResumeWithAi, ResumeReviewResult } from "@/lib/api";
import { Alumni } from "@/data/mockData";
import { AlumniCard } from "@/components/dashboard/AlumniCard";

export const AiCopilotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"advice" | "matcher" | "resume">("advice");

  // Advice tab state
  const [question, setQuestion] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [adviceResult, setAdviceResult] = useState<{
    guidance: string;
    suggestedActions: string[];
    recommendedTopics: string[];
  } | null>(null);

  // Matcher tab state
  const [skillsQuery, setSkillsQuery] = useState("");
  const [companyQuery, setCompanyQuery] = useState("");
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchedAlumni, setMatchedAlumni] = useState<Alumni[]>([]);
  const [hasSearchedMatch, setHasSearchedMatch] = useState(false);

  // Resume Review tab state
  const [resumeText, setResumeText] = useState("");
  const [resumeTargetRole, setResumeTargetRole] = useState("Software Engineer (SDE)");
  const [loadingResume, setLoadingResume] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeReviewResult | null>(null);


  const sampleQuestions = [
    "How do I prepare for FAANG SDE interviews from AU?",
    "Breaking into Investment Banking from AU School of Management",
    "Transitioning from mechanical engineering into software",
    "Demystifying ML research & building a portfolio",
  ];

  const handleAskAdvice = async (qText?: string) => {
    const query = qText || question;
    if (!query.trim()) return;

    setLoadingAdvice(true);
    setAdviceResult(null);

    const res = await askAiCareerAdvice(query.trim());
    setLoadingAdvice(false);
    if (res) {
      setAdviceResult(res);
    }
  };

  const handleMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!skillsQuery.trim() && !companyQuery.trim()) return;

    setLoadingMatch(true);
    setHasSearchedMatch(true);

    const skills = skillsQuery.split(",").map((s) => s.trim()).filter(Boolean);
    const matches = await matchAiMentors(skills, companyQuery.trim());
    setLoadingMatch(false);
    setMatchedAlumni(matches);
  };

  const handleReviewResume = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!resumeText.trim()) return;

    setLoadingResume(true);
    setResumeResult(null);

    const res = await reviewResumeWithAi(resumeText.trim(), resumeTargetRole);
    setLoadingResume(false);
    if (res) {
      setResumeResult(res);
    }
  };

  const handleInsertSampleResume = () => {
    setResumeText(
      "Built a web platform for university students using React and Node.js.\nHelped improve database queries and added caching with Redis.\nAssisted the team in deploying code to AWS and fixing bugs."
    );
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gold-gradient text-primary p-3.5 rounded-full shadow-gold hover:scale-105 active:scale-95 transition-smooth flex items-center gap-2 group border-2 border-card font-serif font-bold text-sm"
        aria-label="Open AI Career Copilot"
      >
        <Sparkles className="h-5 w-5 animate-spin-slow" />
        <span className="hidden sm:inline font-sans text-xs tracking-wide uppercase font-bold text-primary">
          AU AI Copilot
        </span>
      </button>

      {/* Floating Drawer / Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-background border-l border-border shadow-2xl flex flex-col animate-fade-up">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-5 border-b border-primary-glow flex items-start justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary-foreground">
                AI Career Copilot
              </h2>
              <p className="text-xs text-primary-foreground/75 mt-0.5">
                Instant guidance & alumni matching for Andhra University students.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-glow transition-smooth"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-border bg-secondary/40 p-1">
            <button
              onClick={() => setActiveTab("advice")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-smooth flex items-center justify-center gap-1 ${
                activeTab === "advice"
                  ? "bg-background text-primary shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Compass className="h-3.5 w-3.5" /> Guidance
            </button>
            <button
              onClick={() => setActiveTab("matcher")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-smooth flex items-center justify-center gap-1 ${
                activeTab === "matcher"
                  ? "bg-background text-primary shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" /> Matchmaker
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-smooth flex items-center justify-center gap-1 ${
                activeTab === "resume"
                  ? "bg-background text-primary shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Resume AI
            </button>
          </div>


          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activeTab === "advice" ? (
              <>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ask AU Career Assistant:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. How to break into Google or Microsoft?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAskAdvice()}
                      className="text-sm bg-background"
                    />
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => handleAskAdvice()}
                      disabled={loadingAdvice || !question.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {!adviceResult && !loadingAdvice && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5 text-accent" /> Frequently Asked by AU Students:
                    </p>
                    <div className="space-y-1.5">
                      {sampleQuestions.map((sq) => (
                        <button
                          key={sq}
                          onClick={() => {
                            setQuestion(sq);
                            handleAskAdvice(sq);
                          }}
                          className="w-full text-left text-xs p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary text-foreground/80 hover:text-primary transition-smooth border border-border/50 flex items-center justify-between group"
                        >
                          <span>{sq}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-smooth text-accent" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {loadingAdvice && (
                  <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                    <Sparkles className="h-6 w-6 text-accent mx-auto animate-spin-slow" />
                    <p>Analyzing AU alumni journeys and generating recommendations...</p>
                  </div>
                )}

                {adviceResult && (
                  <Card className="p-4 bg-card-gradient border-border/80 shadow-soft space-y-3.5 animate-fade-up">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gold-gradient text-primary border-0 font-semibold text-[10px]">
                        AI Career Guidance
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Alma.Net AI Engine</span>
                    </div>

                    <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                      {adviceResult.guidance}
                    </p>

                    {adviceResult.suggestedActions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/60">
                        <p className="text-xs font-semibold text-primary">Recommended Action Items:</p>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {adviceResult.suggestedActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="h-4 w-4 rounded-full bg-accent/20 text-accent font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="text-foreground/80">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                )}
              </>
            ) : activeTab === "matcher" ? (
              <>
                <form onSubmit={handleMatch} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Skills & Technologies
                    </label>
                    <Input
                      placeholder="e.g. Go, Kubernetes, System Design"
                      value={skillsQuery}
                      onChange={(e) => setSkillsQuery(e.target.value)}
                      className="mt-1 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Target Company / Industry
                    </label>
                    <Input
                      placeholder="e.g. Google, Microsoft, Goldman Sachs"
                      value={companyQuery}
                      onChange={(e) => setCompanyQuery(e.target.value)}
                      className="mt-1 text-sm bg-background"
                    />
                  </div>
                  <Button
                    variant="hero"
                    type="submit"
                    className="w-full"
                    disabled={loadingMatch || (!skillsQuery && !companyQuery)}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" /> Find Matching Mentors
                  </Button>
                </form>

                {loadingMatch && (
                  <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                    <Sparkles className="h-6 w-6 text-accent mx-auto animate-spin-slow" />
                    <p>Scoring 12,000+ alumni by skills and career paths...</p>
                  </div>
                )}

                {hasSearchedMatch && !loadingMatch && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Top Matched Alumni ({matchedAlumni.length})
                    </p>
                    {matchedAlumni.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        No direct matches found. Try broadening your skills.
                      </p>
                    ) : (
                      matchedAlumni.map((a) => (
                        <div key={a.id} className="scale-95 origin-top -my-1">
                          <AlumniCard a={a} />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Target Role:
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-6 px-2 text-accent hover:text-accent font-semibold"
                        onClick={handleInsertSampleResume}
                      >
                        <Sparkles className="h-3 w-3 mr-1" /> Insert Sample Bullets
                      </Button>
                    </div>
                    <select
                      value={resumeTargetRole}
                      onChange={(e) => setResumeTargetRole(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="Software Engineer (SDE)">Software Engineer (SDE / FAANG)</option>
                      <option value="Machine Learning Engineer">Machine Learning / AI Engineer</option>
                      <option value="Investment Banking Analyst">Investment Banking Analyst</option>
                      <option value="Product Manager">Product Manager (0-to-1 PM)</option>
                      <option value="Product Designer">UI/UX Product Designer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                      Paste Resume Bullets or Project Descriptions:
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="e.g. Built a student portal using React and Node.js. Optimized database queries and added Redis caching."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="text-xs font-sans leading-relaxed bg-background"
                    />
                  </div>

                  <Button
                    variant="hero"
                    className="w-full bg-gold-gradient text-primary font-bold shadow-gold"
                    onClick={handleReviewResume}
                    disabled={loadingResume || !resumeText.trim()}
                  >
                    <Bot className="h-4 w-4 mr-1.5" />
                    {loadingResume ? "Critiquing against ATS..." : "Analyze with AI (Google XYZ Formula)"}
                  </Button>
                </div>

                {loadingResume && (
                  <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
                    <Sparkles className="h-6 w-6 text-accent mx-auto animate-spin-slow" />
                    <p>Scoring bullets against ATS benchmarks & executive action verbs...</p>
                  </div>
                )}

                {resumeResult && !loadingResume && (
                  <div className="space-y-4 pt-2">
                    {/* Score banner */}
                    <div className="rounded-xl bg-card border border-border/70 p-4 shadow-soft">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            ATS & Impact Rating
                          </div>
                          <div className="text-2xl font-serif font-bold text-primary">
                            {resumeResult.score}<span className="text-sm font-normal text-muted-foreground"> / 100</span>
                          </div>
                        </div>
                        <Badge className="bg-gold-gradient text-primary border-0 font-bold text-xs">
                          {resumeResult.score >= 85 ? "Strong Candidate" : "Needs Quantification"}
                        </Badge>
                      </div>

                      {/* Strengths */}
                      <div className="mt-3 pt-3 border-t border-border/60 space-y-1">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Strengths Identified:
                        </div>
                        {resumeResult.strengths.map((s, idx) => (
                          <div key={idx} className="text-xs text-foreground/85 flex items-start gap-1.5 pl-1">
                            <span className="text-accent">•</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>

                      {/* Critiques */}
                      {resumeResult.critiques.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-border/60 space-y-1">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5" /> Recommended Improvements:
                          </div>
                          {resumeResult.critiques.map((c, idx) => (
                            <div key={idx} className="text-xs text-foreground/85 flex items-start gap-1.5 pl-1">
                              <span className="text-amber-500">•</span>
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Rewritten Bullets (Google XYZ) */}
                    {resumeResult.improvedBullets.length > 0 && (
                      <div className="space-y-2.5">
                        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Google XYZ Method Rewrites:
                        </div>
                        {resumeResult.improvedBullets.map((b, idx) => (
                          <Card key={idx} className="p-3 bg-secondary/30 border-border/70 text-xs space-y-1.5">
                            <div className="text-muted-foreground line-through opacity-75">
                              "{b.original}"
                            </div>
                            <div className="font-medium text-foreground bg-accent/10 border-l-2 border-accent p-2 rounded">
                              ✨ {b.improved}
                            </div>
                            <div className="text-[11px] text-muted-foreground italic">
                              Why: {b.why}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
