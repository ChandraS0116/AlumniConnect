import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// Helper to extract YouTube ID
function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
}

const av = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

const domainMentorMeta: Record<string, { name: string; avatar: string; role: string; defaultNote: string }> = {
  "Engineering": {
    name: "Venkata Sai Krishna",
    avatar: av("venkata"),
    role: "Staff SWE @ Google • AU CSE '18",
    defaultNote: "Between production sprints at Google Munich, I refer this session for core system design and engineering depth.",
  },
  "AI/ML": {
    name: "Sridevi Subrahmanyam",
    avatar: av("sridevi"),
    role: "Senior ML Scientist @ Microsoft • AU CSE '20",
    defaultNote: "Training models at Microsoft takes all my week—I personally vetted this lecture for AU students entering modern AI/ML.",
  },
  "Core Engineering": {
    name: "Capt. Surya Prakash",
    avatar: av("surya"),
    role: "Chief Marine & Propulsion Eng @ Maersk • AU '15",
    defaultNote: "While managing marine propulsion systems at sea, I prescribe these 3D visual engineering breakdowns for core AU branches.",
  },
  "Filmmaking & Acting": {
    name: "Devendra Varma",
    avatar: av("devendra"),
    role: "Film Director & Actor @ Vyjayanthi Movies • AU Arts '16",
    defaultNote: "14-hour shoot days make weekly filming impossible. I refer these masterclasses for AU Theatre & Film club members.",
  },
  "Fine Arts & Music": {
    name: "Vasundhara Devi",
    avatar: av("vasundhara"),
    role: "Creative Director @ Kalakriti Art Gallery • AU BFA '18",
    defaultNote: "Curating gallery exhibitions leaves little time for studio demos. Study the color harmony and timing in this masterclass.",
  },
  "Media & Literature": {
    name: "Prakash Rao",
    avatar: av("prakash"),
    role: "Senior Investigative Journalist @ The Hindu • AU MJMC '19",
    defaultNote: "Newsroom deadlines are relentless. I refer this lecture to AU students sharpening their storytelling and journalism craft.",
  },
  "Law & Civil Services": {
    name: "Harishankar IAS",
    avatar: av("harishankar"),
    role: "Joint Collector (IAS, AIR 42) • AU Arts '15",
    defaultNote: "District administration leaves no time for daily coaching. This session directly maps to UPSC Mains analytical answer writing.",
  },
  "Medicine & Pharma": {
    name: "Dr. Pallavi Srinivas",
    avatar: av("pallavi"),
    role: "Principal Scientist @ Dr. Reddy's Labs • AU Pharm '17",
    defaultNote: "Running clinical trials in the lab keeps me busy. This session offers high-yield visual pharmacology and trial design.",
  },
  "Finance": {
    name: "Lakshmi Priya Devi",
    avatar: av("lakshmi"),
    role: "VP Investment Banking @ Goldman Sachs • AU MBA '19",
    defaultNote: "Live M&A deal execution in London takes 80-hour weeks. Practice with this financial model before sending me your CV.",
  },
  "Entrepreneurship": {
    name: "Rajesh Naidu",
    avatar: av("rajesh"),
    role: "YC Founder & CEO • AU Mech '15",
    defaultNote: "Building a startup is a 24/7 grind. This is the exact Y Combinator playbook on product discovery and traction.",
  },
  "Design": {
    name: "Ananya Lakshmi Iyer",
    avatar: av("ananya"),
    role: "Staff Product Designer @ Figma / Swiggy • AU '19",
    defaultNote: "Leading product design sprints leaves no time for 1:1 tutoring. Notice the design tradeoffs explained in this session.",
  },
  "Sports & Athletics": {
    name: "Kiran Kumar",
    avatar: av("kiran"),
    role: "High Performance Coach @ SAI • AU M.P.Ed '18",
    defaultNote: "Most of my day is on the track coaching national athletes. Study these force-production biomechanics between practice sessions.",
  },
  "Career": {
    name: "Suresh Babu Chowdary",
    avatar: av("suresh"),
    role: "Engagement Manager @ McKinsey & Co • AU '16",
    defaultNote: "Traveling for client engagements prevents weekly office hours. Master this interview framework before your placement day.",
  },
};

