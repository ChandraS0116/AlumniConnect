import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { alumniData, videosData, mentorPlaylistsData } from "../src/data/mockData.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "alumni.db");
export const db = new DatabaseSync(dbPath);

// Enable WAL mode for high performance
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Initialize Schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS alumni (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      batch INTEGER NOT NULL,
      degree TEXT NOT NULL,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      industry TEXT NOT NULL,
      linkedin TEXT,
      github TEXT,
      bio TEXT,
      skills TEXT,
      achievements TEXT,
      email TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT,
      year TEXT NOT NULL,
      major TEXT NOT NULL,
      linkedin TEXT,
      github TEXT,
      bio TEXT,
      skills TEXT,
      looking_for TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      thumbnail TEXT,
      mentor TEXT NOT NULL,
      mentor_avatar TEXT,
      duration TEXT,
      views INTEGER DEFAULT 0,
      topic TEXT NOT NULL,
      posted_ago TEXT,
      description TEXT,
      youtube_url TEXT NOT NULL,
      youtube_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS doubts (
      id TEXT PRIMARY KEY,
      student TEXT NOT NULL,
      student_avatar TEXT,
      question TEXT NOT NULL,
      topic TEXT NOT NULL,
      replies INTEGER DEFAULT 0,
      status TEXT DEFAULT 'open',
      posted_ago TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS doubt_replies (
      id TEXT PRIMARY KEY,
      doubt_id TEXT NOT NULL,
      author TEXT NOT NULL,
      author_role TEXT,
      author_avatar TEXT,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (doubt_id) REFERENCES doubts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pending_approvals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      action TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mentorship_requests (
      id TEXT PRIMARY KEY,
      student_name TEXT NOT NULL,
      student_email TEXT NOT NULL,
      alumni_id TEXT NOT NULL,
      note TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      avatar TEXT,
      batch INTEGER,
      major TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      mentor TEXT NOT NULL,
      mentor_avatar TEXT,
      mentor_role TEXT,
      mentor_batch TEXT,
      why_curated TEXT,
      thumbnails TEXT,
      video_ids TEXT,
      total_duration TEXT,
      video_count INTEGER DEFAULT 0,
      students_following INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Ensure columns exist on videos table for AU Mentor Referrals
  try { db.exec("ALTER TABLE videos ADD COLUMN mentor_role TEXT;"); } catch (_e) { /* column exists */ }
  try { db.exec("ALTER TABLE videos ADD COLUMN mentor_note TEXT;"); } catch (_e) { /* column exists */ }
  try { db.exec("ALTER TABLE videos ADD COLUMN channel_name TEXT;"); } catch (_e) { /* column exists */ }
  try { db.exec("ALTER TABLE videos ADD COLUMN recommended_for TEXT;"); } catch (_e) { /* column exists */ }
  try { db.exec("ALTER TABLE videos ADD COLUMN referral_type TEXT DEFAULT 'mentor_referral';"); } catch (_e) { /* column exists */ }

  // Seed default data if empty
  const alumniCount = (db.prepare("SELECT count(*) as count FROM alumni").get() as { count: number })?.count ?? 0;
  if (alumniCount === 0) {
    seedInitialData();
  }

  const usersCount = (db.prepare("SELECT count(*) as count FROM users").get() as { count: number })?.count ?? 0;
  if (usersCount === 0) {
    seedUsersAndReplies();
  }

  // Ensure all curated real YouTube masterclasses are synced
  syncCuratedVideos();
}

function seedInitialData() {
  const av = (seed: string) =>
    `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

  const seedAlumni = [
    { id: "1", name: "Venkata Sai Krishna", avatar: av("venkata"), batch: 2018, degree: "B.Tech CSE — AUCE", role: "Senior Software Engineer", company: "Google", location: "Hyderabad, IN", industry: "Technology", linkedin: "https://linkedin.com/in/venkatasai", github: "https://github.com/venkatasai", bio: "Building large-scale distributed systems. Mentoring AU juniors every weekend.", skills: JSON.stringify(["Go", "Kubernetes", "System Design"]), achievements: JSON.stringify(["AU Gold Medal 2018"]), email: "venkata@andhrauniv.edu.in", is_featured: 1 },
    { id: "2", name: "Lakshmi Priya Devi", avatar: av("lakshmi"), batch: 2019, degree: "MBA Finance — AU School of Mgmt", role: "Investment Analyst", company: "Goldman Sachs", location: "London, UK", industry: "Finance", linkedin: "https://linkedin.com/in/lakshmipriya", github: "", bio: "Equity research on emerging markets. Bharatanatyam dancer.", skills: JSON.stringify(["Valuation", "M&A", "Excel"]), achievements: JSON.stringify([]), email: "lakshmi@andhrauniv.edu.in", is_featured: 1 },
    { id: "3", name: "Rajesh Naidu", avatar: av("rajesh"), batch: 2017, degree: "B.Tech ECE — AUCE", role: "Founder & CEO", company: "Lumenite Labs", location: "Bengaluru, IN", industry: "Startup", linkedin: "https://linkedin.com/in/rajeshnaidu", github: "https://github.com/rajeshnaidu", bio: "Hardware-software bridge. YC W22 alum.", skills: JSON.stringify(["IoT", "Leadership", "Product"]), achievements: JSON.stringify(["Forbes 30u30 Asia"]), email: "rajesh@andhrauniv.edu.in", is_featured: 1 },
    { id: "4", name: "Sridevi Subrahmanyam", avatar: av("sridevi"), batch: 2020, degree: "M.Sc Data Science — Dept of CS", role: "ML Research Scientist", company: "Microsoft Research", location: "Bengaluru, IN", industry: "Technology", linkedin: "https://linkedin.com/in/sridevis", github: "https://github.com/sridevis", bio: "LLM alignment & evaluation research.", skills: JSON.stringify(["PyTorch", "NLP", "Research"]), achievements: JSON.stringify([]), email: "sridevi@andhrauniv.edu.in", is_featured: 1 },
    { id: "5", name: "Kishore Varma", avatar: av("kishore"), batch: 2016, degree: "B.Arch — College of Architecture", role: "Principal Architect", company: "Hafeez Contractor", location: "Mumbai, IN", industry: "Architecture", linkedin: "https://linkedin.com/in/kishorevarma", github: "", bio: "Sustainable urban design. Featured in Architectural Digest India.", skills: JSON.stringify(["Revit", "Sustainability", "Urban Planning"]), achievements: JSON.stringify([]), email: "kishore@andhrauniv.edu.in", is_featured: 1 },
    { id: "6", name: "Meghana Reddy", avatar: av("meghana"), batch: 2021, degree: "M.Sc Biotechnology — AU College of Sci", role: "Research Associate", company: "Biocon", location: "Bengaluru, IN", industry: "Healthcare", linkedin: "https://linkedin.com/in/meghanareddy", github: "", bio: "CRISPR-based gene therapy. Filter coffee enthusiast.", skills: JSON.stringify(["Lab Tech", "Bioinformatics"]), achievements: JSON.stringify([]), email: "meghana@andhrauniv.edu.in", is_featured: 1 },
    { id: "7", name: "Suresh Babu Chowdary", avatar: av("suresh"), batch: 2015, degree: "MBA — AU School of Mgmt", role: "VP Strategy", company: "McKinsey", location: "Singapore", industry: "Consulting", linkedin: "https://linkedin.com/in/sureshchowdary", github: "", bio: "Helping Fortune 500s navigate digital transformation.", skills: JSON.stringify(["Strategy", "Leadership"]), achievements: JSON.stringify(["Partner-track 2024"]), email: "suresh@andhrauniv.edu.in", is_featured: 0 },
    { id: "8", name: "Ananya Lakshmi Iyer", avatar: av("ananya"), batch: 2019, degree: "B.Des — Dept of Fine Arts", role: "Lead Product Designer", company: "Figma", location: "Remote", industry: "Design", linkedin: "https://linkedin.com/in/ananyaiyer", github: "", bio: "Crafting tools that designers love.", skills: JSON.stringify(["Figma", "UX Research", "Prototyping"]), achievements: JSON.stringify([]), email: "ananya@andhrauniv.edu.in", is_featured: 0 },
    { id: "9", name: "Manikanta Pavan Kumar", avatar: av("manikanta"), batch: 2018, degree: "B.Tech CSE — AUCE", role: "Staff Engineer", company: "Stripe", location: "Dublin, IE", industry: "Fintech", linkedin: "https://linkedin.com/in/manikantak", github: "https://github.com/manikantak", bio: "Payments infrastructure at scale.", skills: JSON.stringify(["Ruby", "Distributed Systems"]), achievements: JSON.stringify([]), email: "manikanta@andhrauniv.edu.in", is_featured: 0 },
  ];

  const insertAlumni = db.prepare(`
    INSERT INTO alumni (id, name, avatar, batch, degree, role, company, location, industry, linkedin, github, bio, skills, achievements, email, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of seedAlumni) {
    insertAlumni.run(a.id, a.name, a.avatar, a.batch, a.degree, a.role, a.company, a.location, a.industry, a.linkedin, a.github, a.bio, a.skills, a.achievements, a.email, a.is_featured);
  }

  const seedStudents = [
    { id: "s1", name: "Arjun Vasanth Rao", avatar: av("arjun"), year: "Final Year", major: "Computer Science Engineering", linkedin: "https://linkedin.com/in/arjunrao", github: "https://github.com/arjunrao", bio: "Aspiring SDE. Open-source contributor at Apache. AU CSE Dept.", skills: JSON.stringify(["React", "Node", "Python"]), looking_for: "SDE Internship" },
    { id: "s2", name: "Hari Chandana", avatar: av("hari"), year: "3rd Year", major: "Electronics & Communication", linkedin: "https://linkedin.com/in/harichandana", github: "https://github.com/harichandana", bio: "Embedded systems hobbyist. Building a smart greenhouse.", skills: JSON.stringify(["C++", "Arduino", "PCB Design"]), looking_for: "Hardware mentor" },
    { id: "s3", name: "Karthikeya Reddy", avatar: av("karthikeya"), year: "2nd Year", major: "Mechanical Engineering", linkedin: "https://linkedin.com/in/karthikeyareddy", github: "https://github.com/karthikeya", bio: "AU Formula Student team lead.", skills: JSON.stringify(["CAD", "CFD", "Leadership"]), looking_for: "Auto industry referral" },
    { id: "s4", name: "Naga Lakshmi Sailaja", avatar: av("naga"), year: "Final Year", major: "Data Science (M.Sc)", linkedin: "https://linkedin.com/in/nagasailaja", github: "https://github.com/nagasailaja", bio: "ML engineer in the making. Kaggle Expert.", skills: JSON.stringify(["TensorFlow", "SQL", "Statistics"]), looking_for: "ML role at startup" },
    { id: "s5", name: "Vamsi Krishna Patnaik", avatar: av("vamsi"), year: "3rd Year", major: "Business Administration (BBA)", linkedin: "https://linkedin.com/in/vamsipatnaik", github: "", bio: "Co-founded a campus delivery startup at AU.", skills: JSON.stringify(["Sales", "Strategy", "Excel"]), looking_for: "VC mentorship" },
    { id: "s6", name: "Tejaswini Bhavani", avatar: av("tejaswini"), year: "Final Year", major: "Architecture (B.Arch)", linkedin: "https://linkedin.com/in/tejaswinib", github: "", bio: "Sustainable design enthusiast. Loves Vizag's coastline as muse.", skills: JSON.stringify(["Rhino", "Grasshopper"]), looking_for: "Design firm internship" },
  ];

  const insertStudent = db.prepare(`
    INSERT INTO students (id, name, avatar, year, major, linkedin, github, bio, skills, looking_for)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of seedStudents) {
    insertStudent.run(s.id, s.name, s.avatar, s.year, s.major, s.linkedin, s.github, s.bio, s.skills, s.looking_for);
  }

  // Seed videos logic delegated to syncCuratedVideos
  syncCuratedVideos();


  const seedDoubts = [
    { id: "d1", student: "Arjun Vasanth Rao", student_avatar: av("arjun"), question: "How important is competitive programming for SDE interviews at FAANG?", topic: "Engineering", replies: 7, status: "answered", posted_ago: "1h ago" },
    { id: "d2", student: "Naga Lakshmi Sailaja", student_avatar: av("naga"), question: "What's a realistic path from data analyst to ML engineer in 2 years?", topic: "AI/ML", replies: 4, status: "answered", posted_ago: "3h ago" },
    { id: "d3", student: "Vamsi Krishna Patnaik", student_avatar: av("vamsi"), question: "Should I do an MBA right after BBA or work for 3 years first?", topic: "Career", replies: 12, status: "answered", posted_ago: "1d ago" },
    { id: "d4", student: "Hari Chandana", student_avatar: av("hari"), question: "Best resources to learn embedded Linux from scratch?", topic: "Engineering", replies: 0, status: "open", posted_ago: "5h ago" },
    { id: "d5", student: "Tejaswini Bhavani", student_avatar: av("tejaswini"), question: "How do I build a competitive architecture portfolio with limited project experience?", topic: "Design", replies: 2, status: "open", posted_ago: "2d ago" },
  ];

  const insertDoubt = db.prepare(`
    INSERT INTO doubts (id, student, student_avatar, question, topic, replies, status, posted_ago)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const d of seedDoubts) {
    insertDoubt.run(d.id, d.student, d.student_avatar, d.question, d.topic, d.replies, d.status, d.posted_ago);
  }

  const seedApprovals = [
    { id: "app-1", name: "Aditya Varma", type: "Alumni", action: "New profile — Dept of EEE", time: "5m ago", status: "pending" },
    { id: "app-2", name: "Sai Charan Gowtham", type: "Mentor", action: "Video upload — CSE", time: "12m ago", status: "pending" },
    { id: "app-3", name: "Rama Krishna Prasad", type: "Student", action: "Profile edit — Mech Engg", time: "18m ago", status: "pending" },
    { id: "app-4", name: "Padmavathi Anjali", type: "Alumni", action: "New profile — School of Mgmt", time: "1h ago", status: "pending" },
  ];

  const insertApproval = db.prepare(`
    INSERT INTO pending_approvals (id, name, type, action, time, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const p of seedApprovals) {
    insertApproval.run(p.id, p.name, p.type, p.action, p.time, p.status);
  }
}

function seedUsersAndReplies() {
  const av = (seed: string) =>
    `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

  const adminPass = bcrypt.hashSync("admin123", 10);
  const alumniPass = bcrypt.hashSync("alumni123", 10);
  const studentPass = bcrypt.hashSync("student123", 10);

  const defaultUsers = [
    {
      id: "u_admin",
      name: "AU Dean of Alumni Relations",
      email: "admin@andhrauniv.edu.in",
      password_hash: adminPass,
      role: "admin",
      avatar: av("dean"),
      batch: 1998,
      major: "Administration",
    },
    {
      id: "u_alumni_1",
      name: "Venkata Sai Krishna",
      email: "venkata@andhrauniv.edu.in",
      password_hash: alumniPass,
      role: "alumni",
      avatar: av("venkata"),
      batch: 2018,
      major: "Computer Science",
    },
    {
      id: "u_student_1",
      name: "Arjun Vasanth Rao",
      email: "arjun@andhrauniv.edu.in",
      password_hash: studentPass,
      role: "student",
      avatar: av("arjun"),
      batch: 2025,
      major: "Computer Science",
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, avatar, batch, major)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of defaultUsers) {
    insertUser.run(u.id, u.name, u.email, u.password_hash, u.role, u.avatar, u.batch, u.major);
  }

  // Seed sample real discussion answers into doubt_replies
  const seedReplies = [
    {
      id: "rep_1",
      doubt_id: "d1",
      author: "Venkata Sai Krishna",
      author_role: "Senior SWE @ Google (AU '18)",
      author_avatar: av("venkata"),
      message: "At Google, CP gives you speed, but standard LeetCode mediums and system architecture reasoning matter far more. Focus on understanding graph algorithms, DP state transitions, and explain your trade-offs clearly during the call.",
    },
    {
      id: "rep_2",
      doubt_id: "d1",
      author: "Manikanta Pavan Kumar",
      author_role: "Staff Engineer @ Stripe (AU '18)",
      author_avatar: av("manikanta"),
      message: "Seconding Venkata. Clean code, edge-case testing, and communication will beat speed 9 times out of 10. Master patterns, don't memorize 800 questions.",
    },
    {
      id: "rep_3",
      doubt_id: "d2",
      author: "Sridevi Subrahmanyam",
      author_role: "ML Researcher @ Microsoft (AU '20)",
      author_avatar: av("sridevi"),
      message: "Year 1: Master Python, vectorization with NumPy, and build tabular models with PyTorch. Year 2: Learn modern LLM fine-tuning and evaluation harnesses. Try reproducing one paper a quarter.",
    },
    {
      id: "rep_4",
      doubt_id: "d3",
      author: "Lakshmi Priya Devi",
      author_role: "Investment Analyst @ Goldman Sachs (AU '19)",
      author_avatar: av("lakshmi"),
      message: "Work for at least 2 years first! Having practical corporate exposure completely changes how you absorb MBA case studies, and top business schools strongly favor candidates with verified industry impact.",
    },
  ];

  const insertReply = db.prepare(`
    INSERT INTO doubt_replies (id, doubt_id, author, author_role, author_avatar, message)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const r of seedReplies) {
    insertReply.run(r.id, r.doubt_id, r.author, r.author_role, r.author_avatar, r.message);
  }
}

export function syncCuratedVideos() {
  const av = (seed: string) =>
    `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

  const upsertVideo = db.prepare(`
    INSERT INTO videos (id, title, thumbnail, mentor, mentor_avatar, mentor_role, mentor_note, channel_name, recommended_for, referral_type, duration, views, topic, posted_ago, description, youtube_url, youtube_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      thumbnail = excluded.thumbnail,
      mentor = excluded.mentor,
      mentor_avatar = excluded.mentor_avatar,
      mentor_role = excluded.mentor_role,
      mentor_note = excluded.mentor_note,
      channel_name = excluded.channel_name,
      recommended_for = excluded.recommended_for,
      referral_type = excluded.referral_type,
      duration = excluded.duration,
      views = excluded.views,
      topic = excluded.topic,
      posted_ago = excluded.posted_ago,
      description = excluded.description,
      youtube_url = excluded.youtube_url,
      youtube_id = excluded.youtube_id
  `);

  for (const v of videosData) {
    upsertVideo.run(
      v.id,
      v.title || "Masterclass",
      v.thumbnail || "",
      v.mentor || "AU Mentor",
      v.mentorAvatar || "",
      v.mentorRole || "AU Alumnus Mentor",
      v.mentorNote || "Recommended for Andhra University students.",
      v.channelName || "YouTube",
      v.recommendedFor || "All Batches",
      v.referralType || "mentor_referral",
      v.duration || "15:00",
      v.views || 1000,
      v.topic || "Engineering",
      v.postedAgo || "Recently",
      v.description || "",
      v.youtubeUrl || "",
      v.youtubeId || ""
    );
  }

  const upsertPlaylist = db.prepare(`
    INSERT INTO playlists (id, title, topic, mentor, mentor_avatar, mentor_role, mentor_batch, why_curated, thumbnails, video_ids, total_duration, video_count, students_following)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      topic = excluded.topic,
      mentor = excluded.mentor,
      mentor_avatar = excluded.mentor_avatar,
      mentor_role = excluded.mentor_role,
      mentor_batch = excluded.mentor_batch,
      why_curated = excluded.why_curated,
      thumbnails = excluded.thumbnails,
      video_ids = excluded.video_ids,
      total_duration = excluded.total_duration,
      video_count = excluded.video_count,
      students_following = excluded.students_following
  `);

  for (const pl of mentorPlaylistsData) {
    upsertPlaylist.run(
      pl.id,
      pl.title,
      pl.topic,
      pl.mentor,
      pl.mentorAvatar,
      pl.mentorRole,
      pl.mentorBatch,
      pl.whyCurated,
      JSON.stringify(pl.thumbnails),
      JSON.stringify(pl.videoIds),
      pl.totalDuration,
      pl.videoCount,
      pl.studentsFollowing
    );
  }

  // Clear legacy mock IDs if any exist
  db.prepare("DELETE FROM alumni WHERE id NOT LIKE 'alumni_%'").run();

  const upsertAlumni = db.prepare(`
    INSERT INTO alumni (id, name, avatar, batch, degree, role, company, location, industry, linkedin, github, bio, skills, achievements, email, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      avatar = excluded.avatar,
      batch = excluded.batch,
      degree = excluded.degree,
      role = excluded.role,
      company = excluded.company,
      location = excluded.location,
      industry = excluded.industry,
      linkedin = excluded.linkedin,
      github = excluded.github,
      bio = excluded.bio,
      skills = excluded.skills,
      achievements = excluded.achievements,
      email = excluded.email,
      is_featured = excluded.is_featured
  `);

  for (const a of alumniData) {
    upsertAlumni.run(
      a.id,
      a.name,
      a.avatar,
      a.batch,
      a.degree,
      a.role,
      a.company,
      a.location,
      a.industry,
      a.linkedin || "",
      a.github || "",
      a.bio,
      JSON.stringify(a.skills || []),
      JSON.stringify(a.achievements || []),
      a.email,
      a.is_featured ? 1 : 0
    );
  }
}


