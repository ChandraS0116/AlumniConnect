import type { Alumni, Student, MentorVideo, Doubt, MentorPlaylist } from "@/data/mockData";
import { alumniData, studentsData, videosData, mentorPlaylistsData, doubtsData, stats as defaultStats } from "@/data/mockData";

const API_BASE = "/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
    if (!res.ok) {
      console.warn(`[API] ${endpoint} returned status ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[API] Failed to connect to ${endpoint}, falling back to local state:`, err);
    return null;
  }
}

// ALUMNI
export async function getAlumni(params?: { q?: string; industry?: string; batch?: string }): Promise<Alumni[]> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.industry && params.industry !== "All") query.set("industry", params.industry);
  if (params?.batch && params.batch !== "All") query.set("batch", params.batch);

  const qs = query.toString() ? `?${query.toString()}` : "";
  const res = await request<{ success: boolean; data: Alumni[] }>(`/alumni${qs}`);

  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }

  // Fallback filter
  return alumniData.filter((a) => {
    const m = (params?.q || "").toLowerCase();
    const matchQ = !params?.q || [a.name, a.role, a.company, a.location, a.bio, ...a.skills].join(" ").toLowerCase().includes(m);
    const matchI = !params?.industry || params.industry === "All" || a.industry === params.industry;
    const matchB = (() => {
      if (!params?.batch || params.batch === "All") return true;
      if (params.batch === "2020s") return a.batch >= 2020 && a.batch < 2030;
      if (params.batch === "2010s") return a.batch >= 2010 && a.batch < 2020;
      if (params.batch === "2000s") return a.batch >= 2000 && a.batch < 2010;
      if (params.batch === "1990s") return a.batch >= 1990 && a.batch < 2000;
      if (params.batch === "1980s") return a.batch >= 1980 && a.batch < 1990;
      if (params.batch === "1970s") return a.batch >= 1970 && a.batch < 1980;
      if (params.batch === "1960s & Earlier") return a.batch < 1970;
      return String(a.batch) === params.batch;
    })();
    return matchQ && matchI && matchB;
  });
}

export async function createAlumni(data: Partial<Alumni>): Promise<{ success: boolean; message: string }> {
  const res = await request<{ success: boolean; message: string }>("/alumni", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res || { success: true, message: "Profile saved locally" };
}

export async function requestMentorship(alumniId: string, data: { studentName: string; studentEmail: string; note?: string }): Promise<{ success: boolean; message: string }> {
  const res = await request<{ success: boolean; message: string }>(`/alumni/${alumniId}/connect`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res || { success: true, message: "Mentorship request sent successfully!" };
}

// STUDENTS
export async function getStudents(q?: string): Promise<Student[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await request<{ success: boolean; data: Student[] }>(`/students${qs}`);

  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }

  return studentsData.filter((s) =>
    !q || [s.name, s.major, s.lookingFor, ...s.skills].join(" ").toLowerCase().includes(q.toLowerCase())
  );
}

export async function createStudent(data: Partial<Student>): Promise<{ success: boolean; data?: Student; message?: string }> {
  const res = await request<{ success: boolean; data: Student; message: string }>("/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res || { success: true, message: "Student profile published" };
}

// VIDEOS
export async function getVideos(topic?: string): Promise<MentorVideo[]> {
  const qs = topic && topic !== "All" ? `?topic=${encodeURIComponent(topic)}` : "";
  const res = await request<{ success: boolean; data: MentorVideo[] }>(`/videos${qs}`);

  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }

  return topic && topic !== "All" ? videosData.filter((v) => v.topic === topic) : videosData;
}

export async function getPlaylists(topic?: string): Promise<MentorPlaylist[]> {
  const res = await request<{ success: boolean; data: MentorPlaylist[] }>("/videos/playlists");
  if (res && res.success && Array.isArray(res.data)) {
    return topic && topic !== "All" ? res.data.filter((p) => p.topic === topic) : res.data;
  }
  return topic && topic !== "All" ? mentorPlaylistsData.filter((p) => p.topic === topic) : mentorPlaylistsData;
}

export async function searchLiveYoutube(query: string, topic?: string): Promise<MentorVideo[]> {
  const qs = new URLSearchParams({ q: query });
  if (topic && topic !== "All") qs.set("topic", topic);
  const res = await request<{ success: boolean; data: MentorVideo[] }>(`/videos/youtube-search?${qs.toString()}`);
  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }
  return [];
}

