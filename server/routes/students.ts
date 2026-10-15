import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/students
router.get("/", (req, res) => {
  try {
    const { q } = req.query as { q?: string };
    const rows = db.prepare("SELECT * FROM students ORDER BY created_at DESC").all() as any[];

    let result = rows.map((s) => ({
      ...s,
      lookingFor: s.looking_for,
      skills: s.skills ? JSON.parse(s.skills) : [],
    }));

    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      result = result.filter((s) =>
        [s.name, s.major, s.lookingFor, ...s.skills].join(" ").toLowerCase().includes(query)
      );
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/:id
router.get("/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM students WHERE id = ?").get(req.params.id) as any;
    if (!row) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      data: {
        ...row,
        lookingFor: row.looking_for,
        skills: row.skills ? JSON.parse(row.skills) : [],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students
router.post("/", (req, res) => {
  try {
    const { name, major, year, linkedin, github, bio, skills, lookingFor } = req.body;

    if (!name || !major) {
      return res.status(400).json({ success: false, message: "Name and major are required" });
    }

    const id = `s_${Date.now()}`;
    const avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;
    const skillsJson = JSON.stringify(
      Array.isArray(skills)
        ? skills
        : (skills || "Student")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
    );

    db.prepare(`
      INSERT INTO students (id, name, avatar, year, major, linkedin, github, bio, skills, looking_for)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      avatar,
      year || "Final Year",
      major,
      linkedin || "",
      github || "",
      bio || "AU Student looking to connect with alumni mentors.",
      skillsJson,
      lookingFor || "Internship / Mentorship"
    );

    // Add to pending approvals for admin overview
    db.prepare(`
      INSERT INTO pending_approvals (id, name, type, action, time)
      VALUES (?, ?, ?, ?, ?)
    `).run(`app_${Date.now()}`, name, "Student", `New profile published — ${major}`, "Just now");

    const created = db.prepare("SELECT * FROM students WHERE id = ?").get(id) as any;

    res.status(201).json({
      success: true,
      message: "Student profile published successfully",
      data: {
        ...created,
        lookingFor: created.looking_for,
        skills: JSON.parse(created.skills || "[]"),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
