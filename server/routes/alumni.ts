import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/alumni
router.get("/", (req, res) => {
  try {
    const { q, industry, batch } = req.query as { q?: string; industry?: string; batch?: string };

    let sql = "SELECT * FROM alumni WHERE 1=1";
    const params: (string | number)[] = [];

    if (industry && industry !== "All") {
      sql += " AND industry = ?";
      params.push(industry);
    }

    if (batch && batch !== "All") {
      if (batch === "2020s") {
        sql += " AND batch >= 2020 AND batch < 2030";
      } else if (batch === "2010s") {
        sql += " AND batch >= 2010 AND batch < 2020";
      } else if (batch === "2000s") {
        sql += " AND batch >= 2000 AND batch < 2010";
      } else if (batch === "1990s") {
        sql += " AND batch >= 1990 AND batch < 2000";
      } else if (batch === "1980s") {
        sql += " AND batch >= 1980 AND batch < 1990";
      } else if (batch === "1970s") {
        sql += " AND batch >= 1970 AND batch < 1980";
      } else if (batch === "1960s & Earlier") {
        sql += " AND batch < 1970";
      } else if (!isNaN(Number(batch))) {
        sql += " AND batch = ?";
        params.push(Number(batch));
      }
    }

    sql += " ORDER BY is_featured DESC, batch DESC";

    const rows = db.prepare(sql).all(...params) as any[];

    // Parse skills and achievements, and handle search query
    let result = rows.map((r) => ({
      ...r,
      skills: r.skills ? JSON.parse(r.skills) : [],
      achievements: r.achievements ? JSON.parse(r.achievements) : [],
    }));

    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      result = result.filter((a) =>
        [a.name, a.role, a.company, a.location, a.bio, ...a.skills].join(" ").toLowerCase().includes(query)
      );
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/alumni/:id
router.get("/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM alumni WHERE id = ?").get(req.params.id) as any;
    if (!row) {
      return res.status(404).json({ success: false, message: "Alumni not found" });
    }

    res.json({
      success: true,
      data: {
        ...row,
        skills: row.skills ? JSON.parse(row.skills) : [],
        achievements: row.achievements ? JSON.parse(row.achievements) : [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/alumni
router.post("/", (req, res) => {
  try {
    const {
      name,
      batch,
      degree,
      role,
      company,
      location,
      industry,
      linkedin,
      github,
      bio,
      skills,
      email,
    } = req.body;

    if (!name || !batch || !role || !company) {
      return res.status(400).json({ success: false, message: "Name, batch, role, and company are required" });
    }

    const id = `alumni_${Date.now()}`;
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;
    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : (skills || "").split(",").map((s: string) => s.trim()).filter(Boolean));
    const achievementsJson = JSON.stringify([]);

    db.prepare(`
      INSERT INTO alumni (id, name, avatar, batch, degree, role, company, location, industry, linkedin, github, bio, skills, achievements, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      avatar,
      Number(batch) || 2024,
      degree || "Andhra University Alumni",
      role,
      company,
      location || "India",
      industry || "Technology",
      linkedin || "",
      github || "",
      bio || "",
      skillsJson,
      achievementsJson,
      email || ""
    );

    // Also add to pending approvals for audit/admin
    db.prepare(`
      INSERT INTO pending_approvals (id, name, type, action, time)
      VALUES (?, ?, ?, ?, ?)
    `).run(`app_${Date.now()}`, name, "Alumni", `New profile added — ${company}`, "Just now");

    res.status(201).json({
      success: true,
      message: "Alumni profile created successfully",
      data: { id, name, company, role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/alumni/:id/connect
router.post("/:id/connect", (req, res) => {
  try {
    const { studentName, studentEmail, note } = req.body;
    if (!studentName || !studentEmail) {
      return res.status(400).json({ success: false, message: "Student name and email are required" });
    }

    const alumni = db.prepare("SELECT name FROM alumni WHERE id = ?").get(req.params.id) as any;
    if (!alumni) {
      return res.status(404).json({ success: false, message: "Alumni not found" });
    }

    const reqId = `req_${Date.now()}`;
    db.prepare(`
      INSERT INTO mentorship_requests (id, student_name, student_email, alumni_id, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(reqId, studentName, studentEmail, req.params.id, note || "");

    res.status(201).json({
      success: true,
      message: `Mentorship request sent to ${alumni.name}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