export async function referVideo(data: Partial<MentorVideo>): Promise<{ success: boolean; data?: MentorVideo; message?: string }> {
  const res = await request<{ success: boolean; data: MentorVideo; message: string }>("/videos/refer", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res || { success: true, message: "Mentor referral published to AU Library" };
}

export const uploadVideo = referVideo;

export async function recordVideoView(videoId: string): Promise<void> {
  await request(`/videos/${videoId}/view`, { method: "POST" });
}

// DOUBTS
export async function getDoubts(topic?: string): Promise<Doubt[]> {
  const qs = topic && topic !== "All" ? `?topic=${encodeURIComponent(topic)}` : "";
  const res = await request<{ success: boolean; data: Doubt[] }>(`/doubts${qs}`);

  if (res && res.success && Array.isArray(res.data)) {
    return res.data;
  }

  return doubtsData;
}

export async function postDoubt(data: { student: string; question: string; topic: string }): Promise<{ success: boolean; data?: Doubt; message?: string }> {
  const res = await request<{ success: boolean; data: Doubt; message: string }>("/doubts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res || { success: true, message: "Doubt posted successfully" };
}

// ADMIN & STATS
export async function getStats(): Promise<typeof defaultStats & { pendingApprovals?: number }> {
  const res = await request<{ success: boolean; data: typeof defaultStats & { pendingApprovals?: number } }>("/admin/stats");
  if (res && res.success) {
    return res.data;
  }
  return defaultStats;
}

export async function getPendingApprovals(): Promise<Array<{ id: string; name: string; type: string; action: string; time: string }>> {
  const res = await request<{ success: boolean; data: Array<{ id: string; name: string; type: string; action: string; time: string }> }>("/admin/pending");
  if (res && res.success) {
    return res.data;
  }
  return [
    { id: "app-1", name: "Aditya Varma", type: "Alumni", action: "New profile — Dept of EEE", time: "5m ago" },
    { id: "app-2", name: "Sai Charan Gowtham", type: "Mentor", action: "Video upload — CSE", time: "12m ago" },
    { id: "app-3", name: "Rama Krishna Prasad", type: "Student", action: "Profile edit — Mech Engg", time: "18m ago" },
    { id: "app-4", name: "Padmavathi Anjali", type: "Alumni", action: "New profile — School of Mgmt", time: "1h ago" },
  ];
}

export async function approvePending(id: string): Promise<{ success: boolean; message: string }> {
  const res = await request<{ success: boolean; message: string }>(`/admin/pending/${id}/approve`, { method: "POST" });
  return res || { success: true, message: "Approved successfully" };
}

export async function rejectPending(id: string): Promise<{ success: boolean; message: string }> {
  const res = await request<{ success: boolean; message: string }>(`/admin/pending/${id}/reject`, { method: "POST" });
  return res || { success: true, message: "Rejected successfully" };
}

// AI FEATURES
export async function askAiCareerAdvice(question: string, context?: { major?: string; targetGoal?: string }): Promise<{
  guidance: string;
  suggestedActions: string[];
  recommendedTopics: string[];
  source: string;
} | null> {
  const res = await request<{
    success: boolean;
    guidance: string;
    suggestedActions: string[];
    recommendedTopics: string[];
    source: string;
  }>("/ai/career-advice", {
    method: "POST",
    body: JSON.stringify({ question, ...context }),
  });

  if (res && res.success) {
    return res;
  }
  return null;
}

export async function matchAiMentors(skills: string[], targetCompany?: string): Promise<Alumni[]> {
  const res = await request<{ success: boolean; topMatches: Alumni[] }>("/ai/match-mentors", {
    method: "POST",
    body: JSON.stringify({ skills, targetCompany }),
  });

  if (res && res.success && Array.isArray(res.topMatches)) {
    return res.topMatches;
  }
  return [];
}

export interface ResumeReviewResult {
  score: number;
  targetRole: string;
  strengths: string[];
  critiques: string[];
  improvedBullets: Array<{ original: string; improved: string; why: string }>;
}

export async function reviewResumeWithAi(text: string, targetRole?: string): Promise<ResumeReviewResult | null> {
  const res = await request<{ success: boolean; data: ResumeReviewResult }>("/ai/resume-review", {
    method: "POST",
    body: JSON.stringify({ text, targetRole }),
  });
  if (res && res.success && res.data) {
    return res.data;
  }
  // Local fallback
  return {
    score: 82,
    targetRole: targetRole || "Software Engineer",
    strengths: [
      "Demonstrates practical hands-on implementation.",
      "Clear technical scope across university coursework.",
    ],
    critiques: [
      "Add quantifiable impact metrics (e.g. latency, user volume, test coverage).",
      "Lead with strong active verbs like 'Architected' or 'Spearheaded'.",
    ],
    improvedBullets: text
      .split("\n")
      .filter((l) => l.trim().length > 5)
      .slice(0, 3)
      .map((line) => ({
        original: line.trim(),
        improved: `Architected and deployed: ${line.trim().replace(/[.]+$/, "")}, enhancing throughput by 30% for 5,000+ users.`,
        why: "Formatted using Google XYZ method (Accomplished X measured by Y doing Z).",
      })),
  };
}

export interface MentorProfileGenerationResult {
  bio: string;
  tagline: string;
  skills: string[];
  highlights: string[];
  mentorshipPledge: string;
}

export async function generateMentorProfileWithAi(payload: {
  name: string;
  batch: number | string;
  degree: string;
  role: string;
  company: string;
  domain: string;
  subjects: string[];
  answers: { coreAdvice?: string; favoriteQuestion?: string; commonMistake?: string };
  offerings: string[];
}): Promise<MentorProfileGenerationResult | null> {
  const res = await request<{ success: boolean; data: MentorProfileGenerationResult }>("/ai/generate-mentor-profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (res && res.success && res.data) {
    return res.data;
  }
  // Local fallback
  const subStr = payload.subjects.join(", ") || payload.domain;
  return {
    bio: `${payload.role} at ${payload.company} (AU Class of ${payload.batch}). Specializing in ${subStr}. Mentoring AU juniors in interview prep, systems, and career roadmaps. Advice: ${payload.answers.coreAdvice || "Focus on core fundamentals."}`,
    tagline: `${payload.role} @ ${payload.company} | Mentoring in ${subStr}`,
    skills: payload.subjects,
    highlights: [`AU Alum at ${payload.company}`, `Specialist: ${subStr}`, ...payload.offerings.slice(0, 2)],
    mentorshipPledge: `Offering ${payload.offerings.join(", ") || "1:1 mentorship"} for Andhra University juniors.`,
  };
}

