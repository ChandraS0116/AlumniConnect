import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/doubts
router.get("/", (req, res) => {
  try {
    const { topic } = req.query as { topic?: string };

    let sql = "SELECT * FROM doubts";
    const params: string[] = [];

    if (topic && topic !== "All") {
      sql += " WHERE topic = ?";
      params.push(topic);
    }

    sql += " ORDER BY created_at DESC";

    const rows = db.prepare(sql).all(...params) as any[];

    const result = rows.map((d) => ({
      id: d.id,
      student: d.student,
      studentAvatar: d.student_avatar,
      question: d.question,
      topic: d.topic,
      replies: d.replies,
      status: d.status,
      postedAgo: d.posted_ago,
    }));

    res.json({ success: true, count: result.length, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/doubts
router.post("/", (req, res) => {
  try {
    const { student, question, topic } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const id = `d_${Date.now()}`;
    const studentName = student?.trim() || "AU Student";
    const studentAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(studentName)}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

    db.prepare(`
      INSERT INTO doubts (id, student, student_avatar, question, topic, replies, status, posted_ago)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      studentName,
      studentAvatar,
      question.trim(),
      topic || "Engineering",
      0,
      "open",
      "Just now"
    );

    const created = db.prepare("SELECT * FROM doubts WHERE id = ?").get(id) as any;

    res.status(201).json({
      success: true,
      message: "Doubt posted successfully",
      data: {
        id: created.id,
        student: created.student,
        studentAvatar: created.student_avatar,
        question: created.question,
        topic: created.topic,
        replies: created.replies,
        status: created.status,
        postedAgo: created.posted_ago,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/doubts/:id/replies
router.get("/:id/replies", (req, res) => {
  try {
    const rows = db.prepare(
      "SELECT * FROM doubt_replies WHERE doubt_id = ? ORDER BY created_at ASC"
    ).all(req.params.id) as any[];

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/doubts/:id/replies
router.post("/:id/replies", (req, res) => {
  try {
    const { author, authorRole, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Reply message is required" });
    }

    const replyId = `rep_${Date.now()}`;
    const authorName = author?.trim() || "AU Alumni Mentor";
    const authorAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(authorName)}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

    db.prepare(`
      INSERT INTO doubt_replies (id, doubt_id, author, author_role, author_avatar, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(replyId, req.params.id, authorName, authorRole || "Alumni Mentor", authorAvatar, message.trim());

    // Update doubts count and set status to answered
    db.prepare("UPDATE doubts SET replies = replies + 1, status = 'answered' WHERE id = ?").run(req.params.id);

    res.status(201).json({
      success: true,
      message: "Reply posted successfully",
      data: {
        id: replyId,
        doubtId: req.params.id,
        author: authorName,
        authorRole: authorRole || "Alumni Mentor",
        authorAvatar,
        message: message.trim(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