// GET /api/videos/playlists - return all curated mentor playlists
router.get("/playlists", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM playlists ORDER BY created_at ASC").all() as any[];
    const result = rows.map((p) => ({
      id: p.id,
      title: p.title,
      topic: p.topic,
      mentor: p.mentor,
      mentorAvatar: p.mentor_avatar,
      mentorRole: p.mentor_role,
      mentorBatch: p.mentor_batch,
      whyCurated: p.why_curated,
      thumbnails: p.thumbnails ? JSON.parse(p.thumbnails) : [],
      videoIds: p.video_ids ? JSON.parse(p.video_ids) : [],
      totalDuration: p.total_duration,
      videoCount: p.video_count,
      studentsFollowing: p.students_following,
    }));
    res.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/videos/youtube-search - live YouTube exploration endpoint
router.get("/youtube-search", async (req, res) => {
  try {
    const { q, topic } = req.query as { q?: string; topic?: string };
    const query = q?.trim() || `${topic || "engineering"} masterclass lecture`;

    // Query YouTube's InnerTube API
    const ytRes = await fetch("https://www.youtube.com/youtubei/v1/search?prettyPrint=false", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: { client: { clientName: "WEB", clientVersion: "2.20240726.00.00", hl: "en", gl: "IN" } },
        query,
      }),
    });

    const data = await ytRes.json();
    const contents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]
        ?.itemSectionRenderer?.contents || [];

    const effectiveTopic = topic && topic !== "All" ? topic : "Engineering";
    const mentorMeta = domainMentorMeta[effectiveTopic] || domainMentorMeta["Engineering"];

    const results = contents
      .filter((c: any) => c.videoRenderer && c.videoRenderer.videoId && c.videoRenderer.lengthText?.simpleText)
      .map((c: any) => {
        const vr = c.videoRenderer;
        const id = vr.videoId;
        const title = vr.title?.runs?.[0]?.text || "YouTube Masterclass";
        const channel = vr.ownerText?.runs?.[0]?.text || "YouTube Creator";
        const duration = vr.lengthText?.simpleText || "15:00";
        const viewsStr = vr.viewCountText?.simpleText || "20,000 views";
        const viewsNum = parseInt(viewsStr.replace(/[^0-9]/g, ""), 10) || 20000;
        const desc =
          vr.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join("") ||
          title;

        return {
          id: `yt_${id}`,
          title,
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          mentor: mentorMeta.name,
          mentorAvatar: mentorMeta.avatar,
          mentorRole: mentorMeta.role,
          mentorNote: `Live referral for "${query}". Prescribed by AU Alumni Mentor for deep-dive self-study.`,
          channelName: channel,
          recommendedFor: "Live YouTube Discovery",
          referralType: "mentor_referral",
          duration,
          views: viewsNum,
          topic: effectiveTopic,
          postedAgo: "Live from YouTube",
          description: desc,
          youtubeUrl: `https://www.youtube.com/watch?v=${id}`,
          youtubeId: id,
          isLiveYoutube: true,
        };
      });

    res.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    // Graceful fallback to search in SQLite DB
    try {
      const qStr = req.query.q ? String(req.query.q) : "";
      const rows = db
        .prepare("SELECT * FROM videos WHERE title LIKE ? OR description LIKE ? LIMIT 12")
        .all(`%${qStr}%`, `%${qStr}%`) as any[];
      res.json({
        success: true,
        count: rows.length,
        data: rows.map((v) => ({
          id: v.id,
          title: v.title,
          thumbnail: v.thumbnail,
          mentor: v.mentor,
          mentorAvatar: v.mentor_avatar,
          mentorRole: v.mentor_role,
          mentorNote: v.mentor_note,
          channelName: v.channel_name,
          recommendedFor: v.recommended_for,
          referralType: v.referral_type,
          duration: v.duration,
          views: v.views,
          topic: v.topic,
          postedAgo: v.posted_ago,
          description: v.description,
          youtubeUrl: v.youtube_url,
          youtubeId: v.youtube_id,
        })),
      });
    } catch {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// GET /api/videos
router.get("/", (req, res) => {
  try {
    const { topic } = req.query as { topic?: string };

    let sql = "SELECT * FROM videos";
    const params: string[] = [];

    if (topic && topic !== "All") {
      sql += " WHERE topic = ?";
      params.push(topic);
    }

    sql += " ORDER BY created_at DESC";

    const rows = db.prepare(sql).all(...params) as any[];

    const result = rows.map((v) => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      mentor: v.mentor,
      mentorAvatar: v.mentor_avatar,
      mentorRole: v.mentor_role || "AU Alumnus Mentor",
      mentorNote: v.mentor_note || "Personally vetted and recommended for Andhra University students.",
      channelName: v.channel_name || "YouTube Masterclass",
      recommendedFor: v.recommended_for || "All Batches",
      referralType: v.referral_type || "mentor_referral",
      duration: v.duration,
      views: v.views,
      topic: v.topic,
      postedAgo: v.posted_ago,
      description: v.description,
      youtubeUrl: v.youtube_url,
      youtubeId: v.youtube_id,
    }));

    res.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/videos/:id
router.get("/:id", (req, res) => {
  try {
    const v = db.prepare("SELECT * FROM videos WHERE id = ?").get(req.params.id) as any;
    if (!v) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    res.json({
      success: true,
      data: {
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        mentor: v.mentor,
        mentorAvatar: v.mentor_avatar,
        mentorRole: v.mentor_role,
        mentorNote: v.mentor_note,
        channelName: v.channel_name,
        recommendedFor: v.recommended_for,
        referralType: v.referral_type,
        duration: v.duration,
        views: v.views,
        topic: v.topic,
        postedAgo: v.posted_ago,
        description: v.description,
        youtubeUrl: v.youtube_url,
        youtubeId: v.youtube_id,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/videos/refer - refer any YouTube video with mentor takeaway note
router.post("/refer", (req, res) => {
  try {
    const { title, mentor, mentorRole, mentorNote, channelName, recommendedFor, topic, description, youtubeUrl, duration } = req.body;

    if (!title || !youtubeUrl) {
      return res.status(400).json({ success: false, message: "Title and YouTube URL are required" });
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({ success: false, message: "Invalid YouTube URL or ID" });
    }

    const id = `v_${Date.now()}`;
    const mentorName = mentor?.trim() || "AU Alumni Mentor";
    const mentorAvatar = av(mentorName);
    const thumbnail = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

    db.prepare(`
      INSERT INTO videos (id, title, thumbnail, mentor, mentor_avatar, mentor_role, mentor_note, channel_name, recommended_for, referral_type, duration, views, topic, posted_ago, description, youtube_url, youtube_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      thumbnail,
      mentorName,
      mentorAvatar,
      mentorRole || "AU Alumnus Mentor",
      mentorNote || "Curated and referred by AU Mentor for student career advancement.",
      channelName || "YouTube",
      recommendedFor || "All Batches",
      "mentor_referral",
      duration || "15:00",
      1,
      topic || "Engineering",
      "Just now",
      description || "Referred YouTube video session.",
      youtubeUrl,
      youtubeId
    );

    // Add to pending approvals
    db.prepare(`
      INSERT INTO pending_approvals (id, name, type, action, time)
      VALUES (?, ?, ?, ?, ?)
    `).run(`app_${Date.now()}`, mentorName, "Mentor", `Referred YouTube video — ${title}`, "Just now");

    const created = db.prepare("SELECT * FROM videos WHERE id = ?").get(id) as any;

    res.status(201).json({
      success: true,
      message: "Mentor YouTube referral published successfully to AU Library!",
      data: {
        id: created.id,
        title: created.title,
        thumbnail: created.thumbnail,
        mentor: created.mentor,
        mentorAvatar: created.mentor_avatar,
        mentorRole: created.mentor_role,
        mentorNote: created.mentor_note,
        channelName: created.channel_name,
        recommendedFor: created.recommended_for,
        referralType: created.referral_type,
        duration: created.duration,
        views: created.views,
        topic: created.topic,
        postedAgo: created.posted_ago,
        description: created.description,
        youtubeUrl: created.youtube_url,
        youtubeId: created.youtube_id,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/videos (legacy alias for refer)
router.post("/", (req, res) => {
  req.url = "/refer";
  return router.handle(req, res, () => {});
});

// POST /api/videos/:id/view - increment view count
router.post("/:id/view", (req, res) => {
  try {
    db.prepare("UPDATE videos SET views = views + 1 WHERE id = ?").run(req.params.id);
    const updated = db.prepare("SELECT views FROM videos WHERE id = ?").get(req.params.id) as any;
    res.json({ success: true, views: updated?.views ?? 0 });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
