import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/admin/stats
router.get("/stats", (_req, res) => {
  try {
    const alumniCount = (db.prepare("SELECT count(*) as count FROM alumni").get() as any)?.count ?? 0;
    const studentCount = (db.prepare("SELECT count(*) as count FROM students").get() as any)?.count ?? 0;
    const videoCount = (db.prepare("SELECT count(*) as count FROM videos").get() as any)?.count ?? 0;
    const pendingCount = (db.prepare("SELECT count(*) as count FROM pending_approvals WHERE status = 'pending'").get() as any)?.count ?? 0;
    const doubtCount = (db.prepare("SELECT count(*) as count FROM doubts").get() as any)?.count ?? 0;

    res.json({
      success: true,
      data: {
        alumni: alumniCount,
        students: studentCount,
        mentors: 412, // Baseline alumni registered as active mentors
        videos: videoCount,
        pendingApprovals: pendingCount,
        doubts: doubtCount,
        countries: 64,
        companies: 2103,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/pending
router.get("/pending", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM pending_approvals WHERE status = 'pending' ORDER BY created_at DESC").all();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/pending/:id/approve
router.post("/pending/:id/approve", (req, res) => {
  try {
    const item = db.prepare("SELECT * FROM pending_approvals WHERE id = ?").get(req.params.id) as any;
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    db.prepare("UPDATE pending_approvals SET status = 'approved' WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: `Approved ${item.name} (${item.type})` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/pending/:id/reject
router.post("/pending/:id/reject", (req, res) => {
  try {
    db.prepare("UPDATE pending_approvals SET status = 'rejected' WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Item rejected" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/mentorship-requests
router.get("/mentorship-requests", (_req, res) => {
  try {
    const rows = db.prepare(`
      SELECT m.*, a.name as alumni_name, a.company as alumni_company, a.role as alumni_role
      FROM mentorship_requests m
      JOIN alumni a ON m.alumni_id = a.id
      ORDER BY m.created_at DESC
    `).all();

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
