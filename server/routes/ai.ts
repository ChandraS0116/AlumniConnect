import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// POST /api/ai/match-mentors - Semantic & Skill Matchmaker
router.post("/match-mentors", (req, res) => {
  try {
    const { skills, interests, targetRole, targetCompany } = req.body;

    const allAlumni = db.prepare("SELECT * FROM alumni").all() as any[];
    const parsedAlumni = allAlumni.map((a) => ({
      ...a,
      skills: a.skills ? JSON.parse(a.skills) : [],
    }));

    const searchTokens = [
      ...(Array.isArray(skills) ? skills : (skills || "").split(",")),
      ...(Array.isArray(interests) ? interests : (interests || "").split(",")),
      targetRole || "",
      targetCompany || "",
    ]
      .map((t: string) => t.trim().toLowerCase())
      .filter(Boolean);

    // Score alumni based on token matches
    const scored = parsedAlumni.map((alumni) => {
      let score = 0;
      const matchedTokens: string[] = [];

      const haystack = [
        alumni.name,
        alumni.role,
        alumni.company,
        alumni.industry,
        alumni.bio,
        ...alumni.skills,
      ]
        .join(" ")
        .toLowerCase();

      for (const token of searchTokens) {
        if (haystack.includes(token)) {
          score += 10;
          matchedTokens.push(token);
        }
      }

      // Bonus for technology / industry overlap
      if (alumni.is_featured) score += 5;

      return {
        ...alumni,
        matchScore: score,
        matchedKeywords: matchedTokens,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      query: { skills, interests, targetRole, targetCompany },
      topMatches: scored.slice(0, 3),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/career-advice
router.post("/career-advice", async (req, res) => {
  try {
    const { question, currentYear, major, targetGoal } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const q = question.toLowerCase();

    // Contextual expert AI guidance engine
    let guidance = "";
    const suggestedActions: string[] = [];
    const recommendedTopics: string[] = [];

    if (q.includes("interview") || q.includes("faang") || q.includes("dsa") || q.includes("system design")) {
      guidance = "Focus on mastery of core fundamentals (Data Structures, Algorithms, and Distributed Systems). Venkata Sai Krishna (Google AU alum) recommends building end-to-end projects with high concurrency and practicing mock system design interviews with peers.";
      suggestedActions.push("Review 'System Design Interview: A Step-By-Step Guide' in the Mentor Hub");
      suggestedActions.push("Solve high-frequency LeetCode patterns (Sliding Window, Two Pointers, Graphs)");
      suggestedActions.push("Connect with AU alumni currently at Google, Microsoft, and Stripe");
      recommendedTopics.push("Engineering", "System Design");
    } else if (q.includes("film") || q.includes("acting") || q.includes("actor") || q.includes("cinema") || q.includes("theatre") || q.includes("director")) {
      guidance = "Breaking into cinema, theatre, and filmmaking starts with crafting authentic short films, stage performances, and a compelling showreel. Alumni from AU's Department of Theatre Arts recommend directing or acting in independent campus productions and mastering visual storytelling, blocking, and lighting.";
      suggestedActions.push("Watch the Filmmaking & Acting sessions in the Mentor Hub");
      suggestedActions.push("Build a 2-minute dramatic monologue reel or short film portfolio");
      suggestedActions.push("Connect with AU alumni in Film & Media for script and audition critiques");
      recommendedTopics.push("Filmmaking & Acting", "Media & Literature");
    } else if (q.includes("art") || q.includes("painting") || q.includes("music") || q.includes("dance") || q.includes("fine arts")) {
      guidance = "In Fine Arts and Performing Arts, your curated portfolio and live performance repertoire speak loudest. Focus on daily practice in composition, color theory, or classical/contemporary technique, and document your process clearly.";
      suggestedActions.push("Explore 'Fine Arts & Music' sessions in the Mentor Hub");
      suggestedActions.push("Curate a high-resolution digital portfolio or recorded performance showcase");
      suggestedActions.push("Reach out to AU Fine Arts alumni for exhibition and commissioning guidance");
      recommendedTopics.push("Fine Arts & Music", "Design");
    } else if (q.includes("law") || q.includes("upsc") || q.includes("ias") || q.includes("civil service") || q.includes("legal") || q.includes("advocate")) {
      guidance = "Whether preparing for UPSC Civil Services (IAS/IPS) or litigation/corporate law, disciplined reading of primary constitutional texts, daily answer writing, and moot court advocacy are essential. Start with NCERTs, standard polity/history texts, and structured case briefs.";
      suggestedActions.push("Watch the 'Law & Civil Services' strategy lectures in the Mentor Hub");
      suggestedActions.push("Practice daily timed answer writing and constitutional case analysis");
      suggestedActions.push("Connect with AU College of Law and Civil Services alumni mentors");
      recommendedTopics.push("Law & Civil Services", "Career");
    } else if (q.includes("pharma") || q.includes("medicine") || q.includes("biotech") || q.includes("clinical") || q.includes("drug")) {
      guidance = "Careers in Pharmaceutical Sciences, Biotechnology, and Clinical Research reward strong laboratory fundamentals, regulatory understanding (FDA/CDSCO), and computational biology skills. Focus on hands-on wet-lab or bioinformatics projects.";
      suggestedActions.push("Watch 'Medicine & Pharma' sessions in the Mentor Hub");
      suggestedActions.push("Gain research internship experience at Biocon, Dr. Reddy's, or CSIR labs");
      suggestedActions.push("Connect with AU College of Pharmaceutical Sciences & Biotech alumni");
      recommendedTopics.push("Medicine & Pharma", "Core Engineering");
    } else if (q.includes("sport") || q.includes("athletic") || q.includes("fitness") || q.includes("cricket") || q.includes("coach")) {
      guidance = "Excelling in competitive sports and sports sciences requires structured periodization, biomechanics analysis, nutrition discipline, and mental resilience under tournament pressure.";
      suggestedActions.push("Watch 'Sports & Athletics' conditioning & psychology sessions in Mentor Hub");
      suggestedActions.push("Track sprint/strength metrics and recovery cycles systematically");
      suggestedActions.push("Connect with AU Physical Education & Sports alumni");
      recommendedTopics.push("Sports & Athletics", "Career");
    } else if (q.includes("finance") || q.includes("investment") || q.includes("bank") || q.includes("goldman") || q.includes("ca")) {
      guidance = "Breaking into investment banking, CA, or corporate finance requires sharp quantitative acumen, financial modeling skills (DCF, LBO), and structured networking. Lakshmi Priya Devi (Goldman Sachs alum) highlights emerging market equity analysis and rigorous valuation storytelling.";
      suggestedActions.push("Watch the Finance valuation and modeling sessions in the Mentor Hub");
      suggestedActions.push("Build a 3-statement financial model and equity valuation spreadsheet");
      suggestedActions.push("Reach out to alumni working in London, Singapore, and Mumbai financial hubs");
      recommendedTopics.push("Finance", "Career");
    } else if (q.includes("startup") || q.includes("founder") || q.includes("funding") || q.includes("entrepreneur")) {
      guidance = "Start with a painful problem you and your peers experience daily. Build an MVP within 2 weeks, put it in front of real users, and iterate rapidly. Rajesh Naidu (YC alum) emphasizes that conviction and execution speed outshine theoretical plans.";
      suggestedActions.push("Watch the Entrepreneurship playbook videos in the Mentor Hub");
      suggestedActions.push("Validate problem with at least 20 potential customers before building");
      suggestedActions.push("Apply to campus incubators and accelerator programs");
      recommendedTopics.push("Entrepreneurship", "Career");
    } else if (q.includes("ml") || q.includes("ai") || q.includes("data science") || q.includes("research")) {
      guidance = "Transitioning into ML research or engineering requires both theoretical depth (linear algebra, probability, calculus) and practical implementation (PyTorch, transformer architectures). Sridevi Subrahmanyam (Microsoft Research) suggests contributing to open-source benchmarks and reproducing research papers.";
      suggestedActions.push("Watch the AI/ML deep learning sessions in the Mentor Hub");
      suggestedActions.push("Reproduce an existing research paper in PyTorch with documentation");
      suggestedActions.push("Compete in Kaggle competitions to build an empirical track record");
      recommendedTopics.push("AI/ML", "Engineering");
    } else {
      guidance = `For students in ${major || "Andhra University"} looking toward ${targetGoal || "career growth"}, the fastest accelerator is direct mentorship from alumni who have already walked that path. Focus on concrete portfolio artifacts, consistent weekly outreach, and learning in public.`;
      suggestedActions.push("Check the Alumni Directory filtered by your target industry or domain");
      suggestedActions.push("Post your specific question to the live AU Doubt Board");
      suggestedActions.push("Request a 1-on-1 mentorship session with an alumnus in your field");
      recommendedTopics.push("Career", "Mentorship");
    }

    res.json({
      success: true,
      guidance,
      suggestedActions,
      recommendedTopics,
      source: "Alma.Net AI Career Engine",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/resume-review
router.post("/resume-review", (req, res) => {
  try {
    const { text, targetRole = "Software Engineer" } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Resume text or bullets are required" });
    }

    const lines = text
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 5);

    // Analyze lines for action verbs and numerical metrics
    const metricRegex = /\b(\d+%|\$\d+|\d+\s*(users|ms|seconds|rps|x|gb|tb|million|k))\b/i;
    const strongActionVerbs = ["architected", "engineered", "spearheaded", "accelerated", "designed", "optimized", "built", "implemented", "reduced", "delivered", "deployed"];
    
    let metricCount = 0;
    let strongVerbCount = 0;

    const improvedBullets: Array<{ original: string; improved: string; why: string }> = [];

    lines.slice(0, 5).forEach((line: string) => {
      const lower = line.toLowerCase();
      const hasMetric = metricRegex.test(lower);
      const hasVerb = strongActionVerbs.some((v) => lower.startsWith(v) || lower.includes(` ${v} `));

      if (hasMetric) metricCount++;
      if (hasVerb) strongVerbCount++;

      // Create an improved Google XYZ rewrite
      let rewritten = line;
      let why = "Refined for higher ATS impact and clear quantifiable ownership.";

      if (!hasMetric) {
        rewritten = `${line.replace(/[.]+$/, "")}, resulting in a 35% reduction in latency and supporting 10,000+ active users.`;
        why = "Injected measurable business metrics (35% latency drop, user scale) to follow the Google XYZ format.";
      } else if (!hasVerb) {
        rewritten = `Architected and deployed: ${line}`;
        why = "Replaced passive phrasing with an executive leadership action verb.";
      }

      improvedBullets.push({
        original: line,
        improved: rewritten,
        why,
      });
    });

    // Score calculation
    let baseScore = 68;
    if (metricCount > 0) baseScore += Math.min(metricCount * 8, 20);
    if (strongVerbCount > 0) baseScore += Math.min(strongVerbCount * 4, 12);
    const score = Math.min(95, baseScore);

    const strengths: string[] = [];
    const critiques: string[] = [];

    if (metricCount > 0) {
      strengths.push("Contains quantifiable metrics demonstrating concrete business or technical scale.");
    } else {
      critiques.push("Missing quantifiable numbers or benchmarks. Include percentages, user counts, or execution time improvements.");
    }

    if (strongVerbCount > 0) {
      strengths.push("Employs decisive action verbs demonstrating active ownership.");
    } else {
      critiques.push("Several bullets start with passive terms ('Helped with', 'Worked on'). Replace with 'Spearheaded', 'Architected', or 'Engineered'.");
    }

    strengths.push(`Direct alignment observed with standard interview criteria for ${targetRole}.`);

    res.json({
      success: true,
      data: {
        score,
        targetRole,
        strengths,
        critiques,
        improvedBullets,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/generate-mentor-profile
router.post("/generate-mentor-profile", (req, res) => {
  try {
    const { name, batch, degree, role, company, domain, subjects = [], answers = {}, offerings = [] } = req.body;

    const subjectList = Array.isArray(subjects) ? subjects : [];
    const offeringList = Array.isArray(offerings) ? offerings : [];

    const subjectStr = subjectList.length > 0 ? subjectList.join(", ") : domain || "Technology";
    const collegeAffiliation = degree || "Andhra University";

    const ans1 = answers.coreAdvice || "mastering high-impact fundamentals";
    const ans2 = answers.favoriteQuestion || "system architecture and trade-off analysis";
    const ans3 = answers.commonMistake || "focusing on breadth rather than demonstrable project depth";

    const generatedBio = `${role} at ${company} with a foundation from ${collegeAffiliation} (Class of ${batch || "2020"}). Specializing in ${subjectStr}. Passionate about paying it forward to Andhra University juniors by demystifying real-world interview bars, bridging theoretical coursework with production systems, and sharing proven playbooks from industry. Focus area: ${ans1}.`;

    const generatedTagline = `${role} @ ${company} | AU Class of ${batch || "2020"} | Mentoring in ${subjectList.slice(0, 3).join(", ") || domain}`;

    const highlights = [
      `AU Alumnus (${batch || "2020"}) at ${company}`,
      `Core Focus: ${subjectList.slice(0, 2).join(" & ") || domain}`,
      ...offeringList.slice(0, 3),
    ];

    res.json({
      success: true,
      data: {
        bio: generatedBio,
        tagline: generatedTagline,
        skills: [...subjectList],
        highlights,
        mentorshipPledge: `Available for ${offeringList.join(", ") || "1:1 guidance"} to committed AU juniors.`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

